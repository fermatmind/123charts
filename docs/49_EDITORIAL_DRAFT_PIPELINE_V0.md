# Editorial Draft Pipeline v0

## Summary

PR42 adds an admin-only editorial draft pipeline for 123Charts. Editorial notes can be stored and reviewed, but the workflow is draft-only and does not publish project pages.

## Data Model

`editorial_drafts` stores draft notes linked to a project and optional editorial job. The table uses row-level security and authenticated admin-only policies for select, insert, and update.

Allowed statuses:

- `draft`
- `pending_review`
- `approved_for_publication`
- `needs_info`
- `rejected`
- `archived`

`approved_for_publication` records human review intent only. It does not mutate `projects.status`, does not change `index_status`, and does not add sitemap entries.

## Admin-only Boundary

Admin users can review drafts at `/admin/editorial`. The API endpoint `/api/admin/editorial-drafts/[id]` accepts review actions:

- `approve`
- `reject`
- `needs_info`
- `archive`

The endpoint rejects publish-like actions. It records an audit event but does not perform public release work.

## Public Surface Boundary

- No sitemap exposure.
- No public API exposure.
- No public project page changes.
- No MCP exposure.
- No automatic publication.
- No project status mutation to `published`.

## Checker

`npm run editorial-draft:check` verifies:

- migration and RLS presence
- admin-only review route
- publish/index side effects are blocked
- public sitemap/API files do not reference `editorial_drafts`

## Definition of Done

- Editorial output is draft-only.
- Admin review is required before publication.
- No direct project publication path is introduced.
- No sitemap, public API, or MCP exposure is introduced.
- Checker script validates boundaries.
- PR43 can proceed.
