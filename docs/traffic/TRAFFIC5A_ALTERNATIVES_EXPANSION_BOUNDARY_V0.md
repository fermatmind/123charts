# TRAFFIC5A Alternatives Expansion Boundary v0

## Result

GO_PR126_APPROVED_ALTERNATIVES_EXPANSION

TRAFFIC5A defines the canonical pair policy and expansion limits for PR126. The current reviewed local data supports one additional curated alternatives pair. This task is docs/status metadata only and does not modify alternatives runtime files.

## Scope

- Task ID: PR125 / TRAFFIC5A
- Role: codex-research
- Repo: `/Users/rainie/Desktop/123charts.com/123charts`
- Data repo: `/Users/rainie/Desktop/88cn-index-data` cleanliness check only
- Product code changes: none
- Deployment: none

## Source Inputs

- `docs/traffic/TRAFFIC1_DEMAND_SIDE_SEARCH_INTENT_TAXONOMY.md`
- `docs/traffic/TRAFFIC1_DEMAND_SIDE_ROUTE_FAMILY_POLICY.md`
- `docs/traffic/TRAFFIC1_ROUTE_INDEXABILITY_AND_SITEMAP_POLICY.md`
- `docs/traffic/TRAFFIC4R_REMAINING_DEMAND_SIDE_TRAFFIC_SPLIT.md`
- `docs/traffic/TRAFFIC4A_TASK_TO_PROJECT_DISCOVERY_BOUNDARY_V0.md`
- `docs/traffic/TRAFFIC4B_FINITE_TASK_PAGES_IMPLEMENTATION_V0.md`
- `lib/alternatives/curated-alternatives.json`
- `lib/alternatives/curated-alternatives.ts`
- `lib/demo-projects.ts`
- `lib/verticals/vertical-asset-grids.json`
- `lib/collections/curated-collections.json`
- `app/alternatives/[slug]/page.tsx`
- `app/sitemap.ts`

## Existing Alternatives State

Current published alternatives routes:

| Canonical slug | Left | Right | Status |
| --- | --- | --- | --- |
| `aurora-code-vs-nucleus-ml` | `aurora-code` | `nucleus-ml` | published |
| `nucleus-ml-vs-vectorbase` | `nucleus-ml` | `vectorbase` | published |
| `complykit-vs-pulse-analytics` | `complykit` | `pulse-analytics` | published |

Current runtime helper already enforces:

- `ALTERNATIVES_ROUTE_CAP_V0 = 3`;
- canonical slug is alphabetical by project slug;
- `canonicalPath` must equal `/alternatives/${canonicalSlug}`;
- both projects must be local `published` project records;
- reverse order does not become a second route.

## Canonical Pair Policy

Every alternatives pair must satisfy all of these gates:

1. pair appears in a finite local allowlist;
2. both project slugs map to local reviewed `published` records;
3. `canonicalSlug` equals the alphabetically sorted pair joined by `-vs-`;
4. `canonicalPath` equals `/alternatives/${canonicalSlug}`;
5. exactly two projects are returned by the route helper;
6. page copy is neutral and source-backed;
7. route is not generated from arbitrary params, tags, or broad pair expansion;
8. pair is not a reverse duplicate of an existing route;
9. route is not influenced by Featured Signals or paid placement;
10. route remains separate from Public API, MCP, payment, customer, and data-feed behavior.

## Approved PR126 Expansion

PR126 may add exactly one new curated alternatives pair:

| Canonical slug | Left project | Right project | Rationale | Sitemap |
| --- | --- | --- | --- | --- |
| `aurora-code-vs-vectorbase` | `aurora-code` | `vectorbase` | Both are reviewed local `published` records with public source links and appear in the AI builder infrastructure discovery context. This fills a finite editorial gap inside the existing three-project builder infrastructure set without opening broad pair generation. | eligible if checker passes |

PR126 must update the route cap from 3 to 4 only if the implementation adds this single pair and the checker proves exactly four published alternatives routes.

## Forbidden Expansion

PR126 must not add:

- N-by-N pair generation;
- reverse duplicates such as `vectorbase-vs-aurora-code`;
- pair generation from categories, tags, project scores, route params, query strings, or external scans;
- comparisons involving non-published, unreviewed, submitted, pending, scouted, rejected, private, draft-only, or archived records;
- broad comparison pages that imply one project is better;
- copy that criticizes, disparages, predicts outcomes, or recommends purchasing/adoption;
- paid placement effects on alternatives order, copy, sitemap, Public API, MCP, Signal Score, Source Confidence, or editorial review.

## Copy Boundary

Allowed copy:

- neutral comparison;
- reviewed local profile fields;
- public source links;
- lifecycle state;
- reviewed sample context;
- project discovery language;
- source-backed category or workflow context.

Forbidden copy:

- superiority or winner language;
- defamatory or disparaging statements;
- unverifiable claims about revenue, usage, customers, funding, outcomes, or quality;
- outcome promises for discovery, indexing, citation, growth, or adoption;
- paid inclusion or placement promises;
- direct competitor description reuse.

## PR126 Implementation Contract

PR126 may modify only its allowed implementation paths and should:

- append the approved `aurora-code-vs-vectorbase` entry to the curated alternatives registry;
- raise the route cap from 3 to 4 only for this approved expansion;
- keep `getCanonicalAlternativesSlug()` as the single canonical ordering source;
- ensure `generateStaticParams()` still reads only published curated alternatives;
- ensure unknown and reverse slugs are not valid public pages;
- ensure sitemap includes only approved canonical pairs;
- add or update a checker that rejects reverse duplicates, noncanonical paths, under-reviewed pairs, cap drift, and unsafe copy.

## Definition Of Done

| Requirement | PR125 result |
| --- | --- |
| canonical pair allowlist policy defined | PASS |
| reverse duplicates forbidden | PASS |
| N-by-N pair generation forbidden | PASS |
| superiority and defamatory copy forbidden | PASS |

## Exact Next Task

PR126 / TRAFFIC5B Alternatives Expansion Implementation v0.

Do not start PR126 inside PR125.

## What This PR Does Not Do

- Does not modify alternatives runtime files.
- Does not create or edit app routes, components, lib modules, scripts, sitemap runtime code, or package metadata.
- Does not deploy.
- Does not perform external writes, email, DMs, social posting, outreach automation, CRM writes, or PII collection.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not start PR126, TRAFFIC5B, PR127, GROWTH0, BETA1, I18N0, OPS9B, or PR101.
