# HQ monthly reading publication

HQ accepts the PA06-R2 Manga monthly title engagement summary for SIGNED_IN_ELIGIBLE_V1. Transport version 1 covers a full Manila start month.

1. The Manga Steward reviews the exact source batch and purpose. Check whole-row and complementary suppression, changes against prior releases, and disclosure-safe metadata. Hold the batch at source if its existence could disclose protected information.
2. A trusted HQ operator independently verifies the sender and source decision and provisions the UUID, canonical content digest, references to the decision, reconciliation and disclosure review, effective start and expiry into hq_warehouse.export_permission. Record withdrawal in revoked_at when received. Recheck the authoritative source before publication. This first release uses a controlled manual handoff.
3. Call hq_warehouse.stage_reading(permission_uuid, packet_jsonb) from the trusted SQL session. The SHA-256 digest uses UTF-8 bytes of PostgreSQL JSONB text. Each approved work-month carries a bounded work key, starts, completions and distinct readers. Positive cohorts require ten readers. An empty replacement requires explicit no-data or withheld coverage.
4. In a separate transaction call hq_warehouse.publish_reading(month, revision). Check its return value. A held revision preserves the preceding publication. Each accepted revision replaces a complete partition. Identical retries preserve one effect.
5. Provision executives with actual approval in hq_warehouse.reading_audience. Record the approval reference and expiry. Executive → Manga reading displays current approved figures, grain and publication through-time. Operators must review expired history and documented holds before disposal.

The report identifies works by their source key. Human-readable titles and shared IP mappings require approved metadata. Anime and Merchandise require separate validation and publication contracts.

Approved partitions can be staged using the [two-service transfer client](../scripts/stage-manga-engagement.py). Both databases verify the same content digest. Intake accepts closed months within the source export window.
