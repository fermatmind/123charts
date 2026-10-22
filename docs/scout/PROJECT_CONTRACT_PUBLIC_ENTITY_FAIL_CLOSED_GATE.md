# PROJECT_CONTRACT Public Project Entity Contract + Fail-Closed Publish Gate

Status: validation passed
Task: PR182 / PROJECT_CONTRACT
Result: GO_CONTROL_PANEL_WITH_PROJECT_CONTRACT_READY
Date: 2026-06-21

## Result

PR182 defines the permanent 123Charts backstage project data contract and fail-closed publication gate.

Result: `GO_CONTROL_PANEL_WITH_PROJECT_CONTRACT_READY`.

This is a contract-only PR. It does not create a Supabase migration, write staging or production data, create frontend project pages, add sitemap entries, expose Public API or MCP project assets, run Agent/audit, mutate the data repo, deploy, or publish projects.

## Scope

In scope:

- define the Entity -> Repo -> Web model;
- define Source Evidence as the root evidence layer;
- define lifecycle states and allowed transitions;
- define field visibility categories;
- define the only frontend-consumable `published_projection`;
- define the 11 public signal chip slots;
- define sitemap, SEO, Public API, and MCP fail-closed gates;
- define featured/promoted separation;
- define a future migration draft policy without creating a migration;
- carry PR181 manual review findings into the contract;
- register PR183 / CONTROL_PANEL as the next task.

Out of scope:

- Supabase migration files;
- database, staging, or production writes;
- private seed artifact commits;
- raw seed rows, source evidence rows, or canonical candidate rows;
- frontend routes, admin UI, sitemap runtime, Public API, MCP, crawler, worker, Agent, audit, deploy, or server/cloud mutation;
- mutation of `/Users/rainie/Desktop/88cn-index-data`.

## PR181 Seed Manifest Handoff Summary

PR181 verified the repaired private Seed50 artifact as a checksum-verified private handoff input.

| Metric | Count / value |
| --- | --- |
| Accepted private seed rows | 50 |
| Needs-review rows | 25 |
| Rejected rows | 12 |
| Source evidence rows | 114 |
| Canonical candidate rows | 50 |
| GitHub-backed candidates | 20 / 50 |
| Strict open-source declared candidates | 5 / 50 |
| Mixed candidates | 15 / 50 |
| Commercial candidates | 30 / 50 |
| Missing-docs review rows | 6 |
| Canonical review rows | 10 |
| Reachability review rows | 11 |
| Manifest hash | `sha256:08a9fea2875b8c4eef7c96f0c0fc1bfebdecf9d2516fa9d1be949f2ee4f8bd8c` |

These facts are contract inputs only. They do not make any project public, audit-ready, report-ready, sitemap-eligible, Public API eligible, or MCP eligible.

## Project Entity Model

Purpose: the canonical backstage project body.

Draft fields:

| Field | Visibility | Rule |
| --- | --- | --- |
| `project_entity_id` | backstage_only | Stable internal ID. |
| `display_name` | admin_review_only | Human-facing candidate name; not public until projected. |
| `normalized_name` | backstage_only | Matching key only; never a public claim. |
| `organization_name` | admin_review_only | Separate organization identity from product identity. |
| `product_name` | admin_review_only | Separate product identity from organization/model/platform identity. |
| `primary_category` | admin_review_only | Candidate category until manual review. |
| `collection_tags` | admin_review_only | Candidate grouping tags until manual review. |
| `open_source_or_commercial` | admin_review_only | Must distinguish GitHub-backed, strict open-source declaration, mixed, commercial, unknown. |
| `lifecycle_status` | backstage_only | Controls publication eligibility. |
| `review_state` | backstage_only | Controls manual review readiness. |
| `created_at` | backstage_only | Internal chronology. |
| `updated_at` | backstage_only | Internal chronology. |

Rules:

- A project entity is not automatically public.
- A project entity may exist backstage before publication.
- A project entity must not be exposed unless a `published_projection` exists.
- Ambiguous identity states must be represented instead of collapsed.
- Organization, product, model family, and platform records must not collapse into one ambiguous entity. Example: OpenAI, ChatGPT, GPT, and OpenAI API require separate identity scope decisions.

## Repo Asset Model

Purpose: GitHub, source-code, and repository relationship.

Draft fields:

