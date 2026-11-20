# Customer workflows

Manga, Anime and Merchandise share sign-in, account recovery, account management and supplier intake. The three customer flows have different prerequisites. Manga has detailed creator intake and a title engagement cube. Anime and Merchandise have account reporting and supplier workflows. [V1.0 department scope](https://github.com/hilocarloarmenion03/loxadaentertainmentscompany/blob/main/knowledge/specification/v1.0.md#L64)

| Department | Customer catalog release | Operational workflow still needed |
| --- | --- | --- |
| Manga & Light Novel | Signed-in readers can search visible chapter listings. Each listing requires exact source, rights, editorial and publication references. | Protected delivery of the authorized chapter version, qualifying start/end capture, and reconciliation to the engagement cube. |
| Anime | Subscribers can search catalog-ready episodes and view the PHP 200 prepaid offer and verified active access. Access requires separate verified payment and activation evidence and lasts exactly 30 days. | Live checkout, confirmation, entitlement activation, protected episode delivery and view capture. |
| Merchandise | Buyers can search authorized stocked products and manage a browser-local bag. Available quantities derive from on-hand units, quarantine and eligible allocations. | Accepted stock posting, atomic 15-minute checkout holds, payment confirmation, orders, dispatch and verified delivery. |

Trusted operational jobs must supply approved department records. Each private catalog projection checks visibility and time windows. Supplier drafts stay private. The bag stores selection-time prices and does not reserve stock. Checkout must independently recheck price and availability.

1. Deliver one authorized Manga chapter and reconcile a qualifying read to its title, chapter and Manila month.
2. Confirm one Anime payment, activate its exact entitlement and serve one licensed episode to the entitled account.
3. Publish one accepted SKU, reserve one eligible quantity and confirm payment and delivery.

Use authorized assets and providers for live data. [V1.0 implementation boundary](https://github.com/hilocarloarmenion03/loxadaentertainmentscompany/blob/main/knowledge/specification/v1.0.md#L140)
