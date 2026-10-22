# OPS8A Production Release Candidate + Internal Beta Readiness Scan v0

Date: 2026-06-20
Role: Codex-Build
Result: GO_DEPLOY_RC
Exact next task: OPS8B Production Deploy + Live Smoke

## Scope

OPS8A is a readiness, roadmap, and status task only. It does not deploy, SSH
into production, run live smoke, modify server config, modify app runtime,
modify product code, enable feature flags, start OPS8B, start PR101, or mutate
`/Users/rainie/Desktop/88cn-index-data`.

GO_DEPLOY_RC means the current repository state is locally ready to enter the
human-checkpointed OPS8B deployment and live-smoke task. It is not deployment
approval.

## Required Questions

| Question | Answer |
| --- | --- |
| Is PR81-PR100 complete? | Yes. PR98, PR99, and PR100 are merged; PR100 reports the PR81-PR100 B2B Alpha phase complete. |
| Is current main clean and deployable? | Yes for local release-candidate readiness: `main == origin/main` at `842dc5e0f57b7a6cd269ad1c323f00b77393c12f`, worktree clean, build and gate pass. Deployment still requires OPS8B human checkpoint. |
| Does local build pass? | Yes, `npm run build` passes and generated 69 static pages. |
| Does agent gate pass? | Yes, `npm run agent:gate` passes. |
| Is data repo clean? | Yes, `/Users/rainie/Desktop/88cn-index-data` is clean on `main...origin/main`. |
| Are dangerous feature flags expected to remain disabled? | Yes. OPS8A documents disabled or conservative RC defaults and does not edit `.env`. |
| Are Public API, MCP, payment, API key, buyer interest, and Alpha Feed runtime disabled by default? | Yes. Current route/flag code keeps them disabled unless explicitly enabled by later checkpointed env and implementation. Alpha Feed has no live delivery runtime. |
| Is sitemap bounded and safe? | Yes. Built sitemap has 33 URLs and only public allowlisted surfaces. |
| Are admin/API/MCP/payment routes excluded from sitemap? | Yes. Built sitemap has no `/admin`, `/api`, `/api/mcp`, payment, API key, or buyer-interest URLs. |
| Are noindex / published-only boundaries intact? | Yes. Sitemap uses `getPublishedProjects`, `INDEXABLE_STATES`, published report/collection/stack/vertical/alternative registries, and robots disallows admin/API/claim/submit paths. |
| Does buyer interest route remain no-write? | Yes. `/api/alpha-feed/buyer-interest` returns disabled Problem Details for GET/POST and does not parse or store request bodies. |
| Does API key route remain disabled? | Yes. `/api/alpha-feed/api-keys` returns disabled Problem Details for GET/POST and no credential material. |
| Does MCP route remain disabled? | Yes. `/api/mcp` is disabled unless `MCP_SERVER_ENABLED=true` and local-only constraints allow access. |
| Does Public API route remain disabled? | Yes. `/api/public/v0/projects` is disabled unless `PUBLIC_API_ENABLED=true`. |
| Does payment checkout route remain disabled? | Yes. `/api/payments/featured-signals/checkout` returns disabled Problem Details even if future flags are set, pending separate checkpointed implementation. |
| Does Alpha Feed export remain local-only? | Yes. Snapshot exporter remains local dry-run tooling and output is constrained to `/tmp` by previous checks. |
| Does Laravel gateway remain disabled/non-runtime? | Yes. Gateway remains disabled scaffold/spec only; no Composer, PHP runtime, Laravel app, route tree, Redis production config, or server process is active. |
| Does Supabase webhook sync remain contract-only? | Yes. No webhook runtime, migration, secret, live delivery, or Laravel consumer is active. |
| Is production deploy script ready? | Yes for a checkpointed OPS8B attempt: `scripts/agent/deploy-production.sh`, `scripts/agent/smoke-local.sh`, `scripts/agent/smoke-live.sh`, and `ops/skills/live-deploy.md` exist. |
| Are live smoke paths complete? | Generic smoke paths exist. OPS8B must additionally run disabled-route smoke with expected 503 Problem Details for public API, MCP, payment, API key, and buyer-interest routes. |
| What must OPS8B verify after deployment? | Exact SHA, local/live public smoke, disabled API surfaces, sitemap/robots, admin protection, PM2/Nginx/TLS/DNS summaries with secrets/server details redacted. |
| Is internal beta safe to begin after OPS8B? | Conditionally yes only after OPS8B deployment and live smoke pass, no P0/P1 blockers exist, and OPS8C defines the beta test plan. |
| What should OPS8C contain? | Internal beta test plan, manual feedback protocol, tester cohorts, redaction rules, issue triage, rollback/hold conditions, and no CRM/email automation. |
| Should PR101 remain paused? | Yes. PR101 remains paused. Do not start PR101 directly after OPS8A or PR100. |
| Should I18N begin before or after BETA1? | After BETA1 by default. Run I18N0 after beta feedback unless the human team explicitly reprioritizes. |
| What is the exact next task after OPS8A? | OPS8B Production Deploy + Live Smoke. |

