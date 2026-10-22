# OPS8B Production Deploy + Live Smoke v0

Date: 2026-06-20
Role: Codex-QA / Deploy-QA
Result: LIVE_PASS
Exact next recommended task: OPS8C Internal Beta Test Plan + Manual Feedback Protocol v0

## Scope

OPS8B deployed the v0.1-alpha release-candidate to production at the exact
approved `origin/main` SHA and ran live smoke checks. It did not modify product
code, runtime code, deployment scripts, server configuration files, feature
flags, secrets, environment files, Supabase schema, payment settings, API key
runtime, MCP runtime, Laravel runtime, customer access, CRM/email tooling, or
`/Users/rainie/Desktop/88cn-index-data`.

OPS8C, TRAFFIC0, I18N, BETA1, and PR101 were not started.

## Approved And Deployed SHA

| Item | Evidence | Result |
| --- | --- | --- |
| Approved deploy SHA | `d68413fa456ae03b8ee9e83e66af9dc5ce7dfdd6` | PASS |
| Local `main` before deploy | `HEAD == origin/main == d68413fa456ae03b8ee9e83e66af9dc5ce7dfdd6` | PASS |
| Deploy prepare target | `agent:deploy:prepare` printed the same target SHA | PASS |
| Production deploy script final SHA | `production deploy completed at d68413fa456ae03b8ee9e83e66af9dc5ce7dfdd6` | PASS |
| Wrong-SHA guard | Deployment script required `--confirm --commit <sha>` and verified final `HEAD` | PASS |

## Local Pre-Deploy Validation Matrix

| Check | Result |
| --- | --- |
| `git checkout main` / `git fetch origin` / `git pull --ff-only origin main` | PASS |
| `git status --short --branch` | PASS, clean `main...origin/main` |
| `git rev-parse HEAD` | PASS, approved SHA |
| `git rev-parse origin/main` | PASS, approved SHA |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run agent:batch:check` | PASS |
| `npm run agent:train-plan:check` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run agent:gate` | PASS |
| Data repo cleanliness | PASS, clean `main...origin/main` |

## Deploy Summary

The production deploy used the documented repository script through Aliyun
Workbench:

```bash
cd /var/www/123charts
BASE_URL=https://123charts.com scripts/agent/deploy-production.sh --confirm --commit d68413fa456ae03b8ee9e83e66af9dc5ce7dfdd6
```

Server address, SSH details, session identifiers, and environment values are
redacted and are not recorded in this report.

| Deploy step | Result |
| --- | --- |
| Production `git fetch origin` | PASS |
| Production `git switch main` and fast-forward pull | PASS |
| Checkout approved SHA | PASS |
| `npm ci` | PASS |
| Server `npm run verify:day0` | PASS |
| Server `npm run policy:scan` | PASS |
| Server `npm run third-party:check` | PASS |
| Server `npm run build:production` | PASS |
| PM2 restart/start | PASS |
| PM2 save/status | PASS |
| Nginx config test | PASS |
| Nginx reload | PASS |
| Local smoke against loopback | PASS |
| Generic live smoke against `https://123charts.com` | PASS |
| Final deployed SHA check | PASS |

## PM2 / Nginx / TLS / DNS Summary

| Area | Evidence | Result |
| --- | --- | --- |
| PM2 | `123charts-web` process reported `online` after restart/save/status | PASS |
| Nginx | Config syntax test succeeded and reload command completed | PASS |
| TLS | Public HTTPS requests to `https://123charts.com` completed successfully | PASS |
| DNS | Public `https://123charts.com` resolved and served expected production routes | PASS |
| Sensitive details | Server address, SSH details, account data, tokens, cert paths, and env values are redacted | PASS |

## Public Route Live Smoke Matrix

All public route checks used `https://123charts.com`.

| Method | Route | Status | Content type | Leak scan | Result |
| --- | --- | ---: | --- | --- | --- |
| GET | `/api/healthz` | 200 | `application/json` | No sensitive needles | PASS |
| GET | `/` | 200 | `text/html; charset=utf-8` | No sensitive needles | PASS |
| GET | `/projects` | 200 | `text/html; charset=utf-8` | No sensitive needles | PASS |
| GET | `/reports` | 200 | `text/html; charset=utf-8` | No sensitive needles | PASS |
| GET | `/reports/early-ai-project-machine-readability-2026` | 200 | `text/html; charset=utf-8` | No sensitive needles | PASS |
| GET | `/geo-checker` | 200 | `text/html; charset=utf-8` | No sensitive needles | PASS |
| GET | `/submit` | 200 | `text/html; charset=utf-8` | No sensitive needles | PASS |
| GET | `/founders` | 200 | `text/html; charset=utf-8` | No sensitive needles | PASS |
| GET | `/genesis` | 200 | `text/html; charset=utf-8` | No sensitive needles | PASS |
| GET | `/alpha-feed` | 200 | `text/html; charset=utf-8` | No sensitive needles | PASS |
| GET | `/sitemap.xml` | 200 | `application/xml` | No sensitive needles | PASS |
| GET | `/robots.txt` | 200 | `text/plain` | No sensitive needles | PASS |
| GET | `/stacks/ai-coding-workflows` | 200 | `text/html; charset=utf-8` | No sensitive needles | PASS |
| GET | `/collections/open-source-ai-agents` | 200 | `text/html; charset=utf-8` | No sensitive needles | PASS |
| GET | `/verticals/ai-builder-infrastructure` | 200 | `text/html; charset=utf-8` | No sensitive needles | PASS |
| GET | `/alternatives/aurora-code-vs-nucleus-ml` | 200 | `text/html; charset=utf-8` | No sensitive needles | PASS |

