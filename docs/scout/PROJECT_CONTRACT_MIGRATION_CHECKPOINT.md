# PROJECT_CONTRACT_MIGRATION_CHECKPOINT Staging Schema Migration Readiness Scan

Status: validation passed
Task: PR182A / PROJECT_CONTRACT_MIGRATION_CHECKPOINT
Result: READY_FOR_PR182B_WITH_HUMAN_CHECKPOINT
Date: 2026-06-21

## Result

PR182A converts PR182's project contract into a concrete staging schema migration plan.

Decision: `READY_FOR_PR182B_WITH_HUMAN_CHECKPOINT`.

123Charts is ready to draft and review a staging-only Supabase schema apply task for `project_entities`, `repo_assets`, `web_assets`, `source_evidences`, `audit_observations`, `review_decisions`, `published_projections`, `project_collection_links`, and `project_alternative_candidates`, but PR182B must remain behind an explicit human checkpoint. PR182A does not create a migration file, connect to Supabase, apply a migration, write staging or production data, import seed rows, expose a public surface, or mutate `88cn-index-data`.

## Scope

In scope:

- scan current local Supabase/migration posture;
- translate PR182 contract fields into future staging table sketches;
- define lifecycle enum storage;
- define private-by-default RLS and fail-closed visibility principles;
- define rollback and retention expectations;
- define seed handoff import boundaries;
- register PR182B / PROJECT_CONTRACT_STAGING_SCHEMA_APPLY as the next checkpointed task.

Out of scope:

- physical SQL migration files under `supabase/**`;
- Supabase CLI or remote connection;
- database, staging, or production writes;
- private seed row commits;
- raw source evidence commits;
- frontend routes, admin UI implementation, sitemap runtime, Public API, MCP, Agent, audit, crawler, worker, deploy, SSH, cloud/server mutation, or data repo mutation.

## Source Inputs

Read:

- `docs/scout/SEED_MANIFEST_50_SEED_IDENTITY_SHARDS_HARDENING.md`
- `docs/scout/PROJECT_CONTRACT_PUBLIC_ENTITY_FAIL_CLOSED_GATE.md`
- `docs/scout/POST179R_WORKER_SEED_CANON_STAGING_AUDIT_REPORT_EVIDENCE_REVIEW.md`
- `docs/infra/WORKER0_SCOUT_WORKER_BOUNDARY_CHAIN_READINESS.md`
- `docs/infra/OPS_INFRA0X_CROSS_PROJECT_SHARED_INFRASTRUCTURE_INVENTORY.md`
- `docs/infra/OPS_INFRA0Y_CLOUD_FERMATMIND_READONLY_INVENTORY_COMPLETION.md`
- `docs/infra/OPS_INFRA1X_SHARED_SERVER_ISOLATION_POLICY_RUNBOOK.md`
- `docs/infra/OPS_INFRA2X_123charts_STAGING_WORKER_PLACEMENT_DECISION.md`
- `docs/TASK_STATUS.md`
- `ops/tasks/current.json`
- `ops/tasks/roadmap.json`
- `ops/trains/current.json`
- `ops/trains/batches.json`
- local `supabase/migrations/*.sql` files, read-only
- local schema checker scripts, read-only

No `.env` files were read. No secrets were printed. No Supabase connection was attempted.

## Current Repository Schema/Migration Scan

| Question | Answer |
| --- | --- |
| Does 123Charts currently have Supabase migration infrastructure? | Yes. `supabase/migrations` exists with migrations `001_init.sql` through `012_changelog_entries.sql`. |
| Are there existing migration conventions? | Yes. Existing migrations use numbered files, `create table if not exists` in later migrations, `public.set_updated_at()` triggers, `gen_random_uuid()` IDs, `timestamptz`, check constraints, indexes, comments, and RLS policies. |
| Are there existing project tables? | Yes. `public.projects`, `project_sources`, snapshots, scores, external imports, editorial drafts, scouted profiles, lifecycle snapshots, changelog entries, and related admin tables exist. |
| Are there existing published project records? | The repository contains public route fixtures and existing published project surfaces, but PR182A did not connect to Supabase and did not query live records. |
| Is there a staging schema or staging namespace? | No dedicated PR182 staging namespace/table family exists. Current objects are under `public`. PR182B should decide whether to create staging tables in `public` with strict naming or use a separate staging schema after review. |
| Are RLS policies already established? | Yes. Existing migrations enable RLS on core tables. Public reads are narrow and status/index gated; admin-only tables use `public.is_admin()`. |
| Is there a safe place for a future migration draft? | Yes, docs-only draft material can live in `docs/scout/PROJECT_CONTRACT_MIGRATION_CHECKPOINT.md`. Physical migration must wait for PR182B. |
| What is missing before PR182B? | Human approval for staging-only apply, final namespace decision, confirmed rollback command, no-seed-import proof, schema smoke plan, and a decision on whether `published_projections` gets anon read in staging or remains admin-only until a later public release task. |

