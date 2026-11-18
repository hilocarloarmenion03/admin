# Loxada-wide BI and data design

**Status:** Proposed project-wide standard and rollout. This document describes the design, not completed implementation. Repository baseline reviewed on 2026-11-18 (Asia/Manila). The review covered source and documentation, not signed-in deployments or production data.

## Purpose

Design each business workflow so staff can do the work today and explain what happened later. Operational records and forms remain the source of truth for day-to-day action. Read-only reporting models answer questions across time, workflow stages, and departments.

The first use case beyond Account Access is **historical Supplier Activity in Manga & Light Novel, Anime, and Merch**, followed by an approved rollup in Headquarters (HQ). The longer-term design anticipates editorial, media, and commerce workflows without assuming they already exist.

## Current baseline

- The three department repos contain Account Analysis and a read-only Supplier Activity report. Account Analysis counts current account records by registration or admin role assignment date. Current access status is not a historical suspension snapshot.
- Supplier Activity covers current invitation and application queues, account access status, oldest pending application, and intake in two adjacent 30-day windows. It is not a historical funnel or a company-wide report.
- Supplier relationships, private messages, and application reviews are distinct. Some invitation transitions already produce structured notices. Reuse reliable event types and timestamps where available, but do not treat message text, current status, or missing older notices as complete history.
- HQ has role-separated executive and technical dashboard shells. Neither contains live reporting modules in the reviewed source.
- The older central documentation hub references temporary app repos. Use the current app sources linked below for implementation evidence.

## Process and dimension map

Grain means exactly what one record represents. Keep processes with different grains separate and compare compatible summaries rather than joining raw rows.

| System or process | Proposed analytical grain | Useful dimensions or groupings | Decisions supported |
| --- | --- | --- | --- |
| Account Access, all three departments | One department account for current counts. A separate account status event or dated snapshot for historical access reporting. | Department, account group and type, account date, access status | Compare intake by account category and distinguish today's access status from historical status. |
| Supplier onboarding, all three departments | One invitation or application milestone event. Separately, one application in the current queue. | Department, Manila date, supplier type, intake path, milestone or current stage | Find bottlenecks, follow up on overdue cases, compare invited and self-applied paths, and measure review turnaround. |
| Manga & Light Novel editorial and rights | One manuscript or edition milestone. Track title-level permission separately from supplier verification. | Title or edition, supplier type, milestone, date | Identify editorial, rights clearance, or publication delays. Add reading engagement only once there is a real reading workflow. |
| Anime delivery and rights | One episode delivery or QC event. One title, territory, and rights window for licensing. Future subscription and playback records use separate grains. | Title, season or episode, territory, partner type, milestone, date | Find episodes blocked by delivery, QC, or licensing, and identify approaching rights expiries. Later, measure paid retention separately from account registrations. |
| Merch commerce and fulfillment | One order line, one stock movement, one refund event or allocation, and one fulfillment milestone as separate records. Where necessary, one closing-stock snapshot per SKU, location, and day. | SKU or category, location, supplier type, order or fulfillment status, date | See what sells, what needs replenishment, and which products or steps drive delivery delays or returns. |
| HQ executive and technical reporting | One approved metric per department, period, and published breakdown. One refresh run for technical monitoring. | Department, period, shared metric, approved classifications, refresh outcome | Compare like-for-like indicators across departments. Technical admins diagnose stale or failed refreshes separately from executive reporting. |

The editorial, media, commerce, and unified HQ reporting rows are proposals. A verified supplier is not automatically authorized to publish, stream, receive stock, or make commitments.

## Shared reporting standard

