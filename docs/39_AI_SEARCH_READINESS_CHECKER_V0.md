# 39 AI Search Readiness Checker v0

## Date

2026-06-16

## Purpose

Provide a free, public tool that allows AI project founders to check whether their project's landing page exposes clean, machine-readable public signals. The checker performs a safe, read-only, single-page audit and returns a readiness score with actionable recommendations.

## What the Checker Does

1. **Validates the URL** — HTTPS only, SSRF protection, credential/stripping, port restriction
2. **Fetches the page** — GET request, 5s timeout, 256KB max body, controlled redirects
3. **Analyzes HTML** — Title, meta description, canonical, h1, readable text, JSON-LD, schema.org types, Open Graph, public source links
4. **Checks robots.txt + sitemap.xml** — Reachability only, not content parsing
5. **Computes a readiness score** — 0-100 based on 10+ signals
6. **Returns recommendations** — Deterministic, actionable next steps

## What the Checker Does NOT Do

- **No ranking guarantee** — This is NOT an SEO ranking tool. It does not predict or guarantee search rankings.
- **No traffic guarantee** — It does not predict or guarantee website traffic.
- **No AI citation guarantee** — It does not guarantee that ChatGPT, Perplexity, Google AI, or any other AI system will cite the page.
- **No storage** — Results are not stored in Supabase or any database.
- **No LLM calls** — No OpenAI, Anthropic, Google, or other AI API calls.
- **No third-party SEO APIs** — No Ahrefs, Semrush, Moz, or similar integrations.
- **No JavaScript execution** — The checker only reads static HTML. Client-rendered pages will show low text scores.
- **No crawler** — Only the single submitted URL is fetched. No link following or multi-page crawling.
- **No bulk or scheduled scans** — One URL per request, manual trigger only.

## SSRF Protection

The checker fetches user-submitted URLs, which is a potential SSRF vector. Defense layers:

| Layer | Mechanism |
|---|---|
| Protocol | HTTPS only. `http://`, `javascript:`, `data:`, `file:`, `ftp:`, etc. rejected |
| Hostname blocklist | `localhost`, `*.localhost`, `.local`, `.internal`, `test`, `*.test`, `*.example`, `*.invalid` |
| IP literal check | All private/reserved/loopback/link-local/multicast ranges rejected |
| Port restriction | Only port 443 (default HTTPS) accepted |
| Credential stripping | URLs with `user:pass@` rejected |
| Redirect control | Max 2 redirects, each re-validated through SSRF guard |
| Query/hash stripping | Query parameters and hash fragments removed before fetch |

## Timeout and Body Size Limits

| Resource | Limit |
|---|---|
| Fetch timeout | 5 seconds |
| HTML response body | 256 KB |
| robots.txt / sitemap.xml | 256 KB |
| Redirects | Max 2 |

## Scoring Model

| Check | Max Score |
|---|---|
| Title tag | 10 |
| Meta description | 10 |
| Canonical URL | 10 |
| H1 heading | 5 |
| Readable first HTML text | 15 |
| JSON-LD structured data | 15 |
| Relevant schema.org type | 10 |
| Open Graph metadata | 5 |
| robots.txt reachable | 5 |
| sitemap.xml reachable | 5 |
| Public source links | 10 |
| **Total** | **100** |

### Grades

| Range | Grade |
|---|---|
| 85-100 | A |
| 70-84 | B |
| 50-69 | C |
| 30-49 | D |
| 0-29 | F |

## How It Supports Founder Cold Start

1. **Identifies missing machine-readable signals** — Founders learn what their page lacks (JSON-LD, canonical, etc.)
2. **Guides toward structured profile** — The CTA directs founders to create a free 123Charts project profile
3. **Zero friction** — No login, no database, no email required
4. **Immediate results** — Single request, instant audit

## Why This Is Not a Traditional SEO Audit

Traditional SEO audits analyze keyword density, internal linking, domain authority, and backlink profiles. This checker focuses exclusively on **machine-readable structured signals** — the technical foundation that both search engines and AI systems rely on to understand a page.

## Future Possible Improvements

| Feature | Status |
|---|---|
| Authenticated scan history | Not in this PR |
| Integration with founder profile | Not in this PR |
| Admin-reviewed reports | Not in this PR |
| Optional stored snapshots | Not in this PR |
| Rate-limited worker queue | Not in this PR |
| Bulk/batch scanning | Not in this PR |
| JavaScript rendering (headless browser) | Not in this PR |

These features require Supabase storage, authentication, queue infrastructure, or third-party services that are out of scope for Phase 1.