Current migration posture:

- Existing migrations already support RLS, admin checks, public status gating, updated-at triggers, and no-public defaults.
- Existing `public.projects` is a production/public-facing entity and should not be repurposed as the raw PR182 project contract staging store.
- PR182 contract tables should be new staging/backstage tables, not direct writes into current public project surfaces.

## PR181/PR182 Carried Facts

PR181 private Seed50 package facts:

| Metric | Count / value |
| --- | --- |
| Accepted private seed rows | 50 |
| Needs-review rows | 25 |
| Rejected rows | 12 |
| Source evidence rows | 114 |
| Canonical candidate rows | 50 |
| GitHub-backed candidates | 20 / 50 |
| Strict open-source declared candidates | 5 / 50 |
| Mixed candidates | 15 / 50 |
| Commercial candidates | 30 / 50 |
| Missing-docs review rows | 6 |
| Canonical review rows | 10 |
| Reachability review rows | 11 |
| Manifest hash | `sha256:08a9fea2875b8c4eef7c96f0c0fc1bfebdecf9d2516fa9d1be949f2ee4f8bd8c` |

PR182 result:

`GO_CONTROL_PANEL_WITH_PROJECT_CONTRACT_READY`.

PR182 defines Entity -> Repo -> Web, Source Evidence, lifecycle, transitions, visibility, `published_projection`, public chip slots, sitemap/SEO/API/MCP fail-closed gates, featured/promoted separation, and migration draft policy. PR182 explicitly requires a later migration checkpoint before any physical schema.

## Staging Schema Purpose

Staging schema purpose:

- hold backstage project contract records for admin review;
- preserve seed, source, canonical, audit, and review provenance without public exposure;
- allow future PR182B schema smoke and later PR183 admin UI review;
- keep raw seed/evidence/audit/review data private by default;
- generate `published_projections` only after manual review gates pass.

Production schema purpose:

- serve reviewed public product surfaces only after separate approval;
- keep public reads constrained to reviewed projections and existing published route rules;
- avoid raw staging inputs, rejected details, review notes, private hashes, and audit payloads.

PR182B should apply staging only because PR182A has not imported data, has not run audit, has not implemented admin UI, and has not validated live Supabase state. Production write remains forbidden until a separate human-approved release task.

## Future Entity Table Matrix

