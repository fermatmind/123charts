# 37 External Import Integration v0

## Date

2026-06-16

## Purpose

Integrate `fermatmind/88cn-index-data` — the public structured AI project data repository — with 123charts-web. This PR establishes the trust-but-verify pipeline: read project JSON from the open repository, re-validate inside 123charts-web, normalize into import payloads, and stage them in `external_project_imports` for admin review.

## 88cn-index-data Is Public, But Not Trusted

`fermatmind/88cn-index-data` is a public, community-contributable repository. Anyone can open a PR to add project JSON files. While the repository has its own GitHub Actions validation, 123charts-web must **never blindly trust** external data.

All imports are re-validated inside 123charts-web before staging. This provides defense-in-depth:

1. **GitHub Action validates** in the open repo (first pass)
2. **123charts-web validates** on import (second pass — trust but verify)
3. **Admin reviews** the staged import (human review)
4. **Admin publishes** only after all checks pass

## Import Pipeline

```
88cn-index-data (public repo)
  → readIndexData() [local or GitHub API]
    → validateIndexProject() [re-validate all fields]
      → normalizeProject() [normalize to import payload]
        → computeImportFingerprint() [idempotency]
          → external_project_imports [staging table]
            → Admin Review → approved → projects [separate action]
```

## Why External Imports Go to Staging, Not Directly to Projects

Per AGENTS.md and `docs/10_DATA_CONTRACT.md`:

1. **External data must not write directly to `projects`** — All external data enters `external_project_imports` staging.
2. **Admin review is required** — A human must review imports before they become published projects.
3. **Two-step publishing still applies** — Import → approved → preview_noindex → publish → indexable.
4. **No automatic publication** — No trigger, cron, webhook, or background job publishes imports.

## Idempotency

Each import is fingerprinted using `sha256(source_repo + source_path + commit + slug + website_url + payload_hash)`. Before inserting, the system checks if a row with the same fingerprint already exists. If yes, the import is skipped.

Migration 006 adds:
- `external_project_imports.import_fingerprint` (text, nullable)
- Unique partial index on `import_fingerprint WHERE import_fingerprint IS NOT NULL`
- Performance indexes for status-based listing

## Data Source Modes

### Local Source (Development)

Reads from `INDEX_DATA_LOCAL_PATH` (default: `../88cn-index-data`). Used for local development and smoke testing.

### GitHub Source (Production)

Reads from `fermatmind/88cn-index-data` via GitHub public API. No token required for public repos. If `INDEX_DATA_GITHUB_TOKEN` is set, it's used for higher rate limits (server-side only).

## Admin API

### GET /api/admin/external-imports

Returns the staged imports list. Admin-only. No raw payload or fingerprint exposed.

### POST /api/admin/external-imports/sync

Triggers a manual sync. Accepts:
- `source`: `"local"` or `"github"`
- `dry_run`: defaults to `true` (only validate, don't write)

Returns a `SyncResult` with counts and errors. Admin-only.

## Why No GitHub Webhook

GitHub webhooks would automatically trigger imports on every PR merge. This is intentionally avoided because:

1. **Trust boundary** — External repo data should not auto-trigger writes to 123Charts's database.
2. **Admin control** — Admins decide when to sync and what to review.
3. **Rate limiting** — Webhooks could be abused to trigger excessive API calls.
4. **Simplicity** — Manual sync via admin UI is sufficient for Phase 1 volume.

## Why No Automatic Cron

Cron-based sync would poll GitHub repeatedly. This is avoided because:

1. **Cost** — Unnecessary API calls when no new data exists.
2. **Predictability** — Admins know exactly when data was imported.
3. **Phased approach** — Cron sync can be added in a future PR if manual sync becomes a bottleneck.

## Why No OpenAI API

AI review of imported projects is a future editorial pipeline feature. Current Phase 1 relies on human admin review.

## Why No Third-Party Data Import

123Charts only imports from `fermatmind/88cn-index-data`. No Toolify, TAAFT, SaaSHub, Product Hunt scraping.

## Why Dynamic Fields Are Not in the Open Repo

Signal Score, Source Confidence, Editorial Notes, claim verification, and admin review metadata are computed or managed by the 123Charts platform. They are not in `88cn-index-data` and are never imported.

## PR #26 QA Scope

QA for this PR should verify:
1. Admin-only access to external-imports API and page
2. Dry run returns summary without writing
3. Local source syncs example project
4. Invalid source mode returns 400
5. Non-admin returns 401/403
6. Missing Supabase env returns graceful 503

## Future PRs

- **External import review actions** — Approve/reject from admin UI
- **Seed 100 projects** — Batch import initial project dataset
- **Editorial Draft Pipeline** — AI draft generation for imported projects