## Repository State

| Item | Result |
| --- | --- |
| Main SHA | `842dc5e0f57b7a6cd269ad1c323f00b77393c12f` |
| `main == origin/main` | PASS |
| Worktree clean before OPS8A branch | PASS |
| PR98 merge in `origin/main` | PASS, `35a9b7f33bc67fbd5f257bb40f4bd3132f41dfb9` |
| PR99 merge in `origin/main` | PASS, `1ddeb267eb0940d2919c7a9e8b00a35f476c8db3` |
| PR100 merge in `origin/main` | PASS, `842dc5e0f57b7a6cd269ad1c323f00b77393c12f` |
| Data repo | PASS, clean on `main...origin/main` |
| Local build | PASS |
| Agent gate | PASS |
| Live deploy | NOT RUN |
| Live smoke | NOT RUN |

## PR81-PR100 Completion Matrix

| Range | Evidence | Result |
| --- | --- | --- |
| PR81-PR83 Alpha Feed boundary | Boundary, snapshot schema, event outbox docs/contracts | Complete |
| PR84-PR86 snapshot and cleansing | Local dry-run exporter, cleansing model, QA report | Complete |
| PR87-PR90 API credential and metering | Disabled boundary, disabled shell, ledger contract, QA | Complete |
| PR91-PR94 Laravel and sync | Gateway spec, disabled scaffold, webhook boundary, QA | Complete |
| PR95-PR97 Alpha Feed landing/evidence | Static landing, disabled buyer-interest shell, evidence dossier | Complete |
| PR98 | B2B feed leakage QA | Merged |
| PR99 | Alpha Feed pivot gate | Merged |
| PR100 | B2B Alpha data feed readiness report | Merged |

## Release Candidate Readiness Matrix

| Area | Result | Evidence |
| --- | --- | --- |
| Local build | PASS | `npm run build` generated 69 static pages |
| Local typecheck | PASS | `npm run typecheck` |
| Agent gate | PASS | `npm run agent:gate` |
| Public route inventory | PASS | Build output and app route structure inspected |
| Disabled API surfaces | PASS | Route code returns disabled Problem Details by default |
| Sitemap | PASS | Built sitemap has 33 URLs and excludes admin/API surfaces |
| Robots | PASS | Built robots disallows `/admin/`, `/api/`, `/preview/`, `/claim/`, `/submit/` |
| Deploy script | PASS | `scripts/agent/deploy-production.sh` exists and requires `--confirm --commit <sha>` |
| Live smoke script | PASS_WITH_CHECKLIST | Generic script exists; disabled-route 503 checks must be added manually in OPS8B |
| Internal beta | CONDITIONAL | Allowed only after OPS8B and OPS8C |

## Feature Flag Matrix

OPS8A does not create or edit `.env`. These are expected conservative RC
defaults.

