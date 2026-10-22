# TRAFFIC6A Report Distribution Pack Boundary v0

Status: validation passed

PR wrapper: PR128

Result: GO_PR129_LOCAL_DRAFT_REPORT_DISTRIBUTION_PACK

## Scope

TRAFFIC6A defines the safe boundary for PR129. This task is docs/status metadata only. It does not implement a generator, create public pages, modify report runtime, send messages, post to external platforms, log in to external services, write CRM records, collect PII, export browser sessions, deploy, or mutate the data repository.

## Existing Report Inputs

PR129 may read only published local report metadata and existing public report routes from the 123Charts repo:

- `lib/reports/published-reports.ts`
- `lib/demo-reports.ts`
- `lib/reports/seed-100-readiness-report.ts`
- `lib/reports/submission-channels-report.ts`

PR129 must not read from `/Users/rainie/Desktop/88cn-index-data`, Supabase, analytics, CRM, email inboxes, social accounts, browser cookies, browser sessions, private contact lists, or external APIs.

## Approved PR129 Output Model

PR129 may implement a local draft package generator only.

Approved output destination:

- default: `/tmp/123charts-report-distribution-pack`
- optional CLI override: another local temp directory outside the repo

Approved output files:

- `manifest.json` with generated file names, source report slugs, generated timestamp, and safety flags;
- `README.md` explaining local-draft-only usage;
- one markdown draft per published report under `drafts/`;
- optional `links.json` containing public report URLs and titles only.

The generated files are local artifacts and must not be committed unless a later task explicitly changes the allowed paths. PR129 may include example output names in documentation, but not generated artifacts under the repo.

## Supported Draft Channels

Supported channels are draft formats only:

| Channel | Allowed content | Forbidden behavior |
| --- | --- | --- |
| `internal_brief` | Markdown summary for internal review | CRM write, owner assignment, or customer record creation |
| `newsletter_draft` | Markdown newsletter-style draft from published report metadata | Email send, mailing list upload, subscriber export, or tracking pixel |
| `social_draft` | Markdown short-form copy for human review | API posting, platform login, scheduling, DM send, or account scraping |
| `website_snippet` | Markdown snippet and public report links for manual CMS review | CMS write, deploy, sitemap update, or public route creation |

No generated draft may claim distribution, indexing, ranking, traffic, funding, revenue, customer adoption, or conversion outcomes.

## Required Safety Flags

Every generated manifest must include explicit booleans:

- `externalWrites: false`
- `emailSend: false`
- `dmSend: false`
- `socialPost: false`
- `platformLogin: false`
- `crmWrite: false`
- `piiIncluded: false`
- `browserSessionExport: false`
- `dataRepoMutation: false`
- `deploy: false`

PR129 should fail if any generated artifact contains direct personal contact details, private URLs, secrets, tokens, cookies, session exports, analytics exports, CRM IDs, mailing-list fields, or call-to-action language implying automated delivery.

## PR129 Implementation Contract

PR129 may add:

- `lib/traffic-distribution/**`
- `scripts/generate-report-distribution-pack.mjs`
- a package script that runs the local generator
- PR129 docs/status updates

PR129 must:

- derive source reports from local published report helpers only;
- write local draft artifacts only to `/tmp` by default;
- include a dry-run or summary mode suitable for QA;
- keep draft text neutral and review-oriented;
- include checker logic inside the generator or library that rejects forbidden output patterns;
- avoid app routes, components, report page changes, sitemap runtime changes, API routes, MCP routes, deploy config, Supabase, data repo, screenshots, public assets, and package-lock changes.

## PR130 QA Handoff

PR130 should run the PR129 generator into `/tmp`, inspect manifest safety flags, inspect generated draft files, verify no external-write path exists, verify repo scope remains clean, and document findings only.

## Non-Goals

- no automatic posting;
- no email sending;
- no DM sending;
- no social scheduling;
- no CRM integration;
- no contact enrichment;
- no browser automation;
- no browser session export;
- no data repo write;
- no public route, sitemap, or deploy change;
- no report publication state changes.
