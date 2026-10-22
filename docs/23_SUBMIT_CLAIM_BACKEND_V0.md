# 23 Submit + Claim Backend v0

## Date

2026-06-15

## Purpose

Upgrade `/submit` and `/claim/[slug]` from static placeholders to functional form endpoints backed by Supabase. Establishes the submit/claim data ingestion pipeline while maintaining all data integrity, privacy, and security boundaries.

## Why Submit + Claim First

Submit and claim are the two entry points for project data:

1. **Submit** — Founders and community members add projects to the 123Charts index. Without submit, the index cannot grow beyond hand-curated demo data.
2. **Claim** — Founders verify ownership, enabling source confidence improvement, structured profile updates, and Genesis Badge eligibility. Without claim, all projects remain "Not verified."

These two endpoints create the pipeline from public submission → editorial review → publication, which is the core growth loop for Phase 1.

## API Endpoints

### POST /api/project-submissions

Accepts project submission data. Returns 201 on success.

**Request body:**
```json
{
  "project_name": "My AI Project",
  "website_url": "https://example.com",
  "category_slug": "ai-coding",
  "one_liner": "A single sentence describing the project.",
  "description": "Optional description.",
  "founder_name": "Jane Founder",
  "founder_email": "jane@example.com",
  "founder_public_url": "https://linkedin.com/in/jane",
  "github_url": "https://github.com/org/repo",
  "docs_url": "https://docs.example.com",
  "pricing_url": "https://example.com/pricing",
  "launch_url": "https://producthunt.com/posts/...",
  "growth_note": "Public growth signals or milestones."
}
```

**Success (201):**
```json
{
  "ok": true,
  "service": "123charts-web",
  "data": { "message": "Project submitted for review." },
  "request_id": "..."
}
```

**Error responses:** 400 (validation), 405 (wrong method), 503 (Supabase not configured)

### POST /api/project-claims

Accepts founder claim data. Returns 201 on success.

**Request body:**
```json
{
  "project_slug": "aurora-code",
  "claimant_name": "Jane Founder",
  "claimant_email": "jane@example.com",
  "claimant_role": "Founder",
  "claim_method": "github_repo",
  "proof_url": "https://github.com/org/repo/blob/main/.well-known/123charts-claim",
  "proof_note": "Please verify via the GitHub proof file."
}
```

**Success (201):**
```json
{
  "ok": true,
  "service": "123charts-web",
  "data": { "message": "Claim submitted for review." },
  "request_id": "..."
}
```

**Error responses:** 400 (validation), 405 (wrong method), 503 (Supabase not configured)

## Form Validation

Both endpoints use Zod for input validation:

- **project-submission.ts** — Validates all 13 submission fields with type, length, and format constraints
- **project-claim.ts** — Validates 7 claim fields with enumerated claim methods

Validation errors return RFC 9457 Problem Details with field-level `errors` map.

## Graceful Degradation

If Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are not set:

- `getSupabaseClient()` returns `null`
- API routes return **503 Service Unavailable** with a descriptive message
- The Next.js build does **not** crash
- Frontend forms display the error message to users

This allows development and testing without a running Supabase instance.

## Audit Events

Each submission and claim write is recorded in `audit_events`:

- `event_type` — "project_submission" or "project_claim"
- `event_source` — Same as event_type
- `event_payload` — Non-sensitive event metadata (project name, category, claim method)
- `request_id` — For traceability

Audit events do not contain:
- Raw IP addresses
- Private revenue data
- Stripe or payment data
- API keys or credentials
- Analytics screenshots
- Investor information

## Notification Events

Each submission and claim write is recorded in `notification_events`:

- `event_type` — "submission_received" or "claim_received"
- `payload` — Event metadata including founder email (as recipient hint)
- `is_sent` — Always `false` in v0

**Notifications are recorded but NOT sent.** This table serves as a future notification queue. Actual email/Slack/webhook delivery will be implemented in a later PR when:
- Email provider (e.g., Resend, Postmark) is configured
- Editorial review workflow is in place
- Notification preferences are implemented

## Why No Stripe

123Charts Phase 1 is a free index. There are:
- No paid listings
- No sponsored placements
- No premium profiles
- No transaction processing

Stripe integration is not planned for Phase 1. If 123Charts introduces optional paid services in a future phase, Stripe integration will be a separate PR with its own security review.

## Why No Turnstile (Yet)

CAPTCHA/challenge verification (Cloudflare Turnstile, hCaptcha, reCAPTCHA) is not implemented in v0. It will be added before production launch to prevent spam submissions.

When Turnstile is added:
- The submit and claim forms will include a Turnstile widget
- Backend will verify the Turnstile token before processing
- Failed verification returns 400 with a specific error code

## Why No Private Revenue/Analytics/API Key Collection

Per AGENTS.md and `docs/10_DATA_CONTRACT.md`:

- 123Charts uses public signals only
- Submission forms must not collect revenue screenshots, Stripe data, analytics exports, or API keys
- The public data contract limits collected data to: project name, website, category, one-liner, and public URLs
- Private data collection would create data security obligations that 123Charts is not designed to handle

## RLS Dependency

This PR relies on PR #9 RLS policies:

- `project_submissions` — Anonymous INSERT allowed, no anon SELECT
- `project_claims` — Anonymous INSERT allowed, no anon SELECT
- `audit_events` — Anonymous INSERT allowed (002 migration), no anon SELECT
- `notification_events` — Anonymous INSERT allowed (002 migration), no anon SELECT

The Supabase client uses the anonymous key, so RLS enforces all access control.

## Relationship to PR #13 Admin Review

PR #13 will add the admin review backend:

- Dashboard to view and process submissions and claims
- Lifecycle promotion (draft → submitted → pending_review → approved → published)
- Editorial job management
- Admin-only RLS policies for SELECT/UPDATE/DELETE on all tables

The submit/claim endpoints in this PR create the data that PR #13 will process.

## Implementation

### lib/supabase/

- `env.ts` — Read and cache Supabase environment variables
- `server.ts` — Create and cache Supabase client (anon key)

### lib/validation/

- `project-submission.ts` — Zod schema for project submissions
- `project-claim.ts` — Zod schema for founder claims

### app/api/

- `project-submissions/route.ts` — POST handler with validation, Supabase insert, audit, and notification
- `project-claims/route.ts` — POST handler with validation, Supabase insert, audit, and notification

### components/

- `submit-form.tsx` — Client component with 5 form sections, validation, and success/error states
- `claim-form.tsx` — Client component with claim method selection, proof URL, and success/error states

### supabase/migrations/

- `002_audit_notification.sql` — New migration adding `audit_events` and `notification_events` tables with RLS

## Security

- No raw IP addresses stored
- No private revenue/analytics data accepted
- No API key or credential fields
- Anonymous insert only (RLS enforced)
- All responses follow RFC 9457 Problem Details format
- `request_id` included in all responses for traceability
- CSP and security headers applied via middleware (from PR #10)