| Field | Visibility | Rule |
| --- | --- | --- |
| `repo_asset_id` | backstage_only | Stable internal ID. |
| `project_entity_id` | backstage_only | Links to one project entity. |
| `github_url` | public_source_link after review | Public only if reviewed and source-backed. |
| `repo_owner` | backstage_only | Normalization key. |
| `repo_name` | backstage_only | Normalization key. |
| `repo_visibility` | admin_review_only | Public/private/unknown label for review only. |
| `repo_relationship` | admin_review_only | One allowed enum below. |
| `source_evidence_id` | backstage_only | Evidence root. |
| `created_at` | backstage_only | Internal chronology. |
| `updated_at` | backstage_only | Internal chronology. |

Allowed `repo_relationship` values:

- `primary_repo`
- `official_org_repo`
- `related_repo`
- `model_repo`
- `docs_repo`
- `not_applicable`
- `unknown`

Rules:

- GitHub-backed is not the same as strictly open source.
- Mixed projects must not be mislabeled as open source.
- Repo asset can be absent for commercial products.
- Repo asset cannot by itself create publication eligibility.

## Web Asset Model

Purpose: official website, docs, API docs, launch page, organization page, or directory hint relationship.

Draft fields:

| Field | Visibility | Rule |
| --- | --- | --- |
| `web_asset_id` | backstage_only | Stable internal ID. |
| `project_entity_id` | backstage_only | Links to one project entity. |
| `url` | public_source_link after review | Public only if reviewed and safe. |
| `domain` | backstage_only | Normalization key. |
| `asset_role` | admin_review_only | One allowed enum below. |
| `is_official` | admin_review_only | Must be true for official-source publication proof. |
| `source_evidence_id` | backstage_only | Evidence root. |
| `created_at` | backstage_only | Internal chronology. |
| `updated_at` | backstage_only | Internal chronology. |

Allowed `asset_role` values:

- `official_website`
- `official_org`
- `docs`
- `api_docs`
- `launch_page`
- `directory_hint`
- `unknown`

Rules:

- `directory_hint` is discovery context only.
- `directory_hint` can never be a content source.
- `directory_hint` alone cannot allow publication.
- Official sources must be separated from directory hints.

## Source Evidence Contract

Purpose: Source Evidence is the root evidence layer for identity, official-source links, audit observations, and review decisions.

Draft fields:

| Field | Visibility | Rule |
| --- | --- | --- |
| `source_evidence_id` | backstage_only | Stable evidence ID. |
| `project_entity_id` | backstage_only | Links evidence to one entity or candidate. |
| `source_url` | public_source_link after review | Public only if reviewed and safe. |
| `source_role` | admin_review_only | Role assigned by reviewer or future staging workflow. |
| `source_type` | admin_review_only | Official site, docs, repo, launch page, directory hint, unknown. |
| `is_official_source` | admin_review_only | Required for publication proof. |
| `observed_at` | admin_review_only | Timestamp for freshness and TTL. |
| `evidence_hash` | backstage_only | Integrity proof; not public. |
| `claim_boundary` | admin_review_only | One allowed enum below. |
| `visibility` | backstage_only | Controls exposure category. |
| `created_at` | backstage_only | Internal chronology. |
| `updated_at` | backstage_only | Internal chronology. |

Allowed `claim_boundary` values:

- `identity_only`
- `official_docs_link`
- `organization_context`
- `directory_hint_only`
- `audit_observation_source`
- `unknown`

Rules:

- Source evidence proves only the assigned claim boundary.
- Directory pages can only prove `directory_hint_only`.
- Directory sources cannot prove project summary, quality, category truth, or recommendation.
- Copied third-party text must not enter Source Evidence.
- `evidence_hash` is private/backstage by default.

## Lifecycle State Machine

Primary path:

```text
seed_hint
-> identity_candidate
-> canonical_candidate
-> audit_pending
-> audit_observation
-> review_ready
-> published
-> stale / archived
```

Side states:

- `quarantined`
- `rejected`

Full enum:

- `seed_hint`
- `identity_candidate`
- `canonical_candidate`
- `audit_pending`
- `audit_observation`
- `review_ready`
- `published`
- `stale`
- `archived`
- `quarantined`
- `rejected`

Rules:

- All records default private.
- Only `published` may produce a `published_projection`.
- `stale` is noindex by default in MVP.
- `archived` is noindex by default in MVP unless a later reviewed policy changes it.
- `quarantined` and `rejected` are never public.
- `review_ready` is still not public.

