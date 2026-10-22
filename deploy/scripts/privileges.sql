-- Stable effective ACL/RLS manifest. No secret values or table contents.
with objects as (
 select 'relation:'||n.nspname||'.'||c.relname as key,
 jsonb_build_object('owner',pg_get_userbyid(c.relowner),'rls',c.relrowsecurity,'force_rls',c.relforcerowsecurity,
 'acl',(select coalesce(jsonb_agg(jsonb_build_array(case when a.grantee=0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,pg_get_userbyid(a.grantor),a.privilege_type,a.is_grantable) order by case when a.grantee=0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,pg_get_userbyid(a.grantor),a.privilege_type),'[]'::jsonb) from aclexplode(coalesce(c.relacl,acldefault(case when c.relkind='S' then 'S'::"char" else 'r'::"char" end,c.relowner))) a)) as value
 from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname in ('public','auth','storage') and c.relkind in ('r','p','v','m','S','f')
 union all
 select 'function:'||n.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')',
 jsonb_build_object('owner',pg_get_userbyid(p.proowner),'security_definer',p.prosecdef,
 'acl',(select coalesce(jsonb_agg(jsonb_build_array(case when a.grantee=0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,pg_get_userbyid(a.grantor),a.privilege_type,a.is_grantable) order by case when a.grantee=0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,pg_get_userbyid(a.grantor),a.privilege_type),'[]'::jsonb) from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a))
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','auth','storage')
 union all
 select 'policy:'||n.nspname||'.'||c.relname||'.'||p.polname,
 jsonb_build_object('command',p.polcmd,'permissive',p.polpermissive,'roles',(select jsonb_agg(case when r=0 then 'PUBLIC' else pg_get_userbyid(r) end order by case when r=0 then 'PUBLIC' else pg_get_userbyid(r) end) from unnest(p.polroles) r),'using',pg_get_expr(p.polqual,p.polrelid),'check',pg_get_expr(p.polwithcheck,p.polrelid))
 from pg_policy p join pg_class c on c.oid=p.polrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','auth','storage')
) select jsonb_object_agg(key,value) from objects;
