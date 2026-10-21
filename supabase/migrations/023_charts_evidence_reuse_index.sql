-- Exact-image dedup is only a lookup aid; source/month/scope/current verification are checked separately.
create index charts_evidence_reusable on public.charts_evidence(file_hash,peer_domain,demo) where state='verified';
