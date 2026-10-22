# AI Search Readiness Checker QA

## Result

PARTIAL on the deployed `main` snapshot; REMEDIATION PASS on this PR branch.

The feature is deployed live and the main happy path works locally and on `123charts.com`, including `/geo-checker`, `POST /api/geo-checker`, sitemap inclusion, security headers, PM2 restart, and Nginx syntax validation.

The original live QA found two P2 issues:

- P2 API guard ordering: a URL with embedded credentials returns `502 application/problem+json` instead of the expected guard-layer `400 application/problem+json`.
- P2 public copy: a PR #28 restricted link-promise term appears on `/submit`, `/founders`, and `/genesis`.

Follow-up remediation in this PR branch:

- Embedded-credential URL now returns `400 application/problem+json` locally.
- IPv6 loopback URL now returns `400 application/problem+json` locally.
- The restricted public-copy term was removed from app and component public UI files.

No high-volume load test was performed.

## Local Validation Summary

Branch: `codex/ai-search-readiness-checker-qa`

Local commit under test: `588cd61`

| Check | Result |
| --- | --- |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run db:schema:check` | PASS |
| `npm run public-surface:check` | PASS |
| `npm run intake:check` | PASS |
| `npm run external-import:check` | PASS |
| `npm run geo-checker:check` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS, 42/42 pages |
| `scripts/codex-preflight.sh` | PASS |

## Local API QA Summary

Base URL: `http://localhost:3000`

| Case | Expected | Observed |
| --- | --- | --- |
| `GET /geo-checker` | 200 HTML | PASS |
| Valid public URL sample: `https://123charts.com` | 200 JSON with score and checks | PASS, score 40, 11 checks |
| `https://example.com` | 200 JSON with score and checks | Local workstation DNS could not resolve this host; alternate public URL sample passed |
| HTTP scheme | 400 Problem Details | PASS |
| Script scheme | 400 Problem Details | PASS |
| File scheme | 400 Problem Details | PASS |
| FTP scheme | 400 Problem Details | PASS |
| Localhost target | 400 Problem Details | PASS |
| IPv4 loopback target | 400 Problem Details | PASS |
| Zero-address target | 400 Problem Details | PASS |
| IPv6 loopback target | 400 Problem Details | PASS after remediation |
| URL with embedded credentials | 400 Problem Details | PASS after remediation |
| Non-standard port | 400 Problem Details | PASS |
| Missing URL | 400 Problem Details | PASS |
| Empty body | 400 Problem Details | PASS |
| Invalid JSON | 400 Problem Details | PASS |

Error responses used `application/problem+json` and included the required fields inside the existing 123Charts error envelope.

## Local Browser QA Summary

Checked pages:

- `/`
- `/geo-checker`
- `/submit`
- `/founders`
- `/sitemap.xml`

Screenshots:

| State | Screenshot |
| --- | --- |
| Local desktop `/geo-checker` | `../screenshots/qa/pr28-local-geo-checker-desktop.png` |
| Local mobile `/geo-checker` | `../screenshots/qa/pr28-local-geo-checker-mobile.png` |
| Local result state | `../screenshots/qa/pr28-local-geo-checker-result.png` |

Observed:

- `/geo-checker` keeps the 123Charts black, cool-gray, silver-white terminal style.
- Result cards are data-oriented and readable.
- Mobile viewport did not show obvious horizontal overflow.
- `/sitemap.xml` contains `/geo-checker`.
- `/sitemap.xml` does not contain API, admin, preview, pending, submitted, or query URLs.

## Deployment Summary

Deployment method: Cloud Assistant.

SSH was not stable enough for this run, so Cloud Assistant was used for server commands.

Deployed commit: `588cd61`

Server IP: REDACTED

Secrets: REDACTED

Supabase env status: CONFIGURED on server, values not inspected or recorded.

GitHub access method: read-only deploy key generated on the server. The private key was not copied into the repository or report.

## Server Build And Runtime Summary

| Item | Result |
| --- | --- |
| OS / target | Aliyun Hong Kong Ubuntu server |
| Node / npm | Node 22, npm 10 |
| Server `npm ci` | PASS |
| Server gates | PASS |
| Server `npm run build:production` | PASS, 42/42 pages |
| PM2 status | `123charts-web` online |
| Nginx status | `nginx -t` PASS, reloaded |
| TLS status | HTTPS active for `123charts.com` |
| `/api/geo-checker` Nginx rate-limit applied | YES |

