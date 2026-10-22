# 33 Admin Review v0

## Date

2026-06-15

## Purpose

Implement the 123Charts built-in admin review backend for processing project submissions and founder claims. This PR adds the review UI, admin API routes, and review action logic. No email sending, editorial AI, Stripe, or crawler logic.

## Why Admin Is Built Into 123charts-web

123Charts Phase 1 runs as a single Next.js application. There is no separate admin service. Reasons:

1. **Single codebase** — Admin tools share the same Supabase client, auth, and types as the public app
2. **RLS-native authorization** — Admin access uses Supabase RLS and the `is_admin()` function
3. **Zero additional infrastructure** — No separate hosting, domain, or auth provider
4. **Simple audit trail** — Admin actions write to the same `audit_events` table

## Submissions Review Flow

1. User submits via `/submit` → `project_submissions` table (status: `pending_review`)
2. Admin visits `/admin/submissions` → sees list of pending submissions
3. Admin reviews submission details: project name, tagline, website URL, category
4. Admin takes action:

| Action | Result |
|---|---|
| **Approve** | Creates a `projects` row with status=`approved`, index_status=`preview_noindex`. Submission marked `approved`. |
| **Reject** | Submission marked `rejected`. No project created. |
| **Needs Info** | Submission marked `needs_info`. No project created. |

5. All actions record `audit_events` and `notification_events` (notifications are recorded, not sent).

## Claims Review Flow

1. Founder submits claim via `/claim/[slug]` → `project_claims` table (status: `pending`)
2. Admin visits `/admin/claims` → sees list of pending claims
3. Admin reviews: claim method, proof URL/note, associated project
4. Admin takes action:

| Action | Result |
|---|---|
| **Approve** | Claim marked `approved`. If associated project exists, `projects.claim_status` → `claimed`. |
| **Reject** | Claim marked `rejected`. |
| **Needs Info** | Claim marked `needs_info`. |

5. All actions record `audit_events` and `notification_events`.

## Two-Step Publishing

123Charts uses a two-step publishing process to prevent premature public exposure:

### Step 1: Approve (creates project in preview state)

- `projects.status` = `approved`
- `projects.index_status` = `preview_noindex`
- Project is NOT publicly visible via RLS or sitemap
- Admin can preview the project at a preview URL

### Step 2: Publish (makes project publicly visible)

- `projects.status` = `published`
- `projects.index_status` = `indexable`
- Project becomes visible to public RLS queries
- Future: included in sitemap dynamically

### Why Not Auto-Publish

1. **Safety** — New submissions may contain incorrect data, spam, or policy violations. Preview-noindex gives admins a chance to verify before making public.
2. **Editorial quality** — Approved-but-not-published allows editorial content (notes, structured profiles) to be prepared before launch.
3. **Compliance** — Prevents accidental public exposure of unvetted content.
4. **RLS boundary** — `preview_noindex` projects are excluded from public RLS queries, providing a clean separation between preview and public content.

The publish action in this PR is available as an admin API action. A dedicated publish button in the UI will be added in a future PR.

## Audit Events

Every admin action records an `audit_events` row:

| Event Type | Source | Payload |
|---|---|---|
| `submission_approved` | `admin_review` | submission_id, project_id, project_slug, reviewer |
| `submission_rejected` | `admin_review` | submission_id, reviewer |
| `submission_needs_info` | `admin_review` | submission_id, reviewer |
| `claim_approved` | `admin_review` | claim_id, project_id, claim_method, reviewer |
| `claim_rejected` | `admin_review` | claim_id, reviewer |
| `claim_needs_info` | `admin_review` | claim_id, reviewer |
| `project_published` | `admin_review` | project_id, reviewer |

## Notification Events

Every admin action records a `notification_events` row with `is_sent = false`. No email is sent. The notification table serves as a future queue for email/webhook delivery.

## Permissions

| API Route | Required | 401 | 403 |
|---|---|---|---|
| `GET /api/admin/submissions` | Admin session | Yes | Yes |
| `PATCH /api/admin/submissions/[id]` | Admin session | Yes | Yes |
| `GET /api/admin/claims` | Admin session | Yes | Yes |
| `PATCH /api/admin/claims/[id]` | Admin session | Yes | Yes |

- Unauthenticated requests → 401 Unauthorized (RFC 9457 Problem Details)
- Authenticated non-admin → 403 Forbidden (RFC 9457 Problem Details)
- Admin check uses `is_admin()` RPC function (server-side, not client-side)

## Data Hygiene

| Field | Display |
|---|---|
| Founder email | Masked: `fo***@example.com` |
| Internal metadata | Not displayed |
| Notification payload | Not displayed |

## API Contract

All admin API errors use RFC 9457 Problem Details format with:
- `type`, `title`, `status`, `detail`, `instance`
- `request_id` for traceability
- `Content-Type: application/problem+json`

## Next Step: 88cn-index-data

The `external_project_imports` table exists in the schema (PR #9) for external data imports. When the `88cn-index-data` repository is created:

1. External project data enters `external_project_imports` as JSON payloads
2. Admin reviews imports alongside direct submissions
3. Approved imports can create `projects` records (via the same two-step process)
4. This ensures all project data — whether from direct submissions or external imports — goes through the same review gate

## Implementation

### lib/admin/

- `review-queries.ts` — Typed Supabase queries using `getAdminClient()` (service_role)
- `review-actions.ts` — Business logic: approve/reject/needs_info for submissions and claims, two-step publish

### lib/validation/

- `admin-review.ts` — Zod schema for `{ action: "approve" | "reject" | "needs_info" | "publish" }`

### app/api/admin/

- `submissions/[id]/route.ts` — GET (list pending) + PATCH (approve/reject/needs_info)
- `claims/[id]/route.ts` — GET (list pending) + PATCH (approve/reject/needs_info)

### app/admin/

- `page.tsx` — Dashboard updated with active links to submissions and claims
- `submissions/page.tsx` — Server component: admin guard + submissions list
- `submissions/review-actions.tsx` — Client component: approve/reject/needs_info buttons
- `claims/page.tsx` — Server component: admin guard + claims list
