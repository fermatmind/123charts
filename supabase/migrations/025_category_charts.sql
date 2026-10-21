-- Classification is independent of enrollment and of the measurement scope.
alter table public.charts_categories add column parent_en text not null default 'Software & work';
alter table public.charts_categories add column parent_zh text not null default '软件与工作';
alter table public.charts_categories add column rules_version int not null default 1;
alter table public.charts_categories add column check_days int not null default 7 check(check_days between 1 and 90);
update public.charts_categories set parent_en='Software development',parent_zh='软件开发' where slug='ai-coding';
update public.charts_categories set parent_en='Business operations',parent_zh='企业管理' where slug='workflow-automation';
update public.charts_categories set parent_en='Knowledge & research',parent_zh='知识与研究' where slug='knowledge-search';
create table public.charts_memberships (
 project_id uuid not null references public.charts_projects(id) on delete cascade,
 category text not null references public.charts_categories(slug),
 state text not null default 'pending' check(state in ('pending','confirmed','adjusted')),
 placement text not null default 'main' check(placement in ('main','general','scope_unknown')),
 basis text not null, reviewed_at timestamptz, reviewed_by uuid references auth.users(id),
 primary key(project_id,category)
);
insert into public.charts_memberships(project_id,category,state,placement,basis,reviewed_at)
select id,category,'confirmed',case when domain in ('aws.amazon.com','github.com','huggingface.co','cloud.google.com','microsoft.com') then 'general' else 'main' end,
'Existing reviewed purpose classification; broad platform measurements are contextual only.',now() from public.charts_projects where category is not null;
create function public.charts_primary_membership() returns trigger language plpgsql set search_path=public as $$ begin
 if TG_OP='UPDATE' and old.category is distinct from new.category then
 update charts_memberships set state='adjusted',reviewed_at=now(),basis='Primary purpose classification adjusted; retained for audit.' where project_id=new.id and category=old.category;
 end if;
 if new.category is not null then
 insert into charts_memberships(project_id,category,state,basis,reviewed_at)
 values(new.id,new.category,case when new.publication='published' then 'confirmed' else 'pending' end,'Primary purpose recorded during profile review.',case when new.publication='published' then now() else null end)
 on conflict(project_id,category) do update set state=case when new.publication='published' then 'confirmed' else charts_memberships.state end;
 end if;return new;end $$;
create trigger charts_primary_membership after insert or update of category,publication on public.charts_projects for each row execute function public.charts_primary_membership();
alter table public.charts_memberships enable row level security;
create policy public_memberships on public.charts_memberships for select to anon,authenticated using(exists(select 1 from public.charts_projects p where p.id=project_id and p.publication='published'));
revoke all on public.charts_memberships from anon,authenticated; grant select on public.charts_memberships to anon,authenticated;
create table public.charts_classification_log (
 id uuid primary key default gen_random_uuid(),project_id uuid not null references public.charts_projects(id) on delete cascade,
 category text not null,decision jsonb not null,actor uuid references auth.users(id),created_at timestamptz not null default now()
);
alter table public.charts_classification_log enable row level security;
revoke all on public.charts_classification_log from anon,authenticated;

alter table public.charts_traffic add column raw_display text;
alter table public.charts_traffic add column precision_step numeric not null default 1 check(precision_step>0);
alter table public.charts_snapshots add column rule_version text not null default 'purpose-visits-v1';
alter table public.charts_snapshots add column members jsonb not null default '[]';
alter table public.charts_snapshots add column exclusions jsonb not null default '[]';
create table public.charts_verification_tasks (
 id uuid primary key default gen_random_uuid(), domain text not null,source text not null,month text not null,
 scope text not null, demo boolean not null default false, evidence_id uuid references public.charts_evidence(id) on delete set null,
 priority int not null default 0, state text not null default 'pending' check(state in ('pending','running','verified','needs_review','deferred','failed')),
 next_check_at timestamptz not null default now(),last_attempt_at timestamptz,last_success_at timestamptz,
 attempts int not null default 0,actual_calls int not null default 0,locked_at timestamptz,error text,
 unique(domain,source,month,scope,demo)
);
create table public.charts_verification_receipts (
 id uuid primary key default gen_random_uuid(),task_id uuid not null references public.charts_verification_tasks(id) on delete cascade,
 source_url text not null,response_hash text,response_body text,extracted jsonb, outcome text not null,
 detail text not null,actual_calls int not null default 0,cost_usd numeric not null default 0,
 attempted_at timestamptz not null default now(),success_at timestamptz,traffic_id uuid references public.charts_traffic(id)
);
alter table public.charts_verification_tasks enable row level security;
alter table public.charts_verification_receipts enable row level security;
revoke all on public.charts_verification_tasks,public.charts_verification_receipts from anon,authenticated;
create view public.charts_public_checks as select domain,source,month,scope,demo,state,next_check_at,last_attempt_at,last_success_at from public.charts_verification_tasks;
revoke all on public.charts_public_checks from anon,authenticated;grant select on public.charts_public_checks to anon,authenticated;
insert into public.charts_settings(key,value) values('verification','{"enabled":false,"source":"Semrush public","domains":["cursor.com"],"max_requests_daily":5,"max_runtime_ms":25000,"max_retries":3,"budget_usd_daily":0.05}') on conflict(key) do nothing;

-- Publication is serialized. A recheck with unchanged content reuses the old snapshot.
create function public.charts_publish_category(payload jsonb) returns public.charts_snapshots language plpgsql security definer set search_path=public as $$
declare prev charts_snapshots; result charts_snapshots;begin
 perform pg_advisory_xact_lock(hashtext(concat(payload->>'category',payload->>'source',payload->>'month',payload->>'demo')));
 select * into prev from charts_snapshots where category=payload->>'category' and source=payload->>'source' and month=payload->>'month' and metric=payload->>'metric' and scope=payload->>'scope' and demo=(payload->>'demo')::boolean order by version desc limit 1;
 if prev.id is not null and prev.entries=payload->'entries' and prev.total_count=(payload->>'total_count')::int and prev.members=payload->'members' and prev.exclusions=payload->'exclusions' and prev.rule_version=payload->>'rule_version' then return prev; end if;
 if prev.id is not null and length(trim(payload->>'correction_note'))<10 then raise exception 'Revision reason required'; end if;
 insert into charts_snapshots(category,source,month,metric,scope,version,entries,coverage_count,total_count,correction_note,demo,rule_version,members,exclusions)
 values(payload->>'category',payload->>'source',payload->>'month',payload->>'metric',payload->>'scope',coalesce(prev.version,0)+1,payload->'entries',(payload->>'coverage_count')::int,(payload->>'total_count')::int,payload->>'correction_note',(payload->>'demo')::boolean,payload->>'rule_version',payload->'members',payload->'exclusions') returning * into result;
 return result;end $$;
revoke all on function public.charts_publish_category(jsonb) from public,anon,authenticated;grant execute on function public.charts_publish_category(jsonb) to service_role;

create function public.charts_claim_verification() returns setof public.charts_verification_tasks language plpgsql security definer set search_path=public as $$ begin
 return query with next as(select id from charts_verification_tasks where (state in ('pending','verified','deferred') and next_check_at<=now()) or (state='running' and locked_at<now()-interval '3 minutes') order by priority desc,next_check_at for update skip locked limit 1)
 update charts_verification_tasks t set state='running',locked_at=now(),last_attempt_at=now(),attempts=attempts+1 from next where t.id=next.id returning t.*;end $$;
revoke all on function public.charts_claim_verification() from public,anon,authenticated; grant execute on function public.charts_claim_verification() to service_role;
