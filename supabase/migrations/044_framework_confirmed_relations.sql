-- Only reviewed directional relationships are public, independently of profile review.
create or replace view competitor_relations as select r.id,t.id as anchor_id,r.project_id as candidate_id,r.project_id,r.peer_domain,r.peer_name,r.task,r.task as use_case,r.rationale,r.status,r.withdrawn_at,p.demo
 from charts_relations r join charts_projects p on p.id=r.project_id join charts_projects t on t.domain=r.peer_domain and t.demo=p.demo join charts_applications a on a.id=r.application_id
 where p.publication='published' and t.publication='published' and r.withdrawn_at is null and r.status='approved' and a.status='approved';
notify pgrst,'reload schema';
