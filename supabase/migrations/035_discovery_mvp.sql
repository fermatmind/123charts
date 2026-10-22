-- Discovery-first MVP. Historical traffic/evidence remain unchanged and private.
alter table charts_projects drop constraint charts_projects_price_type_check;
alter table charts_projects add constraint charts_projects_price_type_check check(price_type in ('free','freemium','trial','paid','unknown'));
alter table charts_projects add column task text not null default '';
alter table charts_projects add column supported_languages text[] not null default '{}';
alter table charts_projects add column differentiator text not null default '';
alter table charts_projects add column conditions text not null default '';
alter table charts_projects add column is_open_source boolean not null default false;
alter table charts_projects add column open_source_url text not null default '';
alter table charts_projects add column first_published_at timestamptz;
alter table charts_projects add column first_publication_inferred boolean not null default false;
-- Historical records did not record publication separately. Label the estimated timestamp.
update charts_projects set first_published_at=collected_at,first_publication_inferred=true where publication='published';
create function charts_preserve_first_publication() returns trigger language plpgsql as $$ begin
 if tg_op='UPDATE' and old.first_published_at is not null then
 new.first_published_at:=old.first_published_at;new.first_publication_inferred:=old.first_publication_inferred;
 elsif new.publication='published' then new.first_published_at:=now();new.first_publication_inferred:=false;end if;
 return new;end $$;
create trigger charts_first_publication before insert or update on charts_projects for each row execute function charts_preserve_first_publication();
alter table charts_applications add column workflow_version text not null default 'legacy-traffic';
alter table charts_applications alter column workflow_version set default 'discovery-v1';
alter table charts_follows drop constraint charts_follows_kind_check;
alter table charts_follows add constraint charts_follows_kind_check check(kind in ('bookmark','project','category','alternatives'));
alter table charts_recommendations drop constraint charts_recommendations_slot_check;
alter table charts_recommendations add constraint charts_recommendations_slot_check check(slot between 1 and 6);
update charts_settings set value=jsonb_set(value,'{enabled}','false') where key='verification';
insert into charts_settings(key,value) values('discovery','{"cycle":"daily-utc","slots":6,"newSlots":1,"contributionSlots":1,"ordinarySlots":4,"recentDays":30,"lowExposureDays":7}') on conflict(key) do update set value=excluded.value;
-- No new OCR jobs are consumed in this MVP. Durable metadata jobs keep their original retry rules.
create or replace function charts_claim_job() returns setof charts_jobs language plpgsql security definer set search_path=public as $$ begin
 return query with next as(select id from charts_jobs where kind<>'ocr' and ((state='pending' and run_after<=now()) or (state='running' and locked_at<now()-interval '3 minutes')) order by created_at for update skip locked limit 1)
 update charts_jobs j set state='running',locked_at=now(),attempts=attempts+1 from next where j.id=next.id returning j.*;end $$;
