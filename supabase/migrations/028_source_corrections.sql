alter table public.charts_verification_receipts add column reviewed_by uuid references auth.users(id);
alter table public.charts_verification_receipts add column reviewed_at timestamptz;
alter table public.charts_verification_receipts add column review_reason text;
create function public.charts_resolve_observation(rid uuid,actor uuid,reason text) returns uuid language plpgsql security definer set search_path=public as $$
declare r charts_verification_receipts;t charts_verification_tasks;old charts_traffic;tid uuid;f jsonb; begin
 if length(trim(reason))<10 or not exists(select 1 from admin_users where user_id=actor) then raise exception 'Admin and explicit correction reason required';end if;
 select * into r from charts_verification_receipts where id=rid for update;
 select * into t from charts_verification_tasks where id=r.task_id for update;
 f:=r.extracted;
 if r.id is null or r.success_at is null or r.outcome not in ('matched','conflict') or f->>'source'<>t.source or f->>'month'<>t.month or f->>'domain'<>t.domain or f->>'scope'<>t.scope or t.demo then raise exception 'A real same-scope source response is required';end if;
 perform pg_advisory_xact_lock(hashtext(concat(t.domain,t.source,t.month)));
 select * into old from charts_traffic where domain=t.domain and source=t.source and month=t.month and metric='visits' and scope=t.scope and not demo order by version desc limit 1;
 if old.value=(f->>'value')::numeric and old.state='verified' then return old.id;end if;
 if old.id is null then raise exception 'No existing observation to correct';end if;
 update charts_traffic set state='superseded' where domain=t.domain and source=t.source and month=t.month and metric='visits' and scope=t.scope and not demo;
 insert into charts_traffic(domain,source,month,metric,scope,value,version,review_reference,correction_note,demo,raw_display,precision_step)
 values(t.domain,t.source,t.month,'visits',t.scope,(f->>'value')::numeric,old.version+1,'source-receipt:'||rid,reason,false,f->>'raw_display',coalesce((f->>'precision_step')::numeric,1)) returning id into tid;
 update charts_verification_receipts set traffic_id=tid,reviewed_by=actor,reviewed_at=now(),review_reason=reason where id=rid;
 update charts_verification_tasks set state='verified',error=null,last_success_at=r.success_at,next_check_at=now()+interval '7 days' where id=t.id;
 return tid;end $$;
revoke all on function public.charts_resolve_observation(uuid,uuid,text) from public,anon,authenticated;grant execute on function public.charts_resolve_observation(uuid,uuid,text) to service_role;
-- Set-like exclusion order cannot cause a content-identical new publication.
do $$ declare body text;begin
 select pg_get_functiondef('public.charts_publish_category(jsonb)'::regprocedure) into body;
 body:=replace(body,'prev.exclusions=payload->''exclusions''','prev.exclusions @> (payload->''exclusions'') and prev.exclusions <@ (payload->''exclusions'')');
 execute body;end $$;
