-- Headquarters only: executive and technical administrator role separation.
-- Owner business authority is a separate flag, never assigned by registering or by tech_admin.
alter table public.staff_roles
  add column if not exists is_owner boolean not null default false;
alter table public.staff_roles
  drop constraint if exists staff_roles_role_check;
alter table public.staff_roles
  add constraint staff_roles_role_check
  check (
    role in ('executive', 'tech_admin')
    and (not is_owner or role = 'executive')
  );
alter table public.staff_roles enable row level security;
revoke all on table public.staff_roles from anon, authenticated;
grant select on table public.staff_roles to authenticated;
comment on table public.staff_roles is
'Headquarters role is executive or tech_admin. is_owner is restricted to executives, must be provisioned separately by trusted operator. Clients can only read their own record.';
