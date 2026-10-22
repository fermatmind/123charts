# SCOUT_SEED0 Seed 100 Source Mix + Discovery Hint Policy

Status: validation passed
Task: PR163 / SCOUT_SEED0
Result: GO_SCOUT_SEED1
Date: 2026-06-20

## Result

PR163 defines the official Seed 100 source mix and discovery-hint policy.

Result: `GO_SCOUT_SEED1`.

Meaning:

- Seed 100 can proceed to PR164 only as a local-only identity hint normalization task;
- Seed50R `/tmp` artifacts may be used as research input only;
- no Seed50R preview row is an official 123Charts project record;
- no candidate is public, reviewed, audited, indexed, published, or Growth-ready;
- no data repo mutation, Supabase write, staging write, production write, audit trigger, crawler, public route, sitemap, Public API, MCP, report page, or distribution surface is authorized.

## Scope

In scope:

- define Seed 100 source mix;
- define allowed source types and forbidden source types;
- define allowed identity fields and forbidden copied/private/public-state fields;
- define directory-hint policy;
- define Chinese outbound source policy;
- define GitHub/open-source policy;
- define Product Hunt / launch page policy;
- define confidence levels;
- define rejected/weak handling;
- define no-public-surface rules;
- review optional Seed50R research input as policy evidence only.

Out of scope:

- collecting or committing Seed 100 records;
- normalizing the Seed50R preview into a committed pack;
- external HTTP fetching;
- crawler or audit execution;
- Supabase migration or write;
- staging or production DB write;
- data repo mutation;
- public route, sitemap, Public API, MCP, report page, or distribution surface;
- Growth, BETA, I18N, OPS10A, or PR101 start.

## Source Inputs

Reviewed source inputs:

- `docs/infra/WORKER0_SCOUT_WORKER_BOUNDARY_CHAIN_READINESS.md`
- `docs/infra/WORKERQ_WORKER_REPO_ISOLATION_QA.md`
- `docs/scout/SCOUT1_PUBLIC_IDENTITY_SOURCE_POLICY_V0.md`
- `docs/TASK_STATUS.md`
- `ops/tasks/current.json`
- `ops/tasks/roadmap.json`
- `ops/trains/current.json`
- `ops/trains/batches.json`

Optional Seed50R research input was present and read only as research input:

- `/tmp/123charts-seed50-source-research.md`
- `/tmp/123charts-seed50-candidate-hints-preview.jsonl`
- `/tmp/123charts-seed50-rejected-or-weak-hints.jsonl`

Seed50R artifact summary:

| Artifact | Rows | Use in PR163 |
| --- | ---: | --- |
| Candidate hint preview | 40 | Research evidence only; not ingested. |
| Rejected/weak hints | 12 | Discovery-risk evidence only; not ingested. |
| Source research report | 1 report | Policy input. |

## Seed 100 Source Mix

Recommended Seed 100 source mix:

| Source family | Target share | Target count | Use |
| --- | ---: | ---: | --- |
| GitHub / awesome lists / open-source AI projects | 40% | 40 | Strongest source for official repo identity and docs/source links. |
| Product Hunt / launch pages / public launch sources | 30% | 30 | Discovery and launch-context hints; revalidate against official source before use. |
| AI directories | 20% | 20 | Discovery hints only; cannot provide copied descriptions, category labels, scores, rankings, reviews, or recommendation text. |
| Manually selected Chinese outbound AI projects | 10% | 10 | Official global-facing site, GitHub org, docs, or product-owned source required. |

Quality rule:

Seed quality is more important than exact quota. PR164 may stop below 100 if only a smaller set has official-source evidence. Weak or directory-only hints must remain rejected/weak instead of being promoted to fill a quota.

## Allowed Source Types

| Source type | Allowed use | Promotion rule |
| --- | --- | --- |
| `official_site` | Project identity, official website URL, official docs link if present. | Can support `identity_candidate` if stable and public. |
| `official_docs` | Docs URL and product identity support. | Can support `identity_candidate` when linked to official site or repo. |
| `github_repo` | Public repository identity and open-source/source link. | Can support `identity_candidate` if ownership is credible and not name-only. |
| `github_org` | Project organization identity and repo discovery. | Requires project/site/repo cross-check in PR164. |
| `awesome_list` | Discovery only. | Must revalidate every project against official source. |
| `product_hunt` | Launch discovery and source URL. | Discovery hint only unless official website/docs/repo is confirmed. |
| `official_launch_page` | Product-owned launch identity. | Can support candidate identity if product-owned or official. |
| `directory_hint` | Discovery hint only. | Must remain weak until official source is found. |
| `manual_chinese_outbound` | Human-curated Chinese outbound source hint. | Requires official site, repo, docs, or product-owned source. |
| `manual_review_note` | Reviewer clarification. | Must include source URLs and cannot publish or promote records by itself. |