| Flag | Expected RC default | Evidence |
| --- | --- | --- |
| `FEATURED_SIGNALS_ENABLED` | `false` or limited-only if already documented | `lib/featured/flags.ts`, PR50/PR57 docs |
| `AD_PAYMENTS_ENABLED` | `false` | `lib/payments/feature-flags.ts` |
| `STRIPE_CHECKOUT_ENABLED` | `false` | `lib/payments/feature-flags.ts` |
| `FEATURED_SIGNAL_CHECKOUT_ENABLED` | `false` | `lib/payments/feature-flags.ts` |
| `PUBLIC_API_ENABLED` | `false` | `lib/public-api/feature-flags.ts` requires exact `true` |
| `MCP_SERVER_ENABLED` | `false` | `lib/mcp/feature-flags.ts` requires exact `true` |
| `MCP_LOCAL_ONLY` | `true` | `lib/mcp/feature-flags.ts` defaults true unless exact `false` |
| `API_KEYS_ENABLED` | `false` | `lib/api-keys/flags.ts`, API key boundary contract |
| `API_KEY_ISSUANCE_ENABLED` | `false` | `lib/api-keys/flags.ts`, API key boundary contract |
| `METERING_ENABLED` | `false` | `lib/api-keys/flags.ts`, metering contract |
| `CUSTOMER_ACCESS_ENABLED` | `false` | `lib/api-keys/flags.ts`, gateway/API key contracts |
| `BILLING_ENABLED` | `false` | `lib/api-keys/flags.ts` |
| `SUPABASE_WEBHOOK_SYNC_ENABLED` | `false` | Supabase webhook and Laravel gateway contracts |
| `LARAVEL_GATEWAY_ENABLED` | `false` | `gateway/disabled-scaffold.contract.json` |
| `LARAVEL_RUNTIME_ENABLED` | `false` | `gateway/disabled-scaffold.contract.json` |
| `REDIS_GATEWAY_CACHE_ENABLED` | `false` | `gateway/disabled-scaffold.contract.json` |
| `INDEXNOW_LIVE_PING_ENABLED` | `false` | PR78/PR79 boundary keeps live ping disabled |
| `GOOGLE_INDEXING_API_ENABLED` | `false` | PR78/PR79 boundary forbids Google Indexing API use |

## Route Inventory

Build output reports 69 generated static pages. Important public pages:

| Route | OPS8B expectation |
| --- | --- |
| `/` | 200 |
| `/projects` | 200 |
| `/reports` | 200 |
| `/reports/early-ai-project-machine-readability-2026` | 200 |
| `/geo-checker` | 200 |
| `/submit` | 200 page, remains disallowed in robots |
| `/claim/[slug]` | Dynamic page, claim root not in sitemap |
| `/founders` | 200 |
| `/genesis` | 200 |
| `/stacks/*` | Published finite registry pages |
| `/collections/*` | Published finite registry pages |
| `/verticals/*` | Published finite registry pages |
| `/alternatives/*` | Published finite registry pages |
| `/alpha-feed` | Static boundary page, not live feed delivery |
| `/sitemap.xml` | 200 |
| `/robots.txt` | 200 |
| `/admin` | Protected/non-leaking behavior expected when unauthenticated |

Disabled or protected routes for OPS8B smoke:

| Route | Expected behavior |
| --- | --- |
| `/api/public/v0/projects` | 503 `application/problem+json` unless explicitly enabled |
| `/api/mcp` | 503 `application/problem+json` unless explicitly enabled and local-only constraints allow |
| `/api/payments/featured-signals/checkout` | 503 `application/problem+json` |
| `/api/alpha-feed/api-keys` | 503 `application/problem+json` |
| `/api/alpha-feed/buyer-interest` | 503 `application/problem+json` |

## Sitemap / Robots Readiness

Built sitemap evidence: `.next/server/app/sitemap.xml.body` contains 33 URLs.

Included classes:

- root, projects list, founders, genesis, geo-checker;
- six published demo project pages;
- five category pages;
- three collection pages;
- three stack pages;
- three vertical pages;
- three alternatives pages;
- reports index and four report pages.

