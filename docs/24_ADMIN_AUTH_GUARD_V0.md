# 24 Admin Auth Guard v0

## Date

2026-06-15

## Purpose

Establish the Supabase Auth + Admin Guard for the 123Charts admin panel. This PR creates the authentication layer, admin authorization check, and an empty admin shell. No review, approval, or publishing logic is implemented.

## Why Admin Is Built Into 123charts-web

123Charts is a single Next.js application. There is no separate admin service, no headless CMS, and no external dashboard. Reasons:

1. **Single codebase** — Admin tools share the same Supabase client, types, and RLS policies as the public API. No synchronization layer needed.
2. **RLS-native authorization** — Supabase Row-Level Security provides the authorization boundary. Admin access is just another RLS policy, not a separate application.
3. **Zero additional infrastructure** — No separate hosting, domain, CI/CD, or auth provider for admin. One Vercel deployment serves both public and admin routes.
4. **Simple audit trail** — Admin actions write to the same audit_events table as public submissions, providing a unified event log.

## Why Not a Separate CMS

Common alternatives like Strapi, Directus, or Payload CMS would:

- Require separate hosting, databases, and auth
- Create a synchronization boundary between CMS data and 123Charts project data
- Add complexity for a Phase 1 product with a single table-based data model
- Introduce licensing and maintenance overhead

123Charts's data model is simple enough that a custom admin panel within the Next.js app is the right trade-off for Phase 1. If the admin surface grows significantly, a separate CMS can be evaluated in a future phase.

## Supabase Auth + RLS Boundary

### Auth Flow

1. User navigates to `/admin/login`
2. Enters email + password → `supabase.auth.signInWithPassword()`
3. Supabase sets `sb-access-token` and `sb-refresh-token` cookies
4. Middleware refreshes the session on each request to `/admin/*`
5. Server component calls `checkAdminGuard()` which:
   - Gets the user from `supabase.auth.getUser()`
   - Calls `is_admin()` RPC function
6. If `is_admin()` returns true → admin page renders
7. If not → "Not Authorized" page

### is_admin() Function

Defined in the database (created in migration 001, updated in 003):

```sql
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- service_role always passes
  if ... = 'service_role' then return true; end if;

  -- Check admin_users table for authenticated users
  if auth.uid() is not null then
    return exists (select 1 from public.admin_users where user_id = auth.uid());
  end if;

  return false;
end;
$$;
```

The function runs with `security definer` (function owner privileges) so it can read the `admin_users` table even when called by an authenticated user who doesn't have direct SELECT on `admin_users`.

### admin_users Table

Maps Supabase Auth user IDs to admin status:

| Column | Type | Notes |
|---|---|---|
| `user_id` | `uuid` | References `auth.users(id)`, unique |
| `granted_by` | `text` | Who granted admin access |
| `granted_at` | `timestamptz` | When admin was granted |

Admin users are added directly via Supabase SQL editor or a service_role operation — not through the admin UI. This prevents privilege escalation.

### RLS for Admin Routes

- `admin_users` — No anon access. Only admins (via `is_admin()`) and service_role can read.
- `project_submissions`, `project_claims` — Only admins can SELECT (existing PR #9 policy).
- Admin pages are server-rendered with `noIndex()` metadata.

## Why This PR Does Not Do Review Business

This PR is purely the authentication and authorization guard. The following are explicitly out of scope:

1. **Listing submissions/claims** — The admin page shows placeholder cards, not real data
2. **Approve/reject** — No mutation endpoints for lifecycle changes
3. **Publishing projects** — No project lifecycle promotion
4. **Editorial job management** — No editorial pipeline UI
5. **Source refresh monitoring** — No queue monitoring

These features belong in PR #15 (Admin Review v0). This PR ensures the security foundation is in place before any review logic is added.

## PR #15 Admin Review v0 Scope (Next)

PR #15 will add:

1. **Submissions list** — Table view of pending project_submissions
2. **Claims list** — Table view of pending project_claims
3. **Approve/reject actions** — Admin mutations with lifecycle event recording
4. **Project publication** — Promote from approved → published
5. **Audit trail viewing** — Read-only audit_events viewer
6. **Admin RLS policies** — INSERT/UPDATE/DELETE policies for admin users on content tables

## Graceful Degradation

| State | Behavior |
|---|---|
| No Supabase env | `/admin` shows "Admin Not Configured" — no crash |
| Supabase configured, not logged in | Link to `/admin/login` |
| Logged in, not admin | "Not Authorized" with user email displayed |
| Logged in, is admin | Admin shell with placeholder cards |
| Login page, no Supabase env | Shows configuration missing message |

## Security Notes

1. No admin emails hardcoded in source code
2. No service role key exposed to client (anon key only for auth)
3. `is_admin()` is checked server-side (not client-side)
4. Admin pages are `noindex` (not in sitemap)
5. Admin routes are excluded from `robots.txt` allow list
6. CSP headers applied via middleware (from PR #10)
7. `SUPABASE_SERVICE_ROLE_KEY` is server-only, never sent to browser

## Implementation

### lib/auth/

- `session.ts` — `createServerSupabase()` using `@supabase/ssr` with Next.js cookies
- `admin.ts` — `checkAdminGuard()` combining `getUser()` + `is_admin()` RPC

### lib/supabase/

- `admin-server.ts` — `getAdminClient()` using service_role key for admin-only operations

### middleware.ts

- Updated to refresh Supabase auth session on `/admin/*` routes
- Uses `@supabase/ssr` `createServerClient` with request/response cookie helpers

### app/admin/

- `page.tsx` — Server component: checks admin guard, shows shell or auth state
- `login/page.tsx` — Server component: checks Supabase config, renders login form
- `login/login-client.tsx` — Client component: email/password form with Supabase browser client

### app/auth/

- `signout/route.ts` — POST handler: signs out and clears cookies

### supabase/migrations/

- `003_admin_users.sql` — Creates `admin_users` table and updates `is_admin()` function
