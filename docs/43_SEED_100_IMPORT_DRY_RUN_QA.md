# Seed 100 Import Dry Run + Admin Staging QA

## Result

PASS_AFTER_REMEDIATION

PR32 verified that Seed 100 data from `fermatmind/88cn-index-data` can be consumed by the PR31 external import classification layer without entering public 123Charts surfaces.

PR36 remediation closes the original P2/P3 repeatability findings. PR33 can proceed.

## Repo State

| Repo | Commit | Worktree |
| --- | --- | --- |
| 123Charts | `86d6611` | Clean before QA writes |
| 88cn-index-data | `1fb09e3` | Clean after validation |

PR31 merge commit confirmed on main: `86d6611`.

## Data Repo Validation

Data repo path: `/Users/rainie/Desktop/88cn-index-data`

| Check | Result |
| --- | --- |
| `git checkout main` + `git pull --ff-only origin main` | PASS |
| `seed/seed-100-manifest.json` exists | PASS |
| `data/projects/*.json` count | PASS, 101 files including example project |
| `npm run taxonomy:check` | PASS |
| `npm run privacy:check` | PASS |
| `npm run validate` | PASS |
| `npm run aggregate` | PASS, 101 projects aggregated |
| `npm run seed:check` | PASS, 100 verified seed items |
| `npm test` | PASS |
| Data repo worktree clean | PASS |

## Main Repo Validation

Main repo path: `/Users/rainie/Desktop/123charts.com/123charts`

| Check | Result |
| --- | --- |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run db:schema:check` | PASS |
| `npm run public-surface:check` | PASS |
| `npm run intake:check` | PASS |
| `npm run external-import:check` | PASS |
| `npm run external-import:quarantine:check` | PASS |
| `npm run external-import:seed-dry-run` | PASS, 101 files, 100 seed manifest items, all probes PASS |
| `npm run geo-checker:check` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run agent:tool:check` | PASS |
| `npm run agent:mcp-config:check` | PASS |
| `npm run agent:plugin-policy:check` | PASS |
| `npm run agent:scope:check -- PR32` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS, 42 pages |
| `npm run agent:gate` | PASS, includes quarantine and Seed 100 dry-run checks |

## PR31 Artifact Presence

| Artifact | Result |
| --- | --- |
| `lib/index-data/import-summary.ts` | PASS |
| `lib/index-data/quarantine.ts` | PASS |
| `supabase/migrations/007_external_import_quarantine_summary.sql` | PASS |
| `scripts/check-external-import-quarantine.mjs` | PASS |
| `docs/42_EXTERNAL_IMPORT_QUARANTINE_SUMMARY_V0.md` | PASS |
| `package.json` script `external-import:quarantine:check` | PASS |

Reason codes verified:

- `invalid_url`
- `invalid_category`
- `duplicate_slug`
- `duplicate_fingerprint`
- `forbidden_field`
- `privacy_risk`
- `malformed_payload`
- `source_not_allowed`

## Seed 100 Dry-Run Command

PR36 adds a first-class read-only command:

```bash
npm run external-import:seed-dry-run
```

The command reads `/Users/rainie/Desktop/88cn-index-data`, temporarily compiles pure import-classification helpers to the system temp directory, and performs no Supabase access, network fetches, or repo writes.

Result:

```json
{
  "files": 101,
  "seed_manifest_items": 100,
  "accepted": 101,
  "summary": {
    "total": 101,
    "accepted": 101,
    "quarantined": 0,
    "rejected": 0,
    "duplicates": 0
  },
  "probes": {
    "duplicate_slug": "PASS",
    "duplicate_fingerprint": "PASS",
    "invalid_url": "PASS",
    "invalid_category": "PASS",
    "forbidden_field": "PASS",
    "privacy_risk": "PASS",
    "malformed_payload": "PASS"
  }
}
```

This confirms:

- Seed payloads can be read from the local data repo.
- Import candidates can be formed.
- Summary shape exists and includes accepted, quarantined, rejected, duplicates, and reasons.
- Pure classification does not require Supabase env.
- Structural probes produce expected duplicate, URL, category, blocked-field, privacy-risk, and malformed payload reason codes.

## Admin Route Protection And Summary Rendering

PR36 adds a stable QA server command:

```bash
npm run dev:qa
PORT=3100 scripts/codex-preflight.sh
```

`scripts/codex-preflight.sh` still defaults to port 3000, but now respects `PORT` when `APP_URL` is not set. Browser QA uses `localhost:3100` to avoid collisions with other local services.

Checks on `localhost:3100`:

