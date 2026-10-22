create function charts_review_version(aid uuid,actor uuid,reference text,pricing_confirmed boolean,expected_updated_at timestamptz default null) returns uuid language plpgsql security definer set search_path=public as $$ declare a charts_applications;begin
 select * into a from charts_applications where id=aid for update;
 if a.id is null then raise exception 'Application not found';end if;
 if a.status<>'approved' and expected_updated_at is not null and a.updated_at<>expected_updated_at then raise exception 'Application changed; reload the review before deciding';end if;
 return charts_approve_discovery(aid,actor,reference,pricing_confirmed);
end $$;
revoke all on function charts_review_version(uuid,uuid,text,boolean,timestamptz) from public,anon,authenticated;grant execute on function charts_review_version(uuid,uuid,text,boolean,timestamptz) to service_role;
notify pgrst,'reload schema';
