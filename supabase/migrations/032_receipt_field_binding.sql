-- A receipt authorizes its own extracted observation, never caller-supplied values.
do $$ declare body text;begin
 select pg_get_functiondef('public.charts_record_observation(jsonb,uuid)'::regprocedure) into body;
 body:=replace(body,'r.success_at is not null and not t.demo','r.success_at is not null and r.extracted=fields and not t.demo');
 if position('r.extracted=fields' in body)=0 then raise exception 'Observation receipt binding target missing';end if;
 execute body;end $$;