1. **Start with the business decision and metric definition.** Record the grain, source, business date, time zone, calculation, inclusion rules, access scope, refresh cadence, and reconciliation test. Use Asia/Manila for shared calendar boundaries. Name the date explicitly when a workflow has multiple clocks, such as submitted, reviewed, and published.
2. **Keep current state, events, and snapshots distinct.** Use current records for today's queue, event history for changes and elapsed time, and dated snapshots when the metric asks what was true at a past cutoff. Preserve attributes as of an event when changes would affect historical analysis. Do not silently backfill from current values or fill gaps with zero.
3. **Keep reports separate from write forms.** Queues support immediate work. Reports explain patterns. An authorized drill-through opens matching details and does not turn a completed supplier decision back into an editable form.
4. **Make multidimensional reports explorable.** Offer date range and grouping independently. Support drill down and roll up on meaningful hierarchies, slice by one value, dice across multiple filters, and pivot rows and columns without changing the population. Preserve filters when grouping, opening details, paginating, or returning to the report. Omit operations that do not fit a simple queue or alert.
5. **Compare only compatible measures.** Count distinct orders when the question is about orders, not order lines. Recompute percentages from their numerators and denominators when rolling up. Don't sum closing stock through time. Compare distinct fact sets only after aggregating them to compatible keys and periods.
6. **Respect department and role boundaries.** Departments retain their own accounts and operational detail. HQ gets only approved summaries. A company-wide account total counts department accounts, not unique people. Do not merge identities or export private messages, contact details, credentials, or supplier evidence to HQ. Apply access checks independently to report and detail routes.

## First delivery proposal — historical Supplier Activity

| Metric | Proposed meaning |
| --- | --- |
| Incoming applications | Count distinct applications by first submission date. Resubmissions are separate events and don't increase original intake. |
| Time to first review | Elapsed time from first submission to the first recorded staff review decision. State which decisions qualify, the reporting cohort, and sample size. Still-unreviewed cases belong in the backlog measure. |
| Current backlog and age | Count cases in the defined actionable stage at the displayed as-of time. If reporting wait since entry into the current stage, use the corresponding stage timestamp rather than substituting the original application date. Show known gaps. |
| Invitation acceptance | Among eligible invitations sent in the selected cohort, count the share accepted by a stated cutoff. Keep invitations separate from self-applications and distinguish acceptance, completed setup, and verification. |

A useful acceptance test is a department admin selecting **last year, grouped by month**, filtering by supplier type or intake path, and opening a supported count. The detail list must use the exact same filters and Manila period boundaries. Check reconciliation, pivot invariance, role boundaries, empty results versus unavailable data, and cases that were resubmitted or reopened. Add a signed-in check for all three department reports before treating the user journey as verified.

## Rollout and data handling

1. **Department reporting first.** Inventory existing dates and structured events, agree on the shared metric meanings, capture missing milestones going forward, and build read-only relational reports on department data. Reconcile against scoped operational lists and identify the date from which history is reliable.
2. **HQ rollup second.** Publish only approved department aggregates. Start with a scheduled batch and expose the reporting cutoff and last successful refresh. Keep published results consistent on failure. Use stable source keys, repeatable loads, scoped reconciliation, and error visibility so retries or backfills don't double-count.
3. **Add domain reports alongside real workflows.** Agree on events, meaningful dimensions, and authorizations for editorial, rights and delivery, or inventory and fulfillment before launching reports. Revisit a separate warehouse only if reporting volume, refresh, retention, or integration needs justify it. No dedicated cube server, streaming pipeline, or cross-department identity graph is proposed for the first pass.

Keep this document for shared design and metric definitions. Department repos should record implementation details and source evidence. Update the status when implementation is committed, deployed, and verified, treating each as a separate claim.

## Current repository references

- [Manga & Light Novel BI standard](https://github.com/lozadatech01/mangalightnovel/blob/main/docs/bi-standard.md) and [Supplier Activity](https://github.com/lozadatech01/mangalightnovel/blob/main/docs/supplier-activity.md)
- [Anime BI standard](https://github.com/hebratech01/anime/blob/main/docs/bi-standard.md) and [Supplier Activity](https://github.com/hebratech01/anime/blob/main/docs/supplier-activity.md)
- [Merch BI standard](https://github.com/padregandatech01/merch/blob/main/docs/bi-standard.md) and [Supplier Activity](https://github.com/padregandatech01/merch/blob/main/docs/supplier-activity.md)
- [HQ roles and dashboard boundaries](../README.md)
- [Older central documentation hub](https://github.com/despairarc000/temploxadaproject)