| Entity | Purpose | Minimum fields | Visibility | Insertion source | Update source | Publish eligibility | Deletion / rollback | Retention |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `project_entities` | Canonical backstage project body. | ID, display/normalized names, org/product names, category/tags, open/commercial class, lifecycle, review state, timestamps. | Admin/backstage only. | Staged seed import or admin create. | Admin review and later controlled worker output. | Only when lifecycle is `published` and projection exists. | Tombstone or archive before hard delete; staging rollback may drop empty table. | Preserve identity history and review lineage. |
| `repo_assets` | Repository relationship. | ID, entity ID, GitHub URL, owner/repo, visibility, relationship, evidence ID, timestamps. | Admin/backstage; reviewed URL may project. | Staged seed/source evidence. | Admin review. | Never by itself. | Delete/detach if wrong; preserve review trail. | Retain reviewed repo provenance. |
| `web_assets` | Website/docs/API/launch/directory relationship. | ID, entity ID, URL, domain, asset role, official flag, evidence ID, timestamps. | Admin/backstage; reviewed official links may project. | Staged source evidence. | Admin review, later audit refresh. | Official reviewed links may feed projection. | Mark stale or detach; do not publish directory hints. | Retain official-source and freshness trail. |
| `source_evidences` | Root evidence layer. | ID, entity ID, URL, role/type, official flag, observed timestamp, hash, claim boundary, visibility, timestamps. | Backstage by default. | Private seed/source package or later approved audit source. | Admin review, later controlled refresh. | Public source link only after review. | Preserve hash/provenance; hide raw payload. | Retain auditability; raw payloads stay private. |
| `audit_observations` | Structured future audit observations. | ID, entity ID, type/value, method, checked/TTL, failure class, hash, visibility, timestamps. | Admin/backstage. | Later approved audit task only. | Later approved audit refresh. | Public chips only after review. | Expire to stale; remove accidental public projection. | Preserve last successful snapshot and failure taxonomy. |
| `review_decisions` | Human decisions. | ID, entity ID, review state, decision, reviewer ref, reason, reviewed fields, timestamps. | Admin only. | PR183 or later admin review. | Admin only. | Enables projection but is not public itself. | Immutable or tombstoned; do not erase published decision trail casually. | Retain manual review accountability. |
| `published_projections` | Public-safe reviewed projection. | ID, entity ID, slug, name, original summary, official links, category/tags, open/commercial class, chips, reviewed date, lifecycle, SEO flag, timestamps. | Staging read restricted until public release task; future public source only. | Manual review gate only. | Manual review / re-review only. | Yes, if all gates pass. | Delete or set `seo_indexable=false` on accidental projection. | Retain public history only after reviewed policy. |
| `project_collection_links` | Reviewed collection membership. | ID, entity ID, collection slug, review state, timestamps. | Admin/backstage until projected. | Admin review. | Admin review. | Only via finite reviewed collection rules. | Remove link without deleting entity. | Retain membership history if used publicly. |
| `project_alternative_candidates` | Reviewed alternatives candidate mapping. | ID, source entity, target entity, canonical pair key, review state, timestamps. | Admin/backstage. | Admin review. | Admin review. | Only via later alternatives policy. | Remove candidate when ambiguity appears. | Retain duplicate/conflict review history. |

## Lifecycle Enum And State-Machine Storage

Recommended field: `lifecycle_status`.

Allowed values:

- `seed_hint`
- `identity_candidate`
- `canonical_candidate`
- `audit_pending`
- `audit_observation`
- `review_ready`
- `published`
- `stale`
- `archived`
- `quarantined`
- `rejected`

Default value: `seed_hint`.

Recommended review field: `review_state`.

Recommended review values:

- `not_reviewed`
- `needs_review`
- `in_review`
- `approved`
- `changes_requested`
- `rejected`
- `published_approved`
- `archived`

Who may change it:

- staging import may create `seed_hint` / `identity_candidate` only;
- canonical resolver output may propose `canonical_candidate` only after an approved task;
- audit worker may create `audit_observation` only after an approved task;
- only admin/manual review may set `review_ready`, `published`, `stale`, or `archived`;
- no Agent may directly set `published`.

Only `project_entities.lifecycle_status = 'published'` with a valid manual review decision may enter `published_projections`.

Private/noindex states:

- `seed_hint`
- `identity_candidate`
- `canonical_candidate`
- `audit_pending`
- `audit_observation`
- `review_ready`
- `stale` by default
- `archived` by default
- `quarantined`
- `rejected`

## Field Visibility / RLS / Fail-Closed Policy

Principles:

- all base tables private by default;
- public frontend reads only `published_projections`, and only after a later public release checkpoint;
- PR182B staging apply should keep `published_projections` admin-only unless the human checkpoint explicitly approves anon staging read;
- `published_projections` rows are generated only after manual review;
- raw seed, source evidence, audit observation, and review decision tables are never public;
- rejected and quarantined rows are never public;
- stale and archived rows are noindex by default in MVP;
- API and MCP project assets are disabled by default;
- public chips and source links are derived from reviewed fields only;
- private hashes, raw payloads, reviewer notes, rejection details, artifact paths, and internal confidence stay backstage.

RLS draft principles:

- `alter table ... enable row level security` for every new table;
- admin select/insert/update policies use `public.is_admin()`;
- no anon policies on base tables;
- no anon policy on `published_projections` in PR182B unless explicitly approved by human checkpoint;
- if a later task allows public `published_projections`, anon select must require `lifecycle_status = 'published'` and `seo_indexable = true`.

## Draft Migration Plan

This SQL is design draft only and not applied in PR182A.

