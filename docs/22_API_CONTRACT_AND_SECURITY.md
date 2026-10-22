# 22 API Contract + Security Headers v0

## Date

2026-06-15

## Purpose

Define the 123Charts API contract, error format, security headers, and request tracing conventions that all API routes must follow. This v0 establishes the foundation — future PRs will add submit, claim, and admin routes that comply with this contract.

## RFC 9457 Problem Details

123Charts uses [RFC 9457 Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457) — NOT RFC 7807. RFC 9457 is the current IETF standard, obsoleting RFC 7807.

### Why RFC 9457

- RFC 9457 is the current published standard (July 2023).
- It provides a machine-readable, extensible error envelope that clients can parse without inspecting HTTP status text.
- It standardizes `type`, `title`, `status`, `detail`, and `instance` fields.
- It supports extension members like `errors` (field-level validation errors) and `request_id` (request tracing).

### Error Response Format

Content-Type: `application/problem+json`

```json
{
  "ok": false,
  "service": "123charts-web",
  "error": {
    "type": "https://123charts.dev/docs/api-errors#not-found",
    "title": "Not Found",
    "status": 404,
    "detail": "No project found with slug \"unknown\".",
    "instance": "/api/projects/unknown",
    "request_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

### Available Problem Types

| Status | Title | Constructor | Use Case |
|---|---|---|---|
| 400 | Bad Request | `badRequest()` | Validation errors, malformed input |
| 403 | Forbidden | `forbidden()` | Non-public project access, auth failures |
| 404 | Not Found | `notFound()` | Missing resource |
| 405 | Method Not Allowed | `methodNotAllowed()` | Wrong HTTP method |
| 406 | Not Acceptable | `notAcceptable()` | Unsupported content type |
| 429 | Too Many Requests | `tooManyRequests()` | Rate limit exceeded |
| 500 | Internal Server Error | `internalError()` | Unexpected server failure |
| 503 | Service Unavailable | `serviceUnavailable()` | Maintenance or overload |

## Standard Success Response

```json
{
  "ok": true,
  "service": "123charts-web",
  "data": { ... },
  "request_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

`data` varies by endpoint. `request_id` is always present for traceability.

## Request ID

Every API response includes a `request_id`:

1. **Incoming**: The system checks `x-request-id`, `x-amzn-trace-id`, and `cf-ray` headers in order. If any is present, it is forwarded.
2. **Generated**: If no incoming trace ID is found, a UUID v4 is generated.
3. **Response**: The `request_id` is included in both the response body and the `x-request-id` response header.
4. **Middleware**: The global `middleware.ts` sets `x-request-id` on all responses.

## Security Headers

All responses include the following security headers, applied via `middleware.ts`:

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer information |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Permissions-Policy` | `accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()` | Disable browser features |
| `Content-Security-Policy` | Conservative allowlist | Prevent XSS, data injection |

### Content-Security-Policy

The v0 CSP is conservative but functional for Next.js dev/build:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

- `unsafe-inline` and `unsafe-eval` are required by Next.js development mode and are acceptable for a Phase 1 product with no user-generated script content.
- CSP will be tightened in a later PR as the attack surface and requirements become clearer.
- `frame-ancestors 'none'` is equivalent to `X-Frame-Options: DENY`.

## /api/projects/[slug] — Read-Only Project API

### GET /api/projects/{slug}

Returns public project data from demo snapshots. No database connection.

**Success (200):**
```json
{
  "ok": true,
  "service": "123charts-web",
  "data": {
    "slug": "aurora-code",
    "name": "Aurora Code",
    "tagline": "Open-source AI code reviewer...",
    "category": "Developer Tools",
    "website": "https://auroracode.dev",
    "status": "published",
    "signalScore": 78,
    "scores": { ... },
    "sourceConfidence": "public_signals",
    "verificationStatus": "Not verified",
    "publicSources": [ ... ]
  },
  "request_id": "..."
}
```

**404 (Not Found):** Project slug does not exist.

**403 (Forbidden):** Project exists but is not publicly accessible (status not in published/claimed/owner_verified).

### Data Boundary

- Returns only public project data — no private information, no editorial drafts, no raw payloads.
- Non-published projects (draft, submitted, pending_review, approved preview, archived_noindex) return 403.
- No revenue, MRR, ARR, user counts, or private metrics.
- No external API calls at request time — data comes from local demo snapshots.

## Webhook Signature Verification

Webhook signature verification is NOT implemented in v0. When webhook endpoints are added in a future PR:

- Incoming webhooks must verify a signature header (e.g., `x-123charts-signature` or platform-specific header).
- Signature verification must use constant-time comparison.
- Unverified webhook requests must return 401 Unauthorized.
- Webhook endpoints must not perform destructive operations without signature verification.

## API Non-Goals v0

- No submit backend (`POST /api/submissions` — future PR)
- No claim backend (`POST /api/claims` — future PR)
- No admin API routes (future PR)
- No webhook endpoints
- No authentication/authorization beyond public/private data boundaries
- No rate limiting (future PR)
- No API versioning in URL path (future PR)

## Implementation

### lib/api/problem.ts

RFC 9457 Problem Detail types and constructor functions. Each constructor returns a `ProblemDetail` object with standard fields.

### lib/api/response.ts

`success()` and `errorResponse()` wrap Next.js `NextResponse.json()` with consistent `{ ok, service, data/error, request_id }` envelopes.

### lib/api/request-id.ts

`generateRequestId()`, `getIncomingRequestId()`, and `getOrCreateRequestId()` handle request ID generation and propagation.

### lib/security/headers.ts

Constants for security headers and cache header values. `SECURITY_HEADERS` is imported by middleware.

### middleware.ts

Global Next.js middleware that:
- Sets `x-request-id` on all responses
- Applies security headers to all responses
- Sets `cache-control: no-store` on API routes
- Excludes static assets from processing

### app/api/projects/[slug]/route.ts

Read-only GET endpoint that returns public project data from demo snapshots.
