-- Only a trusted operator can register independently verified Steward permissions,
-- validate a source packet or publish it. No browser or API role receives write access.
create schema hq_warehouse;
revoke all on schema hq_warehouse from public, anon, authenticated, service_role;

create table hq_warehouse.export_permission (
  permission_id uuid primary key,
  content_digest text not null check (content_digest ~ '^[a-f0-9]{64}$'),
  steward_evidence text not null check (length(trim(steward_evidence)) > 0),
  reconciliation_evidence text not null check (length(trim(reconciliation_evidence)) > 0),
  disclosure_review text not null check (length(trim(disclosure_review)) > 0),
  valid_from timestamptz not null,
  valid_until timestamptz not null check (valid_until > valid_from),
  revoked_at timestamptz
);

create table hq_warehouse.reading_audience (
  user_id uuid primary key references auth.users(id) on delete cascade,
  purpose_approval text not null check (length(trim(purpose_approval)) > 0),
  valid_until timestamptz not null
);

create table hq_warehouse.reading_batch (
  month date not null,
  revision integer not null check (revision > 0),
  permission_id uuid not null references hq_warehouse.export_permission,
  content_digest text not null,
  coverage text not null check (coverage in ('released','no_data','withheld')),
  through_time timestamptz not null,
  accepted_at timestamptz not null default now(),
  published_at timestamptz,
  primary key (month,revision)
);
create table hq_warehouse.reading_fact (
  month date not null,
  revision integer not null,
  work_id text not null check (length(trim(work_id)) between 1 and 160),
  read_starts integer not null check (read_starts >= 0),
  read_completions integer not null check (read_completions between 0 and read_starts),
  title_distinct_readers integer not null check (title_distinct_readers between 0 and read_starts
    and ((read_starts = 0 and title_distinct_readers = 0) or title_distinct_readers >= 10)),
  primary key (month,revision,work_id),
  foreign key (month,revision) references hq_warehouse.reading_batch on delete cascade
);
create table hq_warehouse.transfer_attempt (
  attempted_at timestamptz not null default now(),
  operation text not null,
  outcome text not null,
  permission_id uuid
);

create function hq_warehouse.stage_reading(p_permission uuid, packet jsonb)
returns text language plpgsql set search_path='' as $$
declare
  fingerprint text := encode(sha256(convert_to(packet::text,'UTF8')),'hex');
  outcome text := 'rejected';
  period date;
  rev integer;
  existing text;
begin
  if exists(select 1 from hq_warehouse.export_permission where permission_id=p_permission
     and content_digest=fingerprint and now() >= valid_from and now()<valid_until and revoked_at is null) then
    begin
      if not (packet ?& array['month','version','dataset','revision','coverage','through_time','rows'])
        or packet - array['month','version','dataset','revision','coverage','through_time','rows'] <> '{}'
        or packet->'version' <> '1' or packet->>'dataset' <> 'manga_title_engagement_monthly'
        or packet->>'month' !~ '^[0-9]{4}-[0-9]{2}-01$'
        or jsonb_typeof(packet->'revision') <> 'number' or packet->>'revision' !~ '^[1-9][0-9]*$'
        or packet->>'through_time' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|\+00:00)$'
        or (packet->>'through_time')::timestamptz > now()
        or jsonb_typeof(packet->'rows') <> 'array'
        or ((packet->>'coverage'='released') <> (jsonb_array_length(packet->'rows')>0))
        or exists(select from jsonb_each(packet) e where e.value='null')
      then raise exception 'invalid packet'; end if;
      period := (packet->>'month')::date;
      rev := (packet->>'revision')::integer;
      if period < date_trunc('month',now() at time zone 'Asia/Manila')::date - interval '24 months'
        or period > ((packet->>'through_time')::timestamptz at time zone 'Asia/Manila')::date then
        raise exception 'invalid coverage'; end if;
      perform pg_advisory_xact_lock(72893,period-date '2000-01-01');
      select content_digest into existing from hq_warehouse.reading_batch where month=period and revision=rev;
      if existing is not null then
        outcome := case when existing=fingerprint then 'accepted' else 'conflict' end;
      else
        insert into hq_warehouse.reading_batch(month,revision,permission_id,content_digest,coverage,through_time)
        values(period,rev,p_permission,fingerprint,packet->>'coverage',(packet->>'through_time')::timestamptz);
        if exists(select from jsonb_array_elements(packet->'rows') r
          where jsonb_typeof(r)<>'object' or r-array['work_id','read_starts','read_completions','title_distinct_readers'] <> '{}'
            or jsonb_typeof(r->'work_id')<>'string'
            or exists(select from unnest(array['read_starts','read_completions','title_distinct_readers']) k
              where jsonb_typeof(r->k)<>'number' or r->>k !~ '^[0-9]+$'))
        then raise exception 'invalid row'; end if;
        insert into hq_warehouse.reading_fact
          select period,rev,work_id,read_starts,read_completions,title_distinct_readers
          from jsonb_to_recordset(packet->'rows') as r(work_id text,read_starts int,read_completions int,title_distinct_readers int);
        outcome := 'accepted';
      end if;
    exception when data_exception or integrity_constraint_violation or raise_exception then outcome := 'rejected';
    end;
  end if;
  insert into hq_warehouse.transfer_attempt(operation,outcome,permission_id) values('validation',outcome,p_permission);
  return outcome;
end $$;

create function hq_warehouse.publish_reading(period date, rev integer) returns text language plpgsql set search_path='' as $$
declare
  outcome text := 'held';
  perm uuid;
begin
  perform pg_advisory_xact_lock(72893,period-date '2000-01-01');
  select p.permission_id into perm from hq_warehouse.reading_batch b join hq_warehouse.export_permission p using(permission_id)
    where b.month=period and b.revision=rev and b.content_digest=p.content_digest
      and p.revoked_at is null and now()>=p.valid_from and now()<p.valid_until for share of p;
  if perm is not null and not exists(select from hq_warehouse.reading_batch where month=period and revision>rev and published_at is not null) then
    update hq_warehouse.reading_batch set published_at=coalesce(published_at,now()) where month=period and revision=rev;
    outcome := 'published';
  end if;
  insert into hq_warehouse.transfer_attempt(operation,outcome,permission_id) values('publication',outcome,perm);
  return outcome;
end $$;

create function hq_warehouse.reading_report()
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
    where b.published_at is not null and b.month >= date_trunc('month', now() at time zone 'Asia/Manila')::date - interval '24 months'
    order by b.month,b.revision desc
  )
  select l.month,l.revision,l.through_time,l.coverage,f.work_id,f.read_starts,f.read_completions,f.title_distinct_readers
  from latest l join hq_warehouse.export_permission p using(permission_id)
  left join hq_warehouse.reading_fact f on f.month=l.month and f.revision=l.revision
  where p.revoked_at is null and p.content_digest=l.content_digest and now()>=p.valid_from and now()<p.valid_until
  order by l.month desc,f.work_id;
end $$;

create function public.hq_reading_report()
returns jsonb language sql stable security invoker set search_path='' as $$
  select coalesce(jsonb_agg(to_jsonb(r) order by r.month desc,r.work_id),'[]'::jsonb)
  from hq_warehouse.reading_report() r
$$;
revoke all on all functions in schema hq_warehouse from public,authenticated,anon,service_role;
revoke all on function public.hq_reading_report() from public,anon,service_role;
grant usage on schema hq_warehouse to authenticated;
grant execute on function hq_warehouse.reading_report(),public.hq_reading_report() to authenticated;
