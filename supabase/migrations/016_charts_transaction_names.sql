-- Fix PL/pgSQL variable/SQL alias ambiguity in local initialization.
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


revoke all on function public.charts_approve_application(uuid,uuid) from public,anon,authenticated;
grant execute on function public.charts_approve_application(uuid,uuid) to service_role;
notify pgrst,'reload schema';
