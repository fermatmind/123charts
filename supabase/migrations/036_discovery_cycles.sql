create table charts_discovery_cycles(day date not null,demo boolean not null,pool jsonb not null,created_at timestamptz not null default now(),primary key(day,demo));
alter table charts_discovery_cycles enable row level security;
revoke all on charts_discovery_cycles from anon,authenticated;
-- Draft editing uses current contribution rules while retaining historical evidence objects.
create or replace function charts_save_draft(aid uuid,actor uuid,d jsonb,is_demo boolean,update_project uuid default null) returns charts_applications language plpgsql security definer set search_path=public as $$
declare a charts_applications;peer_json jsonb;begin
 if jsonb_array_length(d->'peers')>5 then raise exception 'At most five peer websites';end if;
 if aid is not null then select * into a from charts_applications where id=aid and owner_id=actor for update;
 if a.id is null then raise exception 'Application not found';end if;
 if a.status not in ('draft','needs_info') then raise exception 'Only drafts and requested supplements can be edited';end if;
 update charts_applications set draft=d,workflow_version='discovery-v1',updated_at=now() where id=aid returning * into a;
 else
 if update_project is not null and not exists(select 1 from charts_claims where project_id=update_project and owner_id=actor and state='approved') then raise exception 'Owner claim required';end if;
 insert into charts_applications(owner_id,draft,demo,project_id,kind) values(actor,d,is_demo,update_project,case when update_project is null then 'initial' else 'update' end) returning * into a;
 end if;
 delete from charts_relations r where r.application_id=a.id and not exists(select 1 from jsonb_array_elements(d->'peers') p where p->>'domain'=r.peer_domain);
 for peer_json in select * from jsonb_array_elements(d->'peers') loop
 insert into charts_relations(application_id,project_id,peer_domain,peer_name,task,rationale) values(a.id,a.project_id,peer_json->>'domain',peer_json->>'name',peer_json->>'task',peer_json->>'rationale') on conflict(application_id,peer_domain) do update set peer_name=excluded.peer_name,task=excluded.task,rationale=excluded.rationale,status=case when charts_relations.task=excluded.task and charts_relations.rationale=excluded.rationale then charts_relations.status else 'pending' end;end loop;return a;end $$;
notify pgrst,'reload schema';
