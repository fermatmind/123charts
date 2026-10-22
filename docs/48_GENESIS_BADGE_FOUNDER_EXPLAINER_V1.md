# Genesis Badge Founder Explainer v1

## Summary

PR40 refreshes the founder-facing Genesis Badge explanation without adding any backend flow, claim mutation, payment path, sitemap change, or API change.

The page now describes the badge as an optional public signal display rather than a commercial certification. It also introduces the visible status language `Tracked by 123Charts` and `Founder Claimed`.

## What Changed

| Surface | Change |
| --- | --- |
| `/genesis` | Reframed the hero around optional signal display and added small status chips for `Tracked by 123Charts` and `Founder Claimed`. |
| `/founders` | Reframed founder value copy around structured profiles, source confidence, and reviewed public signal profiles. |
| `GenesisBadgeExplainer` | Reworked badge attributes to emphasize optional display, reviewed public sources, founder verification, and no obligation loop. |
| `docs/TASK_STATUS.md` | Recorded PR39 completion and PR40 readiness for PR41 QA. |

## Product Boundary

The Genesis Badge remains:

- optional
- informational
- based on reviewed public signals
- dependent on founder verification
- separate from ordering, payment, certification, or external outcome claims

The PR does not add:

- badge API
- badge embed renderer
- claim mutation
- admin mutation
- sitemap entry change
- payment flow
- restricted asset flow
- private data collection

## Structured Data

The existing WebPage JSON-LD remains page-level only. PR40 does not add product, offer, review, rating, organization endorsement, or fabricated metric structured data.

## Validation

Required PR40 checks:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run public-surface:check`
- `npm run agent:redact:check`
- `npm run agent:scope:check -- PR40`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## PR41 Handoff

PR41 should live-smoke:

- `/genesis`
- `/founders`
- security headers
- public copy boundaries
- no app-code changes in the QA task
