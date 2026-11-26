-- Trusted intake records one independently approved, minimized classroom proposal.
create schema hq_opportunities;
revoke all on schema hq_opportunities from public, anon, authenticated;
create table hq_opportunities.proposals (
  id uuid primary key default gen_random_uuid(),
  path text not null check (path in ('manga_to_anime','anime_to_merch')),
  source_case uuid not null,
  revision integer not null check (revision > 0),
  subject_ref text not null check (length(trim(subject_ref)) between 1 and 160),
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  evidence_ref uuid not null,
  evidence_revision integer not null check (evidence_revision > 0),
  approval_ref uuid not null,
  rights_inquiry text not null check (length(trim(rights_inquiry)) between 1 and 240),
  rationale text not null check (length(trim(rationale)) between 1 and 500),
  product_category text check (length(trim(product_category)) between 1 and 80),
  submitted_at timestamptz not null default now(),
  unique(path,source_case,revision),
  check ((path = 'anime_to_merch') = (product_category is not null))
);
create table hq_opportunities.decisions (
  proposal_id uuid primary key references hq_opportunities.proposals,
  reviewer uuid not null,
  outcome text not null check (outcome in ('investigate','return','decline')),
  reason text not null check (length(trim(reason)) between 1 and 240),
  decided_at timestamptz not null default now()
);
alter table hq_opportunities.proposals enable row level security;
alter table hq_opportunities.decisions enable row level security;

create function hq_opportunities.require_executive() returns void language plpgsql stable
security invoker set search_path = '' as $$
begin
  if not exists(select from public.staff_roles s join auth.users u on u.id=s.user_id
    where s.user_id=auth.uid() and s.role='executive' and u.email_confirmed_at is not null)
  then raise exception 'Executive access required' using errcode='42501'; end if;
end $$;
create function public.hq_opportunities_for_review() returns jsonb language plpgsql stable
security definer set search_path = '' as $$
begin
  perform hq_opportunities.require_executive();
  return (select coalesce(jsonb_agg(to_jsonb(p) || jsonb_build_object('outcome',d.outcome,'reason',d.reason)
    order by p.submitted_at desc,p.id),'[]'::jsonb)
    from hq_opportunities.proposals p left join hq_opportunities.decisions d on d.proposal_id=p.id
    where not exists(select from hq_opportunities.proposals newer where newer.path=p.path
      and newer.source_case=p.source_case and newer.revision>p.revision));
end $$;
create function public.hq_review_opportunity(p_id uuid,p_outcome text,p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform hq_opportunities.require_executive();
  lock table hq_opportunities.proposals in share mode;
  if not exists(select from hq_opportunities.proposals p where p.id=p_id and not exists(
    select from hq_opportunities.proposals newer where newer.path=p.path
    and newer.source_case=p.source_case and newer.revision>p.revision))
  then raise exception 'Proposal superseded or unavailable'; end if;
  insert into hq_opportunities.decisions values(p_id,auth.uid(),p_outcome,trim(p_reason),statement_timestamp())
  on conflict(proposal_id) do nothing;
  if not exists(select from hq_opportunities.decisions where proposal_id=p_id and reviewer=auth.uid()
    and outcome=p_outcome and reason=trim(p_reason)) then raise exception 'Already reviewed'; end if;
end $$;
revoke all on function public.hq_opportunities_for_review(),public.hq_review_opportunity(uuid,text,text) from public,anon;
grant execute on function public.hq_opportunities_for_review(),public.hq_review_opportunity(uuid,text,text) to authenticated;
