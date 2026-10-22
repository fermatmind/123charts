-- Identity and factual correction decisions are atomic and never grant enrollment.
create or replace function public.charts_review_decision(kind text,item_id uuid,decision text,feedback_text text,patch jsonb default '{}') returns void
language plpgsql security definer set search_path=public as $$
declare c charts_corrections; claim charts_claims; before_project charts_projects; changed boolean:=false; begin
 if length(trim(feedback_text))<10 then raise exception 'Record a specific review basis';end if;
 if kind='claim' then
 if decision not in ('approved','rejected') then raise exception 'Invalid decision';end if;
 select * into claim from charts_claims where id=item_id for update;if claim.id is null then raise exception 'Claim not found';end if;
 if claim.state<>'pending' then raise exception 'Claim already reviewed';end if;
 update charts_claims set state=decision,feedback=feedback_text,reviewed_at=now() where id=item_id;
 elsif kind='correction' then
 if decision not in ('adopted','rejected') then raise exception 'Invalid decision';end if;
 select * into c from charts_corrections where id=item_id for update;if c.id is null then raise exception 'Correction not found';end if;
 if c.state<>'pending' then raise exception 'Correction already reviewed';end if;
 if decision='adopted' then
 if patch='{}' then raise exception 'Apply the reviewed factual correction before marking it adopted';end if;
 select * into before_project from charts_projects where id=c.project_id for update;
 update charts_projects set name=coalesce(patch->>'name',name),description_en=coalesce(patch->>'description_en',description_en),description_zh=coalesce(patch->>'description_zh',description_zh),website_url=coalesce(patch->>'website_url',website_url),domain=coalesce(patch->>'domain',domain),measurement_domain=coalesce(patch->>'domain',measurement_domain),updated_at=now() where id=c.project_id;
 if patch ? 'domain' and patch->>'domain'<>before_project.domain then update charts_claims set state='pending',feedback='Official domain changed; verify management identity again.' where project_id=c.project_id and state='approved';end if;
 end if;
 update charts_corrections set state=decision,feedback=feedback_text where id=item_id;
 else raise exception 'Invalid review object';end if;
end $$;
revoke all on function public.charts_review_decision(text,uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.charts_review_decision(text,uuid,text,text,jsonb) to service_role;
notify pgrst,'reload schema';
