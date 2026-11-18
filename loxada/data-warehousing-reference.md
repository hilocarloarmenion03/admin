# Data warehousing and OLAP glossary reference

Recorded on November 18, 2026 from the user-provided `Data_Warehousing_Organized_Glossary.md`. Use it as a terminology and design reference for Loxada reporting and data work across repositories.

| Area | Concepts to consult |
| --- | --- |
| Architecture and storage | Operational sources (OLTP), analytics (OLAP), warehouses and marts, landing and staging, curated and semantic layers |
| Dimensional modeling | Facts, dimensions, declared grain, keys, additive and non-additive measures, transaction facts, periodic snapshots and accumulating snapshots |
| Shared dimensions and history | Conformed dimensions, star, snowflake and galaxy schemas, slowly changing dimensions, and the difference between current state and as-of history |
| Analysis | Drill down, drill up, slice, dice, pivot, and authorized drill-through |
| Data integration and reliability | ETL and ELT, data quality, reconciliation, incremental loads, change data capture, deduplication, idempotency, and recoverable backfills |
| Governance and metrics | Business definitions, lineage, ownership, access control, retention, and reliable KPI calculations |

Set the grain before choosing measures. Aggregate separate facts to a compatible grain before comparing them. Add balances only across applicable dimensions, and recompute ratios from their components when rolling up results. Record the history policy when a report needs past attribute values.

Use the [locked V1.0 business baseline](https://github.com/hilocarloarmenion03/loxadaentertainmentscompany/blob/main/knowledge/specification/v1.0.md) for approved business rules and report definitions, and the [Loxada OLAP reporting standard](olap-reporting.md) for the required report interactions. Choose architecture, loading methods, and tools according to the needs of each workflow.
