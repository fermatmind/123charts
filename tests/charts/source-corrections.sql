-- Synthetic fixtures run only inside the disposable empty test database.
do $$
declare actor uuid:=gen_random_uuid();task uuid; r1 uuid;r2 uuid;tid uuid;newid uuid;again uuid;f jsonb;result jsonb;
begin
 insert into auth.users(id,email) values(actor,'isolated-chart-fixture@example.test');
 insert into public.admin_users(user_id) values(actor);
 insert into public.charts_categories(slug,name_en,name_zh,description_en,description_zh) values('fixture','Fixture','测试','Isolated source test','隔离来源测试');
 insert into public.charts_verification_tasks(domain,source,month,scope) values('isolated-fixture.example','Semrush public','2026-09','worldwide-all-devices-domain') returning id into task;
 f:=jsonb_build_object('domain','isolated-fixture.example','source','Semrush public','month','2026-09','metric','visits','scope','worldwide-all-devices-domain','value',100,'raw_display','100','precision_step',1);
 insert into public.charts_verification_receipts(task_id,source_url,outcome,detail,success_at,extracted) values(task,'https://example.test/fixture','matched','SYNTHETIC SQL FIXTURE, NOT A LIVE SOURCE',now(),f) returning id into r1;
 result:=public.charts_record_observation(f,r1);tid:=(result->>'id')::uuid;
 if result->>'state'<>'verified' then raise exception 'Initial receipt failed';end if;
 begin
 perform public.charts_record_observation(jsonb_set(f,'{value}','999'::jsonb),r1);
 raise exception 'Receipt allowed invented fields';
 exception when others then if SQLERRM='Receipt allowed invented fields' then raise;end if;end;
 f:=jsonb_set(jsonb_set(f,'{value}','120'::jsonb),'{raw_display}','"120"'::jsonb);
 insert into public.charts_verification_receipts(task_id,source_url,outcome,detail,success_at,extracted) values(task,'https://example.test/fixture','matched','SYNTHETIC SOURCE REVISION FIXTURE',now(),f) returning id into r2;
 result:=public.charts_record_observation(f,r2);
 if result->>'state'<>'conflict' or (select value from charts_traffic where id=tid)<>100 then raise exception 'Conflict overwrote the published value';end if;
 newid:=public.charts_resolve_observation(r2,actor,'Synthetic confirmed source revision; retain original history.');
 again:=public.charts_resolve_observation(r2,actor,'Synthetic repeated correction click; keep one resulting version.');
 if newid<>again or (select count(*) from charts_traffic where domain='isolated-fixture.example')<>2 then raise exception 'Correction is not idempotent';end if;
 if (select state from charts_traffic where id=tid)<>'superseded' or (select value from charts_traffic where id=newid)<>120 then raise exception 'Revision history incorrect';end if;
 begin
 update charts_traffic set value=999 where id=newid;
 raise exception 'Published observation was mutable';
 exception when others then if SQLERRM='Published observation was mutable' then raise;end if;end;
 raise notice 'PASS: receipt binding, conflicts, explicit revisions, idempotency and immutable original values.';
end $$;

do $$ begin
 if has_table_privilege('anon','public.charts_memberships','SELECT') or has_table_privilege('authenticated','public.charts_public_memberships','UPDATE') then raise exception 'Private membership or public projection privileges are too broad';end if;
 if not has_table_privilege('anon','public.charts_public_memberships','SELECT') then raise exception 'Public purpose projection is unreadable';end if;
 raise notice 'PASS: public classification projection hides reviewer identities and rejects mutations.';
end $$;
