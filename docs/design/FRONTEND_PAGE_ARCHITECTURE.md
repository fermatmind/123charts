# 123Charts Frontend Page Architecture v0

Result: `FRONTEND_UI_DESIGN_SYSTEM_READY`

Scope: public frontend page blueprint only. This document does not create routes, change code, change sitemap runtime, deploy, write data, or touch server/cloud resources.

## Global Page Rules

Public page architecture must follow these rules:

- project-level public data comes only from reviewed `published_projection`;
- collection-level public data comes only from reviewed finite collection registry entries and published projections;
- public routes fail closed for missing, stale, rejected, quarantined, or unreviewed data;
- filtered search pages remain noindex unless a later reviewed route policy approves a finite page;
- sitemap entries include only eligible published projections and eligible finite collections;
- admin/raw pipeline surfaces remain isolated from public UI;
- no broad faceted pSEO;
- no request-time external crawling, signal recalculation, or worker reads from public routes;
- no fake ranking or default leaderboard.

## Shared Page Data Allowlist

Project pages may display:

- `project_name`
- `original_summary`
- `official_website_url`
- `github_url`
- `docs_url`
- `primary_category` / `category`
- `collection_tags`
- `open_source_or_commercial`
- `public_signal_chips`
- `last_reviewed_at`
- public-safe lifecycle label when the row is eligible

Public pages must not display:

- raw seed;
- raw evidence;
- raw audit;
- review notes;
- rejected or quarantine detail;
- internal confidence;
- hashes;
- private artifact paths;
- worker job payload;
- reviewer identity;
- staging/admin IDs;
- private founder or submitter contact data;
- unreviewed external import data.

## 1. Home `/`

| Item | Blueprint |
| --- | --- |
| Purpose | Establish 123Charts as a reviewed AI project discovery index and move users quickly into search, projects, collections, submit, and methodology. |
| Target user intent | Find a project, browse reviewed AI tools, understand why 123Charts data is different, or submit a project. |
| Visible data fields | Aggregate counts from published projections only, finite collection links, recent reviewed project cards, public signal examples, review freshness language. |
| Forbidden data fields | Raw seed counts, private review counts, raw audit counts, unpublished candidates, queue sizes, internal confidence, private artifacts, worker state. |
| Layout sections | Compact brand/search hero, finite collection shortcuts, recently reviewed public project strip, methodology trust strip, submit CTA, footer. |
| Component list | SiteHeader, HeroSearch, ProjectGrid, ProjectCard, ProjectSignalChips, CollectionGrid or collection shortcut row, MethodologyBlock, SubmitCTA, SiteFooter. |
| Mobile behavior | Search remains first; collection shortcuts become horizontal chips; recent projects render one column; methodology strip becomes compact stacked rows. |
| SEO metadata rules | Indexable only as a static brand/home route. Description must use product positioning and not include unverified totals beyond published projections. |
| Sitemap/indexability rules | Include `/` in sitemap as a static route; do not include query variants. |
| Empty-state behavior | If no published projections exist, show a neutral "Public profiles are under review" state with SubmitCTA and Methodology link. |
| No-leak checks | Home counts must derive only from public projection and public collection helpers; no admin metrics or raw candidate totals. |

Home design notes:

- replace marketing-heavy hero posture with search-first directory utility;
- keep first viewport useful at CONTENT27 and still useful at 5000+ rows;
- show "Public signals only" and "Last reviewed" as trust affordances, not promotional claims.

## 2. Projects Listing `/projects`

| Item | Blueprint |
| --- | --- |
| Purpose | Primary public browsing and search surface for reviewed project profiles. |
| Target user intent | Search by project, category, official signal, or finite collection; compare cards quickly; open details. |
| Visible data fields | Project name, summary, category, collection tags, model type, signal chips, official host, last reviewed, pagination totals from published projections only. |
| Forbidden data fields | Raw row fields, source evidence payloads, raw audit observations, review notes, internal confidence, hidden sort weights, rejected/quarantine status, worker payloads. |
| Layout sections | Page title and short boundary note, SearchFilterPanel, result count and pagination, ProjectGrid, EmptyState, pagination footer. |
| Component list | SiteHeader, SearchFilterPanel, ProjectGrid, ProjectCard, ProjectSignalChips, ProjectOfficialLinks, ReviewTimestamp, EmptyState, SiteFooter, NoIndexGuard for query variants. |
| Mobile behavior | Search full width; filters collapse or stack; cards one column; result count before list; pagination fixed below result grid, not sticky. |
| SEO metadata rules | Base `/projects` indexable. Query-filtered versions use noindex/follow unless later finite route policy approves a static page. Metadata must not reflect unreviewed filters as pages. |
| Sitemap/indexability rules | Include `/projects` as static public listing. Do not include arbitrary query variants. |
| Empty-state behavior | "No published projections matched this search" and reset link. Do not reveal whether matching unpublished records exist. |
| No-leak checks | Filter options are derived from current published projections; result totals count only public rows; pagination cannot fetch raw records. |

