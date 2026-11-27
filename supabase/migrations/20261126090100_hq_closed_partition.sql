create or replace function hq_warehouse.stage_reading(p_permission uuid, packet jsonb)
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
      if period < date_trunc('month',now() at time zone 'Asia/Manila')::date - interval '23 months'
        or (packet->>'through_time')::timestamptz < ((period + interval '1 month') at time zone 'Asia/Manila') then
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
  where p.revoked_at is null and p.content_digest=l.content_digest and now()>=p.valid_from and now()<p.valid_until
  order by l.month desc,f.work_id;
end $$;

