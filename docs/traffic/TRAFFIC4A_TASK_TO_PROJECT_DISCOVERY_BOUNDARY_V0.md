# TRAFFIC4A Task-to-Project Discovery Boundary v0

## Result

GO_PR123_FINITE_TASK_IMPLEMENTATION

TRAFFIC4A defines the finite `/tasks/[slug]` discovery boundary for PR123. The current reviewed local data supports one first-wave indexable task page and several deferred/noindex candidates. This task is docs/status metadata only and does not implement `/tasks`.

## Scope

- Task ID: PR122 / TRAFFIC4A
- Role: codex-research
- Repo: `/Users/rainie/Desktop/123charts.com/123charts`
- Data repo: `/Users/rainie/Desktop/88cn-index-data` cleanliness check only
- Product code changes: none
- Deployment: none

## Source Inputs

- `docs/traffic/TRAFFIC1_DEMAND_SIDE_SEARCH_INTENT_TAXONOMY.md`
- `docs/traffic/TRAFFIC1_DEMAND_SIDE_ROUTE_FAMILY_POLICY.md`
- `docs/traffic/TRAFFIC1_ROUTE_INDEXABILITY_AND_SITEMAP_POLICY.md`
- `docs/traffic/TRAFFIC2_AI_PROJECT_LANDSCAPE_LANDING_BOUNDARY.md`
- `docs/traffic/TRAFFIC3_SECTOR_DENSITY_MARKET_MAP_V0.md`
- `docs/traffic/TRAFFIC3Q_SECTOR_DENSITY_MARKET_MAP_QA_V0.md`
- `docs/traffic/TRAFFIC4R_REMAINING_DEMAND_SIDE_TRAFFIC_SPLIT.md`
- `lib/demo-projects.ts`
- `lib/landscape/public-signal-landscape.ts`
- `lib/verticals/vertical-asset-grids.json`
- `lib/stacks/tech-stack-clusters.json`
- `lib/collections/curated-collections.json`
- `app/sitemap.ts`

## Existing Runtime State

Current local evidence:

| Surface | State |
| --- | --- |
| `/tasks` route | Absent |
| `/tasks/[slug]` route | Absent |
| `/zh-CN/tasks/[slug]` route | Absent |
| `/landscape/sectors` route | Absent |
| Sitemap task entries | Absent |
| Reviewed public-safe projects | 6 total: 5 `published`, 1 `claimed` |
| Current project data source | Local reviewed demo project records, not external crawls |

PR123 may add a finite `/tasks/[slug]` route only if it remains backed by reviewed local project records and a static allowlist.

## Task Route Definition

A task page is a demand-side discovery page for a concrete user job. It answers: "Which reviewed 123Charts projects can help me evaluate or perform this job?"

A task page is not:

- an arbitrary keyword page;
- a query-param search result;
- an AI-for-anything page;
- a generic best/top/ranking page;
- a copied competitor task description;
- a global project directory;
- a paid placement surface;
- a page that promises traffic, ranking, customers, funding, or AI visibility.

## First-Wave Allowlist

PR123 may implement only this first-wave indexable task slug:

| Slug | Title | Intent | Project slugs | Reviewed sample count | Indexability | Sitemap |
| --- | --- | --- | --- | ---: | --- | --- |
| `evaluate-ai-builder-infrastructure` | Evaluate AI builder infrastructure | Find reviewed projects that help builders evaluate AI development, model workflow, and infrastructure options from public signals. | `aurora-code`, `nucleus-ml`, `vectorbase` | 3 | indexable if implementation copy passes boundary checks | eligible |

Rationale:

- all three projects are local reviewed public-safe records;
- all three have `published` lifecycle state;
- all three have public source links;
- the task is concrete enough to avoid generic directory or arbitrary SEO-page behavior;
- the reviewed sample count meets the TRAFFIC1 default threshold of 3.

## Deferred / Noindex Candidates

These candidates are not approved for indexable implementation in PR123:

| Candidate slug | Current backing | Reviewed sample count | Decision |
| --- | --- | ---: | --- |
| `review-model-search-infrastructure` | `nucleus-ml`, `vectorbase` | 2 | Defer. Under threshold; no sitemap. |
| `review-analytics-operations-tools` | `pulse-analytics`, `complykit` | 2 | Defer. Under threshold; no sitemap. |
| `choose-local-on-device-productivity` | `scribe-ai` | 1 | Defer. Under threshold; no sitemap. |
| `compare-open-source-ai-project-tooling` | `aurora-code`, `vectorbase` | 2 | Defer. Under threshold; no sitemap. |