Scale requirements:

- stable default sort should be deterministic and neutral, such as last reviewed plus project name;
- page size remains bounded;
- search index can be segmented by category bucket, slug range, or shard id at larger scale;
- public route never recalculates signals or crawls official sources at request time.

## 3. Project Detail `/projects/[slug]`

| Item | Blueprint |
| --- | --- |
| Purpose | Public-safe project profile with reviewed summary, official source links, signal chips, finite collection membership, and founder claim path. |
| Target user intent | Verify what a project is, open official links, understand public signals, find related reviewed collections, claim or correct a profile. |
| Visible data fields | Project name, original summary, official website, optional GitHub/docs, category, collection tags, model type, public signal chips, last reviewed, lifecycle public label, founder claim link. |
| Forbidden data fields | Raw evidence, raw audit, seed origin, admin notes, private confidence, rejected/quarantine detail, internal IDs, hashes, private artifact paths, worker payloads, unverified metrics. |
| Layout sections | Detail hero, signal chip band, official links panel, entity scope panel, collections panel, reviewed alternatives panel when finite, founder claim CTA, methodology note. |
| Component list | SiteHeader, ProjectDetailHero, ProjectSignalChips, ProjectOfficialLinks, ReviewTimestamp, CollectionCard links or collection chip links, SubmitCTA or claim CTA, MethodologyBlock, SiteFooter, NoIndexGuard. |
| Mobile behavior | Hero summary stays above source panels; official links render as stacked buttons; chips wrap; claim CTA follows public data content and does not cover links. |
| SEO metadata rules | Title from project name; description from original summary; canonical path from slug; robots index/follow only if sitemap eligibility passes. |
| Sitemap/indexability rules | Include only when `isProjectSitemapEligible(project)` passes. Missing/ineligible slugs 404. |
| Empty-state behavior | Missing slug or non-published projection returns 404. No partial public detail shell. |
| No-leak checks | `generateStaticParams`, metadata, JSON-LD, detail render, and related links all use published projections only. |

Detail rules:

- official links must be visually separate from 123Charts editorial summary;
- signal chips cannot look like score cards or endorsement badges;
- related alternatives must remain finite and reviewed;
- no hidden internal confidence or score weights appear in HTML.

## 4. Collections Index `/collections`

| Item | Blueprint |
| --- | --- |
| Purpose | Public navigation hub for finite reviewed collections. |
| Target user intent | Browse curated groups without using broad filters; understand collection criteria; enter a collection detail page. |
| Visible data fields | Collection title, summary, inclusion criteria excerpt, last reviewed, published project count, representative project names from published projections. |
| Forbidden data fields | Draft/noindex collections, under-threshold collections, raw membership review notes, unpublished project slugs, internal collection IDs, rejected/quarantine data. |
| Layout sections | Header with finite-collection policy, CollectionGrid, methodology note, fallback submit CTA. |
| Component list | SiteHeader, CollectionGrid, CollectionCard, ReviewTimestamp, MethodologyBlock, EmptyState, SiteFooter. |
| Mobile behavior | One-column collection cards; criteria excerpt shortened; project count and last reviewed remain visible. |
| SEO metadata rules | Indexable only if it lists reviewed public collections. Description should mention finite reviewed collections. |
| Sitemap/indexability rules | Include `/collections` as static route after route exists. Do not include generated filter pages. |
| Empty-state behavior | If no eligible collections, show "Reviewed collections are being prepared" with link to `/projects`; do not expose draft collection names. |
| No-leak checks | `getPublishedCuratedCollections()` only; no direct registry display of draft/noindex entries. |

## 5. Collection Detail `/collections/[slug]`