## Forbidden Source Types

Forbidden as direct source material:

- login-required pages;
- private communities or invite-only groups;
- cookies or browser sessions;
- analytics, billing, customer, CRM, or admin screens;
- screenshots of private tools;
- personal contact directories;
- scraped founder emails, phone numbers, or private social handles;
- competitor databases as production content sources;
- directory category/ranking/review pages as content sources;
- sponsored listing order or recommendation pages as scoring sources;
- WAF-bypassed, proxy-evaded, or access-control-bypassed pages.

If a source requires login, form submission, cookies, bypass behavior, or unusual probing, PR164 must reject or quarantine it.

## Allowed Identity Fields

Seed hints may contain only:

```text
project_name
official_website_url
github_url
docs_url
source_url
source_type
discovered_at
confidence
manual_note
```

Field rules:

- `project_name`: public spelling only; no legal entity inference.
- `official_website_url`: official or product-owned URL only.
- `github_url`: public repo/org URL only; do not infer ownership from name similarity alone.
- `docs_url`: official docs or official-site-linked docs only.
- `source_url`: the exact public source used for the hint.
- `source_type`: one allowlisted value.
- `discovered_at`: date of discovery or review.
- `confidence`: `strong`, `medium`, or `weak`.
- `manual_note`: original 123Charts reviewer note only; no copied third-party description.

## Forbidden Fields

Seed hints must not contain:

- competitor descriptions;
- competitor categories;
- rankings;
- scores;
- traffic;
- reviews;
- comments;
- recommendations;
- pricing claims copied from third-party listings;
- founder emails;
- phone numbers;
- private social handles;
- personal profiles unless public project-owned source policy later allows them;
- screenshots;
- customer names or logos;
- copied marketing copy;
- public status;
- review status;
- publish status;
- audit status;
- sitemap status;
- Growth status;
- investment, funding, revenue, user, or traction claims;
- cookies, sessions, tokens, credentials, or private telemetry.

## Directory-Hint Policy

AI directories may be used only as discovery hints.

Allowed:

- record directory URL as a `source_url` for a weak discovery hint;
- use directory presence to decide what official source to search for later;
- place directory-only hints in rejected/weak output for human review.

Forbidden:

- copy directory descriptions;
- copy categories;
- copy scores, ranking position, popularity labels, or sponsored order;
- copy reviews, comments, recommendations, or comparison language;
- treat directory-only evidence as official project identity;
- promote directory-only hints to public, reviewed, audited, or report-ready states.

PR164 must quarantine directory-only hints unless it independently finds official site, official docs, or public repo evidence.

## GitHub / Open-Source Policy

GitHub and open-source sources are the strongest Seed 100 input when identity can be verified.

Rules:

- prefer official repository or organization URLs;
- require repository-owner evidence, official docs, official website, or clear project identity;
- do not use repository name similarity alone for canonical identity;
- do not infer traction or quality from stars, forks, watchers, issues, contributors, or activity unless a later task explicitly authorizes that metric;
- do not copy README descriptions into 123Charts public copy;
- preserve repository URL as identity evidence only;
- forks, mirrors, wrappers, and template repos must be marked for canonical review.

## Product Hunt / Launch Page Policy

Product Hunt and launch pages are discovery inputs, not copy sources.

Allowed:

- source URL;
- product name hint;
- official website URL if visible;
- launch source family tag.

Forbidden:

- Product Hunt rankings;
- votes;
- reviews;
- comments;
- badges;
- maker/founder personal contact fields;
- copied tag/category labels;
- copied launch copy;
- claims of popularity or market standing.

PR164 must revalidate launch-page candidates against official websites, official docs, or public repos before keeping them in a normalized local pack.

## Chinese Outbound Policy

Chinese outbound Seed 100 candidates are allowed when the source is public and project-owned or officially controlled.

Allowed examples:

- official global-facing website;
- official English/Chinese docs;
- official GitHub organization or repository;
- official product page;
- product-owned API docs or developer portal.

Forbidden:

- copied Chinese directory text;
- private WeChat group information;
- scraped personal contact data;
- unverified financing, customer, revenue, or ranking claims;
- claims that a project is ready for overseas growth without reviewed evidence;
- public publication before review.

