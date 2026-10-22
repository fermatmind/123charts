alter table public.charts_projects add column if not exists price_verified boolean not null default false;
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


revoke all on function public.charts_verify_evidence(uuid,uuid,jsonb,text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.charts_verify_evidence(uuid,uuid,jsonb,text,text,text,boolean) to service_role;
notify pgrst,'reload schema';
