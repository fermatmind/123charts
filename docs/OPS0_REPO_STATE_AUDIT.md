# OPS-0 Repo State Audit

## Result

PASS_WITH_RISK.

The main repo and data repo are synchronized with their remote `main` branches, and all requested main/data repo checks pass after PR #30 resolved the README public-copy policy blocker. The remaining risk is product-process readiness: external import consumer-side quarantine summary support is still missing, and no dedicated seed slug sitemap leakage check exists yet.

## Main Repo Summary

Repository: `fermatmind/88CN`

Local path: `/Users/rainie/Desktop/123charts.com/123charts`

Branch under audit: `codex/ops0-repo-state-audit`

Remote: `git@github.com:fermatmind/88CN.git`

Current `origin/main` commit: `13f4dd9`

Current branch state: PR #29 branch rebased onto latest `origin/main` after PR #30 merge.

Recent merge context:

- PR #30 merged: README public-copy policy unblock.
- PR #29 open: OPS-0 repo state audit refresh.
- PR #28 merged: Geo Checker remediation live QA.
- PR #27 merged: AI Search Readiness Checker QA.
- PR #26 merged: AI Search Readiness Checker v0.
- PR #25 merged: OSS data repo and external import QA.
- PR #24 merged: External import integration v0.
- PR #23 merged: Live intake firewall QA.
- PR #22 merged: Submission intake firewall.
- PR #21 merged: Production redeploy and admin review QA.
- PR #20 merged: Admin review v0.

## Data Repo Summary

Repository: `fermatmind/88cn-index-data`

Local path: `/Users/rainie/Desktop/88cn-index-data`

Branch: `main`

Remote: `git@github.com:fermatmind/88cn-index-data.git`

Current commit: `1fb09e3`

Current branch state: `main` is synchronized with `origin/main`; worktree clean after checks.

Project JSON count: 101 files.

Seed manifest: `seed/seed-100-manifest.json`, 100 items.

Category distribution:

| Category | Count |
| --- | ---: |
| open-source-ai | 18 |
| ai-coding | 15 |
| ai-agents | 12 |
| ai-microsaas | 10 |
| chinese-ai-builders | 10 |
| rag-tools | 10 |
| ai-video-tools | 7 |
| local-llm | 7 |
| ai-design-tools | 6 |
| ai-seo-tools | 6 |

Source type distribution:

| Source type | Count |
| --- | ---: |
| maintainer-scouted | 96 |
| open-source-repo | 4 |
| founder-submitted | 1 |

Data license files:

- `LICENSE`
- `DATA_LICENSE.md`

Privacy boundary docs:

- `docs/PRIVACY_BOUNDARY.md`
- `docs/DATA_CONTRACT.md`
- `docs/OPEN_CORE_BOUNDARY.md`
- `docs/SEED_100_CURATION_POLICY.md`
- `docs/SEED_SOURCE_VERIFICATION_GUIDE.md`

Data repo GitHub Actions:

- `.github/workflows/validate-project.yml`

## PR History Summary

Main repo sampled PRs:

| PR | State | Head branch | Merge commit |
| --- | --- | --- | --- |
| #1 | MERGED | `codex/day0-bootstrap` | `4f4216e` |
| #10 | MERGED | `opencode/api-contract-security-v0` | `77213a8` |
| #20 | MERGED | `codex/admin-review-v0-pr20` | `07a3957` |
| #28 | MERGED | `codex/geo-checker-remediation-live-qa` | `b13b532` |

Data repo sampled PRs:

| PR | State | Head branch | Merge commit |
| --- | --- | --- | --- |
| #1 | MERGED | `pr24-opencode` | `24b54db` |
| #2 | MERGED | `opencode/seed-100-projects-v0` | `1fb09e3` |

## Build And Check Script Inventory

Main repo package scripts:

| Script | Command |
| --- | --- |
| `dev` | `next dev` |
| `build` | `next build` |
| `build:production` | `NODE_ENV=production next build` |
| `start:production` | `next start` |
| `lint` | `next lint` |
| `typecheck` | `tsc --noEmit` |
| `runtime:check` | `bash deploy/scripts/check-runtime.sh` |
| `db:schema:check` | `node scripts/check-supabase-migrations.mjs` |
| `public-surface:check` | `node scripts/check-public-surface-hardening.mjs` |
| `intake:check` | `node scripts/check-intake-firewall.mjs` |
| `external-import:check` | `node scripts/check-external-import-integration.mjs` |
| `geo-checker:check` | `node scripts/check-geo-checker.mjs` |
| `docs:check` | required file existence check |
| `policy:scan` | `node scripts/scan-forbidden-patterns.mjs` |
| `third-party:check` | `node scripts/check-third-party-notices.mjs` |
| `verify:day0` | docs, policy, and third-party gate |

Main repo check results:

