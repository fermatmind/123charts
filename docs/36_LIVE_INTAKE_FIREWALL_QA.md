# 36 Live Intake Firewall QA

## Result

PASS.

## Scope

PR #23 verified the live Aliyun Hong Kong deployment after the intake firewall work reached `main`. The run used Aliyun Cloud Assistant because direct SSH from the local workstation still timed out during banner exchange.

## Deployment Evidence

| Item | Result |
| --- | --- |
| Deployment method | Cloud Assistant |
| Server IP | REDACTED |
| Secrets | REDACTED |
| Deployed commit | `0483d30` |
| Source path | `/var/www/123charts` |
| Supabase env status | NOT CONFIGURED |
| Nginx config applied | YES |
| Nginx config test | PASS |
| Nginx reload | PASS |
| PM2 restart | PASS |
| `client_max_body_size` | YES, 64k |
| Request throttling config | YES |

## Server Build And Validation

| Check | Result |
| --- | --- |
| Source sync from temporary archive channel | PASS |
| `npm ci` | PASS |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run db:schema:check` | PASS |
| `npm run public-surface:check` | PASS |
| `npm run intake:check` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build:production` | PASS |

## Live Page Smoke

| URL | Result |
| --- | --- |
| `/api/healthz` | 200 |
| `/sitemap.xml` | 200 |
| `/robots.txt` | 200 |
| `/` | 200 |
| `/projects` | 200 |
| `/projects/aurora-code` | 200 |
| `/submit` | 200 |
| `/claim/aurora-code` | 200 |
| `/admin` | 200, sign-in required |
| `/admin/submissions` | 200, sign-in required |
| `/admin/claims` | 200, sign-in required |
| `/api/projects/aurora-code` | 200 |
| `/api/projects/unknown-slug` | 404 Problem Details |

## API Hardening Smoke

| Check | Result |
| --- | --- |
| Submit invalid payload | 400 Problem Details |
| Submit honeypot payload | 400 Problem Details |
| Submit hidden commercial-field payload | 400 Problem Details |
| Submit blocked URL protocol payload | 400 Problem Details |
| Submit oversized payload | 413 |
| Submit valid payload without Supabase env | 503 Problem Details |
| Claim invalid payload | 400 Problem Details |
| Claim honeypot payload | 400 Problem Details |
| Claim hidden commercial-field payload | 400 Problem Details |
| Claim blocked URL protocol payload | 400 Problem Details |
| Claim oversized payload | 413 |
| Claim valid payload without Supabase env | 503 Problem Details |

All Problem Details responses were checked for `type`, `title`, `status`, `detail`, `instance`, and `request_id`.

## Header Smoke

| Header | Result |
| --- | --- |
| `x-request-id` | PASS |
| `content-security-policy` | PASS |
| `x-content-type-options` | PASS |
| `referrer-policy` | PASS |
| `permissions-policy` | PASS |
| `retry-after` on throttled responses | PASS |

The Nginx-generated 429 response was patched during this run so throttled intake responses also include `x-request-id` and the expected security headers.

## Rate-Limit Smoke

| Check | Result |
| --- | --- |
| Submit endpoint low-intensity sequence | 400, 400, 400, then 429 responses |
| Claim endpoint low-intensity sequence | 400, 400, 400, then 429 responses |
| High-volume load test | NOT PERFORMED |

The low-intensity sequence was intentionally limited to eight quick invalid POSTs per endpoint.

## Query Noindex Smoke

| URL | Result |
| --- | --- |
| `/projects?bad=1` | `X-Robots-Tag: noindex, nofollow, noarchive` |
| `/categories/ai-agents?search=spam` | `X-Robots-Tag: noindex, nofollow, noarchive` |
| `/reports?utm_source=test` | `X-Robots-Tag: noindex, nofollow, noarchive` |
| Sitemap query URLs | Not present |
| API noindex pollution | Not observed |

## Admin Protection Smoke

| URL | Result |
| --- | --- |
| `/admin` | Sign-in required |
| `/admin/submissions` | Sign-in required |
| `/admin/claims` | Sign-in required |

No submission or claim data was exposed while logged out.

## Visual QA

| Screenshot | Result |
| --- | --- |
| `../screenshots/qa/pr23-live-home.png` | PASS |
| `../screenshots/qa/pr23-live-submit.png` | PASS |
| `../screenshots/qa/pr23-live-claim.png` | PASS |
| `../screenshots/qa/pr23-live-admin.png` | PASS |
| `../screenshots/qa/pr23-live-admin-submissions.png` | PASS |
| `../screenshots/qa/pr23-live-admin-claims.png` | PASS |

The live pages retained the black, cool-gray, silver terminal style. No public sample page contained the canonical forbidden language set from `AGENTS.md`.

## Known Limitations

1. Direct SSH remains unreliable; Cloud Assistant is the current stable server execution path.
2. Supabase env is NOT CONFIGURED, so valid write-path smoke ends in graceful 503 responses.
3. Nginx 429 bodies are HTML, but the responses now include required request and security headers.
4. No high-volume load test was performed.