```sql
-- DRAFT ONLY. DO NOT APPLY IN PR182A.
-- Future PR182B must choose staging-only namespace and run only after human approval.

create table if not exists public.project_entities (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  normalized_name text not null,
  organization_name text,
  product_name text,
  primary_category text,
  collection_tags text[] not null default '{}'::text[],
  open_source_or_commercial text not null default 'unknown'
    check (open_source_or_commercial in ('strict_open_source', 'mixed', 'commercial', 'unknown')),
  lifecycle_status text not null default 'seed_hint'
    check (lifecycle_status in (
      'seed_hint',
      'identity_candidate',
      'canonical_candidate',
      'audit_pending',
      'audit_observation',
      'review_ready',
      'published',
      'stale',
      'archived',
      'quarantined',
      'rejected'
    )),
  review_state text not null default 'not_reviewed'
    check (review_state in (
      'not_reviewed',
      'needs_review',
      'in_review',
      'approved',
      'changes_requested',
      'rejected',
      'published_approved',
      'archived'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (normalized_name, organization_name, product_name)
);

create table if not exists public.repo_assets (
  id uuid primary key default gen_random_uuid(),
  project_entity_id uuid not null references public.project_entities(id) on delete cascade,
  github_url text,
  repo_owner text,
  repo_name text,
  repo_visibility text not null default 'unknown'
    check (repo_visibility in ('public', 'private', 'unknown', 'not_applicable')),
  repo_relationship text not null default 'unknown'
    check (repo_relationship in (
      'primary_repo',
      'official_org_repo',
      'related_repo',
      'model_repo',
      'docs_repo',
      'not_applicable',
      'unknown'
    )),
  source_evidence_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.web_assets (
  id uuid primary key default gen_random_uuid(),
  project_entity_id uuid not null references public.project_entities(id) on delete cascade,
  url text not null,
  domain text not null,
  asset_role text not null default 'unknown'
    check (asset_role in (
      'official_website',
      'official_org',
      'docs',
      'api_docs',
      'launch_page',
      'directory_hint',
      'unknown'
    )),
  is_official boolean not null default false,
  source_evidence_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.source_evidences (
  id uuid primary key default gen_random_uuid(),
  project_entity_id uuid references public.project_entities(id) on delete cascade,
  source_url text not null,
  source_role text not null default 'unknown',
  source_type text not null default 'unknown',
  is_official_source boolean not null default false,
  observed_at timestamptz not null,
  evidence_hash text not null,
  claim_boundary text not null default 'unknown'
    check (claim_boundary in (
      'identity_only',
      'official_docs_link',
      'organization_context',
      'directory_hint_only',
      'audit_observation_source',
      'unknown'
    )),
  visibility text not null default 'backstage_only'
    check (visibility in (
      'private_seed_only',
      'backstage_only',
      'admin_review_only',
      'published_projection',
      'public_chip',
      'public_source_link',
      'never_public'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (evidence_hash)
);

alter table public.repo_assets
  add constraint repo_assets_source_evidence_id_fkey
  foreign key (source_evidence_id) references public.source_evidences(id) on delete set null;

alter table public.web_assets
  add constraint web_assets_source_evidence_id_fkey
  foreign key (source_evidence_id) references public.source_evidences(id) on delete set null;

create table if not exists public.audit_observations (
  id uuid primary key default gen_random_uuid(),
  project_entity_id uuid not null references public.project_entities(id) on delete cascade,
  observation_type text not null,
  observation_value jsonb not null default '{}'::jsonb,
  audit_method text not null default 'not_run',
  checked_at timestamptz,
  ttl_expires_at timestamptz,
  failure_class text,
  audit_observation_hash text,
  visibility text not null default 'backstage_only'
    check (visibility in ('backstage_only', 'admin_review_only', 'public_chip', 'never_public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_decisions (
  id uuid primary key default gen_random_uuid(),
  project_entity_id uuid not null references public.project_entities(id) on delete restrict,
  review_state text not null,
  decision text not null
    check (decision in ('needs_review', 'approve_projection', 'reject', 'quarantine', 'archive', 'request_changes')),
  reviewer_ref uuid,
  decision_reason text,
  reviewed_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.published_projections (
  id uuid primary key default gen_random_uuid(),
  project_entity_id uuid not null unique references public.project_entities(id) on delete restrict,
  slug text not null unique,
  project_name text not null,
  original_summary text not null,
  official_website_url text not null,
  github_url text,
  docs_url text,
  primary_category text not null,
  collection_tags text[] not null default '{}'::text[],
  open_source_or_commercial text not null,
  public_signal_chips jsonb not null default '{}'::jsonb,
  last_reviewed_at timestamptz not null,
  lifecycle_status text not null default 'published'
    check (lifecycle_status in ('published', 'stale', 'archived')),
  seo_indexable boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (lifecycle_status = 'published' or seo_indexable = false)
);

create table if not exists public.project_collection_links (
  id uuid primary key default gen_random_uuid(),
  project_entity_id uuid not null references public.project_entities(id) on delete cascade,
  collection_slug text not null,
  review_state text not null default 'needs_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_entity_id, collection_slug)
);

create table if not exists public.project_alternative_candidates (
  id uuid primary key default gen_random_uuid(),
  source_project_entity_id uuid not null references public.project_entities(id) on delete cascade,
  target_project_entity_id uuid not null references public.project_entities(id) on delete cascade,
  canonical_pair_key text not null unique,
  review_state text not null default 'needs_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_project_entity_id <> target_project_entity_id)
);

create index if not exists idx_project_entities_lifecycle_review
  on public.project_entities(lifecycle_status, review_state);
create index if not exists idx_repo_assets_project
  on public.repo_assets(project_entity_id);
create index if not exists idx_web_assets_project_role
  on public.web_assets(project_entity_id, asset_role);
create index if not exists idx_source_evidences_project_claim
  on public.source_evidences(project_entity_id, claim_boundary);
create index if not exists idx_audit_observations_project_checked
  on public.audit_observations(project_entity_id, checked_at desc);
create index if not exists idx_review_decisions_project_created
  on public.review_decisions(project_entity_id, created_at desc);
create index if not exists idx_published_projections_public
  on public.published_projections(slug)
  where lifecycle_status = 'published' and seo_indexable = true;

-- PR182B should add set_updated_at triggers for each table.

alter table public.project_entities enable row level security;
alter table public.repo_assets enable row level security;
alter table public.web_assets enable row level security;
alter table public.source_evidences enable row level security;
alter table public.audit_observations enable row level security;
alter table public.review_decisions enable row level security;
alter table public.published_projections enable row level security;
alter table public.project_collection_links enable row level security;
alter table public.project_alternative_candidates enable row level security;

-- Admin-only policies for staging apply.
-- No anon policy should be added in PR182B unless human approval explicitly changes this.
```

