-- Runs only in the disposable migration-check database; no runtime data is reset.
do $$ declare owner_id uuid:=gen_random_uuid(); reviewer uuid:=gen_random_uuid(); aid uuid;pid uuid;stamp timestamptz;d jsonb;jobid uuid;begin
 insert into auth.users(id,email) values(owner_id,'discovery-owner@example.test'),(reviewer,'discovery-reviewer@example.test');
 insert into admin_users(user_id) values(reviewer);
 insert into charts_categories(slug,name_en,name_zh,description_en,description_zh) values('ai-coding','Coding','编程','Coding tasks','编程用途') on conflict do nothing;
 d:=jsonb_build_object('name','Isolated niche fixture','slug','isolated-niche','website_url','https://isolated-niche.example','domain','isolated-niche.example','category','ai-coding','price_type','unknown','description_en','A fictional niche project.','description_zh','虚构的小众测试项目。','task','Unique test task','differentiator','Only used for isolated business verification.','supported_languages',jsonb_build_array('English'),'peer_exception_reason','This isolated niche has no direct websites; an explicit reviewer must assess this exception.','supplementary_alternatives','A manual review process and a spreadsheet provide the comparable method.','peers','[]'::jsonb);
 select id into aid from charts_save_draft(null,owner_id,d,true,null);
 update charts_applications set status='submitted' where id=aid;
 begin perform charts_approve_discovery(aid,owner_id,'Fake non-admin reviewer',false);raise exception 'Non-admin approved';exception when others then if sqlerrm='Non-admin approved' then raise;end if;end;
 pid:=charts_approve_discovery(aid,reviewer,'SYNTHETIC niche rationale and manual alternative assessed.',false);
 if charts_approve_discovery(aid,reviewer,'Repeated click',false)<>pid or (select count(*) from charts_reports where application_id=aid)<>1 then raise exception 'Approval is not idempotent';end if;
 if (select count(*) from charts_evidence where application_id=aid)<>0 then raise exception 'Unexpected screenshot dependency';end if;
 select first_published_at into stamp from charts_projects where id=pid;
 update charts_projects set updated_at=now()+interval '1 day',first_published_at=now()+interval '1 day' where id=pid;
 if (select first_published_at from charts_projects where id=pid) is distinct from stamp then raise exception 'Edit changed first publication';end if;
 update charts_projects set publication='archived' where id=pid;update charts_projects set publication='published' where id=pid;
 if (select first_published_at from charts_projects where id=pid) is distinct from stamp then raise exception 'Republish changed first publication';end if;
 insert into charts_jobs(kind,owner_id,payload,created_at) values('ocr',owner_id,'{}',now()-interval '1 hour');
 insert into charts_jobs(kind,owner_id,payload,state,locked_at,created_at) values('metadata',owner_id,'{"url":"https://example.test"}','running',now()-interval '4 minutes',now()-interval '2 hours') returning id into jobid;
 if not exists(select 1 from charts_claim_job() where id=jobid and attempts=1) then raise exception 'Restart did not recover metadata job';end if;
 if exists(select 1 from charts_jobs where kind='ocr' and state<>'pending') then raise exception 'MVP claimed historical OCR';end if;
 raise notice 'PASS: niche review, admin permission, no-image approval, idempotence, first-publication permanence and durable metadata recovery.';
end $$;
do $$ begin
 if has_table_privilege('anon','charts_discovery_cycles','SELECT') or has_function_privilege('authenticated','charts_approve_discovery(uuid,uuid,text,boolean)','EXECUTE') then raise exception 'Private cycle or approval permissions exposed';end if;
 if exists(select 1 from information_schema.columns where table_name='charts_public_projects' and column_name='controller_id') then raise exception 'Control identity leaked into public projection';end if;
 if (select (value->>'enabled')::boolean from charts_settings where key='verification') then raise exception 'Automatic external traffic verification is enabled';end if;
 raise notice 'PASS: private cycles, safe public profile projection and external verification disabled.';
end $$;
