# Geo Checker Remediation Live QA

## Result

LIVE PASS.

PR #29 verified the PR #28 remediation on the live `123charts.com` deployment. The previously observed API guard ordering issue is fixed live, and the public-copy regression is no longer present on the sampled public pages.

## Original PR #28 Summary

PR #28 shipped the AI Search Readiness Checker and live smoke QA. That run was PARTIAL because two P2 issues remained:

- A credentialed URL reached a downstream error path instead of being rejected by the first URL validation layer.
- A restricted public-copy phrase appeared on several public pages.

## Remediation Summary

| Area | Result |
| --- | --- |
| Credentialed URL guard | PASS, live API returns 400 `application/problem+json` |
| IPv6 loopback guard | PASS, live API returns 400 `application/problem+json` |
| Other URL guard regressions | PASS, live API returns 400 `application/problem+json` |
| Public-copy regression | PASS, sampled public pages had no restricted-term hits |
| Live browser QA | PASS |

## Local Validation

Branch: `codex/geo-checker-remediation-live-qa`

Commit under test: `c707c10`

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

## Live Deployment

Deployment target: Aliyun Hong Kong

Deployment method: Cloud Assistant

Deployed commit: `c707c10`

Server IP: REDACTED

Secrets: REDACTED

| Runtime item | Result |
| --- | --- |
| Server install | PASS |
| Server validation gates | PASS |
| Server production build | PASS, 42/42 pages |
| PM2 status | `123charts-web` online |
| Nginx status | `nginx -t` PASS, reload PASS |
| TLS status | HTTPS active for `123charts.com` |
| DNS status | `123charts.com` and `www.123charts.com` resolve to the live deployment |

## Live Route Smoke

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
| `/founders` | 200 |
| `/genesis` | 200 |
| `/claim/aurora-code` | 200 |
| `/admin` | 200, safe not-configured state with no admin data exposed |

## Header QA

PASS.

Verified on live page and API responses:

- `x-request-id`
- `content-security-policy`
- `x-content-type-options`
- `referrer-policy`
- `permissions-policy`

## Sitemap QA

PASS.

Live `/sitemap.xml`:

- Contains `/geo-checker`.
- Does not contain API URLs.
- Does not contain admin URLs.
- Does not contain preview URLs.
- Does not contain pending or submitted URLs.
- Does not contain query URLs. The only `?` character detected was the XML declaration.

## Geo Checker API QA

PASS.

| Case | Expected | Observed |
| --- | --- | --- |
| Public URL sample: `https://123charts.com` | 200 JSON result | PASS, score 40, 11 checks |
| Credentialed URL | 400 Problem Details | PASS |
| IPv6 loopback target | 400 Problem Details | PASS |
| HTTP scheme | 400 Problem Details | PASS |
| Script-like scheme | 400 Problem Details | PASS |
| File scheme | 400 Problem Details | PASS |
| Localhost target | 400 Problem Details | PASS |
| IPv4 loopback target | 400 Problem Details | PASS |
| Zero-address target | 400 Problem Details | PASS |
| Non-default HTTPS port | 400 Problem Details | PASS |

Problem Details fields were present in the existing 123Charts error envelope:

- `type`
- `title`
- `status`
- `detail`
- `instance`
- `request_id`

## Public Copy Regression QA

PASS.

Sampled pages:

- `/submit`
- `/founders`
- `/genesis`
- `/claim/aurora-code`
- `/geo-checker`
- `/`

Observed: no matches for the PR #28 restricted public-copy list.

## Rate Limit QA

PASS.

Low-intensity repeated requests to `/api/geo-checker` triggered live Nginx HTTP 429 after the initial validation requests. No high-volume load test was performed.

## Browser QA

PASS.

Screenshots:

| State | Screenshot |
| --- | --- |
| Live home | `../screenshots/qa/pr29-live-home.png` |
| Live `/geo-checker` | `../screenshots/qa/pr29-live-geo-checker.png` |
| Live `/geo-checker` result | `../screenshots/qa/pr29-live-geo-checker-result.png` |
| Live `/geo-checker` mobile | `../screenshots/qa/pr29-live-geo-checker-mobile.png` |
| Live `/submit` | `../screenshots/qa/pr29-live-submit.png` |
| Live `/founders` | `../screenshots/qa/pr29-live-founders.png` |
| Live `/genesis` | `../screenshots/qa/pr29-live-genesis.png` |
| Live `/admin` | `../screenshots/qa/pr29-live-admin.png` |

Observed:

- The checker renders the form, score summary, and check cards.
- The result view for `https://123charts.com` returned a deterministic score and check list.
- Mobile viewport is readable and did not show obvious horizontal overflow.
- Admin route did not expose review records or private operational data.

## Known Limitations

- Supabase write-path smoke was not part of this remediation QA.
- The checker happy path used `https://123charts.com` as the stable live sample target to avoid relying on third-party DNS behavior.
- The live rate-limit response is generated by Nginx, not by the application response envelope.

## Next Recommended Action

Merge PR #29 after review, then redeploy only if `origin/main` advances after this live smoke.
