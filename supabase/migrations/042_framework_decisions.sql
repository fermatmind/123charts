create function charts_relation_decision(rid uuid,actor uuid,decision text,basis text) returns void language plpgsql security definer set search_path=public as $$ declare r charts_relations;a charts_applications;begin
 if not exists(select 1 from admin_users where user_id=actor) then raise exception 'Administrator required';end if;
 select * into r from charts_relations where id=rid for update;if r.id is null then raise exception 'Relationship not found';end if;
 select * into a from charts_applications where id=r.application_id;
 if a.status not in ('submitted','verifying','approved','needs_info') then raise exception 'Submitted application required';end if;
 if decision not in ('approved','rejected','revoked') or length(trim(basis))<5 then raise exception 'Record a specific relationship decision basis';end if;
 update charts_relations set status=case when decision='revoked' then status else decision end,withdrawn_at=case when decision='revoked' then now() else null end,feedback=basis where id=rid;
 if decision='approved' and a.status='approved' and r.project_id is not null then
 perform charts_adopt_contribution(r.project_id,'relation:'||r.project_id||':'||r.peer_domain||':'||md5(r.task),'relationship',a.demo);end if;
end $$;
revoke all on function charts_relation_decision(uuid,uuid,text,text) from public,anon,authenticated;grant execute on function charts_relation_decision(uuid,uuid,text,text) to service_role;
-- A rejected initial application cannot leave an unreviewed public record behind (legacy provisional drafts).
create function charts_reject_provisional() returns trigger language plpgsql security definer set search_path=public as $$ begin
 if new.status='rejected' and old.status<>'rejected' then update charts_projects set publication='archived' where origin_application_id=new.id and review_state='pending';end if;return new;end $$;
create trigger charts_rejected_profile after update of status on charts_applications for each row execute function charts_reject_provisional();
notify pgrst,'reload schema';