## Allowed State Transitions

| From | To | Required condition |
| --- | --- | --- |
| `seed_hint` | `identity_candidate` | Seed manifest row verified. |
| `identity_candidate` | `canonical_candidate` | Source evidence is enough for identity. |
| `canonical_candidate` | `audit_pending` | No unresolved canonical blocker. |
| `audit_pending` | `audit_observation` | Agent/audit produces a structured observation under an approved later task. |
| `audit_observation` | `review_ready` | Observation schema is valid and no no-public blocker remains. |
| `review_ready` | `published` | Manual review, original summary, public field checks, and fail-closed gates pass. |
| Any pre-published state | `quarantined` | Identity unclear, source blocked/dead, evidence insufficient, reachability issue, or copy risk. |
| Any pre-published state | `rejected` | Fake, duplicate pollution, non-AI, no official source, or copied-content risk. |
| `published` | `stale` | TTL expired or source signal outdated. |
| `stale` | `published` | Re-review passes. |
| `published` | `archived` | Human archive decision or project deprecated/dead evidence. |

Manual review is mandatory for transition to `published`.

No Agent can directly set `published`.

## Field Visibility Matrix

| Category | Meaning | Example fields |
| --- | --- | --- |
| `private_seed_only` | Private handoff input; never frontend input. | Raw seed row, row hash, shard hash. |
| `backstage_only` | Internal identity, hash, state, and provenance control. | `project_entity_id`, `evidence_hash`, `manifest_hash`, internal confidence, canonical ambiguity details. |
| `admin_review_only` | Visible to reviewers before publication; not public. | Reviewer notes, review state, quarantine/rejected detail, reachability failure detail. |
| `published_projection` | Reviewed public-safe entity fields. | `slug`, `project_name`, `original_summary`, `official_website_url`, `github_url`, `docs_url`, `primary_category`, `collection_tags`, `open_source_or_commercial`, `public_signal_chips`, `last_reviewed_at`, `lifecycle_status`. |
| `public_chip` | Reviewed public signal chip slots only. | Website reachable, docs linked, review status. |
| `public_source_link` | Reviewed public-safe official links only. | Official website, docs URL, GitHub URL. |
| `never_public` | Never expose. | Raw audit payload, private notes, copied third-party content, private artifact path. |

Backstage or never-public fields include:

- raw seed row;
- raw source evidence payload;
- raw audit payload;
- private notes;
- reviewer notes;
- quarantine reason detail;
- rejected reason detail;
- `row_hash`;
- `shard_hash`;
- `manifest_hash`;
- internal confidence score;
- internal canonical ambiguity details;
- internal reachability failure details;
- directory source metadata;
- copied third-party content;
- private artifact path.

## Published Projection Contract

Purpose: `published_projection` is the only surface that frontend project pages may consume.

Required fields:

- `slug`
- `project_name`
- `original_summary`
- `official_website_url`
- `github_url`
- `docs_url`
- `primary_category`
- `collection_tags`
- `open_source_or_commercial`
- `public_signal_chips`
- `last_reviewed_at`
- `lifecycle_status`

Rules:

- It must be derived from reviewed data only.
- It must not include raw audit payload.
- It must not include seed, canonical, or internal fields.
- It must not include copied third-party descriptions.
- It must not include ranking, score, best/top, or recommendation claims.
- It must fail closed if review state is not `published`.
- Future `/projects/[slug]` behavior must 404 for non-published records.

## 11 Public Signal Chip Slots

Required slots:

| Slot | Allowed values | Rule |
| --- | --- | --- |
| Website reachable | `checked`, `not_detected`, `needs_recheck`, `pending_review` | Positive only if source-backed/reviewed. |
| Official site linked | `checked`, `not_detected`, `pending_review` | Official-source proof required. |
| Docs linked | `checked`, `not_detected`, `not_applicable`, `pending_review` | Docs absence must not become a negative claim. |
| GitHub linked | `checked`, `not_detected`, `not_applicable`, `pending_review` | GitHub-backed is not strict open-source proof. |
| Open-source / Commercial | `checked`, `not_applicable`, `pending_review`, `needs_recheck` | Must distinguish mixed/unknown. |
| Canonical detected | `checked`, `not_detected`, `pending_review`, `needs_recheck` | Ambiguity blocks publication. |
| Sitemap detected | `checked`, `not_detected`, `not_applicable`, `needs_recheck` | Detection only, not SEO promise. |
| JSON-LD detected | `checked`, `not_detected`, `not_applicable`, `needs_recheck` | Detection only. |
| SoftwareApplication schema detected | `checked`, `not_detected`, `not_applicable`, `needs_recheck` | Detection only. |
| Last reviewed | `checked`, `needs_recheck`, `pending_review` | Must show reviewed date when public. |
| Review status | `checked`, `pending_review`, `needs_recheck` | Cannot imply automated publication. |

