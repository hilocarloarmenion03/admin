# Supplier work panels

Navigation and first intake workflows · November 2026

See the [supplier supply implementation](supplier-supply-implementation.md) for the role-specific forms, gates and delivery sequence.

## Placement and grouping

Each signed-in supplier sees one work panel named for what they provide to their department.

- The main navigation shows **Overview → [Work panel] → Supplier account**, below the supplier’s name and role. Overview opens after sign-in. Sign out is in the header.
- **Supplier account** opens Application. Suppliers with a conversation can switch between **Application** and **Messages** in the row below the main navigation. Both pages retain their existing URLs.
- Put the work panel’s tabs below its title and above the contents. The first tab opens by default once it is available. On phones, let navigation wrap and make the selected item clear in each row.
- Keep chapters, episodes, samples, shipment details, and review feedback with the record they belong to. Use filters for statuses such as Draft, Submitted, or Needs changes.

## Work panels and planned tabs

| Department | Supplier role | Work panel | Tabs in order | Where related work belongs |
| --- | --- | --- | --- | --- |
| Manga & Light Novel | Independent author | **My Works** | **Titles** · **Submissions** | Titles holds the author's own manga and light novels, descriptions, and rights declarations. Submissions shows chapter or manuscript versions, receipts, and editorial feedback. |
| Manga & Light Novel | Publisher | **Catalog** | **Titles** · **Deliveries** | Titles holds offered editions and catalog imports with row-level feedback. Deliveries tracks versioned content packages and review results by edition. |
| Anime | Anime rights supplier | **Licensing** | **Title Offers** · **Media Deliveries** | Title Offers holds offered completed titles and their proposed rights scope. Media Deliveries shows authorized episode packages, receipts, and file checks. |
| Anime | Lead production company | **Production** | **Proposals** · **Projects** | Proposals shows invitations and bids for a brief. Each project keeps its milestones, deliverables, and review feedback together. |
| Merchandise | Wholesale supplier | **Wholesale** | **Product Offers** · **Purchase Orders** | Product Offers holds the finished goods and prices the supplier offers. Each purchase order keeps the supplier's response and shipment updates together. |
| Merchandise | Lead manufacturer | **Manufacturing** | **Proposals** · **Projects** | Proposals shows briefs, quotes, and timelines. Each project keeps its sample approvals, batch milestones, and shipments together. |

These six paths follow the approved departmental sourcing model. [V1.0 supplier paths](https://github.com/hilocarloarmenion03/loxadaentertainmentscompany/blob/main/knowledge/specification/v1.0.md#L227)

## Initial work panel

All three departments use `/portal/supply` as the entry route, guarded by their existing supplier access checks. Invited suppliers can enter after completing account setup. The panel initially shows its title and a short availability message. Work tabs appear as their workflows become usable.

## First functional slice

Start with **Manga → My Works → Titles**. An independent author with an original supplier application can create their own private title and rights draft. Submission of chapter files follows after effective submission permission is recorded. Keep supplier ownership, the exact title or edition, the submission version, when it was submitted, and the review result linked from the first real workflow. [V1.0 creator draft and submission](https://github.com/hilocarloarmenion03/loxadaentertainmentscompany/blob/main/knowledge/specification/v1.0.md#L522)

Next, complete that Manga path through editorial review, publication, and real reading events. Add the publisher's **Catalog → Titles** workflow for verified offered editions and retain their source attribution. That is the evidence the department needs to answer which publisher's released editions were read. Publisher deliveries still require the applicable authorization for the edition. [V1.0 publisher catalog and delivery](https://github.com/hilocarloarmenion03/loxadaentertainmentscompany/blob/main/knowledge/specification/v1.0.md#L1011) · [V1.0 Title Engagement](https://github.com/hilocarloarmenion03/loxadaentertainmentscompany/blob/main/knowledge/specification/v1.0.md#L34168)
