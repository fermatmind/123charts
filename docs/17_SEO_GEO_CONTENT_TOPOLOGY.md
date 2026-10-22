# 17 SEO/GEO Content Topology v0

## Date

2026-06-15

## Purpose

Define the content architecture that forms 123Charts's natural traffic skeleton. Phase 1 does not rely on traditional SEO blog content. Instead, structured project asset pages, category hubs, curated collections, data reports, and founder value pages create a topology of discoverable, indexable, interlinked content that naturally attracts search traffic.

## Content Type Map

| Content Type | Route Pattern | Indexable | Structured Data | Refresh Cadence |
|---|---|---|---|---|
| Project Detail | `/projects/[slug]` | Yes (published/claimed/verified) | WebPage | On data update |
| Category Hub | `/categories/[slug]` | Yes | WebPage + ItemList | Weekly |
| Curated Collection | `/collections/[slug]` | Yes | CollectionPage + ItemList | Weekly |
| Report List | `/reports` | Yes | ItemList | Weekly |
| Report Detail | `/reports/[slug]` | Yes | TechArticle | Per release |
| Founders | `/founders` | Yes | WebPage | Monthly |
| Genesis Badge | `/genesis` | Yes | WebPage | Monthly |
| Project Submit | `/submit` | No (noindex) | None | N/A |
| Claim Page | `/claim/[slug]` | No (noindex) | None | N/A |
| Admin / API / Preview | `/admin/*`, `/api/*`, `/preview/*` | No (robots.txt block + noindex) | None | N/A |

## Topology Principles

### 1. Structured Over Unstructured

Every content page is a structured asset, not a freeform blog post. Category hubs, collections, and reports follow consistent information architecture with predictable sections, metadata, and structured data markup.

### 2. Interlinked, Not Siloed

- Project detail pages link to their categories and collections
- Category pages link to their projects with signal-ranked ordering
- Collection pages link to their projects with inclusion rationale
- Reports link to referenced projects
- Founders page links to claim system and Genesis Badge page
- Genesis Badge page links to founders page

### 3. Public Signals Only

All content is grounded in publicly verifiable data. No private metrics, fabricated statistics, or unverifiable claims. Unknown data is displayed as unknown.

### 4. Editorial, Not Automated

Category overviews, collection rationales, and report summaries are editorial content. AI may draft but humans must review before publication. No report, category page, or collection page may be published without editorial review.

### 5. SEO Without SEO Content

The topology achieves search discoverability through:
- Structured, well-linked information architecture
- Schema.org structured data (WebPage, ItemList, CollectionPage, TechArticle)
- Descriptive, unique metadata per page
- Published-only sitemap inclusion
- Clean URL structure with semantic slugs
- Category and collection pages that serve as topical authority hubs

No traditional SEO blog posts, keyword-stuffed landing pages, or link-bait content. The content itself is the SEO asset.

## Category Hub Design

Each category hub serves as an industry/vertical landing page:

1. **Category Overview** — What this category covers
2. **Why This Category Matters** — Editorial context on industry significance
3. **Signal-Ranked Projects** — Projects ordered by Signal Score
4. **Fastest Dev Momentum** — Projects with top development velocity
5. **Open Source vs Commercial** — Ecosystem structure notes
6. **Methodology** — How projects are assessed
7. **Source Confidence** — Data reliability explanation
8. **FAQ** — Common questions answered

## Collection Design

Each collection is a scenario-driven asset pool:

1. **Inclusion Criteria** — What qualifies a project for this collection
2. **Editorial Summary** — Context for why this collection exists
3. **Project Grid** — All matching projects with Signal Score
4. **Why These Projects Are Included** — Editorial rationale
5. **Last Updated** — Timestamp for freshness signal
6. **Methodology** — Collection methodology

## Report Design

Reports are data-media style, not blog posts:

1. **Executive Summary** — Top-level findings
2. **Methodology** — Data sources and analysis approach
3. **Top Movers** — Projects with significant score changes
4. **Newly Claimed** — Projects that transitioned to claimed status
5. **Fastest Dev Momentum** — Top development velocity projects
6. **Commercial Readiness Watch** — Projects showing commercial signals
7. **SEO Gap Patterns** — Structured data and discoverability observations
8. **Source Confidence** — Data reliability statement
9. **Report Notes** — Editorial caveats

## Founder Value Layer

The founders page and Genesis Badge page provide the why:

- **Founders Page** — Explains the value of a structured public profile, source confidence improvement, and verified signal tracking. Explicitly states what 123Charts does NOT promise (no traffic guarantees, no ranking promises, no backlink obligations).
- **Genesis Badge Page** — Explains badge eligibility criteria, attributes, and limitations. Explicitly states no ranking guarantees, no SEO benefits, no forced backlinks.

## Pending/Preview Indexing Policy

If a pending or preview page becomes publicly accessible in the future, it must use meta `noindex` (via `<meta name="robots" content="noindex">`) or `X-Robots-Tag: noindex` HTTP header. Pending/preview pages must NOT rely on `robots.txt` blocks for noindex enforcement.

Reason: `robots.txt` `Disallow` prevents crawling but does not prevent indexing if the page is linked from external sources. `noindex` is required to prevent search engine indexing of non-public lifecycle states.

## Sitemap Rules

- Include: `/`, `/projects`, `/projects/[slug]` (published/claimed/verified), `/categories/[slug]`, `/collections/[slug]`, `/reports`, `/reports/[slug]`, `/founders`, `/genesis`
- Exclude: `/admin`, `/api`, `/preview`, `/submit`, `/claim/[slug]`, search parameter URLs
- Sitemap inclusion follows lifecycle state, not route existence

## Robots.txt Rules

- Allow: `/`, `/projects`, `/projects/*`, `/categories/`, `/categories/*`, `/collections/`, `/collections/*`, `/reports`, `/reports/*`, `/founders`, `/genesis`
- Disallow: `/admin/`, `/api/`, `/preview/`, `/claim/`, `/submit/`
