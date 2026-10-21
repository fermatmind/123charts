-- Reuse the canonical charts_* tables. Suggested business names are projections, never duplicate data stores.
alter table charts_projects add column first_indexed_at timestamptz generated always as(first_published_at) stored;
alter table charts_projects add column review_state text not null default 'approved' check(review_state in ('pending','approved','reference'));
alter table charts_projects add column origin_application_id uuid references charts_applications(id) on delete set null;
alter table charts_projects add column content_version bigint not null default 1;
alter table charts_projects add column category_id text generated always as(category) stored;
create index charts_products_category_first_indexed on charts_projects(category_id,first_indexed_at desc) where publication='published';
create index charts_products_first_indexed on charts_projects(first_indexed_at desc) where publication='published';
create index charts_relations_target_status on charts_relations(peer_domain,status) where withdrawn_at is null;
create index charts_events_outbound_dedupe on charts_events(project_id,visitor_id,((created_at at time zone 'UTC')::date)) where kind='outbound';
alter table charts_events add column event_id uuid;
create unique index charts_events_event_id on charts_events(event_id) where event_id is not null;
create table charts_cache_invalidations(id bigint generated always as identity primary key,tags text[] not null default array['catalog:public','public-index'],created_at timestamptz not null default now(),processed_at timestamptz,attempts int not null default 0,error text);
alter table charts_cache_invalidations enable row level security;
revoke all on charts_cache_invalidations from anon,authenticated;
create index charts_pending_cache on charts_cache_invalidations(id) where processed_at is null;
create function charts_public_changed() returns trigger language plpgsql security definer set search_path=public as $$ begin
 insert into charts_cache_invalidations default values;
 if tg_table_name='charts_projects' and tg_op='UPDATE' then
 if new.publication<>'published' and old.publication='published' then
 delete from charts_recommendations where project_id=new.id and day>=current_date;
 update charts_discovery_cycles set pool=coalesce((select jsonb_agg(e) from jsonb_array_elements(pool) e where e->>'id'<>new.id::text),'[]') where day>=current_date and demo=new.demo;
 end if;end if;
 return null;end $$;
create trigger charts_products_cache after insert or update or delete on charts_projects for each row execute function charts_public_changed();
create trigger charts_relations_cache after insert or update or delete on charts_relations for each row execute function charts_public_changed();
create trigger charts_categories_cache after insert or update or delete on charts_categories for each row execute function charts_public_changed();
create function charts_content_version() returns trigger language plpgsql as $$ begin new.content_version:=old.content_version+1;return new;end $$;
create trigger charts_version before update on charts_projects for each row execute function charts_content_version();
create view products as select id,slug,name,website_url,website_url as official_url,domain,measurement_domain,category,category_id,description_en,description_zh,price_type,price_verified,publication,collected_at,enrolled_at,official_source,source_checked_at,demo,updated_at,task,supported_languages,differentiator,conditions,is_open_source,open_source_url,first_published_at,first_indexed_at,first_publication_inferred,review_state,content_version from charts_projects where publication='published';
revoke all on products from anon,authenticated;grant select on products to anon,authenticated;
create view catalog_categories as select * from charts_categories;
revoke all on catalog_categories from anon,authenticated;grant select on catalog_categories to anon,authenticated;
create view competitor_relations as select r.id,t.id as anchor_id,r.project_id as candidate_id,r.project_id,r.peer_domain,r.peer_name,r.task,r.task as use_case,r.rationale,r.status,r.withdrawn_at,p.demo
 from charts_relations r join charts_projects p on p.id=r.project_id join charts_projects t on t.domain=r.peer_domain and t.demo=p.demo join charts_applications a on a.id=r.application_id
 where p.publication='published' and t.publication='published' and r.withdrawn_at is null and ((r.status='approved' and a.status='approved') or (r.status='pending' and p.origin_application_id=a.id and a.status in ('submitted','verifying','needs_info','approved')));
revoke all on competitor_relations from anon,authenticated;grant select on competitor_relations to anon,authenticated;
create view outbound_clicks with(security_invoker=true) as select id,event_id,project_id as product_id,visitor_id,session_id,surface,excluded,exclusion_reason,created_at from charts_events where kind='outbound';
revoke all on outbound_clicks from anon,authenticated;
create function charts_submit_public(aid uuid,actor uuid) returns charts_applications language plpgsql security definer set search_path=public as $$
declare a charts_applications;d jsonb;pid uuid;peer record;begin
 select * into a from charts_applications where id=aid and owner_id=actor for update;
 if a.id is null then raise exception 'Application not found';end if;
 if a.status='submitted' then return a;end if;
 if a.status not in ('draft','needs_info') then raise exception 'Editable application required';end if;
 d:=a.draft;
 if a.kind='initial' then
 perform pg_advisory_xact_lock(hashtextextended(d->>'domain',0));
 select id into pid from charts_projects where domain=d->>'domain';
 if pid is not null and not exists(select 1 from charts_projects where id=pid and origin_application_id=aid) then raise exception 'This website already has a profile. Claim it or submit a correction.';end if;
 if pid is null then
 insert into charts_projects(slug,name,website_url,domain,measurement_domain,category,description_en,description_zh,price_type,publication,controller_id,demo,task,supported_languages,differentiator,conditions,is_open_source,open_source_url,review_state,origin_application_id,official_source)
 values(d->>'slug',d->>'name',d->>'website_url',d->>'domain',d->>'domain',d->>'category',d->>'description_en',d->>'description_zh',d->>'price_type','published',actor::text,a.demo,d->>'task',array(select jsonb_array_elements_text(d->'supported_languages')),d->>'differentiator',coalesce(d->>'conditions',''),coalesce((d->>'is_open_source')::boolean,false),coalesce(d->>'open_source_url',''),'pending',aid,d->>'website_url') returning id into pid;
 end if;
 update charts_relations set project_id=pid where application_id=aid;
 for peer in select * from charts_relations where application_id=aid loop
 insert into charts_projects(slug,name,website_url,domain,measurement_domain,category,publication,demo,task,review_state,official_source)
 values(trim(both '-' from regexp_replace(peer.peer_domain,'[^a-z0-9]+','-','g'))||'-'||substr(md5(peer.peer_domain),1,8),peer.peer_name,'https://'||peer.peer_domain,peer.peer_domain,peer.peer_domain,d->>'category','published',a.demo,peer.task,'reference','https://'||peer.peer_domain)
 on conflict(domain) do nothing;
 end loop;
 else pid:=a.project_id;
 if not exists(select 1 from charts_claims where project_id=pid and owner_id=actor and state='approved') then raise exception 'Verified manager required';end if;
 end if;
 update charts_applications set project_id=pid,status='submitted',submitted_at=now(),updated_at=now() where id=aid returning * into a;
 return a;end $$;
revoke all on function charts_submit_public(uuid,uuid) from public,anon,authenticated;grant execute on function charts_submit_public(uuid,uuid) to service_role;
notify pgrst,'reload schema';
