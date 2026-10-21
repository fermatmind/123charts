-- Claiming a task or deferring for budget is not an actual source request.
create or replace function public.charts_claim_verification() returns setof public.charts_verification_tasks language plpgsql security definer set search_path=public as $$ begin
 return query with next as(select id from charts_verification_tasks where (state in ('pending','verified','deferred') and next_check_at<=now()) or (state='running' and locked_at<now()-interval '3 minutes') order by priority desc,next_check_at for update skip locked limit 1)
 update charts_verification_tasks t set state='running',locked_at=now(),attempts=attempts+1 from next where t.id=next.id returning t.*;end $$;
create or replace view public.charts_public_checks as select domain,source,month,scope,demo,state,next_check_at,last_attempt_at,last_success_at from public.charts_verification_tasks t where exists(select 1 from public.charts_projects p where p.measurement_domain=t.domain and p.publication='published');
revoke all on public.charts_public_checks from anon,authenticated;grant select on public.charts_public_checks to anon,authenticated;
create or replace view public.charts_public_traffic with(security_barrier=true) as
 select id,domain,source,month,metric,scope,value,version,state,correction_note,demo,verified_at,raw_display,precision_step from public.charts_traffic where state='verified';
revoke all on public.charts_public_traffic from anon,authenticated;grant select on public.charts_public_traffic to anon,authenticated;
