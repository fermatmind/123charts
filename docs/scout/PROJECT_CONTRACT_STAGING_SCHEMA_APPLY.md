# PROJECT_CONTRACT_STAGING_SCHEMA_APPLY v0

Status: validation passed
Task: PR184 / PROJECT_CONTRACT_STAGING_SCHEMA_APPLY
Result: STAGING_SCHEMA_MIGRATION_READY_APPLY_PENDING
Date: 2026-06-21

## Result

PR184 creates the physical staging-only project contract migration file for the 20k-50k data-plane train.

Result: `STAGING_SCHEMA_MIGRATION_READY_APPLY_PENDING`.

The migration is ready for a staging Supabase apply, but this run did not apply it remotely because the Supabase CLI is not available in the local environment. No staging, production, seed, public, sitemap, Public API, MCP, worker, audit, data repo, server, or cloud write occurred.

## Human Checkpoint

The `/goal 123Charts 20k-50k Scale Buildout Continuous PR Train PR184-PR207 v0` message explicitly granted PR184 authorization for scoped Supabase staging schema apply only.

Authorization boundary recorded:

- staging schema apply is allowed for PR184 only;
- production write remains forbidden;
- seed import remains forbidden;
- frontend/public read remains forbidden;
- sitemap, Public API, MCP, worker, audit, crawler, and data repo mutation remain forbidden.

## Scope

In scope:

- create `supabase/migrations/013_project_contract_staging_schema.sql`;
- preserve the PR182 / PR182A Entity -> Repo -> Web contract;
- keep base tables private by default;
- enable RLS on every new table;
- create admin-only policies;
- document rollback and schema smoke;
- record apply-pending status when staging CLI access is unavailable.

Out of scope:

- production database write;
- seed data import;
- private Seed50 artifact commit;
- live Supabase apply without a usable CLI/session;
- public read policy;
- frontend route or admin UI implementation;
- sitemap, Public API, MCP, worker, audit, crawler, Redis/queue, deploy, server/cloud mutation, or data repo mutation.

## Migration Created

Created:

- `supabase/migrations/013_project_contract_staging_schema.sql`

Tables created:

- `project_entities`
- `source_evidences`
- `repo_assets`
- `web_assets`
- `audit_observations`
- `review_decisions`
- `published_projections`
- `project_collection_links`
- `project_alternative_candidates`

Namespace decision:

- The migration uses `public` tables, matching existing 123Charts migration conventions.
- The tables are staging/backstage contract tables, not public frontend tables.
- Public exposure is blocked by RLS and by the absence of anon policies.

## RLS / Visibility

Every new table enables row level security.

Policies created:

- authenticated admin select/insert/update policies using `public.is_admin()`;
- no anon policy;
- no public read policy;
- no policy that exposes raw seed, source evidence, audit observation, review decision, rejected, quarantined, or stale records.

`published_projections` is intentionally admin-only in PR184. A later public surface PR must explicitly introduce any public-safe read path, and only for reviewed `published` rows.

## Schema Smoke Plan

After staging apply, run read-only schema smoke:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'project_entities',
    'source_evidences',
    'repo_assets',
    'web_assets',
    'audit_observations',
    'review_decisions',
    'published_projections',
    'project_collection_links',
    'project_alternative_candidates'
  )
order by table_name;

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'project_entities',
    'source_evidences',
    'repo_assets',
    'web_assets',
    'audit_observations',
    'review_decisions',
    'published_projections',
    'project_collection_links',
    'project_alternative_candidates'
  )
order by tablename;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'project_entities',
    'source_evidences',
    'repo_assets',
    'web_assets',
    'audit_observations',
    'review_decisions',
    'published_projections',
    'project_collection_links',
    'project_alternative_candidates'
  )
order by tablename, policyname;
```

Expected smoke:

- all nine tables exist;
- RLS is enabled on all nine tables;
- policies exist only for authenticated admin access;
- no anon policy exists for any new table.

## Rollback Plan

If the migration has been applied to an empty staging target and must be rolled back before any review data exists, drop in reverse dependency order:

```sql
drop table if exists public.project_alternative_candidates cascade;
drop table if exists public.project_collection_links cascade;
drop table if exists public.published_projections cascade;
drop table if exists public.review_decisions cascade;
drop table if exists public.audit_observations cascade;
drop table if exists public.web_assets cascade;
drop table if exists public.repo_assets cascade;
drop table if exists public.source_evidences cascade;
drop table if exists public.project_entities cascade;
```

If review data exists, do not destructive-drop without a separate human checkpoint. Instead:

- remove or disable public projection reads if a later task added them;
- set accidental projection rows `seo_indexable=false`;
- preserve review decisions and evidence lineage until a retention decision is approved.

## Apply Status

Remote staging apply status: `APPLY_PENDING`.

Reason:

- `supabase` CLI was not available locally;
- no `.env` file was read;
- no Supabase credential, DB URL, or connection string was printed;
- no live staging or production connection was attempted.

This is a truthful partial completion under the PR184 goal rule. The migration can be applied later from an approved environment that has the Supabase CLI and staging credentials.

## No-Write Confirmation

- Production write: no.
- Staging write: no remote write in this run.
- Seed import: no.
- Public read: no.
- Frontend/admin UI: no.
- Sitemap/API/MCP: no.
- Worker/audit/crawler: no.
- Data repo mutation: no.
- Server/cloud mutation: no.
- Secrets printed: no.

## Validation Evidence

Passing validations:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run agent:redact:check`
- `npm run agent:batch:check`
- `npm run agent:train-plan:check`
- `npm run agent:scope:check -- PR184`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run agent:gate`
- `node scripts/check-alternatives-canonical.mjs`
- `npm run db:schema:check`
- `git diff --check`

Non-blocking lifecycle sidecar:

- `node scripts/check-task-discovery-boundary.mjs` rejects `supabase/migrations/013_project_contract_staging_schema.sql` with the PR123-era message `must not change in PR123`;
- `node scripts/check-landscape-boundary.mjs`, `npm run landscape:check`, and `node scripts/check-sector-density-boundary.mjs` call the task-discovery checker when finite task routes exist, so they inherit the same PR123-era failure;
- this is checker lifecycle debt, not a PR184 product/runtime leak, because PR184 is the approved Supabase migration task and `npm run agent:scope:check -- PR184`, `npm run db:schema:check`, and `npm run agent:gate` pass;
- PR184 does not modify `scripts/**`, so the checker lifecycle remediation is recorded in `docs/SIDECAR_ISSUES.md` rather than fixed out of scope.

## Next

After PR184 merges, continue to PR185 / BULK_IMPORT_CONTRACT.

PR185 may define batch/quarantine/import contracts only. It must not import seed data, write Supabase, run a worker, expose public routes, mutate the data repo, or start PR186.