| Item | Blueprint |
| --- | --- |
| Purpose | Explain one finite reviewed collection and list its eligible published projects. |
| Target user intent | Understand why projects are grouped, scan included projects, open project details. |
| Visible data fields | Collection title, summary, inclusion criteria, why included, methodology note, last reviewed, project cards from published projections. |
| Forbidden data fields | Draft collection status, unpublished slugs, raw review notes, rejected/quarantine details, internal membership reasons, raw evidence, worker results. |
| Layout sections | Collection hero, criteria panel, why-included panel, ProjectGrid, review timestamp, methodology block. |
| Component list | SiteHeader, CollectionCard or detail hero, ProjectGrid, ProjectCard, ProjectSignalChips, MethodologyBlock, ReviewTimestamp, EmptyState, SiteFooter, NoIndexGuard. |
| Mobile behavior | Hero and criteria stack; project cards one column; methodology block follows projects. |
| SEO metadata rules | Title from collection title; description from collection summary; canonical path from slug; JSON-LD uses public-safe project names and URLs only. |
| Sitemap/indexability rules | Include only when collection is published, sitemap eligible, and meets minimum published project count. Otherwise 404 or noindex. |
| Empty-state behavior | If membership falls below threshold, fail closed through 404/noindex rather than displaying internal underfilled collection. |
| No-leak checks | Membership resolves through published projection lookup; no raw collection registry detail outside allowlist. |

## 6. Methodology `/methodology`

| Item | Blueprint |
| --- | --- |
| Purpose | Explain the public projection, signal chip, review timestamp, official source, collection, and sitemap/indexing policies. |
| Target user intent | Understand what 123Charts verifies, what it does not verify, how public profiles are reviewed, and how to request correction. |
| Visible data fields | Policy descriptions, allowed public fields, neutral unknown states, signal chip definitions, last-reviewed meaning, sitemap eligibility rules. |
| Forbidden data fields | Internal confidence model, raw audit logic, private reviewer process, raw evidence examples, private artifacts, worker details, unpublished project examples. |
| Layout sections | Overview, published projection contract, signal chip meaning, official source policy, finite collection policy, no-leak policy, correction/claim path. |
| Component list | SiteHeader, MethodologyBlock, ReviewTimestamp examples, SubmitCTA or claim CTA, SiteFooter. |
| Mobile behavior | Accordion-like sections allowed; keep definitions short; sticky table of contents optional only if it does not crowd content. |
| SEO metadata rules | Indexable static policy page; description must be factual and neutral. |
| Sitemap/indexability rules | Include as static route. |
| Empty-state behavior | Not applicable; page should render static policy even when no projects exist. |
| No-leak checks | Methodology examples must be generic or from published projections only. |

## 7. Submit `/submit`

| Item | Blueprint |
| --- | --- |
| Purpose | Let founders submit a project for review while setting expectations that submission is not publication. |
| Target user intent | Add a project, provide official links, understand review state, learn how claim/correction works. |
| Visible data fields | Submission form fields, public-source guidance, review notice, no-promise policy, allowed unknown states. |
| Forbidden data fields | Existing unpublished submissions, reviewer notes, private queue position, admin status, internal matching, hidden moderation flags. |
| Layout sections | Submission intro, public-source checklist, form, privacy/review notice, founder FAQ link, methodology link. |
| Component list | SiteHeader, SubmitCTA, Submit form, MethodologyBlock, EmptyState for disabled form, SiteFooter. |
| Mobile behavior | Single-column form; long URL fields full width; submit button below privacy/review copy; errors inline. |
| SEO metadata rules | Noindex in current posture unless human-approved public acquisition policy changes it. Metadata must not promise publication. |
| Sitemap/indexability rules | Exclude while noindex. |
| Empty-state behavior | If submission API unavailable, show "Submissions are temporarily unavailable" and methodology link. Do not expose backend error detail. |
| No-leak checks | Success/error responses must not reveal internal moderation, duplicate matching, or existing private submission state. |

Submit copy rules:

- emphasize review;
- avoid exaggerated marketing;
- say corrections and founder claims are reviewed;
- never imply automatic publication, route creation, or search visibility.

## 8. Admin Entry Surface `/admin`

| Item | Blueprint |
| --- | --- |
| Purpose | Protected internal entry reference only; not part of public browsing. |
| Target user intent | Authorized team member signs in or sees protected unavailable state. |
| Visible data fields | Auth state, admin navigation cards after authorization, generic unavailable/not-authorized messages. |
| Forbidden data fields | Any admin data to unauthenticated users, project review notes, raw evidence, queue payloads, private contact data, secrets, environment values. |
| Layout sections | Protected guard state, authorized admin nav, sign-out/back-to-site utilities. |
| Component list | SiteHeader optional or internal shell, EmptyState for unavailable/unauthorized, NoIndexGuard, protected admin cards. |
| Mobile behavior | Simple one-column protected states; admin nav cards stack. |
| SEO metadata rules | Always noindex/nofollow. No public metadata beyond generic admin label. |
| Sitemap/indexability rules | Never include in sitemap. |
| Empty-state behavior | Supabase missing, unauthenticated, and not-admin states must be generic and non-leaky. |
| No-leak checks | Guard executes before data queries; unauthorized responses never render admin records. |

