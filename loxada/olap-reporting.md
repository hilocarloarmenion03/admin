# Loxada OLAP reporting standard

Apply this standard to analytical reports in every Loxada repository and system, including future systems. The approved business rules and report definitions come from [Loxada V1.0](https://github.com/hilocarloarmenion03/loxadaentertainmentscompany/blob/main/knowledge/specification/v1.0.md). Use the dimensions and measures that the workflow supports.

| Operation | What a report must let people do |
| --- | --- |
| Slice | Filter by one dimension, such as account type, access status, or reporting period. |
| Dice | Combine filters across dimensions. Allow multiple values in a dimension when that can change the result meaningfully. |
| Drill down | Move to a finer level in a real hierarchy, such as year → quarter → month. Where useful, select a specific period heading to focus the report. |
| Drill up | Return to a broader level. Keep filters the user applied independently, including the selected date range. |
| Pivot | Move dimensions between rows and columns while preserving filters, the measured population, and the grand total. |
| Drill through | Open authorized records that reconcile with the selected count. Keep the same filters through detail navigation and pagination. Leave aggregate-only counts unlinked. |

Show the active filters, date grouping, and any drill focus. Keep the filter range independent from a drill focus. Use Asia/Manila calendar boundaries for shared calendar reports. Keep account actions and other operational forms separate from analysis. A queue or alert can link to a report for deeper analysis. When a suitable hierarchy or dimension is unavailable, document the limitation alongside the report.

Define each metric's grain, source, business date, inclusion rules, access scope, and freshness. Distinguish zero from unavailable data and current state from historical state. Verify slice and dice, drill transitions, pivot invariance, subtotal reconciliation, role boundaries, and exact drill-through on the reports that provide it.

The Account Access reference implementation spans [HQ](../README.md), [Manga & Light Novel](https://github.com/lozadatech01/mangalightnovel/blob/main/docs/bi-standard.md), [Anime](https://github.com/hebratech01/anime/blob/main/docs/bi-standard.md), and [Merch](https://github.com/padregandatech01/merch/blob/main/docs/bi-standard.md).

See the [data warehousing glossary reference](data-warehousing-reference.md) for shared terminology on dimensional modeling, data integration, and governance.
