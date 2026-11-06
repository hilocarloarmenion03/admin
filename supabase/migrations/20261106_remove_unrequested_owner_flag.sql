-- Forward corrective migration: V1 does not call for an is_owner staff flag.
-- Keep precisely two Headquarters RBAC roles.
alter table public.staff_roles
  drop constraint if exists staff_roles_role_check;
alter table public.staff_roles
  drop column if exists is_owner;
alter table public.staff_roles
  add constraint staff_roles_role_check
    check (role in ('executive', 'tech_admin'));
comment on table public.staff_roles is
  'Headquarters staff role: executive or tech_admin. RLS restricts each user to reading their own role; assignments require a trusted operator.';
