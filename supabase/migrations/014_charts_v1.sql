-- 123Charts: independent product authority, additive to the historical 88CN schema.
create table public.charts_categories (
 slug text primary key, name_en text not null, name_zh text not null,
 description_en text not null, description_zh text not null
);
create table public.charts_projects (
 id uuid primary key default gen_random_uuid(), slug text unique not null,
 name text not null, website_url text not null, domain text unique not null,
 measurement_domain text not null, category text references public.charts_categories(slug),
 description_en text not null default '', description_zh text not null default '',
 price_type text not null default 'freemium' check(price_type in ('free','freemium','trial','paid')),
 publication text not null default 'draft' check(publication in ('draft','published','archived')),
 collected_at timestamptz not null default now(), enrolled_at timestamptz,
 controller_id text, official_source text, source_checked_at timestamptz,
 demo boolean not null default false, updated_at timestamptz not null default now()
);
create table public.charts_applications (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 project_id uuid references public.charts_projects(id), kind text not null default 'initial' check(kind in ('initial','update')),
 draft jsonb not null default '{}', status text not null default 'draft'
 check(status in ('draft','submitted','verifying','approved','needs_info','rejected')),
 feedback text, demo boolean not null default false, submitted_at timestamptz, reviewed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.charts_relations (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.charts_applications(id),
 project_id uuid references public.charts_projects(id), peer_domain text not null, peer_name text not null,
 task text not null, rationale text not null, status text not null default 'pending'
 check(status in ('pending','approved','rejected')), feedback text,
 unique(application_id, peer_domain)
);
create table public.charts_evidence (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.charts_applications(id),
 owner_id uuid not null references auth.users(id), peer_domain text not null, storage_path text unique not null,
 file_hash text not null, original_name text not null, raw_text text, extracted jsonb,
 state text not null default 'pending_extraction' check(state in ('pending_extraction','pending_review','verified','conflict','invalid')),
 review_channel text, review_reference text, review_note text, reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz, traffic_id uuid, demo boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.charts_source_months (
 source text not null, month text not null check(month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
 published_at timestamptz not null, accepted boolean not null default true,
 reference text not null, demo boolean not null default false, primary key(source, month, demo)
);
create table public.charts_traffic (
 id uuid primary key default gen_random_uuid(), domain text not null, source text not null,
 month text not null check(month ~ '^\d{4}-(0[1-9]|1[0-2])$'), metric text not null default 'visits',
 scope text not null default 'worldwide-all-devices-domain', value numeric not null check(value >= 0),
 version int not null default 1, state text not null default 'verified' check(state in ('verified','conflict','superseded')),
 evidence_id uuid references public.charts_evidence(id), review_reference text not null,
 correction_note text, demo boolean not null default false, verified_at timestamptz not null default now(),
 unique(domain,source,month,metric,scope,version,demo)
);
alter table public.charts_evidence add foreign key(traffic_id) references public.charts_traffic(id);
create table public.charts_reports (
 id uuid primary key default gen_random_uuid(), application_id uuid unique not null references public.charts_applications(id),
 owner_id uuid not null references auth.users(id), project_id uuid not null references public.charts_projects(id),
 peers jsonb not null, share_token uuid unique, demo boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.charts_claims (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 project_id uuid not null references public.charts_projects(id), method text not null default 'manual_review',
 evidence text not null, state text not null default 'pending' check(state in ('pending','approved','rejected')),
 feedback text, reviewed_at timestamptz, created_at timestamptz not null default now()
);
create unique index charts_claim_unique_pending on public.charts_claims(project_id, owner_id) where state in ('pending','approved');
create table public.charts_corrections (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 project_id uuid not null references public.charts_projects(id), message text not null,
 state text not null default 'pending' check(state in ('pending','adopted','rejected')), feedback text,
 created_at timestamptz not null default now()
);
create table public.charts_snapshots (
 id uuid primary key default gen_random_uuid(), category text not null references public.charts_categories(slug),
 source text not null, month text not null, metric text not null, scope text not null,
 version int not null, entries jsonb not null, coverage_count int not null, total_count int not null,
 correction_note text, demo boolean not null default false, created_at timestamptz not null default now(),
 unique(category,source,month,metric,scope,version,demo)
);
create table public.charts_contributions (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.charts_projects(id),
 fingerprint text unique not null, type text not null, adopted_at timestamptz not null default now(),
 eligible boolean not null default false, demo boolean not null default false
);
create table public.charts_recommendations (
 id uuid primary key default gen_random_uuid(), day date not null, context text not null, slot int not null check(slot between 1 and 4),
 reason text not null, project_id uuid not null references public.charts_projects(id),
 demo boolean not null default false, unique(day,context,slot,demo), unique(day,context,project_id,demo)
);
create table public.charts_events (
 id uuid primary key default gen_random_uuid(), kind text not null check(kind in ('impression','project_view','outbound')),
 project_id uuid not null references public.charts_projects(id), visitor_id text not null, surface text not null,
 session_id text not null, excluded boolean not null default false, exclusion_reason text,
 created_at timestamptz not null default now()
);
create index charts_events_project_date on public.charts_events(project_id, created_at);
create table public.charts_follows (
 owner_id uuid not null references auth.users(id), target text not null, kind text not null check(kind in ('bookmark','project','category')),
 email_enabled boolean not null default false, created_at timestamptz not null default now(), primary key(owner_id,target,kind)
);
create table public.charts_notifications (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 title_en text not null, title_zh text not null, body_en text not null, body_zh text not null,
 href text not null, seen boolean not null default false, email_sent_at timestamptz,
 dedupe_key text unique not null, created_at timestamptz not null default now()
);
create table public.charts_jobs (
 id uuid primary key default gen_random_uuid(), kind text not null check(kind in ('ocr','metadata','digest','recommendations')),
 owner_id uuid references auth.users(id), payload jsonb not null, state text not null default 'pending'
 check(state in ('pending','running','done','failed')), attempts int not null default 0,
 locked_at timestamptz, run_after timestamptz not null default now(), result jsonb, error text,
 created_at timestamptz not null default now(), finished_at timestamptz
);
create index charts_jobs_queue on public.charts_jobs(state,run_after);
create table public.charts_settings (key text primary key, value jsonb not null);
insert into public.charts_settings values ('recommendations','{"recentDays":30,"lowExposureDays":7,"projectCap":1,"controllerCap":2,"capDays":7}');

-- RLS is the database boundary even when application routes use service-role queries.
do $$ declare t text; begin
 foreach t in array array['categories','projects','applications','relations','evidence','source_months','traffic','reports','claims','corrections','snapshots','contributions','recommendations','events','follows','notifications','jobs','settings'] loop
 execute format('alter table public.charts_%I enable row level security',t);
 execute format('create policy admin_all on public.charts_%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',t);
 end loop;
end $$;
create policy public_categories on public.charts_categories for select to anon,authenticated using(true);
create policy public_projects on public.charts_projects for select to anon,authenticated using(publication='published');
create policy public_months on public.charts_source_months for select to anon,authenticated using(true);
create policy public_traffic on public.charts_traffic for select to anon,authenticated using(state='verified');
create policy public_snapshots on public.charts_snapshots for select to anon,authenticated using(true);
create policy public_recommendations on public.charts_recommendations for select to anon,authenticated using(true);
create policy own_applications on public.charts_applications for select to authenticated using(owner_id=auth.uid());
create policy own_evidence on public.charts_evidence for select to authenticated using(owner_id=auth.uid());
create policy own_relations on public.charts_relations for select to authenticated using(exists(select 1 from public.charts_applications a where a.id=application_id and a.owner_id=auth.uid()));
create policy own_reports on public.charts_reports for select to authenticated using(owner_id=auth.uid());
create policy own_claims on public.charts_claims for select to authenticated using(owner_id=auth.uid());
create policy own_corrections on public.charts_corrections for select to authenticated using(owner_id=auth.uid());
create policy own_follows on public.charts_follows for select to authenticated using(owner_id=auth.uid());
create policy own_notifications on public.charts_notifications for select to authenticated using(owner_id=auth.uid());
create policy own_jobs on public.charts_jobs for select to authenticated using(owner_id=auth.uid());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('charts-evidence','charts-evidence',false,10485760,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
-- No public Storage policy: server validates access and signs individual private objects.

create or replace function public.charts_claim_job() returns setof public.charts_jobs
language plpgsql security definer set search_path=public as $$ begin
 return query with next as (
 select id from charts_jobs where (state='pending' and run_after<=now()) or (state='running' and locked_at<now()-interval '3 minutes')
 order by created_at for update skip locked limit 1
 ) update charts_jobs j set state='running',locked_at=now(),attempts=attempts+1 from next where j.id=next.id returning j.*;
end $$;

create or replace function public.charts_verify_evidence(eid uuid, actor uuid, fields jsonb, channel text, reference text, note text, revision boolean default false)
returns jsonb language plpgsql security definer set search_path=public as $$
declare e charts_evidence; old charts_traffic; tid uuid; next_version int; v numeric; begin
 select * into e from charts_evidence where id=eid for update;
 if e.id is null then raise exception 'Evidence not found'; end if;
 if length(trim(channel))<3 or length(trim(reference))<8 then raise exception 'Review channel and reference required'; end if;
 if e.state='verified' then return jsonb_build_object('id',e.traffic_id,'state','verified'); end if;
 if fields->>'domain'<>e.peer_domain or fields->>'metric'<>'visits' or fields->>'source'<>'AITDK' or fields->>'scope'<>'worldwide-all-devices-domain' then raise exception 'Measurement domain, source, metric or scope does not match'; end if;
 if not (fields ? 'value') or fields->>'value' is null or (fields->>'value')::numeric<0 then raise exception 'Numeric visits are required'; end if;
 if not exists(select 1 from charts_source_months where source=fields->>'source' and month=fields->>'month' and accepted and demo=e.demo) then raise exception 'Month is outside the accepted released months'; end if;
 if e.demo=false and reference like 'demo:%' then raise exception 'Demo reference cannot verify real evidence'; end if;
 v:=(fields->>'value')::numeric;
 perform pg_advisory_xact_lock(hashtext(e.peer_domain||(fields->>'month')));
 select * into old from charts_traffic where domain=e.peer_domain and source=fields->>'source' and month=fields->>'month' and metric=fields->>'metric' and scope=fields->>'scope' and demo=e.demo order by version desc limit 1;
 if old.id is not null and old.value=v and old.state='verified' then tid:=old.id;
 else
 next_version:=coalesce(old.version,0)+1;
 if old.id is not null and not revision then
 update charts_traffic set state='conflict' where domain=e.peer_domain and source=fields->>'source' and month=fields->>'month' and metric=fields->>'metric' and scope=fields->>'scope' and demo=e.demo and state='verified';
 update charts_evidence set state='conflict',review_note='Unresolved same-scope value conflict',extracted=fields where id=eid;
 return jsonb_build_object('state','conflict');
 end if;
 if revision and length(trim(note))<10 then raise exception 'A source revision requires an explanation'; end if;
 if old.id is not null then update charts_traffic set state='superseded' where domain=e.peer_domain and source=fields->>'source' and month=fields->>'month' and metric=fields->>'metric' and scope=fields->>'scope' and demo=e.demo; end if;
 insert into charts_traffic(domain,source,month,metric,scope,value,version,evidence_id,review_reference,correction_note,demo)
 values(e.peer_domain,fields->>'source',fields->>'month',fields->>'metric',fields->>'scope',v,next_version,eid,reference,note,e.demo) returning id into tid;
 end if;
 update charts_evidence set state='verified',traffic_id=tid,extracted=fields,review_channel=channel,review_reference=reference,review_note=note,reviewed_at=now(),reviewed_by=actor where id=eid;
 return jsonb_build_object('id',tid,'state','verified');
end $$;

create or replace function public.charts_approve_application(aid uuid,actor uuid) returns uuid
language plpgsql security definer set search_path=public as $$
declare a charts_applications; pid uuid; d jsonb; report_peers jsonb; valid_count int; contribution_key text; begin
 select * into a from charts_applications where id=aid for update;
 if a.id is null then raise exception 'Application not found'; end if;
 if a.status='approved' then return a.project_id; end if;
 if a.status not in ('submitted','verifying','needs_info') then raise exception 'Application is not reviewable'; end if;
 d:=a.draft;
 if a.kind='initial' then
 if (select count(distinct peer_domain) from charts_relations where application_id=aid and status='approved')<>10 then raise exception 'Exactly ten reviewed relevant peers required'; end if;
 select count(distinct e.peer_domain) into valid_count from charts_evidence e join charts_traffic t on e.traffic_id=t.id
 join charts_source_months m on m.source=t.source and m.month=t.month and m.demo=t.demo and m.accepted
 where e.application_id=aid and e.state='verified' and t.state='verified';
 if valid_count<5 or valid_count>10 then raise exception 'Evidence for five to ten distinct peers required'; end if;
 if exists(select 1 from charts_evidence where application_id=aid and state in ('conflict','pending_extraction','pending_review')) then raise exception 'Resolve outstanding evidence review first'; end if;
 else
 if not exists(select 1 from charts_claims where project_id=a.project_id and owner_id=a.owner_id and state='approved') then raise exception 'Approved owner claim required for project updates'; end if;
 end if;
 pid:=a.project_id;
 if pid is null then
 select id into pid from charts_projects where domain=d->>'domain';
 if pid is null then
 insert into charts_projects(slug,name,website_url,domain,measurement_domain,category,description_en,description_zh,price_type,publication,enrolled_at,controller_id,demo)
 values(d->>'slug',d->>'name',d->>'website_url',d->>'domain',d->>'domain',d->>'category',d->>'description_en',d->>'description_zh',d->>'price_type','published',now(),a.owner_id::text,a.demo) returning id into pid;
 else update charts_projects set enrolled_at=coalesce(enrolled_at,now()) where id=pid; end if;
 elsif a.kind='update' then
 update charts_projects set name=d->>'name',description_en=d->>'description_en',description_zh=d->>'description_zh',price_type=d->>'price_type',category=d->>'category',updated_at=now() where id=pid;
 end if;
 update charts_relations set project_id=pid where application_id=aid;
 select jsonb_agg(jsonb_build_object('domain',r.peer_domain,'name',r.peer_name,'task',r.task,'rationale',r.rationale,'relationship_state',r.status,'traffic',(
 select jsonb_build_object('value',t.value,'month',t.month,'source',t.source,'scope',t.scope,'version',t.version,'state',t.state) from charts_traffic t where t.domain=r.peer_domain and t.demo=a.demo and t.state='verified' order by month desc,version desc limit 1
 ))) into report_peers from charts_relations r where application_id=aid;
 if a.kind='initial' then
 insert into charts_reports(application_id,owner_id,project_id,peers,demo) values(aid,a.owner_id,pid,coalesce(report_peers,'[]'),a.demo) on conflict(application_id) do nothing;
 end if;
 contribution_key:='application:'||aid;
 insert into charts_contributions(project_id,fingerprint,type,eligible,demo)
 values(pid,contribution_key,case when a.kind='initial' then 'enrollment' else 'update' end,
 not exists(select 1 from charts_contributions where project_id=pid and eligible and adopted_at>now()-interval '7 days')
 and (select count(*) from charts_contributions c join charts_projects p on p.id=c.project_id where p.controller_id=a.owner_id::text and c.eligible and c.adopted_at>now()-interval '7 days')<2,a.demo) on conflict(fingerprint) do nothing;
 update charts_applications set status='approved',project_id=pid,reviewed_at=now(),updated_at=now(),feedback=null where id=aid;
 insert into charts_notifications(owner_id,title_en,title_zh,body_en,body_zh,href,dedupe_key)
 values(a.owner_id,'Application approved','申请已通过','Your project and peer observation group are ready.','项目档案与同行观察组已准备好。','/dashboard','approved:'||aid) on conflict(dedupe_key) do nothing;
 return pid;
end $$;

-- Server-only transactional operations; neither anon nor authenticated clients may invoke them.
revoke all on function public.charts_claim_job() from public,anon,authenticated;
revoke all on function public.charts_verify_evidence(uuid,uuid,jsonb,text,text,text,boolean) from public,anon,authenticated;
revoke all on function public.charts_approve_application(uuid,uuid) from public,anon,authenticated;
grant execute on function public.charts_claim_job() to service_role;
grant execute on function public.charts_verify_evidence(uuid,uuid,jsonb,text,text,text,boolean) to service_role;
grant execute on function public.charts_approve_application(uuid,uuid) to service_role;
create or replace function public.charts_save_draft(aid uuid,actor uuid,d jsonb,is_demo boolean,update_project uuid default null)
returns public.charts_applications language plpgsql security definer set search_path=public as $$
declare a charts_applications; peer_json jsonb; begin
 if aid is not null then
 select * into a from charts_applications where id=aid and owner_id=actor for update;
 if a.id is null then raise exception 'Application not found'; end if;
 if a.status not in ('draft','needs_info') then raise exception 'Only drafts and requested supplements can be edited'; end if;
 if exists(select 1 from charts_evidence e where e.application_id=aid and not exists(select 1 from jsonb_array_elements(d->'peers') p where p->>'domain'=e.peer_domain)) then raise exception 'Remove the associated evidence before removing a peer'; end if;
 update charts_applications set draft=d,updated_at=now() where id=aid returning * into a;
 else
 if update_project is not null and not exists(select 1 from charts_claims where project_id=update_project and owner_id=actor and state='approved') then raise exception 'Owner claim required'; end if;
 insert into charts_applications(owner_id,draft,demo,project_id,kind) values(actor,d,is_demo,update_project,case when update_project is null then 'initial' else 'update' end) returning * into a;
 end if;
 delete from charts_relations r where r.application_id=a.id and not exists(select 1 from jsonb_array_elements(d->'peers') p where p->>'domain'=r.peer_domain);
 for peer_json in select * from jsonb_array_elements(d->'peers') loop
 insert into charts_relations(application_id,project_id,peer_domain,peer_name,task,rationale) values(a.id,a.project_id,peer_json->>'domain',peer_json->>'name',peer_json->>'task',peer_json->>'rationale')
 on conflict(application_id,peer_domain) do update set peer_name=excluded.peer_name,task=excluded.task,rationale=excluded.rationale,
 status=case when charts_relations.task=excluded.task and charts_relations.rationale=excluded.rationale then charts_relations.status else 'pending' end;
 end loop;
 return a;
end $$;
revoke all on function public.charts_save_draft(uuid,uuid,jsonb,boolean,uuid) from public,anon,authenticated;
grant execute on function public.charts_save_draft(uuid,uuid,jsonb,boolean,uuid) to service_role;
