# PR75 GitHub Structured Profile Mirror Spec v0

## Scope

PR75 defines the policy and markdown contract for a future local-only GitHub profile mirror workflow.

Roadmap scope for PR75 is spec-only. This task does not add generator scripts, app code, public routes, sitemap entries, API routes, MCP behavior, payment behavior, dependencies, deploy configuration, external repository writes, GitHub Pages deployment, external index pings, or data repository writes.

## Mirror Objective

The GitHub profile mirror is a portable markdown summary of an 123Charts project profile for founder-owned or maintainer-owned GitHub surfaces.

The mirror may help humans inspect public project facts outside the 123Charts web app. It must not become a source of truth, a publication trigger, an indexing automation, or a promise of search visibility, ranking movement, citation, traffic, funding, revenue, or adoption.

## Source Boundary

Mirror inputs must come only from reviewed local records that are already safe for public display.

Allowed source classes:

- 123Charts project records with `status: "published"`, `status: "claimed"`, or `status: "owner_verified"`;
- public project fields already shown on public 123Charts project pages;
- official project URLs, public GitHub URLs, public docs URLs, public pricing URLs, and public launch URLs that have passed existing review;
- published category, stack, collection, vertical, or alternatives metadata when the project is already eligible for that surface;
- public verification labels such as `Public signals only`, `Not verified`, `Not enough data`, `Founder not claimed`, or `Source unavailable`.

Forbidden source classes:

- submitted, pending-review, approved-preview-only, archived-by-default, rejected, quarantined, duplicate, or scouted-only records;
- private founder contact data, email addresses, phone numbers, direct messages, identity documents, or login credentials;
- admin notes, review comments, moderation notes, source-confidence internals, reviewer identity, queue metadata, audit-event payloads, notification-event payloads, or internal scoring evidence;
- payment state, checkout status, billing identifiers, orders, invoices, ad placement state, private backer interest, private watchlist records, private analytics, revenue evidence, customer lists, or screenshots;
- external raw crawl output that has not passed 123Charts review and publication policy;
- any data from `/Users/rainie/Desktop/88cn-index-data` unless a later task explicitly reads it in local-only mode without mutation and then applies the same reviewed-public allowlist.

Unknown or unavailable values must render as one of the approved unknown labels rather than being inferred.

## Markdown Profile Contract

A generated profile mirror must be deterministic, plain markdown, and safe to review in a pull request before any external use.

Required sections:

```text
# {Project Name}

{Reviewed one-line public description}

## Public Profile

- 123Charts profile: {public profile URL}
- Official site: {official URL or approved unknown label}
- Public GitHub: {public GitHub URL or approved unknown label}
- Docs: {public docs URL or approved unknown label}
- Category: {reviewed category label}
- Review status: {public lifecycle label}

## Public Signals

- Product readiness: {public summary or approved unknown label}
- Dev momentum: {public summary or approved unknown label}
- Market presence: {public summary or approved unknown label}
- Commercial readiness: {public summary or approved unknown label}
- SEO foundation: {public summary or approved unknown label}
- Trust confidence: {public summary or approved unknown label}

## 123Charts Editorial Note

{Human-reviewed public editorial note or approved unknown label}

## Boundaries

- Generated from reviewed public 123Charts data only.
- Does not include private founder, payment, admin, analytics, or review metadata.
- Does not promise ranking, traffic, citation, funding, revenue, or adoption outcomes.
```

Optional sections:

- published stack, collection, vertical, or alternatives links where the project is already listed on that public surface;
- public founder-claim status if already public;
- last reviewed date if already safe for public display.

Forbidden markdown content:

- hidden HTML, tracking pixels, scripts, forms, badges that imply ranking guarantees, or external mutation hooks;
- generated testimonials, customer logos, private metrics, investor interest, funding claims, revenue claims, user counts, retention claims, or unreviewed comparisons;
- paid placement language mixed into Signal Score or organic editorial claims;
- copy that implies guaranteed search placement, traffic, citations, investment outcomes, or commercial performance.

## File Naming Contract

Future local-only generation should use deterministic slugs:

```text
{project_slug}.md
```

The generator must reject paths that escape the configured output directory. It must not write into another repository, GitHub checkout, public directory, deployment directory, or data repository by default.

The default output root for PR76 should be a temporary path such as:

```text
/tmp/123charts-github-profile-mirror
```

## PR76 Local-Only Boundary

PR76 may proceed only if it can stay local-only.

Required generator behavior:

- supports `--dry-run`;
- supports `--source local`;
- supports `--out /tmp/...` or another non-repo temporary directory;
- supports `--no-write-external`;
- refuses external GitHub writes;
- refuses GitHub Pages deployment;
- refuses data repository mutation;
- refuses generated profile commits unless a later roadmap task explicitly allows sanitized fixtures;
- writes no secrets, credentials, private founder data, private payment data, admin notes, or internal review metadata;
- exits non-zero if unsafe fields are present in the candidate payload.

Forbidden generator behavior:

- pushing to GitHub;
- creating external pull requests;
- creating GitHub issues;
- committing generated profile markdown into `/Users/rainie/Desktop/88cn-index-data`;
- calling GitHub mutation APIs;
- deploying GitHub Pages;
- publishing or unpublishing 123Charts project records;
- triggering sitemap, IndexNow, Google Indexing API, Public API, MCP, payment, deploy, or server configuration changes.

If PR76 requires any external repository write, data repository write, or generated profile commit outside explicit roadmap scope, it must stop with `HUMAN_CHECKPOINT_REQUIRED`.

## Checker Contract For PR76

PR75 cannot add a checker because the roadmap forbids `scripts/**`, `ops/mirror/**`, and `package.json` changes.

If PR76 scope allows scripts, it should add a local checker that validates:

- generator default output path is outside the repository;
- dry-run mode exists and is the documented default for validation;
- external write flags are absent or disabled;
- GitHub mutation APIs are not called;
- GitHub Pages deployment is not invoked;
- data repository paths are not written;
- generated markdown contains no private founder, admin, payment, analytics, credential, or review metadata fields;
- generated markdown contains no search-ranking, traffic, citation, funding, revenue, or adoption promise;
- only published or otherwise public-eligible lifecycle states are accepted;
- unknown values use approved unknown labels.

## Definition Of Done

- [x] Mirror spec exists.
- [x] Data source boundary is defined.
- [x] Only reviewed and public-eligible data is allowed.
- [x] Private founder data is forbidden.
- [x] Email addresses are forbidden.
- [x] Admin notes are forbidden.
- [x] Payment state is forbidden.
- [x] Internal score/source-confidence internals are forbidden.
- [x] Data repository mutation is forbidden.
- [x] External GitHub writes are forbidden.
- [x] GitHub Pages deployment is forbidden.
- [x] Markdown profile format is defined.
- [x] PR76 local-only generation boundary is defined.
- [x] Search-ranking, traffic, citation, funding, revenue, and adoption promises are forbidden.

## Proceed Decision

PR76 can proceed only after PR75 merges and cleanup completes, and only as a local-only dry-run generator. The roadmap currently marks PR76 with a human checkpoint for data repository or external repository writes, so any such requirement must stop the train before implementation or merge.
