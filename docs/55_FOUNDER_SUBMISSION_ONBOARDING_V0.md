# Founder Submission Onboarding v0

PR48 adds a founder-ready onboarding surface at `/founding-slots`. The page explains how founders can prepare a structured project submission, how reviewed publication works, and how claim, correction, and removal requests fit into the 123Charts workflow.

## Included

- `/founding-slots` static public onboarding page.
- `components/founder/submission-onboarding-faq.tsx` for FAQ, sequence, boundaries, and founder actions.
- Links from `/submit`, `/claim/[slug]`, and `/founders` to the onboarding surface.
- `npm run founder-onboarding:check` to validate copy boundaries and required workflow language.

## Boundary Rules

- Submissions do not publish automatically.
- Submitted and pending-review records remain outside public indexing and sitemap coverage.
- Founder requests for claim, correction, or removal stay in review until accepted.
- The page uses public-source language only.
- No API, Supabase, deploy, middleware, payment, MCP, plugin, or dependency changes.

## Validation

| Check | Result |
| --- | --- |
| `npm run founder-onboarding:check` | PASS |
| `npm run agent:scope:check -- PR48` | PASS |
| `npm run policy:scan` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |

## Next

PR49 should verify the PR47 submission channels report and PR48 founder onboarding surfaces together as QA.
