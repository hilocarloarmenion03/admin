-- HQ-only account analysis. The public RPC returns aggregate cells, never identities.
create schema if not exists loxada_hq_reporting;
revoke all on schema loxada_hq_reporting from public, anon, authenticated;
grant usage on schema loxada_hq_reporting to authenticated;

create function loxada_hq_reporting.staff_account_counts()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $body$
begin
  if not exists (
    select 1
    from public.staff_roles viewer
    join auth.users u on u.id = viewer.user_id
    where viewer.user_id = (select auth.uid())
      and viewer.role in ('executive', 'tech_admin')
      and u.email_confirmed_at is not null
  ) then
    raise exception 'HQ staff account reporting is not authorized' using errcode = '42501';
  end if;

  return (
    select coalesce(jsonb_agg(to_jsonb(cell) order by cell.month, cell.role), '[]'::jsonb)
    from (
      select to_char(s.created_at at time zone 'Asia/Manila', 'YYYY-MM') as month,
             s.role,
             count(*) as total
      from public.staff_roles s
      where s.role in ('executive', 'tech_admin')
      group by 1, 2
    ) cell
  );
end;
$body$;
revoke all on function loxada_hq_reporting.staff_account_counts() from public, anon, authenticated;
grant execute on function loxada_hq_reporting.staff_account_counts() to authenticated;

create function public.hq_staff_account_counts()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $body$
  select loxada_hq_reporting.staff_account_counts();
$body$;
revoke all on function public.hq_staff_account_counts() from public, anon, authenticated;
grant execute on function public.hq_staff_account_counts() to authenticated;
comment on function public.hq_staff_account_counts() is
  'HQ operator and executive report. Monthly counts of current local staff role records. No identities or department accounts.';
