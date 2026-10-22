# OpenAI OSS Evidence Dossier v0

## Status

This dossier is an internal evidence packet for future open infrastructure support conversations. It is not an external application, not a launch request, and not a claim of endorsement by OpenAI or any other organization.

The packet contains repo-grounded facts only. It does not include private data, secret material, unverified traction metrics, or any request to publish, deploy, expose a public feed, or enable MCP.

## Project Summary

123Charts is the Free AI Project Growth Index. Phase 1 creates a public growth-signal index for free AI projects with project discovery, founder claim workflows, editorial review, explainable scoring, and staged public-data import.

Current Phase 1 boundaries are:

- public project profiles
- public growth signals
- claim and review workflows
- editor-selected discovery
- explainable scoring
- staged public data import

Current Phase 1 exclusions are:

- automatic publication
- private-data ingestion
- paid influence on Signal Score
- unreviewed claims
- external source crawling during public page render
- direct promotion from imported data to public project records

## Evidence Sources in This Repo

The following repo files define the current evidence base:

- `docs/00_PROJECT_BRIEF.md`: Phase 1 purpose, operating principles, and product boundaries.
- `docs/01_AGENT_OPERATING_MODEL.md`: agent roles and review boundaries.
- `docs/06_FORBIDDEN_PATTERNS.md`: public wording restrictions and safer alternatives.
- `docs/08_BATCH_PIPELINE.md`: bounded queue and batch-run expectations.
- `docs/09_EDITORIAL_PIPELINE.md`: AI draft limits and human review requirements.
- `docs/10_DATA_CONTRACT.md`: public JSON scope, excluded data, staging boundary, and unknown-value policy.
- `docs/14_OPEN_SOURCE_REUSE_POLICY.md`: upstream reuse and notice expectations.
- `ops/tasks/roadmap.json`: staged task registry and PR train definitions.
- `docs/TASK_STATUS.md`: completed implementation and QA status by project area.
- `docs/62_OSS_MAINTAINER_AUTOMATION_V0.md`: maintainer-controlled automation policy added in PR55.

## Governance Controls

123Charts currently uses a policy-first operating model:

- roadmap tasks declare allowed paths, forbidden paths, validations, deployment mode, human checkpoint status, payment status, and MCP status
- `agent:scope:check` limits active work to the registered task scope
- `agent:redact:check` blocks secret-like material and credential leakage
- `policy:scan` blocks restricted public-copy language outside allowlisted policy files
- `third-party:check` verifies open-source reuse notice boundaries
- `agent:batch:check` and `agent:train-plan:check` validate train registration and execution order
- `agent:gate` runs the standard local validation stack before merge

Human review remains required for public editorial notes, lifecycle promotion, and any publication decision.

## Data Boundary

The documented data boundary is public-only by default.

Allowed public JSON fields are limited to project name, official website, category slug, one-line description, public repository URL, public docs URL, public pricing URL, public launch URL, and public founder social URL.

Excluded material includes private contact data, private revenue proof, payment screenshots, keys, analytics exports, bank records, identity documents, customer lists, and login credentials.

External JSON must enter import staging before any admin review. It must not write directly to primary project records and must not create published project pages directly.

Public rendering must use reviewed local snapshots. Public project pages must not call external sources at request time.

## Editorial Boundary

The editorial pipeline allows AI-assisted drafts only. Public editorial notes require human review.

Editorial content must not invent metrics, customers, financing claims, rankings, partnerships, or private facts. Unknown information must stay visibly unknown using documented values such as:

- Not verified
- Public signals only
- Not enough data
- Founder not claimed
- Source unavailable

## Completed Work Relevant to Open Infrastructure

Completed repo work that supports a cautious open-infrastructure posture includes:

- external import staging with re-validation, normalization, fingerprint deduplication, admin sync API, and admin imports page
- external import quarantine summaries with accepted, quarantined, duplicate, and rejected classifications
- sanitized Seed 100 machine-readability audit dataset generation
- static aggregate report pages from reviewed local artifacts
- report archive and sitemap hardening for published report records
- public copy guard extensions across editorial, scouted, conversion CTA, and claim/correct/remove surfaces
- admin-reviewed scouted profile states with noindex defaults and no public feed exposure
- admin-only conversion counters and pivot gates
- lifecycle archive boundaries and disabled signal alert rules
- draft/staged changelog boundaries with admin review states
- static read-only backers landing page with no payment or commitment flow
- maintainer-controlled OSS automation for local summaries and label suggestions only

## PR55 Maintainer Automation Boundary

PR55 added maintainer automation scaffolding that is local and maintainer-controlled.

It allows:

- local payload validation
- local check summaries
- label suggestions
- maintainer checklists

It disables:

- external PR comments
- external issue creation
- approval events
- merge events
- credential requests
- data repo writes
- payment events
- MCP surfaces
- external model calls

The PR55 checker is `npm run oss-maintainer:check`.

## Validation Evidence

The current train uses the existing local validation stack. For this dossier, required validations are:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run agent:redact:check`
- `npm run agent:scope:check -- PR56`

Additional train and build validations may be run before merge:

- `npm run agent:batch:check`
- `npm run agent:train-plan:check`
- `node scripts/agent/train-plan-check.mjs --batch TRAIN-PR55-PR56-OSS-EVIDENCE`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run agent:gate`

## Non-Claims

This dossier does not claim:

- OpenAI endorsement
- external program acceptance
- measured adoption
- user, star, traffic, revenue, or customer counts
- public API availability
- MCP availability
- production launch status
- external submission status

## Future Public API and MCP Caution

Public API and MCP tasks are registered as later roadmap work. They are intentionally separate from this dossier and must remain behind their own task scopes, validations, and human checkpoints where required.

This PR does not start PR57, PR58, PR59, or PR60.

## Current Limitations

- Evidence is limited to repo-local documents, task registry entries, and local validation outputs.
- This packet has not been submitted to any external organization.
- No external model provider API was called to create or validate the dossier.
- No production credentials, private user records, private founder records, payment data, or data-repo mutations are involved.