PR123 should not create these pages. If a later implementation chooses to support internal under-threshold pages, they must be `noindex, follow`, excluded from sitemap, and covered by a separate task.

## Minimum Reviewed-Project Threshold

Indexable `/tasks/[slug]` routes require all of the following:

1. slug is explicitly allowlisted;
2. route is generated from a static local registry, not arbitrary params;
3. at least 3 reviewed public-safe projects are mapped to the slug;
4. mapped projects use only `published`, `claimed`, or `owner_verified` lifecycle states;
5. every mapped project has source-linked public evidence;
6. copy uses reviewed sample count language;
7. no under-threshold slug appears in sitemap;
8. no query-string page is generated or indexed.

Under-threshold task candidates must remain absent or `noindex, follow` and must not enter sitemap.

## PR123 Implementation Contract

PR123 may create:

- `app/tasks/[slug]/page.tsx`
- `components/tasks/**`
- `lib/tasks/**`
- `scripts/check-task-discovery-boundary.mjs`
- a finite sitemap entry for `evaluate-ai-builder-infrastructure`

PR123 must not create:

- `/tasks` broad index page unless a later task explicitly allows it;
- arbitrary `/tasks/[slug]` pages beyond the allowlist;
- query-param task pages;
- `/zh-CN/tasks/[slug]`;
- `/landscape/sectors`;
- API, MCP, payment, customer, buyer-interest, or data-feed routes;
- data repo writes.

Recommended implementation shape:

- a local `lib/tasks` registry with a static array of allowlisted task entries;
- `generateStaticParams()` sourced only from the eligible task registry;
- `notFound()` for unknown slugs;
- metadata robots/indexing aligned to the task's eligibility;
- sitemap inclusion only for `sitemapEligible === true`;
- a checker that rejects arbitrary params, under-threshold sitemap entries, forbidden copy, route drift, and data-source drift.

## Copy Boundary

Allowed:

- reviewed public signals;
- source-linked projects;
- reviewed sample count;
- task fit signals;
- lifecycle state;
- last reviewed;
- public source links;
- "not verified" / "public signals only" where appropriate.

Forbidden:

- best/top/ranking/superiority claims;
- copied competitor descriptions;
- broad "AI tools for everything" wording;
- fake counts or global market coverage;
- revenue, traffic, funding, customer, or usage claims;
- ranking, indexing, citation, visibility, or outcome promises;
- paid inclusion, dofollow/backlink, sponsorship, restricted financial-offering, or investment language;
- any copy that implies Featured Signals affect organic route order, sitemap, public API, MCP, Signal Score, Source Confidence, or editorial review.

## Sitemap / Canonical / Noindex Boundary

- `evaluate-ai-builder-infrastructure` can be sitemap-eligible after PR123 implements and verifies it.
- Unknown task slugs must not render indexable pages.
- Deferred task candidates must not enter sitemap.
- No task page may be generated from query parameters.
- Canonical must be self-canonical only for allowlisted indexable task routes.
- No noindex or unreviewed route may be a canonical target.

## Definition Of Done

| Requirement | PR122 result |
| --- | --- |
| TRAFFIC4A boundary report exists | PASS |
| finite task slug allowlist defined | PASS |
| minimum reviewed-project threshold documented | PASS |
| arbitrary task pages forbidden | PASS |
| sitemap/noindex boundary documented | PASS |

## Exact Next Task

PR123 / TRAFFIC4B Finite Task Pages Implementation v0.

Do not start PR123 inside PR122.

## What This PR Does Not Do

- Does not implement `/tasks`.
- Does not create app routes, components, lib modules, scripts, or sitemap runtime changes.
- Does not create alternatives pages, `/zh-CN`, `/landscape/sectors`, API, MCP, payment, customer, or buyer-interest routes.
- Does not deploy.
- Does not send email, DMs, social posts, CRM writes, or external writes.
- Does not collect or store PII.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not start PR123, PR124, TRAFFIC4B, TRAFFIC4Q, GROWTH0, BETA1, I18N0, OPS9B, or PR101.
