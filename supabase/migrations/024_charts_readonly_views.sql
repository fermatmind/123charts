-- Supabase default privileges also apply to new views. Explicitly narrow these
-- updatable definer views to SELECT; RLS alone cannot protect the underlying rows.
revoke all on public.charts_public_projects,public.charts_public_traffic from anon,authenticated;
grant select on public.charts_public_projects,public.charts_public_traffic to anon,authenticated;
