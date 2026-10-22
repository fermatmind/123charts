-- Only run in a disposable acceptance database.
begin;
do $$ declare owner_id uuid:=gen_random_uuid();a charts_applications;b charts_applications;stamp timestamptz;d jsonb;
begin
 if has_function_privilege('anon','charts_save_draft(uuid,uuid,jsonb,boolean,uuid)','execute') then raise exception 'Private draft RPC exposed';end if;
 insert into auth.users(id,email) values(owner_id,'draft-noop-'||owner_id||'@example.test');
 d:='{"name":"No-op fixture","peers":[],"description_en":"","supported_languages":[]}'::jsonb;
 a:=charts_save_draft(null,owner_id,d,true,null);
 update charts_applications set updated_at=now()-interval '1 day' where id=a.id returning updated_at into stamp;
 b:=charts_save_draft(a.id,owner_id,d,true,null);
 if b.updated_at is distinct from stamp then raise exception 'Unchanged draft moved its timestamp';end if;
 b:=charts_save_draft(a.id,owner_id,d||'{"description_en":"Edited"}',true,null);
 if b.updated_at is not distinct from stamp or b.draft->>'description_en'<>'Edited' then raise exception 'Real edit was skipped';end if;
 raise notice 'PASS: unchanged drafts are no-ops; real edits still persist.';
end $$;
rollback;
