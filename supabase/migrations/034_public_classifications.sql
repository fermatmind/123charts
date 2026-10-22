-- Purpose evidence is public; internal reviewer identities are not.
create view public.charts_public_memberships with(security_barrier=true) as
 select m.project_id,m.category,m.state,m.placement,m.basis,m.reviewed_at from public.charts_memberships m
 join public.charts_projects p on p.id=m.project_id where p.publication='published';
revoke all on public.charts_memberships,public.charts_public_memberships from anon,authenticated;
grant select on public.charts_public_memberships to anon,authenticated;
