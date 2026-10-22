# AGENT-INTEGRATION0A State Mapping

This document maps worker-side states to 123Charts admin-review states. It preserves
the no-auto-publish boundary: worker states may request review, but only manual
123Charts admin review can create `published_projection`.

## Worker-Side States

| Worker state | Meaning |
| --- | --- |
| `discovery_hint` | Candidate project identity was found from approved public-source inputs. |
| `source_verified` | Official source resolver found a candidate official source. |
| `canonical_candidate` | Canonical entity resolver produced a candidate identity. |
| `audit_observed` | Fixture/default audit observations were attached for review context. |
| `quarantined` | Worker detected a risk requiring quarantine handling. |
| `review_ready` | Worker packaged a sanitized admin-review candidate. |
| `publish_recommended` | Worker recommendation engine suggests possible publish after admin review. |

## 123Charts-Side States

| 123Charts state | Meaning |
| --- | --- |
| `import_received` | 123Charts received an artifact set for validation. |
| `review_queue_pending` | A validated record is waiting for admin review. |
| `review_blocked` | A record needs human unblock before admin review can proceed. |
| `admin_reviewing` | Human admin is reviewing the record. |
| `manual_approved` | Human admin approved creation of a public projection. |
| `manual_rejected` | Human admin rejected the record. |
| `published_projection_created` | 123Charts created public projection after manual approval. |
| `stale` | Record is stale and requires recheck before further action. |
| `archived` | Record is retained for internal history only. |

## Allowed Transitions

```text
review_ready -> import_received
import_received -> review_queue_pending
review_queue_pending -> admin_reviewing
admin_reviewing -> manual_approved
manual_approved -> published_projection_created
admin_reviewing -> manual_rejected
review_blocked -> admin_reviewing only after human unblock
quarantined -> review_blocked
publish_recommended -> review_queue_pending
```

## Forbidden Transitions

```text
publish_recommended -> published_projection_created
review_ready -> published_projection_created
quarantined -> published_projection_created
rejected -> published_projection_created
worker_output -> sitemap
worker_output -> frontend
worker_output -> public API
worker_output -> MCP
```

## Review Queue Interpretation

`review_ready` is a packaging state, not a publication state.

`publish_recommended` is a recommendation state, not a publication state.

`review_blocked` is not rejection. It means human unblock is required before
normal admin review can continue.

`quarantined` is admin-only. Quarantine details must not leave the admin/review
boundary.

## Public Surface Boundary

Only `published_projection_created` may feed public frontend, search index,
sitemap, Public API, or MCP surfaces, and only when produced by the 123Charts admin
review process.

Worker output cannot directly feed:

- frontend
- sitemap
- Public API
- MCP
- `published_projection`
- data repo exports
