# 31 Deployment Smoke Report

## Date

2026-06-16

## Result

LIVE PASS.

## Deployment Target

Aliyun Hong Kong.

## Server Identity

- Server IP: REDACTED
- Secrets: REDACTED
- ECS instance: Aliyun Hong Kong Ubuntu host
- Inbound ports configured: 22, 80, 443

## Runtime Inventory

| Item | Result |
| --- | --- |
| OS | Ubuntu 24.04.4 LTS |
| Node version | v22.22.3 |
| npm version | 10.9.8 |
| PM2 status | `123charts-web` online |
| Nginx status | active |
| TLS status | active for `123charts.com` |
| DNS status | public `123charts.com` HTTPS smoke passed |
| Supabase env status | NOT CONFIGURED |

## Source Deployment

| Step | Result | Notes |
| --- | --- | --- |
| Deployment method | PASS | Aliyun Cloud Assistant was used because direct SSH remained unreliable. |
| Source retrieval | PASS | A temporary GitHub source archive channel was used; sensitive URL and credential material were not committed or recorded. |
| Source path | PASS | Source deployed to `/var/www/123charts`. |
| Deployed commit | PASS | `0483d30` |
| Dependency install | PASS | `npm ci` completed on the server. |
| Production build | PASS | `npm run build:production` completed. |
| PM2 restart | PASS | `123charts-web` restarted and saved. |

## Server Validation Checklist

| Check | Result |
| --- | --- |
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

## Nginx Intake Firewall

| Check | Result |
| --- | --- |
| Nginx config applied | YES |
| `nginx -t` | PASS |
| Nginx reload | PASS |
| `client_max_body_size` | YES, 64k |
| Request throttling zones | YES |
| Intake endpoint throttling | YES |
| No-cache for admin/submit/claim/API | YES |
| 429 response headers | PASS |

## Smoke Test Checklist

| Endpoint | Result |
| --- | --- |
| `https://123charts.com/api/healthz` | 200 |
| `https://123charts.com/sitemap.xml` | 200 |
| `https://123charts.com/robots.txt` | 200 |
| `https://123charts.com/` | 200 |
| `https://123charts.com/projects` | 200 |
| `https://123charts.com/projects/aurora-code` | 200 |
| `https://123charts.com/submit` | 200 |
| `https://123charts.com/claim/aurora-code` | 200 |
| `https://123charts.com/admin` | 200, sign-in required |
| `https://123charts.com/admin/submissions` | 200, sign-in required |
| `https://123charts.com/admin/claims` | 200, sign-in required |
| `https://123charts.com/api/projects/aurora-code` | 200 |
| `https://123charts.com/api/projects/unknown-slug` | 404 Problem Details |

## API And Header Checklist

| Check | Result |
| --- | --- |
| Known project API | PASS |
| Unknown project API | PASS |
| Submit invalid payload | 400 Problem Details |
| Claim invalid payload | 400 Problem Details |
| Submit valid payload without Supabase env | 503 Problem Details |
| Claim valid payload without Supabase env | 503 Problem Details |
| Oversized submit payload | 413 |
| Oversized claim payload | 413 |
| Low-intensity throttling | 429 observed on both intake endpoints |
| No high-volume load test | Confirmed |
| `x-request-id` | Present on app and Nginx 429 responses |
| `content-security-policy` | Present |
| `x-content-type-options` | Present |
| `referrer-policy` | Present |
| `permissions-policy` | Present |

## Indexing Checks

| Check | Result |
| --- | --- |
| Query URL noindex headers | PASS |
| Sitemap excludes admin/API/preview/pending/submitted paths | PASS |
| Sitemap excludes query URLs | PASS |
| Robots disallows admin/API/preview/submit/claim paths | PASS |

## Browser QA

Screenshots were captured from live `123charts.com` pages:

- `../screenshots/qa/pr23-live-home.png`
- `../screenshots/qa/pr23-live-submit.png`
- `../screenshots/qa/pr23-live-claim.png`
- `../screenshots/qa/pr23-live-admin.png`
- `../screenshots/qa/pr23-live-admin-submissions.png`
- `../screenshots/qa/pr23-live-admin-claims.png`

## Known Limitations

1. Direct SSH from the local workstation still times out during banner exchange, so Cloud Assistant remains the reliable execution path.
2. Supabase env is NOT CONFIGURED; submit and claim write-path smoke correctly returned graceful 503 responses.
3. Low-intensity throttling reached 429 quickly; no high-volume load test was performed.
4. Nginx generated 429 responses are HTML, not application Problem Details, but they now include the required operational and security headers.

## Secrets

REDACTED.