Forbidden chip values or claims:

- `score`
- `rank`
- `best`
- `top`
- `verified as best`
- `guaranteed visibility`
- `guaranteed ChatGPT citation`
- `guaranteed indexing`
- `paid boost`

Rules:

- Chips are public only if source-backed or reviewed.
- Pending chips can be shown only when not misleading.
- Missing/unknown cannot be inflated into positive signals.
- Chip display cannot be influenced by featured/promoted/payment fields.

## Sitemap / SEO Fail-Closed Gate

Sitemap eligibility requires all conditions:

- `lifecycle_status = published`;
- `published_projection` exists;
- `original_summary` exists;
- `official_website_url` exists;
- at least one official Source Evidence exists;
- canonical slug confirmed;
- no copied third-party content;
- no quarantine, rejected, stale, or archived blocker;
- SEO indexability flag is true.

Forbidden in sitemap:

- `seed_hint`
- `identity_candidate`
- `canonical_candidate`
- `audit_pending`
- `audit_observation`
- `review_ready`
- `quarantined`
- `rejected`
- `stale` by default
- `archived` by default
- `directory_hint_only`
- missing official source
- missing `original_summary`
- missing canonical slug
- copied-content risk

Rules:

- Fail closed.
- If uncertain, noindex.
- Faceted/filter combinations remain noindex unless explicitly approved later.
- Collection pages must be finite and reviewed.

## Public API / MCP Gate

MVP default:

- Public API disabled for project assets.
- MCP disabled for project assets.

Future API/MCP payloads may be sourced only from:

- `published_projection`;
- `public_signal_chips`;
- public source links;
- `last_reviewed_at`.

Forbidden unless a later explicit review changes policy:

- raw seed;
- raw audit;
- review notes;
- hash chain;
- private artifact path;
- quarantine/rejected details;
- internal confidence;
- internal canonical ambiguity;
- raw evidence payload.

## Featured / Promoted Separation

Allowed future UI-only fields:

- `featured_visual_badge`
- `sponsored_slot`
- `promoted_campaign_id`

These fields must never affect:

- `organic_sort`;
- `source_confidence`;
- `public_signal_chips`;
- sitemap inclusion;
- Public API ordering;
- MCP payload ordering;
- AI/search visibility claims;
- `review_state`;
- `lifecycle_status`.

Required rule:

Paid visibility is UI-only and cannot alter public signal integrity.

## Migration Draft Policy

PR182 does not create a physical migration.

No Supabase staging migration is applied in PR182.

No database writes occur in PR182.

Physical Supabase staging migration requires PR182A/B or another human-approved checkpoint.

Future possible tables/entities:

| Future entity | Purpose | Important fields | Visibility | Public eligibility | Rollback / retention expectation |
| --- | --- | --- | --- | --- | --- |
| `project_entities` | Canonical backstage project body. | IDs, names, lifecycle, review state. | Backstage/admin. | Only through `published_projections`. | Tombstone or archive with review history. |
| `repo_assets` | Repository relationship. | GitHub URL, owner, repo, relationship, evidence ID. | Backstage/admin; reviewed links may project. | Never by itself. | Detach or mark stale without deleting entity. |
| `web_assets` | Website/docs/launch/directory relationship. | URL, domain, role, official flag, evidence ID. | Backstage/admin; reviewed official links may project. | Official reviewed assets only. | Mark stale, preserve previous reviewed snapshot. |
| `source_evidences` | Root evidence layer. | Source URL, type, official flag, observed date, hash. | Backstage by default. | Public link only after review. | Retain hash/provenance, hide raw payload. |
| `audit_observations` | Structured observations from approved future audit. | Observation type, timestamp, TTL, failure class. | Backstage/admin. | Public chips only after review. | Expire to stale; preserve last successful snapshot. |
| `review_decisions` | Human review outcomes. | Reviewer, decision, reviewed fields, blockers. | Admin only. | Enables projection but is not public itself. | Immutable audit trail or redacted tombstone. |
| `published_projections` | Public-safe frontend source. | Slug, original summary, official links, chips, reviewed date. | Public after review. | Yes, if all gates pass. | Remove from sitemap/API/MCP on stale/archive. |
| `project_collection_links` | Reviewed finite collection membership. | Entity ID, collection slug, status. | Backstage/admin until projected. | Only reviewed finite collections. | Disable link without deleting entity. |
| `project_alternative_candidates` | Future reviewed comparison candidate mapping. | Entity IDs, canonical pair, review state. | Backstage/admin. | Only via later approved alternatives policy. | Remove candidate if ambiguity appears. |

