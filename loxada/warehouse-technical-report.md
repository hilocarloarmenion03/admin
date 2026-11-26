# Loxada warehouse design and technical review

**Review date** · 26 November 2026. The production observations below describe the opening audit, before implementation work started that day. The physical design and acceptance steps describe the intended system.

## Decision and evidence

An editorial administrator wants to select a publisher, choose a title, and compare chapter starts by month. A supplier supplies the title and chapter identity. Authorized reader delivery records a start against the exact release and records a completion when the reader reaches its end. The administrator can then change the rows from publisher to title to chapter, change the columns from year to quarter to month, or swap axes. Supplier submission, account registration, and catalog impressions cannot establish how many people read the chapter. [Manga design](manga-reader-schema.md) · [OLAP controls](olap-reporting.md)

## Dimensional design

Keep detailed evidence in its originating department. Each row below describes a separate fact grain. Three stars can share calendar and governed content dimensions in a galaxy while keeping incompatible measures separate. See the reporting map for the complete eight-report matrix, 34 measures, reconciliation identities, exact export grains and permitted scope. [Reporting map](reporting-data-map.md)

| Local fact grain | Dimension keys and date roles | Safe aggregation |
| --- | --- | --- |
| One authorized reading attempt | Local reader scope, exact reading unit, edition, release and publisher attribution, Manila start date | Sum starts and completions over the start cohort. Recompute distinct readers over the selected population and rates from counts. |
| One playback attempt and its separate progress intervals | Episode media release, title, entitlement, Manila start date | Union overlapping clipped playback intervals per attempt before totaling seconds. Attribute later completions to the start cohort. |
| One paid access period and its separate service and financial movements | Offer, service date, accounting date, currency | Recognize revenue as service is provided. Measure active periods at month end. |
| One delivered sales line with separate lot issues and returns | SKU, warehouse, delivery date, return date, accounting date, currency | Pre-aggregate lot costs and adjustments to the sales grain before joining. Distinguish gross units sold and returned units. |
| One daily inventory snapshot per SKU and warehouse | SKU, warehouse, Manila snapshot day | Sum across warehouses at the same instant. Use the last covered snapshot for a closing balance. |

For a department hierarchy keep publisher attribution on the exact release. A governed parent-child lookup can normalize a hierarchy into a snowflake. For time-varying classification that affects historical reporting, use a stable business identifier and a version key with an inclusive start and exclusive end. Enforce nonoverlapping validity periods. Resolve the version at the business event time. Keep a corrected historical attribution traceable to the superseded revision. These are selective Type 2 slowly changing dimension rules.

HQ receives approved summaries. Its calendar and department keys can conform across sources. Link department-specific work or product IDs to a common IP only through reviewed, effective-dated mappings. Multiple IP links must preserve the original total. Retain an unmapped category so the report can reconcile to its source. HQ supports the detail present in each authorized export. A title-month export supports title and month analysis while local chapter detail stays in the department.

## ETL and recovery procedure

1. Record stable event identity, exact asset or line reference, UTC business and recorded times, and the source revision. Record provider references within their provider namespace. Keep account identities local.
2. Extract new or changed records with a durable checkpoint and tie-breaker. Derive the affected partitions using the metric’s business time in Asia/Manila. A correction can affect both the old and new partition.
3. Validate grain uniqueness, valid dimension versions, authorization and evidence. Quarantine conflicting identities or missing references with a reason and a source pointer. Expose incomplete coverage to the analyst.
4. Rebuild each affected local partition from eligible evidence. Reconcile counts, totals, money in integer centavos and snapshot positions. Compare computed results with source counts at the same grain. Persist a completed run and advance the checkpoint only after durable publication.
5. Export the exact approved partition and revision. Apply the V1.0 privacy and complementary suppression rules before transfer. Include definition version, coverage, digest, reconciliation and release authority. Seven of eight R2 reports are HQ candidates. The manufacturing project report stays local.
6. HQ validates the manifest, columns, dataset grain and approval. Recheck authorization before atomic publication. Exact replay has one effect. Hold an equal revision with conflicting content. Preserve published history on failure and expose its last verified cutoff.
7. Exercise a delayed completion, an identical retry, an incomplete partition and a corrected partition. Compare both source and destination totals. Verify that users cannot infer suppressed rows through totals or neighboring filters. Apply raw and aggregate retention by purpose. [V1.0 evidence and reporting rules](https://github.com/hilocarloarmenion03/loxadaentertainmentscompany/blob/main/knowledge/specification/v1.0.md#L33462)

## Verification record and presentation evidence

At the opening audit, Manga production held one supply item and zero catalog releases, reading attempts or monthly loads. Anime had zero catalog entries and paid periods. Merchandise had zero catalog entries. HQ served local staff counts. These figures establish coverage only. No business conclusion about audience demand, subscription performance or profitability follows from them.

| Project output | Evidence for review |
| --- | --- |
| Dimensional design and ETL documentation | This report, the eight-report source map, and the Manga reading model |
| Warehouse database implementation | Check each deployed migration and relation against its documented grain. Record successful loading, reconciliation and a replay for each supported dataset. |
| Interactive dashboard | Demonstrate an actual measured event with slice, dice, drill, roll-up and pivot. Verify totals and missing periods. |
| Executive presentation and technical report | Use the accompanying executive briefing and this document. Attach verified report date, revision, coverage and source reconciliation to every empirical claim. |

Classification, clustering, association rules and prediction belong to the course syllabus. A model needs an eligible dataset, an explicit decision, evaluation against observed outcomes and privacy review. A reviewed adaptation or merchandise opportunity can use descriptive evidence first. Record who made the decision, which evidence revision supported it and the observed outcome before assessing predictive performance. [Executive briefing](warehouse-executive-briefing.md)
