create table public.charts_source_evidence (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),
 domain text not null,source text not null,month text not null,storage_path text unique not null,file_hash text not null,
 raw_text text,extracted jsonb,state text not null default 'pending_extraction',created_at timestamptz not null default now()
);
alter table public.charts_source_evidence enable row level security;
revoke all on public.charts_source_evidence from anon,authenticated;
alter table public.charts_verification_tasks add column source_evidence_id uuid references public.charts_source_evidence(id) on delete set null;
-- Rechecking the same value retains its data version. Conflicts require explicit review.
create function public.charts_record_observation(fields jsonb,receipt uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare old charts_traffic; tid uuid; begin
 if fields->>'source' not in ('Semrush public','TabAPI') or fields->>'scope'<>'worldwide-all-devices-domain' or fields->>'metric'<>'visits' or fields->>'month' !~ '^\d{4}-(0[1-9]|1[0-2])$' or (fields->>'value')::numeric<0 then raise exception 'Invalid source observation';end if;
 if not exists(select 1 from charts_verification_receipts r join charts_verification_tasks t on t.id=r.task_id where r.id=receipt and r.outcome='matched' and r.success_at is not null and not t.demo and t.domain=fields->>'domain' and t.source=fields->>'source' and t.month=fields->>'month') then raise exception 'Matching real source receipt required';end if;
 perform pg_advisory_xact_lock(hashtext(concat(fields->>'domain',fields->>'source',fields->>'month')));
 select * into old from charts_traffic where domain=fields->>'domain' and source=fields->>'source' and month=fields->>'month' and scope=fields->>'scope' and metric='visits' and not demo order by version desc limit 1;
 if old.id is not null and old.state='verified' and old.value=(fields->>'value')::numeric then
 update charts_verification_receipts set traffic_id=old.id where id=receipt;
 return jsonb_build_object('state','verified','id',old.id,'changed',false);end if;
 if old.id is not null then
 update charts_traffic set state='conflict' where id=old.id and state='verified';
 return jsonb_build_object('state','conflict','id',old.id,'changed',true);end if;
 insert into charts_traffic(domain,source,month,metric,scope,value,raw_display,precision_step,review_reference,correction_note,demo)
 values(fields->>'domain',fields->>'source',fields->>'month','visits',fields->>'scope',(fields->>'value')::numeric,fields->>'raw_display',coalesce((fields->>'precision_step')::numeric,1),'source-receipt:'||receipt,'Public source read and scope checked; modeled visits, not first-party analytics.',false) returning id into tid;
 update charts_verification_receipts set traffic_id=tid where id=receipt;
 return jsonb_build_object('state','verified','id',tid,'changed',true);end $$;
revoke all on function public.charts_record_observation(jsonb,uuid) from public,anon,authenticated;grant execute on function public.charts_record_observation(jsonb,uuid) to service_role;
create function public.charts_review_membership(pid uuid,cat text,decision jsonb,actor uuid) returns void language plpgsql security definer set search_path=public as $$ begin
 if length(trim(decision->>'basis'))<10 or decision->>'state' not in ('pending','confirmed','adjusted') or decision->>'placement' not in ('main','general','scope_unknown') then raise exception 'Classification state, placement and purpose basis required';end if;
 insert into charts_memberships(project_id,category,state,placement,basis,reviewed_at,reviewed_by) values(pid,cat,decision->>'state',decision->>'placement',decision->>'basis',now(),actor) on conflict(project_id,category) do update set state=excluded.state,placement=excluded.placement,basis=excluded.basis,reviewed_at=excluded.reviewed_at,reviewed_by=actor;
 insert into charts_classification_log(project_id,category,decision,actor) values(pid,cat,decision,actor);end $$;
revoke all on function public.charts_review_membership(uuid,text,jsonb,uuid) from public,anon,authenticated;grant execute on function public.charts_review_membership(uuid,text,jsonb,uuid) to service_role;
