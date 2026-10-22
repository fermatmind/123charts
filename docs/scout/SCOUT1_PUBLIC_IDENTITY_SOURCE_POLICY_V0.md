# SCOUT1 Public Identity Source Policy v0

Status: validation passed  
Task: PR134 / SCOUT1  
Result: GO_SCOUT2_SCOUT4_SCOUT3_DEPENDENCY  
Date: 2026-06-20

## Decision

SCOUT1 defines which public identity sources can be used by later scouted sandbox work. It does not approve a crawler, ingestion script, external fetch run, database write, public page, sitemap entry, Public API field, MCP tool, `/landscape` count, `/tasks` route, alternatives route, report publication, deployment, or companion data repo mutation.

Future SCOUT2, SCOUT4, and SCOUT3 work may rely on this policy only as a source classification contract. They still need their own roadmap scope and validation before any local dry run.

## Source Classes

| Class | Examples | Use | Minimum evidence |
| --- | --- | --- | --- |
| `official_primary` | Official site, official docs, official GitHub organization, official package page linked from the official site | Project identity, canonical URL, public description fragment, product category hint | One stable URL plus source timestamp |
| `official_launch` | Official launch page, official changelog, official blog, official product announcement | Launch context and product identity | One stable URL plus source timestamp |
| `public_repository` | Public GitHub repository or organization controlled by the project | Public repo URL, license hint, dev momentum metadata if later allowed | Repository URL plus owner identity evidence |
| `public_listing` | Public package registry or reviewed directory that links back to official assets | Secondary confirmation only | Must be paired with `official_primary` or `public_repository` |
| `manual_review_note` | Human-authored reviewer note based on allowed public sources | Override or clarification | Reviewer, date, source URLs, reason |

No single non-official listing is enough to create a `review_candidate`. Non-official listings can support dedupe or discovery hints only.

## Reliability Rules

1. Prefer official sources over third-party listings.
2. Require at least one official or repository-controlled source before a candidate can leave `scouted`.
3. Require two independent public-safe signals before `review_candidate` unless a human reviewer records a manual note.
4. Treat copied descriptions from third-party listings as unavailable; write original notes instead.
5. Use source timestamps and retrieval dates in later contracts so stale facts can be corrected.
6. Keep noisy or conflicting identities in `quarantined` until a human resolves them.

## Forbidden Discovery Inputs

The scouted sandbox must not use private contacts, personal email scraping, login-required pages, cookies, browser session export, private groups, customer lists, analytics, billing screens, screenshots of private tools, copied competitor database text, competitor rankings, reviews, comments, private founder social data, or any target that requires bypassing access controls.

If a source blocks access, returns rate-limit or access-control signals, requires a form, requires login, or requires unusual probing, future audit work must classify it as unavailable or blocked according to AUDIT0/AUDIT1. It must not attempt bypass behavior.

## Field-Level Source Requirements

| Field family | Required source | Notes |
| --- | --- | --- |
| Project name | `official_primary`, `public_repository`, or human note | Preserve exact public spelling; do not infer legal entity. |
| Canonical URL | `official_primary` or human note | Must be normalized later by SCOUT4. |
| Category hint | Official source, repository topic, or human note | Treat as provisional until review. |
| One-line internal note | Original 123Charts wording only | No copied third-party descriptions. |
| Public repository URL | Repository-controlled source | Do not infer ownership from name similarity alone. |
| Public docs URL | Official docs or official site link | Keep as source URL, not proof of readiness. |
| Launch URL | Official launch source | Third-party launch pages are secondary unless linked from official assets. |

Commercial, traction, customer, financing, investor, verification, and founder-contact fields are out of scope for SCOUT1 and must remain unknown unless a later human-reviewed policy explicitly allows them.

## Manual Override

A manual override must include:

- reviewer identifier or role;
- date;
- source URLs;
- the conflict or gap being resolved;
- the exact field affected;
- a statement that the override does not publish, index, promote, or expose the candidate.

Manual override cannot promote a record to public lifecycle states and cannot waive privacy, source-copy, login, bypass, data repo, Public API, MCP, sitemap, or deploy boundaries.

## Handoff

SCOUT2 may define the sandbox contract fields using this policy. SCOUT4 may define canonical resolution and identity conflict handling. SCOUT3 may define only a local dry-run contract or implementation if its own roadmap scope allows it.

Do not start SCOUT2, SCOUT3, SCOUT4, AUDIT0, AUDIT1, AUDIT2, REPORT0, REPORT1, REPORT2, SCOUTQ, second-round Growth, BETA1, I18N0, OPS8D, OPS10A, or PR101 from this PR.

## Validation

| Check | Result |
| --- | --- |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run agent:train-plan:check -- --batch TRAIN-PR134-PR137-SCOUT-AUDIT-REPORT-BOUNDARIES` | PASS |
| `npm run agent:scope:check -- PR134` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
