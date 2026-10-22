-- The root architecture document is authoritative: submission yields a private preview, approval publishes.
create or replace function charts_submit_public(aid uuid,actor uuid) returns charts_applications language plpgsql security definer set search_path=public as $$ declare a charts_applications;begin
 select * into a from charts_applications where id=aid and owner_id=actor for update;
 if a.id is null then raise exception 'Application not found';end if;
 if a.status='submitted' then return a;end if;
 if a.status not in ('draft','needs_info') then raise exception 'Editable application required';end if;
 update charts_applications set status='submitted',submitted_at=now(),updated_at=now() where id=aid returning * into a;return a;end $$;
-- A confirmed direction is anchor -> candidate. Passive reference profiles do not need recursive applications.
create function charts_reference_target() returns trigger language plpgsql security definer set search_path=public as $$ declare p charts_projects;begin
 if new.status<>'approved' or new.project_id is null or new.withdrawn_at is not null then return new;end if;
 select * into p from charts_projects where id=new.project_id;
 if p.id is null or p.publication<>'published' then return new;end if;
 insert into charts_projects(slug,name,domain,website_url,measurement_domain,category,publication,demo,task,description_en,description_zh,review_state,official_source)
 values(trim(both '-' from regexp_replace(new.peer_domain,'[^a-z0-9]+','-','g'))||'-'||substr(md5(new.peer_domain),1,8),new.peer_name,new.peer_domain,'https://'||new.peer_domain,new.peer_domain,p.category,'published',p.demo,new.task,'Reference website for the reviewed task: '||new.task,'已确认用途关系中的目标网站：'||new.task,'reference','https://'||new.peer_domain)
 on conflict(domain) do update set publication=case when charts_projects.publication='draft' then 'published' else charts_projects.publication end,review_state=case when charts_projects.publication='draft' then 'reference' else charts_projects.review_state end,task=case when charts_projects.task='' then excluded.task else charts_projects.task end;
 return new;end $$;
create trigger charts_confirm_reference after insert or update of status,project_id on charts_relations for each row execute function charts_reference_target();
create view impressions with(security_invoker=true) as select id,event_id,project_id as product_id,visitor_id,session_id,surface,excluded,exclusion_reason,created_at from charts_events where kind='impression';
revoke all on impressions from anon,authenticated;
notify pgrst,'reload schema';
