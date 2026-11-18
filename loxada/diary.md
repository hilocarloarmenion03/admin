# Loxada implementation diary

## 2026-11-18 · Manage Accounts

1. Reviewed the Manga & Light Novel department admin's Account Access screen. The account report appeared before the directory, so staff had to pass the report controls to find and manage an account.
2. Prepared the same directory-first flow for all three department portals. Manage accounts combines name, account type, and access status in one search form. Account analysis opens separately and its linked counts still open the corresponding filtered directory. Existing account actions and permissions are retained.
3. All 29 tests passed in each department repo. Changed files passed ESLint and all three apps built with local placeholder configuration. Browser checks with Manga fixture accounts covered search, filter reset, links to matching accounts, and phone widths of 320 and 390 pixels. Live signed-in verification is pending.
4. Opened draft changes for [Manga & Light Novel](https://github.com/lozadatech01/mangalightnovel/pull/16), [Anime](https://github.com/hebratech01/anime/pull/16), and [Merch](https://github.com/padregandatech01/merch/pull/16).

[Canonical V1.0 business baseline](https://github.com/hilocarloarmenion03/loxadaentertainmentscompany/blob/main/knowledge/specification/v1.0.md)

## 2026-11-18 · OLAP reporting standard

- Adopted slice, dice, drill down, drill up, and pivot as the reporting standard for all Loxada repositories and systems. Authorized drill-through remains available for countable portal records.
- Updated Account Analysis so date filters survive drill-down and drill-up. Department controls keep account group, account types, and access status available together. HQ uses the same date-filter and pivot behavior for staff aggregates.
- Added the [OLAP reporting standard](olap-reporting.md) and linked it from the repository guidance and the company-wide BI design.

## 2026-11-18 · Supplier navigation

- Grouped Invitations & Messages, Applications, and Activity under Suppliers in the Manga & Light Novel, Anime, and Merch admin workspaces.
- Kept the existing routes for conversations, invitations, application reviews, and activity reports. The relevant supplier tab stays selected on detail pages.
