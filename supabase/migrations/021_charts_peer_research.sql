-- Adopted peer relationships expand the research queue; publication still needs reviewed content.
create or replace function public.charts_collect_peer_profiles() returns trigger language plpgsql security definer set search_path=public as $$
declare peer record; pid uuid; begin
 if new.status='approved' and old.status<>'approved' then
 for peer in select * from charts_relations where application_id=new.id and status='approved' loop
 pid:=null;
 insert into charts_projects(slug,name,website_url,domain,measurement_domain,category,publication,official_source,demo)
 values(trim(both '-' from regexp_replace(lower(peer.peer_name),'[^a-z0-9]+','-','g'))||'-'||substr(md5(peer.peer_domain),1,8),peer.peer_name,'https://'||peer.peer_domain,peer.peer_domain,peer.peer_domain,new.draft->>'category','draft','https://'||peer.peer_domain,new.demo)
 on conflict(domain) do nothing returning id into pid;
 if pid is not null and not(new.demo and peer.peer_domain like '%.example') then
 insert into charts_jobs(kind,owner_id,payload) values('metadata',new.owner_id,jsonb_build_object('url','https://'||peer.peer_domain,'project_id',pid));
 end if;
 end loop;
 end if;return new;
end $$;
create trigger charts_collect_adopted_peers after update of status on public.charts_applications for each row execute function public.charts_collect_peer_profiles();
create or replace function public.charts_claim_job() returns setof public.charts_jobs
language plpgsql security definer set search_path=public as $$ begin
 return query with next as (
 select id from charts_jobs where (state='pending' and run_after<=now()) or (state='running' and locked_at<now()-interval '3 minutes')
 order by case when kind='ocr' then 0 else 1 end,created_at for update skip locked limit 1
 ) update charts_jobs j set state='running',locked_at=now(),attempts=attempts+1 from next where j.id=next.id returning j.*;
end $$;
revoke all on function public.charts_claim_job() from public,anon,authenticated;
grant execute on function public.charts_claim_job() to service_role;
notify pgrst,'reload schema';
