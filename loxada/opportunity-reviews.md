# Department opportunity handoff

A Manga department can propose investigating an Anime adaptation. An Anime department can propose investigating a Merchandise product category. HQ records a feasibility decision for the specific revision received. The source department owns its evidence. [Central workflow contracts](https://github.com/hilocarloarmenion03/loxadaentertainmentscompany/blob/main/knowledge/specification/v1.0.md#L5791)

## Prepare a proposal

1. Identify the work or title in its source department. Record the source case UUID and positive revision. Use the same case UUID across corrections.
2. Select a period with verified departmental evidence. Record its inclusive start and end dates and the exact evidence UUID and revision. Verify the source report's population, measure definition, reporting cutoff and reconciliation.
3. Have an authorized operator confirm the independent release approval covers this exact revision, purpose, recipient, permitted fields and disclosure risk. Retain that approval UUID. The HQ table stores references, so the submitting operator must verify them against the actual source records.
4. Write the reason to investigate and the outstanding rights question. For Anime to Merchandise, include the proposed product category. Use only information the approval permits. Keep identifiable readers, viewers, supplier contacts, contracts and protected source material in the originating department.

## Deliver to HQ and record the decision

Trusted intake writes the validated proposal to the private HQ table. The current implementation requires an authorized database operator or integration with explicit insert privilege. There is no public submission RPC. The receiving table requires the following fields. [HQ migration](../supabase/migrations/20261126040000_opportunity_review.sql)

| Fields | Accepted values |
| --- | --- |
| path, source_case, revision | manga_to_anime or anime_to_merch, UUID, positive integer |
| subject_ref, period_start, period_end | 1–160 characters, two dates in chronological order |
| evidence_ref, evidence_revision, approval_ref | UUID, positive integer, UUID |
| rationale, rights_inquiry | 1–500 and 1–240 characters respectively |
| product_category | 1–80 characters for Anime to Merch. Use SQL NULL for Manga to Anime. |

Use parameter binding. After an ambiguous write, look up the unique path, source case and revision. An identical stored row confirms receipt. Investigate conflicting content and send a separately approved newer revision when a correction is due. Preserve the original row and its decision.

A confirmed HQ executive opens **Feasibility reviews**, selects **Approve investigation**, **Return for information**, or **Decline**, and records a reason of 1–240 characters. The screen shows the latest revision of each case. HQ stores one decision per revision. A later revision requires a new review. Route the recorded outcome to the receiving department under its own authority and record its receipt locally. Rights clearance and investment authorization have independent evidence. [Executive review page](../app/executive/opportunities/page.tsx)

## Relationship to warehouse reporting

The Manga engagement staging script moves an approved monthly aggregate batch into HQ staging. It requires separate configured database services and an active exact-digest permission. Publication has a separate review. A feasibility proposal has its own purpose, references and release approval. Staging an aggregate does not create a proposal or issue a decision. [Transfer script](../scripts/stage-manga-engagement.py) · [Reporting map](reporting-data-map.md)

## Verification as of 27 November 2026

The HQ release verification recorded zero production proposals and denied anonymous access. Code review confirms the current-revision filter, a confirmed executive role check, and a unique decision per proposal. Verification with a real approved source case still requires an eligible proposal, an actual executive decision and a receiving department receipt. The current HQ screen covers intake review and decision recording. [HQ implementation](https://github.com/hilocarloarmenion03/admin/pull/13)
