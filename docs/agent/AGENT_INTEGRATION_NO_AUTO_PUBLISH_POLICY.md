# AGENT-INTEGRATION0A No-Auto-Publish Policy

Worker output is never publication.

Worker recommendation is never publication.

Worker review-ready payload is never publication.

Only manual 123Charts admin review can produce `published_projection`.

Only `published_projection` can enter frontend, search, sitemap, Public API, or
MCP surfaces.

## Policy Rules

1. Worker artifacts may be accepted only as admin-review input candidates.
2. Worker `recommend_publish` does not create a public page.
3. Worker `publish_recommended` does not create a public page.
4. Worker `review_ready` does not create a public page.
5. Worker quarantine, audit, evidence, and trace data remain admin-only.
6. 123Charts admin review is the only path to `published_projection`.
7. `published_projection` remains the only public data source for project
   frontend, search, sitemap, Public API, and MCP surfaces.

## Explicit No-Leak Boundary

The following fields and payload classes are forbidden in public surfaces:

- raw seed
- raw source evidence
- raw audit payload
- review notes
- internal confidence
- canonical ambiguity details
- quarantine details
- rejected details
- private hashes
- private artifact paths
- worker job payload
- admin state history

These fields may appear only in admin-only review, quarantine, or trace
contexts when a later task explicitly implements an authorized storage path.

## Worker Recommendation Boundary

Allowed recommendation values are:

- `recommend_publish`
- `recommend_review`
- `recommend_quarantine`
- `recommend_reject`
- `recommend_recheck`

All recommendation values require human review before any public state can be
created. Recommendation confidence may be a coarse internal band only. It must
not be exposed as an absolute public score.

## Import Contract Boundary

Validated import artifacts may move records to `review_queue_pending` or
`review_blocked`. They may not:

- write Supabase
- write staging DB
- write production DB
- write `published_projection`
- write sitemap entries
- mutate frontend routes
- release Public API or MCP data
- mutate `88cn-index-data`
- start worker runtime
- start queue runtime
- deploy

## Human Final Gate

The final publication gate is a human 123Charts admin action. Any future automation
must stop before `published_projection_created` unless a separate explicit
human-approved task defines a safe admin workflow and rollback path.
