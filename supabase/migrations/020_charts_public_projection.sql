-- Public clients receive a finite projection, never internal control/verification references.
create view public.charts_public_projects with(security_barrier=true) as
 select id,slug,name,website_url,domain,measurement_domain,category,description_en,description_zh,price_type,price_verified,publication,collected_at,enrolled_at,official_source,source_checked_at,demo,updated_at
 from public.charts_projects where publication='published';
create view public.charts_public_traffic with(security_barrier=true) as
 select id,domain,source,month,metric,scope,value,version,state,correction_note,demo,verified_at
 from public.charts_traffic where state='verified';
revoke select on public.charts_projects,public.charts_traffic from anon,authenticated;
grant select on public.charts_public_projects,public.charts_public_traffic to anon,authenticated;