PR182B must re-review this draft before creating a real migration file.

## Seed Handoff Import Boundary

Future import rules:

- accepted PR181 seed rows may become `project_entities` only through a staged import task after schema apply;
- needs-review rows remain private and cannot create published projections;
- rejected rows stay rejected/private and may only become negative-sample evidence;
- `row_hash`, `evidence_hash`, `shard_hash`, and `manifest_hash` stay backstage;
- raw private seed package paths must never become public;
- no seed data import occurs in PR182A or PR182B unless PR182B is explicitly expanded by human approval; default PR182B is schema-only;
- directory hints remain discovery context only and cannot become summary/content source.

## Rollback And Retention Policy

Migration rollback expectations:

- PR182B must include a staging-only rollback plan before apply.
- If no data exists, rollback may drop the new staging tables in reverse dependency order.
- If review data exists, rollback should disable projection reads and preserve review/audit trail unless a human authorizes destructive cleanup.
- `published_projections` accidental rows must be removed or set `seo_indexable=false` immediately, then followed by sitemap/API/MCP cache checks if any future public surface exists.

Tombstone vs delete:

- entities with review decisions should be tombstoned/archived rather than hard-deleted;
- wrong repo/web assets can be detached or marked stale;
- raw evidence hashes should be preserved for auditability;
- rejected/quarantined detail remains admin-only and never public.

Retention:

- preserve manual review accountability;
- preserve last successful audit observation when a source later fails;
- never retain private package paths in public projection fields.

## PR182B Human Checkpoint Requirements

PR182B may proceed only with explicit human approval for:

- staging-only Supabase target;
- physical migration file creation under `supabase/migrations/**`;
- no production write;
- no seed data import;
- no frontend read;
- no sitemap/API/MCP exposure;
- rollback SQL or documented rollback command;
- post-apply schema smoke;
- confirmation that no `.env` values are printed or committed.

