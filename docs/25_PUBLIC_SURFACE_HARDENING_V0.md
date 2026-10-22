# 25 Public Surface Hardening v0

## Date

2026-06-15

## Purpose

Harden the 123Charts public API surface against P1 contract violations, monetization field injection, and query-parameter-based indexing abuse. This PR fixes the validation ordering bug found in PR #13 QA and adds proactive defenses.

## P1 Fix: API Validation Ordering

### The Bug

PR #13 QA found that `POST /api/project-submissions` and `POST /api/project-claims` returned **503 Service Unavailable** for invalid payloads when Supabase environment variables were not configured.

The root cause: the route handlers checked `getSupabaseClient()` before parsing or validating the request body. An invalid payload (missing required fields, wrong types) should always return **400 Bad Request** regardless of Supabase availability.

### The Fix

Route handlers now follow this ordering strictly:

1. **Parse JSON** — If body is not valid JSON, return 400
2. **Reject forbidden fields** — If body contains monetization/commercial fields, return 400
3. **Zod strict validation** — If body fails schema validation, return 400
4. **Check Supabase** — Only after validation passes, check if Supabase is available → 503 if not
5. **Insert** — Write to Supabase
6. **Audit + Notify** — Record events (non-blocking)

Both `/api/project-submissions` and `/api/project-claims` now follow this ordering.

### Before vs After

| Scenario | Before | After |
|---|---|---|
| Invalid payload, no Supabase env | **503** (WRONG) | **400** (CORRECT) |
| Invalid payload, Supabase configured | 400 | 400 |
| Valid payload, no Supabase env | 503 | 503 |
| Valid payload, Supabase configured | 201 | 201 |

## Monetization Field Interception

### Why Block Monetization Fields

123Charts Phase 1 is a free index. There are:
- No paid listings
- No sponsored placements
- No premium tiers
- No Stripe integration
- No payment processing

Accepting monetization fields in API payloads would:
1. Create false expectations that paid features exist
2. Risk storing payment-intent data that 123Charts has no infrastructure to handle
3. Blur the boundary between the free index and future commercial features
4. Create a potential attack surface for payment-related abuse

### Blocked Fields

The following fields are rejected in ALL API payloads (both project-submissions and project-claims):

| Field | Category |
|---|---|
| `stripe_session_id` | Stripe |
| `stripe_customer_id` | Stripe |
| `stripe_price_id` | Stripe |
| `stripe_checkout_session_id` | Stripe |
| `checkout_session_id` | Payment |
| `payment_link` | Payment |
| `payment_status` | Payment |
| `is_premium_tier` | Commercial tier |
| `premium` | Commercial tier |
| `paid_plan` | Commercial tier |
| `plan` | Commercial tier |
| `price_id` | Pricing |
| `accelerator` | Third-party |
| `priority_payment` | Payment |
| `feature_flag_override` | Internal |

If any of these fields appear in a request body, the API returns **400 Bad Request** with:

```json
{
  "ok": false,
  "service": "123charts-web",
  "error": {
    "type": "...",
    "title": "Bad Request",
    "status": 400,
    "detail": "Request contains disallowed fields for project-submissions: stripe_session_id, premium. 123Charts does not accept monetization, payment, or commercial-tier fields.",
    "instance": "/api/project-submissions",
    "request_id": "..."
  }
}
```

### Zod Strict Mode

In addition to the explicit forbidden field check, both schemas now use `.strict()`. This rejects ANY key not defined in the schema, providing defense-in-depth against:

- Unknown monetization fields not in the explicit blocklist
- Typo-squatted field names
- Future payment-related fields that emerge before the blocklist is updated
- Malformed payloads with extra properties

## Query Parameter Noindex

### The Risk

Search engines may index pages with arbitrary query parameters, creating duplicate content issues and potentially indexing pages with injected parameters. For example:

- `/projects?utm_source=spam` could be indexed as a separate page
- `/categories/ai-agents?ref=badactor` could create indexed referral trails
- `/founders?gclid=...` could create indexed ad-tracking URLs

### The Fix

Middleware now adds `X-Robots-Tag: noindex, nofollow, noarchive` to any public HTML page response that includes non-internal query parameters.

**Internal parameters (allowed, no noindex):**
- `_rsc` — React Server Components internal
- Any parameter starting with `__next` — Next.js internal

**Not affected:**
- API routes (`/api/*`) — already have `no-store` cache headers
- Static assets (`/_next/*`) — not processed by middleware
- `sitemap.xml`, `robots.txt` — excluded from middleware
- Pages without query parameters — no noindex applied

### Why Not robots.txt

Using `robots.txt` to block query-parameter pages is incorrect because:

1. `robots.txt` blocks crawling but does NOT prevent indexing
2. A page blocked by `robots.txt` can still appear in search results
3. `robots.txt` patterns are URL-prefix based and can't distinguish query parameters from path segments

The correct approach is `X-Robots-Tag` (HTTP header) or `<meta name="robots">` (HTML), both of which tell search engines to not index the page.

## Why Not Stripe

123Charts Phase 1 is a free, public index. Stripe integration is not in scope because:

1. There are no paid features to charge for
2. Payment processing introduces PCI compliance obligations
3. Stripe integration would require storing customer data, creating privacy obligations
4. The business model for Phase 1 is growth-signal discovery, not transactions

When (and if) 123Charts introduces optional commercial features in a future phase, Stripe integration will be its own PR with full security review, PCI scope analysis, and data handling policies.

## Why This Is Not SEO Manipulation

The `X-Robots-Tag: noindex` on query-parameter pages is a defensive measure to prevent search engines from indexing unintended URL variants. It is NOT:

- A link scheme to pass ranking signals
- An attempt to manipulate search rankings
- A cloaking technique (same content with and without params)
- A paid link or backlink scheme

This is standard practice for content sites that want their canonical URLs indexed while preventing query-parameter duplication in search results.

## Implementation

### lib/validation/shared.ts

`FORBIDDEN_PAYLOAD_FIELDS` — Set of 15 blocked monetization/commercial/tier field names.
`checkForbiddenFields()` — Inspects raw JSON keys before Zod validation.

### lib/validation/project-submission.ts, project-claim.ts

Added `.strict()` to both schemas — rejects unknown keys.

### app/api/project-submissions/route.ts, project-claims/route.ts

Reordered: parse → forbidden check → validate → Supabase check → insert → audit/notify.

### middleware.ts

Added query-parameter noindex logic for public HTML pages with non-internal params.
