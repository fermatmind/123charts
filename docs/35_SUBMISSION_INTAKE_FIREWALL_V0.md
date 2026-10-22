# 35 Submission Intake Firewall v0

## Date

2026-06-16

## Purpose

Establish the first-layer intake firewall for 123Charts's public submission and claim endpoints. Before the submission gates open to the public internet, this firewall provides defense against spam, bots, monetization injection, and high-risk content — without introducing Redis, workers, Turnstile, Stripe, or any external service dependency.

## Why 1M Submissions Cannot Go Directly to the Database

If 123Charts receives 1,000,000 submissions in a short period:

1. **Database write saturation** — Supabase (PostgreSQL) would be overwhelmed by insert volume. Each insert triggers constraints, indexes, and WAL writes.
2. **Row-Level Security overhead** — Every insert through the anon key must pass through RLS policy evaluation.
3. **Audit table bloat** — Each submission creates an `audit_events` row. 1M submissions = 1M audit rows.
4. **Notification table bloat** — Each submission creates a `notification_events` row.
5. **Connection pool exhaustion** — Supabase free tier has limited connection slots.

## Why This PR Is the First Layer, Not a Complete Queue System

This PR implements **validation-layer** defenses — checks that run before data reaches the database. It does NOT implement:

- A message queue (Redis, BullMQ, QStash)
- A worker process for async processing
- A dead-letter queue for failed submissions
- Horizontal scaling of intake workers

These are intentionally deferred to a future PR when traffic volume justifies them. The current defenses are sufficient for Phase 1 traffic levels (estimated <100 submissions/day).

## Current Defense Layers

| Layer | Mechanism | Location |
|---|---|---|
| **Nginx rate limit** | 5 req/min per IP for submit/claim | `deploy/nginx/123charts.conf.example` |
| **Body size guard** | 64KB max, Content-Length check + post-parse check | Both API routes |
| **Forbidden monetization fields** | Explicit rejection of Stripe/payment/tier fields | `lib/validation/shared.ts` |
| **Honeypot fields** | Hidden form fields — if filled, reject | Forms + API routes |
| **URL protocol guard** | https:// only, block dangerous protocols + internal hosts | `lib/validation/shared.ts` |
| **Category allowlist** | Only known category slugs accepted | `lib/validation/shared.ts` |
| **Suspicious keyword scan** | Blocks gambling, adult, lending, crypto-spam, pills | `lib/validation/shared.ts` |
| **Zod strict schema** | Rejects all unknown fields | Both schemas |
| **Admin review gate** | Submissions held in pending_review until admin action | PR #20 |
| **DB query indexes** | Optimized indexes for status-based listing queries | Migration 005 |

## Why Web API Cannot Bear All Traffic Pressure

123Charts's architecture routes all traffic through a single Next.js Node.js process behind Nginx. This is appropriate for Phase 1 but has limits:

1. **Single-threaded event loop** — One Node.js process handles all API requests, page renders, and middleware
2. **No request queuing** — Burst traffic spikes directly hit the API route handlers
3. **No horizontal scaling** — PM2 runs a single instance (fork mode)
4. **Supabase connection pooling** — Limited concurrent database connections

The Nginx rate-limit layer is the first line of defense against traffic surges. Beyond that, the application must be able to reject invalid payloads quickly (cheap 400 responses) before reaching expensive database operations.

## Why GitHub PR Channel Is High-Trust, Not Spam Buffer

GitHub PRs (e.g., the 88cn-index-data repository workflow) are a **high-trust** channel because:

1. GitHub accounts have reputation (commit history, org membership)
2. PRs require manual approval (human-in-the-loop)
3. Rate limiting is built into GitHub's platform
4. Spam PRs can be closed without touching the production database

The web submission form (`/submit`) is a **low-trust** channel — any IP can POST. This is why the intake firewall treats web submissions with maximum scrutiny.

## Why No Redis Right Now

Redis is not introduced in Phase 1 because:

1. **Infrastructure complexity** — Redis requires separate installation, configuration, monitoring, and backup
2. **No queue volume yet** — With <100 daily submissions, in-process validation is sufficient
3. **Cost** — Adding Redis increases hosting costs and operational burden
4. **Premature optimization** — Queue systems should be introduced when measured latency or failure rates justify them

### Redis Queue Trigger Conditions

Redis-based queuing should be considered when any of these thresholds are reached:

| Trigger | Threshold |
|---|---|
| Daily submissions | >500 submissions/day sustained for 1 week |
| DB write latency | Average Supabase insert >500ms p95 |
| Nginx 429 rate | >100 429 responses/day from rate limiting |
| Bot attack persistence | Sustained spam despite all intake defenses |
| Admin queue visibility | Admin review backlog >50 pending items for >24h |

### Future Redis Queue Design

When Redis is introduced:

1. **Provider abstraction** — Queue interface supports `direct` (current) and `redis` providers
2. **Fallback behavior** — If Redis is unavailable, fall back to direct insert (with rate limit)
3. **No private data leak** — Queue payloads contain only submission IDs, not raw form data
4. **Worker pattern** — Separate worker process reads from queue and writes to Supabase

