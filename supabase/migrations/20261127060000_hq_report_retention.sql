-- Steward-controlled REPORTS_24M review and restricted preservation.
create table hq_warehouse.reading_hold (
  case_id uuid primary key,
  month date not null check (extract(day from month)=1),
  revision integer check (revision > 0), -- null covers all revisions of this month
  reason text not null check (length(trim(reason)) between 1 and 500),
  reviewer text not null check (length(trim(reviewer)) between 1 and 160),
  recorded_at timestamptz not null default statement_timestamp(),
  next_review_at timestamptz not null check (next_review_at > recorded_at),
  released_at timestamptz check (released_at >= recorded_at),
  release_reference text,
  check ((released_at is null and release_reference is null) or
         (released_at is not null and length(trim(release_reference)) > 0 and release_reference is not null))
);
create index reading_active_hold on hq_warehouse.reading_hold(month,revision) where released_at is null;

create table hq_warehouse.reading_disposal_review (
  month date not null,
  revision integer not null,
  review_reference text not null check(length(trim(review_reference)) between 1 and 160),
  reviewer text not null check(length(trim(reviewer)) between 1 and 160),
  reviewed_at timestamptz not null default statement_timestamp(),
  primary key(month,revision),
  foreign key(month,revision) references hq_warehouse.reading_batch on delete cascade
);
create table hq_warehouse.reading_disposal_receipt (
  month date not null,
  revision integer not null,
  review_reference text not null,
  disposed_at timestamptz not null default statement_timestamp(),
  primary key(month,revision)
);

create view hq_warehouse.reading_retention_queue as
select b.month,b.revision,
       ((b.month+interval '25 months') at time zone 'Asia/Manila') as expires_at,
       exists(select from hq_warehouse.reading_hold h where h.month=b.month
         and (h.revision is null or h.revision=b.revision) and h.released_at is null) as held,
       r.review_reference
from hq_warehouse.reading_batch b left join hq_warehouse.reading_disposal_review r using(month,revision)
where ((b.month+interval '25 months') at time zone 'Asia/Manila') <= statement_timestamp();

create function hq_warehouse.dispose_reading_reports() returns integer
language plpgsql security invoker set search_path='' as $$
declare total integer;
begin
  -- Serialize hold/review changes against the actual irreversible transaction.
  lock table hq_warehouse.reading_hold, hq_warehouse.reading_disposal_review in share row exclusive mode;
  with eligible as materialized (
    select month,revision,review_reference from hq_warehouse.reading_retention_queue
    where not held and review_reference is not null
  ), disposed as (
    delete from hq_warehouse.reading_batch b using eligible e
    where b.month=e.month and b.revision=e.revision returning b.month,b.revision
  )
  insert into hq_warehouse.reading_disposal_receipt(month,revision,review_reference)
  select d.month,d.revision,e.review_reference from disposed d join eligible e using(month,revision);
  get diagnostics total=row_count;
  return total;
end $$;

revoke all on all tables in schema hq_warehouse from public,anon,authenticated,service_role;
revoke all on function hq_warehouse.dispose_reading_reports() from public,anon,authenticated,service_role;

create or replace function hq_warehouse.reading_report()
returns table(month date, revision int, through_time timestamptz, coverage text, work_id text,
 read_starts int,read_completions int,title_distinct_readers int)
language plpgsql stable security definer set search_path='' as $$
begin
  if not exists(select from public.staff_roles s join auth.users u on u.id=s.user_id
    join hq_warehouse.reading_audience a on a.user_id=s.user_id and a.valid_until>now()
    where s.user_id=(select auth.uid()) and s.role='executive' and u.email_confirmed_at is not null)
  then raise exception 'Executive access required' using errcode='42501'; end if;
  return query with latest as (
    select distinct on (b.month) b.* from hq_warehouse.reading_batch b
    where b.published_at is not null and b.month >= date_trunc('month', now() at time zone 'Asia/Manila')::date - interval '23 months'
    order by b.month,b.revision desc
  )
  select l.month,l.revision,l.through_time,l.coverage,f.work_id,f.read_starts,f.read_completions,f.title_distinct_readers
  from latest l join hq_warehouse.export_permission p using(permission_id)
  left join hq_warehouse.reading_fact f on f.month=l.month and f.revision=l.revision
  where not exists(select from hq_warehouse.reading_hold h
    where h.month=l.month and (h.revision is null or h.revision=l.revision) and h.released_at is null)
    and p.revoked_at is null and p.content_digest=l.content_digest and now()>=p.valid_from and now()<p.valid_until
  order by l.month desc,f.work_id;
end $$;


-- Review decisions are supplied by operators. Only reviewed expired data is removed.
create extension if not exists pg_cron;
select cron.schedule('hq-reviewed-report-disposal','20 19 * * *',
  'select hq_warehouse.dispose_reading_reports()');
