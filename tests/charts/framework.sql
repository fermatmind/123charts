-- The disposable empty-schema database verifies the public/private read boundary.
do $$begin
 if not exists(select 1 from information_schema.columns where table_name='products' and column_name='first_published_at') then raise exception 'Missing publication date';end if;
 if exists(select 1 from information_schema.columns where table_name='products' and column_name in ('controller_id','owner_id','origin_application_id')) then raise exception 'Private identity leaked through catalog';end if;
 if not has_table_privilege('anon','products','select') or has_table_privilege('anon','products','update') then raise exception 'Public product permissions incorrect';end if;
 if has_table_privilege('anon','outbound_clicks','select') or has_table_privilege('authenticated','impressions','select') then raise exception 'Private metrics exposed';end if;
 if has_table_privilege('authenticated','charts_cache_invalidations','select') then raise exception 'Cache outbox exposed';end if;
 if has_function_privilege('authenticated','charts_review_version(uuid,uuid,text,boolean,timestamptz)','execute') then raise exception 'Review RPC exposed';end if;
 if exists(select 1 from products where publication<>'published') then raise exception 'Hidden records exposed';end if;
 if exists(select 1 from competitor_relations where status<>'approved' or withdrawn_at is not null) then raise exception 'Unreviewed relations exposed';end if;
 if (select count(*) from information_schema.columns where table_name='competitor_relations' and column_name in ('anchor_id','candidate_id','use_case','status'))<>4 then raise exception 'Directional relation contract incomplete';end if;
 if not exists(select 1 from pg_indexes where indexname='charts_products_category_first_indexed') or not exists(select 1 from pg_indexes where indexname='charts_events_impression_once') then raise exception 'Catalog/event indexes missing';end if;
 raise notice 'PASS: canonical views, directional relation fields, private metrics/RPC/outbox permissions and catalog/event indexes.';
end $$;
