-- A NEW isolated restore target only. pg_dump reapplies source defaults at the end.
-- Pre-existing Supabase grants would otherwise leak into newly restored objects.
do $$ declare r record; object_type text; scope text; grantee_name text;
begin
 for r in select d.defaclrole,d.defaclnamespace,d.defaclobjtype,a.grantee
 from pg_default_acl d cross join lateral aclexplode(d.defaclacl) a
 where a.grantee<>d.defaclrole loop
  object_type:=case r.defaclobjtype when 'r' then 'TABLES' when 'S' then 'SEQUENCES' when 'f' then 'FUNCTIONS' when 'T' then 'TYPES' when 'n' then 'SCHEMAS' end;
  if object_type is null then raise exception 'Unknown default privilege object type';end if;
  scope:=case when r.defaclnamespace=0 then '' else format(' IN SCHEMA %I',(select nspname from pg_namespace where oid=r.defaclnamespace)) end;
  grantee_name:=case when r.grantee=0 then 'PUBLIC' else quote_ident(pg_get_userbyid(r.grantee)) end;
  execute format('ALTER DEFAULT PRIVILEGES FOR ROLE %I%s REVOKE ALL ON %s FROM %s',pg_get_userbyid(r.defaclrole),scope,object_type,grantee_name);
 end loop;
end $$;
