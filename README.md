# Loxada — Headquarters

Two independent **account types**, not two shared accounts.

| Type | Database role | Dashboard | Responsibility |
| --- | --- | --- | --- |
| Executive | `executive` | `/executive` | Company reports, governance, business decisions |
| Technical administrator | `tech_admin` | `/admin` | Technical controls, system security, staff access administration (future tools) |

**Owner authority is separate:** an executive is not automatically the Owner. The trusted `staff_roles.is_owner` flag defaults to `false` and can only be set by a separately approved operator procedure. The database rejects a technical administrator with `is_owner = true`.

## Authentication and permissions

- All staff use the same `/login` with **individual** Supabase Auth identities.
- After verifying email/password, confirmed email and the trusted staff role, the server redirects to the matching dashboard.
- `/admin` and `/executive` are protected server-side in both their layouts and pages. Neither role can enter the other area.
- `staff_roles` uses RLS: members may read their own record but cannot assign or edit roles from the client.
- No signup or self-assignment. No real approvals, user administration forms, business reports or technical monitoring actions are implemented yet.
- The optional legacy `admin` username alias resolves to `ADMIN_LOGIN_EMAIL` if configured; it **never** authorizes a session. Prefer unique real emails. Never use `admin/admin` as public credentials.
- API routes, server actions and data queries added later must enforce their own permissions; page protection alone is insufficient.

## Provisioning staff

A trusted operator may run `node scripts/provision-staff.mjs` locally with private `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `STAFF_EMAIL`, `STAFF_ROLE` (`executive` or `tech_admin`). The script creates an **unconfirmed** Auth user and inserts a non-Owner staff role, with a random temporary password printed to the trusted terminal. Confirm email ownership and rotate that temporary password before live use. Do not put the secret or password in browser code, GitHub, chat logs or a public deployment.

For an **existing** Auth user, an authorized operator must assign that actual user's UUID to `public.staff_roles` through a trusted process. Do not assume the Auth account automatically has executive privileges.

The previously used `owner_admin` role is retired in Headquarters. The other three department databases and repositories are **unchanged**.

## Development

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` on the relevant Supabase project. Build with `npm run build` and run with `npm run dev`. Confirm real end-to-end login only when authorized staff accounts are available.

See `supabase/migrations/20261106_headquarters_executive_tech_rbac.sql` for the applied role migration.