| Check | Result |
| --- | --- |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run db:schema:check` | PASS, 23 tables verified |
| `npm run public-surface:check` | PASS |
| `npm run intake:check` | PASS |
| `npm run external-import:check` | PASS |
| `npm run geo-checker:check` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS, 42/42 pages |

Data repo package scripts:

| Script | Command |
| --- | --- |
| `validate` | `node scripts/validate-projects.mjs` |
| `aggregate` | `node scripts/aggregate-projects.mjs` |
| `privacy:check` | `node scripts/check-forbidden-fields.mjs` |
| `taxonomy:check` | `node scripts/check-taxonomy.mjs` |
| `seed:check` | `node scripts/check-seed-batch.mjs` |
| `test` | taxonomy, privacy, validate, aggregate, seed checks |

Data repo check results:

| Check | Result |
| --- | --- |
| `npm ci` | PASS |
| `npm run taxonomy:check` | PASS |
| `npm run privacy:check` | PASS |
| `npm run validate` | PASS |
| `npm run aggregate` | PASS |
| `npm run seed:check` | PASS |
| `npm test` | PASS |

## Route And API Inventory

Public and page routes:

- `/`
- `/projects`
- `/projects/[slug]`
- `/categories/[slug]`
- `/collections/[slug]`
- `/reports`
- `/reports/[slug]`
- `/founders`
- `/genesis`
- `/geo-checker`
- `/submit`
- `/claim/[slug]`
- `/robots.txt`
- `/sitemap.xml`

Admin routes:

- `/admin`
- `/admin/login`
- `/admin/submissions`
- `/admin/claims`
- `/admin/external-imports`

API routes:

- `/api/healthz`
- `/api/projects/[slug]`
- `/api/project-submissions`
- `/api/project-claims`
- `/api/geo-checker`
- `/api/admin/submissions/[id]`
- `/api/admin/claims/[id]`
- `/api/admin/external-imports`
- `/api/admin/external-imports/sync`

## Migration Inventory

| Migration | Purpose |
| --- | --- |
| `001_init.sql` | Core schema, lifecycle, RLS, admin policies, staging tables |
| `002_audit_notification.sql` | Audit and notification tables |
| `003_admin_users.sql` | Admin user mapping and guard support |
| `004_needs_info_status.sql` | Review status expansion |
| `005_intake_indexes.sql` | Intake indexes |
| `006_external_import_indexes.sql` | External import fingerprint and indexes |

## Deploy Directory Inventory

- `deploy/nginx/`
- `deploy/pm2/`
- `deploy/scripts/`

Deployment docs present:

- `docs/28_ALIYUN_HK_DEPLOYMENT_RUNTIME.md`
- `docs/31_DEPLOYMENT_SMOKE_REPORT.md`
- `docs/32_SERVER_OPERATIONS_CHECKLIST.md`
- `docs/34_PRODUCTION_REDEPLOY_ADMIN_QA.md`
- `docs/36_LIVE_INTAKE_FIREWALL_QA.md`
- `docs/41_GEO_CHECKER_REMEDIATION_LIVE_QA.md`

No real server address, private key, env file, or live config was scanned into this report.

## External Import Boundary Status

PASS.

Evidence:

- `lib/index-data/sync.ts` writes staged rows to `external_project_imports`.
- `scripts/check-external-import-integration.mjs` verifies no direct project-table writes from sync logic.
- `app/admin/external-imports/page.tsx` is admin route only.
- `app/api/admin/external-imports/route.ts` and `/sync` are admin API routes.
- `app/sitemap.ts` renders reviewed demo/public routes and does not read staged imports.
- `npm run external-import:check` passed.

Boundary conclusion:

- External data enters staging only.
- No automatic project publication path was observed.
- No automatic sitemap inclusion path was observed.
- Public API exposure of staged import payloads was not observed.

## Geo Checker Boundary Status

PASS.

Evidence:

- `/geo-checker` exists.
- `/api/geo-checker` exists.
- `lib/geo-checker/ssrf-guard.ts` exists.
- `lib/geo-checker/fetch-url.ts` has timeout, redirect, and body-limit logic.
- `scripts/check-geo-checker.mjs` verifies no Supabase import and no AI API dependency in the checker files.
- `deploy/nginx/123charts.conf.example` contains `/api/geo-checker`.
- `app/sitemap.ts` includes `/geo-checker`.
- `npm run geo-checker:check` passed.

Boundary conclusion:

- No Supabase writes were observed for the checker.
- No LLM or third-party SEO API integration was observed for the checker.
- SSRF guard and Nginx rate-limit example are present.

## Intake Firewall Boundary Status

PASS.

Evidence:

- Honeypot field checks exist in `lib/validation/shared.ts` and form components.
- Hidden monetization-field rejection exists in `lib/validation/shared.ts`.
- URL guard and content-length guard are present in intake routes.
- `supabase/migrations/005_intake_indexes.sql` exists.
- `docs/36_LIVE_INTAKE_FIREWALL_QA.md` exists.
- `npm run intake:check` passed.

## Deployment Report Status

PASS with historical caveat.

Deployment runtime docs and smoke reports exist through the latest Geo Checker remediation live QA. Earlier reports document partial SSH reliability, but later Cloud Assistant based live QA completed and is documented.

## Commercial And Featured Signals Boundary

PASS for current implementation state.

No current implementation of commercial placement, featured-signal ranking, paid exposure, or related sitemap/API/MCP behavior was found. OPS-1 should still create explicit boundary contracts before any future monetized surface is implemented.

## Public Copy Risk Scan

PASS.

Current scan result:

- README policy blocker resolved by PR #30.
- Current `npm run policy:scan` passes.
- `app/**`, `components/**`, and product UI files did not show the PR #28 public-copy regression.
- Policy and QA documents contain allowed historical/policy references.

## Known Gaps

1. Consumer-side quarantine summary support is missing for imported seed records.
2. No dedicated automated check proves seed slugs stay out of sitemap output after import; current protection comes from staging-only import and static sitemap code.
3. OPS-1 contracts do not yet exist for telemetry, cache tags, event outbox, redaction, featured signals, public API, MCP, and payment boundaries.

## Recommended Next Action

1. Merge OPS-0 after this refresh.
2. Build OPS-1 Agent Operating System v1.
3. Implement PR31 External Import Consumer Quarantine Summary v0.
4. Run PR32 Seed 100 Import Dry Run + Admin Staging QA.
