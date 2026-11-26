"""Stage one approved monthly partition using two operator-configured libpq services."""
import argparse
import base64
import datetime
import os
import re
import subprocess
import uuid


def query(service, sql):
    result = subprocess.run(
        ["psql", "-X", "-qAt", "-w", "-v", "ON_ERROR_STOP=1"],
        input=sql, text=True, capture_output=True, timeout=120,
        env={**os.environ, "PGSERVICE": service, "PGCONNECT_TIMEOUT": "10"},
    )
    if result.returncode:
        raise RuntimeError("Database operation failed. Check the operator connection and privileges.")
    return result.stdout.strip()


def stage(month, permission, source, destination):
    if month.day != 1 or source == destination:
        raise ValueError("Select a month start and separate Manga and HQ services.")
    # Obtain an independently registered digest before reading a packet from Manga.
    digest = query(destination, f"""
        select content_digest from hq_warehouse.export_permission
        where permission_id = '{permission}' and revoked_at is null
          and now() >= valid_from and now() < valid_until;
    """)
    if not re.fullmatch(r"[0-9a-f]{64}", digest):
        raise ValueError("An active exact-packet permission is required.")
    packet = query(source, f"""
        with candidate as materialized (
          select manga_analytics.engagement_export_candidate('{month.isoformat()}') as payload
        )
        select payload::text from candidate
        where encode(sha256(convert_to(payload::text, 'UTF8')), 'hex') = '{digest}';
    """)
    if not packet:
        raise ValueError("No complete local partition matches this permission.")
    # Encode before embedding in SQL. Never log business values or connection strings.
    encoded = base64.b64encode(packet.encode()).decode("ascii")
    result = query(destination, f"""
        select hq_warehouse.stage_reading('{permission}',
          convert_from(decode('{encoded}', 'base64'), 'UTF8')::jsonb);
    """)
    if result != "accepted":
        raise ValueError("HQ held or rejected this partition. Consult the transfer audit.")
    print("Partition accepted for separate publication review.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("month", type=datetime.date.fromisoformat)
    parser.add_argument("permission", type=uuid.UUID)
    parser.add_argument("--source-service", default="manga_reporting")
    parser.add_argument("--hq-service", default="hq_intake")
    args = parser.parse_args()
    try:
        stage(args.month, args.permission, args.source_service, args.hq_service)
    except (OSError, ValueError, RuntimeError, subprocess.TimeoutExpired) as error:
        parser.exit(1, str(error) + "\n")
