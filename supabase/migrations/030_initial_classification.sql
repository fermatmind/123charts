-- Fresh databases and existing checkouts apply the same broad-platform rule.
create or replace function public.charts_primary_membership() returns trigger language plpgsql set search_path=public as $$ begin
 if TG_OP='UPDATE' and old.category is distinct from new.category then
 update charts_memberships set state='adjusted',reviewed_at=now(),basis='Primary purpose classification adjusted; retained for audit.' where project_id=new.id and category=old.category;
 end if;
 if new.category is not null then
 insert into charts_memberships(project_id,category,state,placement,basis,reviewed_at)
 values(new.id,new.category,case when new.publication='published' then 'confirmed' else 'pending' end,
 case when new.domain in ('aws.amazon.com','github.com','huggingface.co','cloud.google.com','microsoft.com') then 'general' else 'main' end,
 'Primary purpose recorded during profile review.',case when new.publication='published' then now() else null end)
 on conflict(project_id,category) do update set state=case when new.publication='published' then 'confirmed' else charts_memberships.state end;
 end if;return new;end $$;