create function charts_approve_discovery(aid uuid,actor uuid,reference text,pricing_confirmed boolean default false) returns uuid language plpgsql security definer set search_path=public as $$
declare a charts_applications;d jsonb;pid uuid;cnt int;reviewed int;oldp charts_projects;new_rel boolean;begin
 if not exists(select 1 from admin_users where user_id=actor) then raise exception 'Administrator required';end if;
 select * into a from charts_applications where id=aid for update;
 if a.id is null then raise exception 'Application not found';end if;
 if a.status='approved' then return a.project_id;end if;
 if a.status not in ('submitted','verifying') then raise exception 'Submitted application required';end if;
 if length(trim(reference))<8 then raise exception 'Record factual review source and decision basis';end if;
 d:=a.draft;cnt:=jsonb_array_length(d->'peers');
 if length(trim(coalesce(d->>'task','')))<3 or length(trim(coalesce(d->>'differentiator','')))<3 or jsonb_array_length(coalesce(d->'supported_languages','[]'))=0 then raise exception 'Task, languages and distinguishing conditions required';end if;
 if a.kind='initial' and (cnt>5 or (cnt<3 and (length(trim(coalesce(d->>'peer_exception_reason','')))<20 or length(trim(coalesce(d->>'supplementary_alternatives','')))<10))) then raise exception 'Three to five peers or a reviewed niche exception required';end if;
 select count(*) into reviewed from charts_relations where application_id=aid and status='approved';
 if reviewed<>cnt then raise exception 'Review every submitted relationship before approval';end if;
 pid:=a.project_id;
 if a.kind='update' and not exists(select 1 from charts_claims where project_id=pid and owner_id=a.owner_id and state='approved') then raise exception 'Approved ownership claim required';end if;
 -- Serializes same-domain approvals without replacing an existing project or its owner.
 perform pg_advisory_xact_lock(hashtextextended(d->>'domain',0));
 if pid is null then select id into pid from charts_projects where domain=d->>'domain';end if;
 if pid is not null then select * into oldp from charts_projects where id=pid for update;
 if oldp.demo<>a.demo then raise exception 'Dataset mismatch';end if;end if;
 if pid is null then
 insert into charts_projects(slug,name,website_url,domain,measurement_domain,category,description_en,description_zh,price_type,publication,enrolled_at,controller_id,demo,task,supported_languages,differentiator,conditions,is_open_source,open_source_url,price_verified,official_source,source_checked_at)
 values(d->>'slug',d->>'name',d->>'website_url',d->>'domain',d->>'domain',d->>'category',d->>'description_en',d->>'description_zh',d->>'price_type','published',now(),a.owner_id::text,a.demo,d->>'task',array(select jsonb_array_elements_text(d->'supported_languages')),d->>'differentiator',coalesce(d->>'conditions',''),coalesce((d->>'is_open_source')::boolean,false),coalesce(d->>'open_source_url',''),pricing_confirmed,reference,now()) returning id into pid;
 elsif a.kind='update' then
 update charts_projects set name=d->>'name',category=d->>'category',description_en=d->>'description_en',description_zh=d->>'description_zh',price_type=d->>'price_type',price_verified=pricing_confirmed,task=d->>'task',supported_languages=array(select jsonb_array_elements_text(d->'supported_languages')),differentiator=d->>'differentiator',conditions=coalesce(d->>'conditions',''),is_open_source=coalesce((d->>'is_open_source')::boolean,false),open_source_url=coalesce(d->>'open_source_url',''),official_source=reference,source_checked_at=now(),updated_at=now() where id=pid;
 end if;
 new_rel:=exists(select 1 from charts_relations r where r.application_id=aid and not exists(select 1 from charts_relations x where x.project_id=pid and x.application_id<>aid and x.peer_domain=r.peer_domain and x.task=r.task and x.status='approved'));
 update charts_relations set project_id=pid where application_id=aid;
 insert into charts_reports(application_id,owner_id,project_id,peers,demo) values(aid,a.owner_id,pid,coalesce((select jsonb_agg(jsonb_build_object('domain',peer_domain,'name',peer_name,'task',task,'rationale',rationale,'relationship_state',status,'traffic',null)) from charts_relations where application_id=aid),'[]'),a.demo) on conflict(application_id) do nothing;
 if new_rel then perform charts_adopt_contribution(pid,'relationships:'||pid||':'||md5((d->'peers')::text),'relationship',a.demo);end if;
 if a.kind='update' and (oldp.price_type,oldp.conditions) is distinct from (d->>'price_type',d->>'conditions') then perform charts_adopt_contribution(pid,'conditions:'||pid||':'||md5(coalesce(d->>'conditions','')||coalesce(d->>'price_type','')),'profile_update',a.demo);end if;
 update charts_applications set project_id=pid,status='approved',workflow_version='discovery-v1',feedback=reference,reviewed_at=now(),updated_at=now() where id=aid;
 insert into charts_notifications(owner_id,title_en,title_zh,body_en,body_zh,href,dedupe_key) values(a.owner_id,'Listing and comparison ready','收录与对照清单已就绪','Your reviewed profile, relevant discovery eligibility and comparison are ready. Sharing is optional.','项目档案、相关发现资格及同类对照已准备好，分享完全自愿。','/dashboard','approved:'||aid) on conflict(dedupe_key) do nothing;
 return pid;end $$;
revoke all on function charts_approve_discovery(uuid,uuid,text,boolean) from public,anon,authenticated;
grant execute on function charts_approve_discovery(uuid,uuid,text,boolean) to service_role;
-- Extend the safe public projection, without exposing controller IDs or private review notes.
create or replace view charts_public_projects as select id,slug,name,website_url,domain,measurement_domain,category,description_en,description_zh,price_type,price_verified,publication,collected_at,enrolled_at,official_source,source_checked_at,demo,updated_at,task,supported_languages,differentiator,conditions,is_open_source,open_source_url,first_published_at,first_publication_inferred from charts_projects where publication='published';
notify pgrst,'reload schema';