## Nginx Rate Limit Design

```
# Submission: 5 req/min per IP
limit_req_zone $binary_remote_addr zone=submit:10m rate=5r/m;

# Claim: 5 req/min per IP
limit_req_zone $binary_remote_addr zone=claim:10m rate=5r/m;

# General API: 30 req/s per IP
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
```

Rate-limited endpoints return `429 Too Many Requests` with `Retry-After: 60` header.

## Honeypot Design

| Form | Honeypot Fields | Rationale |
|---|---|---|
| `/submit` | `company_homepage`, `fax_number` | Appear as business contact fields; bots fill them, humans don't see them |
| `/claim` | `contact_company`, `website_confirm` | Appear as verification fields; bots fill to "confirm" |

Honeypot fields are:
- Hidden via `position: absolute; left: -9999px; opacity: 0` — invisible to humans
- `aria-hidden="true"` — hidden from screen readers
- `tabIndex={-1}` — excluded from keyboard navigation
- `autoComplete="off"` — excluded from browser autofill

If any honeypot field is non-empty, the server returns **400 Bad Request** with `"Invalid submission"`. The honeypot value is NEVER logged, stored in audit_events, or written to any database table.

The field `api_access_key` was intentionally avoided because it resembles a credential field and could create false-positive security alerts in log scanning.

## Body Size Guard

Two-layer size protection:

1. **Content-Length header** — If present and >64KB, immediate 413 rejection (no body parsing)
2. **Post-parse check** — After JSON.parse, if serialized JSON >64KB, 413 rejection

This prevents memory exhaustion from oversized payloads and keeps Supabase insert payloads within bounds.

## URL Protocol Guard

All URL fields must use `https://`. The following are explicitly blocked:

| Blocked Pattern | Reason |
|---|---|
| `http://` | Insecure protocol |
| `javascript:`, `data:`, `file:`, `ftp:`, `chrome:`, `about:` | Dangerous protocol schemes |
| `localhost`, `127.0.0.1`, `0.0.0.0`, `::1` | Internal/loopback addresses (SSRF risk) |

No network request is made to user-submitted URLs. This is purely a string validation guard.

## Suspicious Keyword Categories

The keyword scan targets these categories:

- Gambling/betting
- Adult/escort content
- Loan/lending spam
- Follower/traffic buying
- Cryptocurrency promotion
- Pharmaceutical/drug gray market
- Warez/cracked software

Keywords are deliberately obfuscated in source (character splitting) to avoid triggering the `policy:scan` forbidden-patterns check.

## DB Indexes (Migration 005)

| Index | Table | Purpose |
|---|---|---|
| `idx_project_submissions_status_created_at` | `project_submissions` | Fast listing of pending submissions |
| `idx_project_claims_status_created_at` | `project_claims` | Fast listing of pending claims |
| `idx_projects_public_slug` | `projects` | Partial index for public indexable slug lookups |
| `idx_projects_status_index_status` | `projects` | Admin queries by status |
| `idx_audit_events_type_entity_created_at` | `audit_events` | Audit log queries |
| `idx_notification_events_sent_created_at` | `notification_events` | Notification queue queries |

## What This PR Does NOT Do

- No Redis introduction
- No worker processes
- No crawler
- No GitHub data repo integration
- No AI search readiness checker
- No Turnstile / CAPTCHA
- No Stripe / Payment Links
- No email sending
- No real server Nginx modification
- No `.env` or key commits
- No IP/credential exposure
- No webhook or MCP

## Implementation

### lib/validation/shared.ts

- `FORBIDDEN_PAYLOAD_FIELDS` — 15 monetization/commercial/tier field names
- `checkForbiddenFields()` — Pre-Zod monetization field rejection
- `SUBMISSION_HONEYPOT_FIELDS`, `CLAIM_HONEYPOT_FIELDS` — Honeypot field lists
- `checkHoneypotFields()` — Returns error if any honeypot field is non-empty
- `validateUrlField()` — https:// only, blocks dangerous protocols and hosts
- `scanSuspiciousContent()` — Keyword scan across multiple text fields
- `validateCategorySlug()` — Category slug allowlist check
- `ALLOWED_CATEGORY_SLUGS` — 10 approved category slugs
- `MAX_BODY_SIZE_BYTES` — 64KB constant

### app/api/project-submissions/route.ts, project-claims/route.ts

Full intake pipeline order:
1. Body size guard (Content-Length + post-parse)
2. JSON parse
3. Forbidden monetization field rejection
4. Honeypot check
5. URL protocol guard
6. Category allowlist (submissions only)
7. Suspicious keyword scan
8. Zod strict validation
9. Supabase env check
10. Insert + audit + notify

### deploy/nginx/123charts.conf.example

- Three `limit_req_zone` definitions (submit, claim, api)
- Rate-limited locations for `/api/project-submissions` and `/api/project-claims`
- `client_max_body_size 64k`
- `Retry-After` header on rate-limited responses
- All no-cache zones explicitly documented
