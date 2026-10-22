# PR69 Vertical Asset Grid Taxonomy v0

## Scope

PR69 defines the vertical asset grid taxonomy and advice boundary for future limited `/verticals/*` discovery pages. It is docs-only by roadmap scope: no app route, component, library, checker script, sitemap entry, public API, MCP, payment, dependency, deploy, external index ping, or data repo mutation is introduced.

## Taxonomy Principle

Vertical asset grids are AI project discovery domains. They group reviewed public project profiles by product domain so readers can compare public signals and navigate related project pages.

They are not professional advice categories. A vertical page must not tell users what product to buy, use, prescribe, invest in, rely on for regulated decisions, or treat as a substitute for qualified professional review.

## Lifecycle

Every vertical must use one of these statuses:

| Status | Public route | Sitemap | Use |
| --- | --- | --- | --- |
| `draft` | No | No | Internal candidate only. |
| `noindex` | Preview only | No | Reviewed enough for internal QA but not indexable. |
| `published` | Yes, if threshold is met | Yes, if sitemap eligible | Public discovery grid. |
| `archived` | No by default | No | Retired or superseded grid. |

## Evidence Threshold Policy

A vertical can become `published` only when all conditions are met:

- slug is literal and manually allowlisted;
- status is `published`;
- `sitemapEligible` is true;
- at least two local reviewed project records have `status: "published"`;
- every included project has at least one public source link;
- inclusion rationale is written by 123Charts, not generated from freeform query text;
- page copy states project-discovery scope;
- regulated-language constraints are present when the domain touches legal, finance, healthcare, compliance, security, or investment-adjacent topics.

## Route Generation Boundary

Allowed:

- finite registry-backed `/verticals/[slug]` pages;
- `generateStaticParams()` from a literal registry;
- `notFound()` or equivalent noindex behavior for unknown or ineligible slugs;
- sitemap entries from published, sitemap-eligible registry records only.

Forbidden:

- query-generated vertical pages;
- tag cartesian-product route generation;
- freeform text to route creation;
- external source crawling at request time;
- broad pSEO page expansion;
- AI filler pages;
- Google Indexing API usage;
- live IndexNow ping;
- data repo mutation.

## Regulated-Language Boundary

All vertical pages must avoid:

- legal advice or instructions;
- financial advice or product recommendations for money decisions;
- medical advice, diagnosis, or treatment claims;
- investment recommendations;
- compliance guarantees;
- safety, certification, audit, or outcome guarantees;
- ranking, traffic, citation, or backlink promises.

If a future vertical touches legal, finance, healthcare, investment, compliance, security, or other regulated contexts, the page must:

- describe the surface as an AI project discovery grid;
- state that included projects are shown from public signals only;
- avoid recommending products for regulated decisions;
- avoid implying verified compliance, clinical, legal, financial, or investment suitability;
- keep project claims to reviewed local profile data.

## V0 Candidate Verticals

PR70 may implement fewer than this list if the published-project threshold does not support a candidate.

| Candidate slug | Discovery scope | Initial published project evidence | Regulated boundary |
| --- | --- | --- | --- |
| `ai-builder-infrastructure` | Developer and infrastructure projects for AI builders. | `aurora-code`, `nucleus-ml`, `vectorbase` | General product discovery only. |
| `model-and-search-infrastructure` | Model workflow and semantic search infrastructure projects. | `nucleus-ml`, `vectorbase` | General product discovery only. |
| `analytics-and-operations-tools` | Analytics, compliance-preparation, and operational tooling projects. | `pulse-analytics`, `complykit` | Must not provide compliance advice or guarantee readiness. |

## PR70 Implementation Expectations

PR70 should add a machine-readable registry and checker because PR69 roadmap scope forbids library and script changes. PR70 should verify:

- registry-backed vertical routes only;
- published-only project filtering;
- no unreviewed, scouted, quarantined, submitted, rejected, archived, claimed, or owner-verified record leakage;
- sitemap uses the published vertical helper only;
- unknown slugs return `notFound()` or noindex behavior;
- no professional advice language;
- no regulated claims.

## Definition of Done

- [x] Domains are project categories, not advice categories.
- [x] No legal, financial, or medical advice.
- [x] No regulated claims.
- [x] Threshold policy defined.
