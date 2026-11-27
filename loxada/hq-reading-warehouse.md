# HQ monthly reading publication

HQ accepts the PA06-R2 Manga monthly title engagement summary for SIGNED_IN_ELIGIBLE_V1. Transport version 1 covers a full Manila start month.

1. The Manga Steward reviews the exact source batch and purpose. Check whole-row and complementary suppression, changes against prior releases, and disclosure-safe metadata. Hold the batch at source if its existence could disclose protected information.
2. A trusted HQ operator independently verifies the sender and source decision and provisions the UUID, canonical content digest, references to the decision, reconciliation and disclosure review, effective start and expiry into hq_warehouse.export_permission. Record withdrawal in revoked_at when received. Recheck the authoritative source before publication. This first release uses a controlled manual handoff.
3. Call hq_warehouse.stage_reading(permission_uuid, packet_jsonb) from the trusted SQL session. The SHA-256 digest uses UTF-8 bytes of PostgreSQL JSONB text. Each approved work-month carries a bounded work key, starts, completions and distinct readers. Positive cohorts require ten readers. An empty replacement requires explicit no-data or withheld coverage.
4. In a separate transaction call hq_warehouse.publish_reading(month, revision). Check its return value. A held revision preserves the preceding publication. Each accepted revision replaces a complete partition. Identical retries preserve one effect.
5. Provision executives with actual approval in hq_warehouse.reading_audience. Record the approval reference and expiry. Executive → Manga reading displays current approved figures, grain and publication through-time. Operators must review expired history and documented holds before disposal.

The report identifies works by their source key. Human-readable titles and shared IP mappings require approved metadata. Anime and Merchandise require separate validation and publication contracts.

Approved partitions can be staged using the [two-service transfer client](../scripts/stage-manga-engagement.py). Both databases verify the same content digest. Intake accepts closed months within the source export window.

## Aggregate retention

REPORTS_24M starts at the end of the source period. A January 2024 monthly revision becomes eligible on February 1, 2026 at midnight Manila time. The reporting window can stop displaying a partition earlier. Warehouse access and primary disposal have separate decisions.

An authorized operator reviews the private reading_retention_queue for identifying content, approved preservation purposes and active holds. Record a case-scoped reading_hold with its reason, reviewer and next review date for a month, optionally narrowed to a revision. Establish a hold before approving disposal. Open holds immediately restrict executive access to the affected publication. A due review date prompts review and keeps the hold active. To release, record the actual release time and reference. Record a reading_disposal_review only after checking the precise revision for disposal eligibility. Remove a mistaken approval before disposal runs.

The database runs dispose_reading_reports daily at 03:20 Manila time. Each approved expired revision is removed atomically with its work-month facts and review, leaving a minimal receipt. The routine checks holds again inside the disposal transaction. Permission decisions and transfer audit records have separate purposes. The original transfer digest alone cannot restore a deleted report through the closed-month intake gate.

After restoring a backup, restrict executive access, reconcile current holds, permissions and disposal receipts against the restore point, and apply eligible disposal before reopening reporting. Provider backup expiry and restore rehearsal need independent verification.
