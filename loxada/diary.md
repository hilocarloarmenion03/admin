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

## 2026-11-19 · Reporting data and Manga reader design

- Mapped all eight V1.0 reports and 34 measures to their source evidence, grain, reconciliation checks, and eligibility for HQ export. See the [reporting data map](reporting-data-map.md).
- Drafted the [Manga creator-to-reader schema](manga-reader-schema.md) with the existing account and supplier integration, rights and release gates, reading evidence, local mart, and verification cases. The design is ready for review before implementation.

## 2026-11-19 · Manga admin panel grouping

- Moved the live Reader Accounts report into Account Access → Account Analysis. Analytics now groups Title Engagement and Ad Settlements as related business reports. Each reports unavailable while its required source evidence is missing.
- Verified that saved reader account filters retain their scope and moved the changes to the production branch. [Manga PR](https://github.com/lozadatech01/mangalightnovel/pull/18)

## 2026-11-19 · Supplier work panels

- Added a supplier-only work panel in Manga & Light Novel, Anime, and Merch. Each supplier sees the panel name for their role. Grouped Application and Messages under Supplier account.
- Verified six supplier roles at mobile width, including the existing application and conversation links. Logged-out users go to sign-in, customers return to their own portal, and incomplete invitees return to the invitation.
- Merged the navigation and availability screen for [Manga & Light Novel](https://github.com/lozadatech01/mangalightnovel/pull/19), [Anime](https://github.com/hebratech01/anime/pull/17), and [Merch](https://github.com/padregandatech01/merch/pull/17). The [supplier work panel plan](supplier-work-panels.md) records the tabs and the sequence for adding real submission workflows.

## 2026-11-19 · Self-service password recovery

- Added Forgot password to all four sign-in pages. The same recovery flow uses the account’s sign-in email and returns the user to ordinary sign-in after the password changes.
- Kept supplier onboarding and staff privileges separate from account recovery. Documented the hosted Site URL, reset template, and email delivery settings in the [password recovery guide](password-recovery.md).


## 2026-11-19 · Cross-device password recovery

- Made new reset links usable on a different device across all four systems. Supabase still verifies and exchanges each one-time recovery code before the app opens the reset form.

## 2026-11-19 · Manga Title Engagement cube

- Added the Manga reading-attempt fact, a flattened star view over the work, edition, unit and release dimensions, and monthly totals for the V1.0 signed-in reading cohort.
- Added date, content type and verified publisher filters, title breakdown, year → quarter → month drilling and pivoting under Analytics → Title Engagement. Verified cohort completions, distinct-reader totals, coverage rules and role boundaries.
- The dashboard shows Unavailable until the approved supplier submission, editorial release and reader delivery workflows provide reading evidence. Ad Settlements and the multi-fact galaxy depend on a separate reconciled financial source. [Manga implementation](https://github.com/lozadatech01/mangalightnovel/pull/22)

## 2026-11-20 · Manga Title Engagement drill paths

- Open a publisher to see its titles, then a title to see its edition-specific chapters. Open a year or quarter to drill on dates independently while retaining the selected content.
- Verified that release versions of the same chapter roll up together and reads follow the publisher verified for the release. Verified both click paths, roll-up, pivot and exact distinct-reader totals against an isolated database. [Manga implementation](https://github.com/lozadatech01/mangalightnovel/pull/23)

## 2026-11-20 · Manga Title Engagement catalog pickers

- Added direct Publishers, Titles and Chapters selection. Publisher filters narrow the title list, and a title can be selected across all publishers.
- Populated selection controls from approved release dimensions independently of reading coverage. The empty state explains why the title list is disabled before the first release is available. [Manga implementation](https://github.com/lozadatech01/mangalightnovel/pull/24)

## 2026-11-20 · Supplier supply intake

- Added role-specific drafts, immutable submissions and clarification to the Manga, Anime and Merchandise supplier work panels. Department staff can review submitted versions and record or revoke intake qualification against an exact application revision.
- Verified all six supplier roles with separate accounts in isolated databases. Confirmed private drafts, preserved receipts, access isolation and current qualification or invitation gates.
- Documented the handoff from intake to actual rights, delivery and project workflows. Production and manufacturing proposals require an authorized tender source. [Implementation plan](supplier-supply-implementation.md) · [Manga](https://github.com/lozadatech01/mangalightnovel/pull/25) · [Anime](https://github.com/hebratech01/anime/pull/20) · [Merchandise](https://github.com/padregandatech01/merch/pull/20)

## 2026-11-20 · Simpler Manga creator title form

- Split New title into basic title details and a separate Rights for review step. Made supporting references optional and translated the rights fields into plain-language questions.
- Both steps use the same exact-version draft and submission history. Rights review still requires the complete declaration. [Manga implementation](https://github.com/lozadatech01/mangalightnovel/pull/26)