Admin isolation rules:

- no public header link to `/admin`;
- public pages do not mention raw pipeline route names;
- admin route is a protected reference surface only.

## 9. 404 / Fail-Closed Pages

| Item | Blueprint |
| --- | --- |
| Purpose | Hide non-public or missing resources safely while giving users a route back to public discovery. |
| Target user intent | Recover from missing route, mistyped slug, or ineligible project/collection. |
| Visible data fields | Generic not-found text, links to `/projects`, `/collections`, `/submit`, and methodology. |
| Forbidden data fields | Whether an unpublished slug exists, why a record is rejected/quarantined, review status, private evidence, internal blocker reason. |
| Layout sections | Status title, short explanation, recovery links, search affordance. |
| Component list | SiteHeader, HeroSearch or compact search, EmptyState, SiteFooter, NoIndexGuard. |
| Mobile behavior | Centered compact state with full-width search and stacked recovery links. |
| SEO metadata rules | noindex/follow for app-level not-found; avoid slug-specific metadata derived from private records. |
| Sitemap/indexability rules | Not included in sitemap. |
| Empty-state behavior | The page itself is the empty state; do not differentiate hidden vs nonexistent records. |
| No-leak checks | 404 path never queries raw tables after public lookup fails. |

Fail-closed message pattern:

- "This public profile is unavailable."
- "Browse reviewed projects or submit a correction."
- Do not say "pending review", "rejected", "quarantined", or "private record exists" on public not-found pages.

## 10. Sitemap/Search Public Model

| Item | Blueprint |
| --- | --- |
| Purpose | Define public discoverability model for project routes, collection routes, static routes, and search index segments. |
| Target user intent | Search engines and internal search can discover eligible public pages while unsafe records stay private. |
| Visible data fields | Search document fields: slug, title, summary, category, collection tags, source signal chips, URL path, last reviewed. |
| Forbidden data fields | Raw seed, identity candidates, canonical candidates, audit pending records, audit observations, review-ready rows, stale/rejected/quarantined/archive blockers, raw evidence, private hashes, copied competitor text. |
| Layout sections | Not a user-facing page; public artifacts include sitemap routes and internal search index outputs. |
| Component list | No visual component required; NoIndexGuard applies to query pages and ineligible routes. |
| Mobile behavior | Search UI consumes the model through Projects listing and home search. |
| SEO metadata rules | Canonical static paths only; filtered query pages noindex; project/collection metadata reads only public-safe fields. |
| Sitemap/indexability rules | Project sitemap eligibility requires published lifecycle, projection, summary, official URL, canonical slug, `seo_indexable`, and no stale/rejected/quarantine/copied-content/directory-hint blocker. Collection sitemap eligibility requires published status, registry eligibility, and minimum published projects. |
| Empty-state behavior | Empty sitemap/search segment is valid and should not fall back to raw data. |
| No-leak checks | Segment builders must serialize only allowlisted fields and ignore unknown unsafe fields. |

Segmentation rules:

- project sitemap segment size remains bounded;
- collection sitemap segment size remains bounded;
- internal search shards should be deterministic and cacheable;
- no public request should trigger external scanning or score recalculation;
- stale records keep last successful private snapshot but leave public sitemap/search when ineligible.

## Route Indexability Matrix

| Route | Default indexability | Sitemap rule |
| --- | --- | --- |
| `/` | index | static route. |
| `/projects` | index | static route, no query variants. |
| `/projects/[slug]` | conditional | only eligible published projections. |
| `/collections` | index after route exists | static route, finite reviewed collections only. |
| `/collections/[slug]` | conditional | only eligible finite collections. |
| `/methodology` | index | static policy route. |
| `/submit` | noindex current posture | exclude unless later approved. |
| `/admin` | noindex | never include. |
| 404/fail-closed | noindex | never include. |
| search/filter query URLs | noindex | never include broad query variants. |

## Page QA Checklist

Every public page implementation PR should verify:

- page reads no raw data source;
- page has a no-leak empty state;
- metadata uses only public fields;
- ineligible slugs fail closed;
- filtered query pages noindex;
- sitemap helper output matches route eligibility;
- mobile cards and chips do not overlap;
- official links are visible and clearly external;
- no leaderboard or fake ranking appears by default;
- no admin/raw pipeline link appears in public navigation.