Nginx rate-limit note: the `/api/geo-checker` location was added to the live Nginx configuration and validated with `nginx -t`. The real configuration file is not committed.

## Live Route Smoke Results

Base URL: `https://123charts.com`

| Route | Result |
| --- | --- |
| `/api/healthz` | 200 |
| `/geo-checker` | 200 |
| `/sitemap.xml` | 200 |
| `/robots.txt` | 200 |
| `/` | 200 |
| `/projects` | 200 |
| `/submit` | 200 |
| `/admin` | 200, safe not-configured state |

Headers verified on `/geo-checker`:

- `x-request-id`
- `content-security-policy`
- `x-content-type-options`
- `referrer-policy`
- `permissions-policy`

## Live API QA Summary

| Case | Expected | Observed |
| --- | --- | --- |
| Valid public URL sample: `https://123charts.com` | 200 JSON with score and checks | PASS, score 40, 11 checks |
| HTTP scheme | 400 Problem Details | PASS |
| Localhost target | 400 Problem Details | PASS |
| URL with embedded credentials | 400 Problem Details | FAIL on deployed snapshot; fixed locally in this PR branch |
| Non-standard port | 400 Problem Details | PASS |
| Invalid JSON | 400 Problem Details | PASS |

Problem Details fields verified on error responses:

- `type`
- `title`
- `status`
- `detail`
- `instance`
- `request_id`

## Live Rate-Limit Low-Intensity Result

Result: PASS.

Low-intensity repeated requests to `/api/geo-checker` triggered HTTP 429 from Nginx after the initial validation requests.

Notes:

- 429 was observed.
- The 429 response is Nginx HTML, not the application Problem Details envelope.
- No high-volume load test was performed.

## Live Browser QA Summary

Screenshots:

| State | Screenshot |
| --- | --- |
| Live home | `../screenshots/qa/pr28-live-home.png` |
| Live `/geo-checker` | `../screenshots/qa/pr28-live-geo-checker.png` |
| Live `/geo-checker` result | `../screenshots/qa/pr28-live-geo-checker-result.png` |
| Live `/geo-checker` mobile | `../screenshots/qa/pr28-live-geo-checker-mobile.png` |
| Live `/submit` | `../screenshots/qa/pr28-live-submit.png` |
| Live `/admin` | `../screenshots/qa/pr28-live-admin.png` |
| Live `/founders` | `../screenshots/qa/pr28-live-founders.png` |
| Live `/genesis` | `../screenshots/qa/pr28-live-genesis.png` |

Observed:

- `/geo-checker` renders the form, score, check cards, missing items, and next steps.
- The live result state used `https://123charts.com` and returned score 40 with 11 checks.
- The CTA points to the project submission path.
- Mobile viewport is readable and did not show obvious horizontal overflow.
- `/admin` does not expose admin data when Supabase admin access is unavailable.

## Sitemap Result

PASS.

Live `/sitemap.xml`:

- Contains `/geo-checker`.
- Does not contain API URLs.
- Does not contain admin URLs.
- Does not contain preview URLs.
- Does not contain pending or submitted URLs.
- Does not contain query URLs.

## Public Copy Check

PARTIAL.

Checked public pages:

- `/`
- `/geo-checker`
- `/submit`
- `/founders`
- `/genesis`

Observed on the deployed snapshot:

- `/` and `/geo-checker` passed the PR #28 public-copy scan.
- `/submit`, `/founders`, and `/genesis` contain one restricted link-promise term from the PR #28 ban list.

Follow-up remediation in this PR branch removed that restricted public-copy term from the public UI files.

## Known Limitations

- Local workstation DNS could not resolve `https://example.com`, so local valid-url testing used `https://123charts.com` as the public URL sample.
- Live rate-limit testing was intentionally low intensity.
- The Nginx 429 response is generated before the application layer and does not use the 123Charts Problem Details envelope.
- This QA did not inspect or record secret values.

## Next Recommended Action

Merge this PR, redeploy, then rerun the PR #28 live smoke to confirm the deployed site reaches LIVE PASS.
