create temp table fingerprints (name text, rows bigint, hash text);
do $$ declare r record;begin
 for r in select table_schema,table_name from information_schema.tables where table_schema in ('public','auth','storage') and table_type='BASE TABLE' order by table_schema,table_name loop
 execute format('insert into fingerprints select %L,count(*),md5(coalesce(string_agg(to_jsonb(t)::text,%L order by to_jsonb(t)::text),%L)) from %I.%I t',r.table_schema||'.'||r.table_name,'|','',r.table_schema,r.table_name);
 end loop;
end $$;
select jsonb_object_agg(name,jsonb_build_object('rows',rows,'hash',hash)) from fingerprints;
