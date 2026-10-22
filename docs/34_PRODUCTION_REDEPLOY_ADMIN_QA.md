# 123Charts PR #21 Production Redeploy + Admin Review QA

Date: 2026-06-16

Result: LIVE PASS

## Scope

Production redeploy and smoke QA for the current `main` branch after PR #20.

- Deployment target: Aliyun Hong Kong
- Server IP: REDACTED
- Secrets: REDACTED
- Source commit deployed: `07a39576baf883f0d251ad9461afc7b5df6b0c3b`
- Deployment channel: Aliyun Cloud Assistant with GitHub read-only deploy key
- OS version: Ubuntu 24.04.4 LTS
- Node version: `v22.22.3`
- npm version: `10.9.8`
- PM2 status: online; redeploy command completed with exit code 0
- Nginx status: active; HTTPS traffic served through Nginx
- TLS status: active for `https://123charts.com`
- DNS status: active for `123charts.com`
- Supabase env status: NOT CONFIGURED for required runtime/admin keys; values were not inspected

## Smoke Test Checklist

| Check | Result | Evidence |
| --- | --- | --- |
| `/api/healthz` | PASS | `200 application/json` |
| `/sitemap.xml` | PASS | `200 application/xml` |
| `/robots.txt` | PASS | `200 text/plain` |
| `/api/projects/aurora-code` | PASS | `200 application/json` |
| `/api/projects/unknown-slug` | PASS | `404 application/problem+json` |
| `/` | PASS | `200 text/html` |
| `/projects` | PASS | `200 text/html` |
| `/submit` | PASS | `200 text/html` |
| `/claim/aurora-code` | PASS | `200 text/html` |
| `/admin` | PASS | `200 text/html`, graceful unavailable state |
| `/admin/login` | PASS | `200 text/html`, no secrets or hardcoded admin email exposed |
| `/admin/submissions` | PASS | `200 text/html`, unauthenticated guard shown |
| `/admin/claims` | PASS | `200 text/html`, unauthenticated guard shown |
| `/genesis` | PASS | `200 text/html` |
| `/founders` | PASS | `200 text/html` |

## API Checklist

| Check | Result | Notes |
| --- | --- | --- |
| Known project API | PASS | `ok: true`, includes `request_id` |
| Unknown project API | PASS | RFC 9457 Problem Details under `error` with `type`, `title`, `status`, `detail`, `instance`, `request_id` |
| Submit valid payload without Supabase env | PASS | `503 application/problem+json`, no server crash |
| Claim valid payload without Supabase env | PASS | `503 application/problem+json`, no server crash |
| Submit monetization field interception | PASS | `stripe_session_id` rejected with `400 application/problem+json` |
| Admin collection API direct access | PASS | No collection list API exposed at `/api/admin/submissions` or `/api/admin/claims`; both returned non-data 404 pages |

## Header Checklist

| Header | Result |
| --- | --- |
| `x-request-id` | PASS |
| `content-security-policy` | PASS |
| `x-content-type-options` | PASS |
| `referrer-policy` | PASS |
| `permissions-policy` | PASS |
| `x-frame-options` | PASS |

## Admin Review Checklist

| Page | Result | Notes |
| --- | --- | --- |
| `/admin` | PASS | Shows graceful admin unavailable state when Supabase env is not configured |
| `/admin/login` | PASS | Shows admin unavailable state; no key, password, IP, or hardcoded admin email exposed |
| `/admin/submissions` | PASS | Shows `Sign In Required`; no submission rows exposed |
| `/admin/claims` | PASS | Shows `Sign In Required`; no claim rows exposed |
| Admin review actions | NOT RUN | Requires configured Supabase/admin session; no real approve/reject/needs-info mutation was attempted |

## Sitemap / Robots

| Check | Result |
| --- | --- |
| Sitemap returns 200 | PASS |
| Sitemap excludes `admin`, `api`, `preview`, `pending`, `submitted`, and query URLs | PASS |
| Robots returns 200 | PASS |
| Robots disallows `/admin/`, `/api/`, `/preview/`, `/claim/`, and `/submit/` | PASS |
| Query URLs receive HTML noindex header | PASS |

## Public Language Scan

PASS. Checked public HTML against the canonical Phase 1 forbidden language set from `AGENTS.md`.

No matches found.

## Browser QA Screenshots

- `../screenshots/qa/pr21-home.png`
- `../screenshots/qa/pr21-projects.png`
- `../screenshots/qa/pr21-project-aurora-code.png`
- `../screenshots/qa/pr21-submit.png`
- `../screenshots/qa/pr21-claim-aurora-code.png`
- `../screenshots/qa/pr21-admin.png`
- `../screenshots/qa/pr21-admin-login.png`
- `../screenshots/qa/pr21-admin-submissions.png`
- `../screenshots/qa/pr21-admin-claims.png`
- `../screenshots/qa/pr21-genesis.png`
- `../screenshots/qa/pr21-founders.png`

## Known Limitations

- Direct local SSH remained unavailable during QA, so Aliyun Cloud Assistant was used as the stable execution channel.
- Supabase runtime/admin keys are not configured for the live app. Public pages, read-only demo API, security headers, submit/claim graceful fallback, and unauthenticated admin guards were verified.
- No real database write, admin approval, rejection, needs-info, or publish mutation was performed.
- Server IP, env values, keys, credentials, deploy URLs, and certificate material were not recorded.

## Files Modified

No app code modified. This PR contains QA documentation and browser screenshots only.