Excluded classes:

- `/admin`;
- `/api/**`;
- `/api/mcp`;
- payment checkout route;
- Alpha Feed API key and buyer-interest routes;
- submitted, pending, quarantined, scouted, rejected, or private data surfaces.

Robots evidence: `.next/server/app/robots.txt.body` allows public discovery
paths and disallows `/admin/`, `/api/`, `/preview/`, `/claim/`, and `/submit/`.

OPS8B must verify live `/sitemap.xml` and `/robots.txt` after deployment.

## Disabled Surface Inventory

| Surface | Result |
| --- | --- |
| Public API | Disabled by default via `PUBLIC_API_ENABLED !== "true"` |
| MCP | Disabled by default via `MCP_SERVER_ENABLED !== "true"` and local-only default |
| Payment checkout | Disabled Problem Details; checkout execution unimplemented pending checkpoint |
| API key shell | Disabled Problem Details for GET/POST |
| Buyer interest shell | Disabled Problem Details for GET/POST and no request body parsing/storage |
| Supabase writes | No active Alpha Feed, buyer-interest, API key, metering, or webhook write path |
| Laravel runtime | Disabled/non-runtime scaffold only |
| Metering runtime | Contract-only; no live route |
| Customer access | Not active |

## Data Repo Cleanliness

`/Users/rainie/Desktop/88cn-index-data` was checked out to `main`, fast-forward
pulled, and remained clean on `main...origin/main`. OPS8A does not mutate it.

## Server Deploy Readiness

Existing deployment artifacts:

- `scripts/agent/deploy-production.sh`
- `scripts/agent/smoke-local.sh`
- `scripts/agent/smoke-live.sh`
- `deploy/nginx/123charts.conf.example`
- `deploy/pm2/ecosystem.config.cjs`
- `deploy/scripts/build-production.sh`
- `deploy/scripts/check-runtime.sh`
- `deploy/scripts/deploy-rsync.sh.example`
- `deploy/scripts/restart-pm2.sh`
- `ops/skills/live-deploy.md`

Deployment remains checkpointed. OPS8B must use an exact approved
`origin/main` SHA and the deployment script, not ad hoc server steps.

## OPS8B Live Smoke Checklist

OPS8B must verify, after deploy:

| Check | Expected |
| --- | --- |
| Deployed SHA | Exact approved SHA matches production checkout |
| `/api/healthz` | 200 |
| `/` | 200 |
| `/projects` | 200 |
| `/reports` | 200 |
| `/reports/early-ai-project-machine-readability-2026` | 200 |
| `/geo-checker` | 200 |
| `/submit` | 200 |
| `/alpha-feed` | 200 static boundary page |
| `/admin` unauthenticated | protected/sign-in/non-leaking |
| `/sitemap.xml` | 200 and 33 expected URL class coverage or documented delta |
| `/robots.txt` | 200 and admin/API disallow rules present |
| `/api/public/v0/projects` | 503 Problem Details |
| `/api/mcp` | 503 Problem Details |
| `/api/payments/featured-signals/checkout` | 503 Problem Details |
| `/api/alpha-feed/api-keys` | 503 Problem Details |
| `/api/alpha-feed/buyer-interest` | 503 Problem Details |
| PM2 | running expected app process |
| Nginx | config test passes and service reloads |
| TLS/DNS | valid public access, details redacted |
| Secrets/server details | redacted from repo, PR body, and chat |

## Internal Beta Readiness

Internal beta is not safe to begin inside OPS8A. It can begin only after:

1. OPS8B deploy succeeds.
2. OPS8B live smoke succeeds.
3. Disabled route smoke succeeds.
4. Live sitemap and robots are verified.
5. No P0/P1 release blocker exists.
6. OPS8C defines the internal beta test plan and manual feedback protocol.

Recommended sequence: OPS8B first, then OPS8C, then BETA1.

## BETA1 Gating Criteria

BETA1 must remain human/manual. It requires:

