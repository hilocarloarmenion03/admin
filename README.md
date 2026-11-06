# Loxada — Headquarters

Headquarters has **exactly two staff account types**:

| Type | Database role | Dashboard | Responsibility |
| --- | --- | --- | --- |
| Executive | `executive` | `/executive` | Company reports, governance and business decisions |
| Technical administrator | `tech_admin` | `/admin` | Technical controls, system security and staff access administration (future tools) |

There is **no extra Owner permission flag**. Each role grants only its defined access. The company-wide Owner governance/BI service in the V1 business architecture remains a *business-system responsibility*, not a separate user boolean in Headquarters.

## Authentication and authorization

- Staff members use **individual** Supabase Auth accounts at `/login`.
- After checking email/password, email confirmation and `public.staff_roles.role`, the server redirects to the role's dashboard.
- `/executive` and `/admin` are protected by server-side role checks on their pages and layouts; each denies the other role.
- RLS allows each authenticated staff member to read their own role only. Staff cannot self-assign or edit roles.
- No public registration, user-management forms, live business approvals or monitoring tools are implemented.
- The optional `admin` username alias uses `ADMIN_LOGIN_EMAIL`; it is **not** an authorization grant. Real staff should use their own email and strong private password.
- Future server actions, APIs and business tables must independently enforce the two roles; dashboard access alone is not authorization for mutations.

## Provisioning

A trusted operator may run `node scripts/provision-staff.mjs` with private `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `STAFF_EMAIL` and `STAFF_ROLE` (`executive` or `tech_admin`). The script creates an unconfirmed Auth user, inserts their department role and prints a unique temporary password privately. Verify email ownership and rotate the password before live use. Never commit credentials.

For an existing Auth account, staff provisioning must use the account's actual UUID. No `is_owner` column or field should be provided.

## Schema history

- `supabase/migrations/20261106_headquarters_executive_tech_rbac.sql` records the previously applied migration for audit history; it introduced a provisional Owner flag.
- `supabase/migrations/20261106_remove_unrequested_owner_flag.sql` is the corrective applied migration that **removes** that flag and retains exactly two roles. Do not re-run the earlier migration after the correction.
- This change applies to Headquarters only; the Manga, Anime and Merchandise databases were not modified.

## Development

Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, then run `npm install`, `npm run dev` or `npm run build`. Real login requires an appropriately provisioned Auth user and role record.