No-public default:

- new rows default backstage/private;
- no row enters `published_projections` without manual review;
- no table becomes a sitemap, API, MCP, report, or data-repo source by default.

## Manual Review Findings Carried From PR181

| Finding | Count | PR182 handling |
| --- | ---: | --- |
| Needs-review rows | 25 | Represented by `review_state` and fail-closed transitions. |
| Canonical review rows | 10 | Blocks `canonical_candidate -> audit_pending` until resolved. |
| Missing-docs review rows | 6 | Blocks docs chip positivity and may block sitemap eligibility where docs are required by review policy. |
| Reachability review rows | 11 | Blocks reachable chip positivity and may keep record `needs_recheck` or `quarantined`. |

These findings are not blockers for PR182 because PR182 defines the contract. They remain blockers for future publication.

## PR183 / CONTROL_PANEL Handoff

Register but do not start:

PR183 / CONTROL_PANEL - Minimal Admin Review UI + Manual State Switcher v0

Purpose:

- create a minimal admin review surface for project CRUD;
- display source links and audit chips;
- allow neutral original summary editing;
- provide a manual state switcher;
- preserve published-only frontend behavior.

PR183 must inherit:

- no auto-publish;
- no auto-outreach;
- no copied third-party content;
- manual review required for `published`;
- fail-closed sitemap, API, MCP, and frontend publication gates.

## Sidecar Findings

No sidecar-blocking issue was found.

Open findings carried forward:

- PR183 requires a human-reviewed admin surface before projects can move through manual state transitions.
- Any physical migration must be split into PR182A/B or another explicit checkpoint.
- PR181 manual review findings remain private and publication-blocking.

## Validation Results

Pre-change baseline:

- `npm run verify:day0`: PASS
- `npm run agent:redact:check`: PASS
- `npm run agent:batch:check`: PASS
- `npm run agent:train-plan:check`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run agent:gate`: PASS
- `node scripts/check-landscape-boundary.mjs`: PASS
- `npm run landscape:check`: PASS
- `node scripts/check-sector-density-boundary.mjs`: PASS
- `node scripts/check-task-discovery-boundary.mjs || true`: PASS
- `node scripts/check-alternatives-canonical.mjs || true`: PASS

PR182 final validation:

- `npm run verify:day0`: PASS
- `npm run policy:scan`: PASS
- `npm run third-party:check`: PASS
- `npm run agent:redact:check`: PASS
- `npm run agent:batch:check`: PASS
- `npm run agent:train-plan:check`: PASS
- `npm run agent:scope:check -- PR182`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run agent:gate`: PASS
- `node scripts/check-landscape-boundary.mjs`: PASS
- `npm run landscape:check`: PASS
- `node scripts/check-sector-density-boundary.mjs`: PASS
- `node scripts/check-task-discovery-boundary.mjs || true`: PASS
- `node scripts/check-alternatives-canonical.mjs || true`: PASS
- `git diff --check`: PASS
- `jq empty ops/tasks/current.json ops/tasks/roadmap.json ops/trains/current.json ops/trains/batches.json`: PASS
- `git -C /Users/rainie/Desktop/88cn-index-data status --short --branch`: clean

## What This PR Does Not Do

- Does not create Supabase migrations.
- Does not write Supabase, staging, or production data.
- Does not commit private seed artifacts.
- Does not commit raw 50 project rows.
- Does not commit source evidence rows.
- Does not commit canonical candidate rows.
- Does not create public project pages.
- Does not change sitemap runtime.
- Does not expose Public API or MCP project assets.
- Does not create admin UI implementation.
- Does not run Agent/audit, crawler, worker, or external HTTP.
- Does not mutate `88cn-index-data`.
- Does not deploy or mutate server/cloud state.
- Does not start PR183.
