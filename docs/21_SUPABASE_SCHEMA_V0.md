# 21 Supabase Schema v0

## Date

2026-06-15

## Purpose

Define the first 123Charts Supabase database schema. This schema covers all core entities, lifecycle states, score tracking, editorial pipeline, async refresh jobs, system controls, and RLS policies for Phase 1.

## Migration

File: `supabase/migrations/001_init.sql`

Apply with: Supabase CLI (`supabase db push` or `supabase migration up`).

## Table Inventory

### Core Content (4 tables)

| Table | Purpose | Public Read |
|---|---|---|
| `categories` | Category definitions with index status | Indexable only |
| `collections` | Curated collection definitions | Indexable only |
| `reports` | Data report headers | Indexable only |
| `projects` | Core project entities with full lifecycle | Published/claimed/verified/archived_research only |

### Project Sources and Snapshots (3 tables)

| Table | Purpose | Public Read |
|---|---|---|
| `project_sources` | External URL sources per project | No |
| `project_source_snapshots` | Normalized snapshot payloads (long-term) | No |
| `project_raw_payloads` | Raw fetch payloads (short-term, bounded retention) | No |

### Score Tables (2 tables)

| Table | Purpose | Public Read |
|---|---|---|
| `project_scores` | Latest Signal Score per project | Via public project |
| `project_score_snapshots` | Historical score snapshots | Via public project |

### Structured Profile (1 table)

| Table | Purpose | Public Read |
|---|---|---|
| `project_structured_profiles` | schema.org-compliant structured data | Only if `human_approved_at` is set AND project is public |

### Submit / Claim / Import (3 tables)

| Table | Purpose | Public Read | Public Write |
|---|---|---|---|
| `project_submissions` | Anonymous project submissions | No | Insert allowed |
| `project_claims` | Anonymous founder claims | No | Insert allowed |
| `external_project_imports` | Staged external data imports | No | No |

### Editorial Pipeline (1 table)

| Table | Purpose | Public Read |
|---|---|---|
| `project_editorial_jobs` | AI-generated editorial drafts | No |

### Founder Value (2 tables)

| Table | Purpose | Public Read |
|---|---|---|
| `project_badges` | Genesis Badge and other badges | Via public project, active only |
| `project_consents` | Per-project consent flags | No |

### Lifecycle (1 table)

| Table | Purpose | Public Read |
|---|---|---|
| `project_lifecycle_events` | Immutable lifecycle transition log | Via public project |

### Async Jobs (1 table)

| Table | Purpose | Public Read |
|---|---|---|
| `source_refresh_jobs` | Queued external source refresh jobs | No |

### System Controls (2 tables)

| Table | Purpose | Public Read |
|---|---|---|
| `system_flags` | Cost/web kill switches | No |
| `system_budgets` | Daily budget tracking | No |

## Lifecycle States

### Project Status

Supported values (stored as text with CHECK constraint):

| Status | Meaning | Default Index |
|---|---|---|
| `draft` | Incomplete submission | noindex |
| `submitted` | Submitted for review | noindex |
| `pending_review` | Under editorial review | noindex |
| `approved` | Approved but not yet public | preview_noindex |
| `published` | Publicly published | indexable |
| `claimed` | Founder claimed | indexable |
| `owner_verified` | Founder identity verified | indexable |
| `inactive_warning` | Activity decline warning | noindex |
| `candidate_archive` | Flagged for archival | noindex |
| `archived_research` | Archived, research-visible | archived_indexable |
| `archived_noindex` | Archived, not indexable | archived_indexable (but excluded by status filter) |
| `rejected_spam` | Spam/abuse rejected | noindex |

### Index Status

Supported values:

| Value | Meaning |
|---|---|
| `noindex` | Must not be indexed by search engines |
| `preview_noindex` | Internal preview, not indexed |
| `indexable` | Eligible for sitemap and search index |
| `archived_indexable` | Eligible for archive index (requires human approval) |

## Why External JSON Must First Enter `external_project_imports`

Per AGENTS.md and `docs/10_DATA_CONTRACT.md`, external JSON must never write directly to `projects`. External data enters `external_project_imports` staging, which is:

1. **Isolated from public tables** — import rows have no RLS public read policy
2. **Reviewable** — each import row has a status, reviewer_notes, and reviewer identity
3. **Non-destructive** — imports can be rejected or partially accepted without affecting live project data
4. **Traceable** — source_name, source_url, and created_at provide full provenance

After admin review, approved imports may create or update project records via admin-only operations.

## Why Raw Payloads Do Not Live Long-Term in Postgres

`project_raw_payloads` has bounded retention:

- `expires_at` — required timestamp; rows are eligible for deletion after expiration
- `raw_pointer` — future object storage path for large payloads
- `raw_size_bytes` — enables size monitoring and cost tracking

Long-term data lives in `project_source_snapshots.normalized_payload`, which stores only structured, normalized data — not raw HTML blobs, full API responses, or unbounded JSON.

## Why Score Is Per-Project Only (No Full-Table Recalculation)

Per `docs/11_SCALABILITY_GUARDS.md` and `docs/08_BATCH_PIPELINE.md`:

- No automated trigger recalculates all scores at once
- No `recalculate_all_scores()` function exists
- Score recalculation is per-project, triggered by bounded queue jobs
- `project_scores` stores latest; `project_score_snapshots` stores history
- Failed fetches must not zero out scores — last successful snapshot is preserved

## Why No Automatic Score Recalculation Trigger

Automated triggers that fire on every row change would:

- Create cascading write amplification
- Break the per-project queue sharding model
- Make cost unpredictable
- Violate the explicit cost guard against unbounded writes

Score recalculation is intentionally manual/admin-triggered via queued jobs, not database triggers.

## RLS Summary

All 20 tables have RLS enabled. Policies use `anon` (public/anonymous) and `authenticated` roles.

### Public Read Access

| Table | Condition |
|---|---|
| `categories` | `index_status = 'indexable'` |
| `collections` | `index_status = 'indexable'` |
| `reports` | `index_status = 'indexable'` |
| `projects` | `status IN ('published','claimed','owner_verified','archived_research') AND index_status IN ('indexable','archived_indexable')` |
| `project_scores` | Associated project is publicly readable |
| `project_score_snapshots` | Associated project is publicly readable |
| `project_structured_profiles` | `human_approved_at IS NOT NULL` AND associated project is publicly readable |
| `project_badges` | `is_active = true` AND associated project is publicly readable |
| `project_lifecycle_events` | Associated project is publicly readable |

### Public Write Access

| Table | Operation | Condition |
|---|---|---|
| `project_submissions` | INSERT | Unrestricted (anonymous submission) |
| `project_claims` | INSERT | Unrestricted (anonymous claim) |

### No Public Access

`project_sources`, `project_source_snapshots`, `project_raw_payloads`, `external_project_imports`, `project_editorial_jobs`, `source_refresh_jobs`, `project_consents`, `system_flags`, `system_budgets` — no `anon` select policies exist.

### Admin Access

All tables have an admin select policy using `public.is_admin()`. Admin insert/update/delete policies are not defined in v0 — they will be added when the admin dashboard is implemented in a future PR.

## Public Indexable Content Boundary

Content visible to unauthenticated public users via RLS:

1. Published/claimed/verified projects with `index_status = 'indexable'`
2. Categories, collections, and reports with `index_status = 'indexable'`
3. Project scores for public projects
4. Human-approved structured profiles for public projects
5. Active project badges for public projects
6. Lifecycle event history for public projects

Content NOT visible to the public:
- Submissions, claims, and imports in any state
- Editorial AI drafts (must not be public)
- Raw payloads and source snapshots
- System flags and budgets
- Refresh job queue state
- Unapproved structured profiles
- Project consent data
- Non-indexable categories, collections, and reports

## Future PRs

### PR #10: Submit + Claim Backend

Will add:
- API routes for submission and claim form handling
- Anti-spam validation on submissions
- Admin policies for reviewing submissions and claims

### PR #11: Admin Dashboard + Queues

Will add:
- Admin CRUD policies on all tables
- Queue worker infrastructure for source_refresh_jobs
- Score recalculation worker functions
- Editorial pipeline management

## Dependencies

- Requires Supabase project with `pgcrypto` extension
- Migration must be applied before any application code reads from Supabase
- No `.env.local` or Supabase connection is created in this PR
