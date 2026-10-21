-- Publishing or editing a profile cannot overwrite an existing classification decision.
do $$ declare body text;begin
 select pg_get_functiondef('public.charts_primary_membership()'::regprocedure) into body;
 body:=replace(body,'on conflict(project_id,category) do update set state=case when new.publication=''published'' then ''confirmed'' else charts_memberships.state end;','on conflict(project_id,category) do nothing;');
 if position('do update set state' in body)>0 then raise exception 'Classification decision preservation target missing';end if;
 execute body;end $$;