Manual notes must use original 123Charts wording and must not imply ranking, investment value, guaranteed traffic, guaranteed indexing, or public endorsement.

## Confidence Levels

| Confidence | Requirement | Allowed next handling |
| --- | --- | --- |
| `strong` | Official site/docs plus public repo or product-owned source. | Eligible for PR164 local normalization. |
| `medium` | Official site or official docs or launch source with official URL, but incomplete cross-check. | Eligible for PR164 local normalization with caution. |
| `weak` | Directory-only, conflicting, stale, or incomplete source evidence. | Keep rejected/weak or quarantine; do not promote. |

Confidence is not a score and must not be displayed publicly.

## Rejected / Weak Handling

Rejected or weak hints must be stored separately from accepted local packs.

Reasons include:

- `directory_only`;
- `copied_copy_risk`;
- `ranking_or_score_risk`;
- `private_contact_risk`;
- `ambiguous_identity`;
- `duplicate_identity`;
- `source_unavailable`;
- `official_source_missing`;
- `login_required`;
- `blocked_or_bypass_risk`.

Rejected/weak hints are not failed projects. They are incomplete evidence and must not become negative claims.

## Seed50R Use Policy

Seed50R may inform PR163/PR164 only as research input.

Observed Seed50R accepted preview:

- 40 rows;
- fields match the PR163 identity-only allowed field set;
- source types: 20 `github_repo`, 3 `product_hunt`, 6 `official_launch_page`, 6 `official_site`, 5 `manual_chinese_outbound`;
- confidence: 21 `strong`, 19 `medium`.

Observed Seed50R rejected/weak file:

- 12 rows;
- all `directory_hint`;
- not eligible for direct promotion.

Rules:

- PR164 must not copy the preview directly into a committed record set;
- PR164 must revalidate and normalize;
- PR164 should not force exact 100 if quality is insufficient;
- Seed50R must not enter `88cn-index-data`;
- Seed50R must not enter public routes, sitemap, Public API, MCP, reports, or Growth.

## No-Public Rule

Seed hints and local Seed packs are private/backstage until a later reviewed publication task explicitly approves public use.

Forbidden surfaces:

- public frontend;
- sitemap;
- Public API;
- MCP;
- `/landscape`;
- `/tasks`;
- alternatives pages;
- public report pages;
- report registry;
- public JSON;
- distribution packs;
- data repo exports.

## PR164 Handoff

PR164 / SCOUT_SEED1 may proceed next only as a local-only identity hint local pack task.

PR164 must:

- use this policy as the allowed field and source contract;
- use Seed50R only as research input if present;
- revalidate and normalize candidates;
- preserve accepted and rejected/weak separation;
- output under `/tmp` unless a later explicit scope allows committed summary only;
- avoid Supabase, staging, production, data repo, public routes, sitemap, Public API, MCP, audit triggers, and Growth.

Expected PR164 result:

- `PASS_SCOUT_SEED_LOCAL_PACK`; or
- `PASS_SCOUT_SEED40_LOCAL_PACK_WITH_FINDINGS` if only the Seed50R-quality 40-candidate local pack is justified.

## Validation Results

Validation after PR163 edits:

| Check | Result |
| --- | --- |
| `npm run agent:scope:check -- PR163` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run verify:day0` | PASS |
| `npm run policy:scan` | PASS |
| `npm run third-party:check` | PASS |
| `npm run agent:batch:check` | PASS |
| `npm run agent:train-plan:check` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run agent:gate` | PASS |
| `node scripts/check-landscape-boundary.mjs` | PASS |
| `npm run landscape:check` | PASS |
| `node scripts/check-sector-density-boundary.mjs` | PASS |
| `node scripts/check-task-discovery-boundary.mjs` | PASS |
| `node scripts/check-alternatives-canonical.mjs` | PASS |
| `git diff --check` | PASS |

## What This PR Does Not Do

- Does not start PR164.
- Does not create or commit Seed 100 records.
- Does not ingest Seed50R.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not create public pages, sitemap entries, public JSON, Public API, MCP, report registry, or distribution surfaces.
- Does not trigger audit.
- Does not perform external HTTP fetches.
- Does not run a crawler.
- Does not create Supabase migrations.
- Does not write Supabase, staging, or production data.
- Does not create Redis or queues.
- Does not deploy, SSH, or mutate cloud/server state.
- Does not edit `.env`, read secrets, or print secrets.
- Does not mutate FermatMind repos.
- Does not start Growth, BETA, I18N, OPS10A, or PR101.