PR182B default result should be schema-only. Seed import, admin UI, public read, API/MCP release, sitemap release, audit run, and worker runtime must remain separate tasks.

## Aliyun/Tencent Relevance Statement

No fresh Aliyun/Tencent scan is required for PR182A. Existing OPS-INFRA reports remain sufficient because PR182A is a schema readiness checkpoint, not a server placement or deploy task.

PR182A performs no cloud action, no SSH, no deploy, no server mutation, and no DB/Supabase connection. OPS-INFRA1X/2X remain the server-placement evidence sources for later worker/admin runtime decisions.

## Decision

Selected result: `READY_FOR_PR182B_WITH_HUMAN_CHECKPOINT`.

Rationale:

- PR182 contract is sufficiently concrete to draft staging schema.
- Existing repo migration conventions and RLS style are adequate.
- Existing project/public tables should not be reused for raw project contract staging.
- PR182B is safe only as staging schema apply with explicit human approval and no seed import.
- Production/public release remains blocked until admin review, projection generation, and public surface gates are separately implemented and reviewed.

Rejected alternatives:

- `READY_FOR_PR182B_STAGING_SCHEMA_APPLY`: rejected because human approval is still required before a physical migration.
- `NEED_SUPABASE_STAGING_PROJECT_DECISION`: rejected because a staging-only path can be specified, though namespace must be confirmed in PR182B.
- `NEED_SCHEMA_CONTRACT_REPAIR`: rejected because PR182 fields are sufficient for a draft.
- `BLOCKED_MIGRATION_CHECKPOINT_SCOPE_RISK`: rejected because no forbidden action was required.

## Sidecar Findings

No sidecar-blocking issue was found.

Findings to carry forward:

- PR182B must choose `public`-prefixed staging tables versus a separate staging schema before apply.
- PR182B must not import PR181 seed data by default.
- PR182B is registered in `ops/tasks/roadmap.json`, but current train-plan/batch validators accept only `PR<number>` task IDs or selected non-PR families. Because `PR182B` is a suffixed task ID, it cannot be referenced from `ops/trains/batches.json` without changing validator scripts, which is out of PR182A scope.
- PR183 remains the registry-visible train in `ops/trains/current.json`; a human should execute PR182B explicitly by task ID or remap PR182B to a numeric PR before PR183 starts.

## Validation Results

Pre-change baseline:

- `npm run verify:day0`: PASS
- `npm run agent:redact:check`: PASS
- `npm run agent:batch:check`: PASS
- `npm run agent:train-plan:check`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run agent:gate`: PASS

PR182A final validation:

- `jq empty ops/tasks/current.json ops/tasks/roadmap.json ops/trains/current.json ops/trains/batches.json`: PASS
- `npm run agent:scope:check -- PR182A`: PASS
- `npm run agent:redact:check`: PASS
- `npm run agent:batch:check`: PASS
- `npm run agent:train-plan:check`: PASS for registry-visible `TRAIN-PR183-CONTROL-PANEL`
- `git diff --check`: PASS
- `npm run verify:day0`: PASS
- `npm run policy:scan`: PASS
- `npm run third-party:check`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run agent:gate`: PASS
- `node scripts/check-landscape-boundary.mjs`: PASS
- `npm run landscape:check`: PASS
- `node scripts/check-sector-density-boundary.mjs`: PASS
- `node scripts/check-task-discovery-boundary.mjs`: PASS
- `node scripts/check-alternatives-canonical.mjs`: PASS

Train note: `PR182B` is roadmap-registered, but current train/batch validators do not accept suffixed PR IDs in train batches. `TRAIN-PR183-CONTROL-PANEL` remains the registry-visible train until `PR182B` is executed explicitly by task ID or remapped to a numeric PR.

## What This PR Does Not Do

- Does not create migration files under `supabase/**`.
- Does not connect to Supabase.
- Does not run Supabase CLI.
- Does not apply migration.
- Does not write staging or production data.
- Does not write any database.
- Does not mutate `88cn-index-data`.
- Does not read `.env` values.
- Does not print secrets.
- Does not commit private seed rows, private artifacts, or raw source evidence rows.
- Does not touch frontend routes, admin UI implementation, sitemap runtime, Public API, MCP, Agent, audit, crawler, worker, deploy, SSH, Aliyun, Tencent, DNS, security groups, or servers.
- Does not start PR182B or PR183.