| Request | Result |
| --- | --- |
| `GET /admin/external-imports` | PASS, renders Sign In Required page |
| `GET /admin/external-imports` with `ADMIN_EXTERNAL_IMPORTS_FIXTURE=1` and non-production dev server | PASS, renders authenticated summary fixture |
| `GET /api/admin/external-imports` | PASS, `401 application/problem+json` |
| `POST /api/admin/external-imports/sync` dry run | PASS, `401 application/problem+json` |

No staged import records, raw payloads, private data, stack traces, or admin metadata were exposed unauthenticated. The fixture path is guarded by `NODE_ENV !== "production"` plus explicit `ADMIN_EXTERNAL_IMPORTS_FIXTURE=1`, so production cannot activate it.

Screenshots:

- `../screenshots/qa/pr32-admin-external-imports-unauth.png`
- `../screenshots/qa/pr32-admin-external-imports-fixture.png`

## Sitemap Leakage Check

Sitemap fetched from:

```bash
curl -s http://localhost:3100/sitemap.xml > /tmp/123charts-pr32-sitemap.xml
```

Sampled 21 slugs: first 10 data repo slugs, last 10 data repo slugs, and `example-ai-project`.

Result:

```json
{
  "checked": 21,
  "leaked": []
}
```

No sampled Seed 100 slug entered sitemap automatically.

Screenshot / evidence:

- `../screenshots/qa/pr32-sitemap-or-curl-evidence.png`

## Public API Leakage Check

Sampled 10 Seed 100 slugs:

| Slug | HTTP | Leak Scan |
| --- | --- | --- |
| `adobe-firefly` | 404 | clean |
| `agentgpt` | 404 | clean |
| `agno` | 404 | clean |
| `aider` | 404 | clean |
| `anything-llm` | 404 | clean |
| `augment-code` | 404 | clean |
| `autogpt` | 404 | clean |
| `baichuan` | 404 | clean |
| `bolt` | 404 | clean |
| `canva` | 404 | clean |

Public API responses did not include external import table names, quarantine details, import payloads, or admin metadata.

## Quarantine Summary Shape

PASS. The pure summary helper and dry-run classification output include:

- `total`
- `accepted`
- `quarantined`
- `rejected`
- `duplicates`
- `reasons`

All required reason code keys exist.

Admin UI summary visibility is verified through the non-production fixture path. The unauthenticated boundary remains verified separately.

## Privacy And Redaction

`npm run agent:redact:check` passed.

Static search over PR31-related files found sensitive-word matches only in existing policy/config contexts:

- `lib/index-data/forbidden-fields.ts`
- `lib/index-data/source.ts`

No real private data, env values, credential-bearing URLs, raw payload dumps, or server identifiers were found in QA outputs.

## Browser / Curl Evidence

Screenshots:

- `../screenshots/qa/pr32-admin-external-imports-unauth.png`
- `../screenshots/qa/pr32-sitemap-or-curl-evidence.png`
- `../screenshots/qa/pr32-projects-public-surface.png`
- `../screenshots/qa/pr32-geo-checker-public-surface.png`

Public surface screenshots confirm `/projects` and `/geo-checker` remain reachable on the QA dev server.

## Findings

| Severity | Area | Finding | Impact | Recommendation |
| --- | --- | --- | --- | --- |
| P2 | Dry-run ergonomics | Resolved in PR36. `npm run external-import:seed-dry-run` is now first-class and read-only. | Repeatable Seed 100 dry-run is available. | Keep command in `agent:gate` unless runtime becomes excessive. |
| P2 | Admin UI visibility | Resolved in PR36. Non-production fixture verifies authenticated summary rendering. | Summary cards and reason counts are now browser-verifiable without real credentials. | Keep fixture gated by non-production plus explicit env flag. |
| P3 | Agent gate coverage | Resolved in PR36. `agent:gate` now includes quarantine and Seed 100 dry-run checks. | Broad gate covers PR31/PR32 import safety checks. | None. |
| P3 | Browser port | Resolved in PR36. `dev:qa` uses 3100 and preflight supports `PORT=3100`. | Browser QA no longer depends on port 3000 availability. | None. |

## Scope Remediation

Initial `npm run agent:scope:check -- PR32` failed because PR32 allowed paths did not include `docs/43_SEED_100_IMPORT_DRY_RUN_QA.md`, which this task explicitly required. PR36 later expanded PR32 into a narrow QA-remediation scope for the dedicated dry-run command, agent gate coverage, preflight port handling, and the non-production admin summary fixture. No public project route, sitemap, public API, Supabase migration, or deployment path was changed.

## Recommendation

PR33 can proceed.

The original findings are resolved and do not indicate Seed 100 sitemap leakage, public API leakage, unauthenticated admin data exposure, missing reason codes, or failed data validation.