Unauthenticated `/admin` returned a non-leaking HTML response and did not expose
private data, server details, stack traces, or secrets.

## Disabled Route Smoke Matrix

These checks cover the OPS8A sidecar gap that the generic live smoke script does
not assert disabled-route Problem Details by itself.

| Method | Route | Status | Content type | Body echo | Leak scan | Result |
| --- | --- | ---: | --- | --- | --- | --- |
| GET | `/api/public/v0/projects` | 503 | `application/problem+json` | No | No sensitive needles | PASS |
| GET | `/api/mcp` | 503 | `application/problem+json` | No | No sensitive needles | PASS |
| POST | `/api/mcp` | 503 | `application/problem+json` | No | No sensitive needles | PASS |
| GET | `/api/payments/featured-signals/checkout` | 503 | `application/problem+json` | No | No sensitive needles | PASS |
| POST | `/api/payments/featured-signals/checkout` | 503 | `application/problem+json` | No | No sensitive needles | PASS |
| GET | `/api/alpha-feed/api-keys` | 503 | `application/problem+json` | No | No sensitive needles | PASS |
| POST | `/api/alpha-feed/api-keys` | 503 | `application/problem+json` | No | No sensitive needles | PASS |
| GET | `/api/alpha-feed/buyer-interest` | 503 | `application/problem+json` | No | No sensitive needles | PASS |
| POST | `/api/alpha-feed/buyer-interest` | 503 | `application/problem+json` | No | No sensitive needles | PASS |

Behavior-based feature-flag confirmation:

- Public API remains disabled because `/api/public/v0/projects` returns 503.
- MCP remains disabled because `/api/mcp` GET and POST return 503.
- Payment checkout remains disabled because checkout GET and POST return 503.
- API key shell remains disabled because API-key GET and POST return 503.
- Buyer interest remains disabled/no-write because GET and POST return 503 and
  the POST probe body is not echoed.
- Alpha Feed has a public static page only; disabled API/customer endpoints
  remain disabled.

## Sitemap Live Verification

| Check | Result |
| --- | --- |
| `/sitemap.xml` status | PASS, 200 |
| Live URL count | 33 |
| Delta from OPS8A local build count | 0 |
| Root present | PASS |
| Projects list present | PASS |
| Reports present | PASS |
| Geo checker present | PASS |
| Founders present | PASS |
| Genesis present | PASS |
| Published stacks present | PASS |
| Published collections present | PASS |
| Published verticals present | PASS |
| Published alternatives present | PASS |
| Forbidden sitemap surfaces | PASS, none found |

Forbidden sitemap strings checked and not found:

- `/admin`
- `/api`
- `/api/mcp`
- `payment`
- `checkout`
- `api-keys`
- `buyer-interest`
- `submitted`
- `pending`
- `quarantined`
- `scouted`
- `rejected`
- `private`

## Robots Live Verification

| Check | Result |
| --- | --- |
| `/robots.txt` status | PASS, 200 |
| `Disallow: /admin/` | PASS |
| `Disallow: /api/` | PASS |
| `Disallow: /preview/` | PASS |
| `Disallow: /claim/` | PASS |
| `Disallow: /submit/` | PASS |

## Security Header Summary

Representative live routes checked:

- `/`
- `/reports/early-ai-project-machine-readability-2026`
- `/alpha-feed`
- `/api/public/v0/projects`

Observed header coverage:

| Header | Public pages | Disabled API route | Result |
| --- | --- | --- | --- |
| `content-type` | Present | Present | PASS |
| `x-content-type-options` | Present | Present | PASS |
| `referrer-policy` | Present | Present | PASS |
| `permissions-policy` | Present | Present | PASS |
| `x-frame-options` | Present | Present | PASS |
| `content-security-policy` | Present | Present | PASS |
| `x-request-id` | Present | Present | PASS |
| `cache-control` | Present | Present | PASS |

Raw request IDs and full header values are not recorded because they are not
needed for release evidence.

## Data Repo Cleanliness

`/Users/rainie/Desktop/88cn-index-data` remained clean on `main...origin/main`.
OPS8B did not mutate the data repo.

## Findings By Severity

| Severity | Findings |
| --- | --- |
| P0 | None |
| P1 | None |
| P2 | None |
| P3 | Existing automation gap remains: `scripts/agent/smoke-live.sh` does not natively assert disabled-route 503 Problem Details. OPS8B manually covered the required disabled-route checks for this release. |

## Sidecar Issues

No release-blocking sidecar issue is open for OPS8B.

The existing OPS8A P3 sidecar about generic live smoke script coverage remains
valid as future automation debt, but the OPS8B release smoke requirement itself
was satisfied by explicit disabled-route checks.

## What This PR Does Not Do

- Does not start OPS8C, BETA1, TRAFFIC0, I18N, or PR101.
- Does not modify product code, runtime code, route code, middleware, scripts,
  package metadata, deploy config, Supabase schema, gateway files, public files,
  `.env*`, secrets, certificates, or server configuration files in git.
- Does not enable Public API, MCP, payment, API keys, metering, Laravel runtime,
  Supabase webhook sync, Redis gateway cache, customer access, CRM, email
  provider, live analytics collection, or live Alpha Feed delivery.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.

## Decision

LIVE_PASS.

The exact approved SHA is deployed, production route smoke passes, disabled
surfaces remain disabled, sitemap/robots are bounded, security headers are
present on representative routes, and no P0/P1/P2 release blocker is present.

Exact next recommended task: OPS8C Internal Beta Test Plan + Manual Feedback
Protocol v0.