- human-selected founder/data-buyer testers;
- no Codex outreach execution;
- no CRM/email automation;
- redacted feedback before repo entry;
- no private contact details or buyer messages committed;
- clear stop conditions for P0/P1 bugs, privacy issues, disabled-route leaks,
  payment/customer-access confusion, or server instability.

## I18N Sequencing Recommendation

Default recommendation: start i18n after BETA1 feedback, beginning with I18N0
Internationalization Boundary Scan. Do not begin translation before I18N0 unless
the human team explicitly reprioritizes.

Recommended i18n order:

1. I18N0 boundary scan.
2. I18N1 core i18n infrastructure.
3. I18N2 limited zh-CN core public pages.
4. I18N3 hreflang/canonical/sitemap QA.
5. I18N4 Chinese founder copy QA.

## Roadmap Registration

OPS8A registered missing narrow roadmap tasks:

- OPS8A Production Release Candidate + Internal Beta Readiness Scan v0;
- OPS8B Production Deploy + Live Smoke v0;
- OPS8C Internal Beta Test Plan + Manual Feedback Protocol v0;
- BETA1 Founder / Data Buyer Internal Test Run v0;
- I18N0 Internationalization Boundary Scan v0;
- I18N1 Core i18n Infrastructure v0;
- I18N2 Core Public Pages zh-CN v0;
- I18N3 hreflang / Canonical / Sitemap QA v0;
- I18N4 Chinese Founder Copy QA v0;
- OPS8D Beta Feedback Triage + Roadmap Recut v0.

OPS8B and BETA1 are human-checkpointed. I18N1/I18N2 are checkpointed before
code/copy implementation. OPS8A does not start any of them.

## PR101 Pause Recommendation

PR101 should remain paused. Do not start PR101 directly after OPS8A or PR100.
Run OPS8B as the exact next task, then OPS8C, then BETA1.

## Findings By Severity

| Severity | Findings |
| --- | --- |
| P0 | None |
| P1 | None |
| P2 | None |
| P3 | Existing lifecycle-aware checker debt from PR98/OPS7D remains non-blocking; generic smoke scripts do not by themselves cover disabled-route 503 checks, so OPS8B must run the expanded checklist in this report. |

## Sidecar Issues

No new blocking sidecar. Existing non-blocking sidecars remain:

- direct Alpha Feed landing checker is PR95-phase scoped after PR96 disabled
  buyer-interest shell;
- direct Laravel gateway checker has lifecycle-scoped modes unsuitable for
  whole-repo release readiness;
- `agent:gate` does not directly run every historical task-specific checker,
  though current required validations pass.

## Validation

| Command | Result |
| --- | --- |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run agent:batch:check` | PASS |
| `npm run agent:train-plan:check` | PASS |
| `npm run agent:scope:check -- OPS8A` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run agent:gate` | PASS |

## Definition Of Done

| Item | Result |
| --- | --- |
| PR81-PR100 completion verified | PASS |
| Local main clean and buildable | PASS |
| Data repo clean | PASS |
| Release candidate readiness scanned | PASS |
| Feature flag matrix documented | PASS |
| Disabled surfaces documented | PASS |
| Sitemap/robots readiness documented | PASS |
| OPS8B live smoke checklist exists | PASS |
| Internal beta readiness gate documented | PASS |
| PR101 pause recommendation documented | PASS |
| Exact next task defined | PASS |
| No product/runtime code modified | PASS |
| No deploy | PASS |
| No data repo mutation | PASS |
| Validations pass | PASS |
| OPS8B not started | PASS |

## What This PR Does Not Do

- Does not deploy.
- Does not SSH into production.
- Does not run live smoke.
- Does not modify server config.
- Does not modify app runtime or product code.
- Does not enable feature flags.
- Does not create or edit `.env`.
- Does not write secrets.
- Does not start OPS8B, OPS8C, BETA1, I18N, OPS8D, or PR101.
- Does not mutate `88cn-index-data`.

## Final Decision

GO_DEPLOY_RC.

Exact next task: OPS8B Production Deploy + Live Smoke.
