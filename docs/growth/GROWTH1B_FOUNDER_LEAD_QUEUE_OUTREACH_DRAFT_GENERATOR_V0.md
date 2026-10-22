# GROWTH1B Founder Lead Queue + Outreach Draft Generator v0

Date: 2026-06-20
Role: Codex-Research
Result: PASS_LOCAL_DRAFT_CONTRACT_ONLY
Next task: GROWTH1Q Founder Acquisition Agent QA / No-Auto-Send QA v0

## Scope

GROWTH1B defines the local-only founder acquisition draft packet that a future
generator may emit. The current roadmap scope forbids `scripts/**`, runtime
code, package metadata, public assets, routes, Supabase, deployment files, and
data-repo writes, so this task documents the generator contract instead of
adding executable generator code.

The draft packet is not a contact database. It does not collect private contact
fields, enrich contacts, send messages, post externally, log in to platforms,
write CRM records, store PII, export browser sessions, call platform APIs,
write Supabase, mutate `/Users/rainie/Desktop/88cn-index-data`, or deploy.

## Input Contract

A compliant local draft packet may read only reviewed public 123Charts context:

- project slug and public 123Charts project path;
- public project name and reviewed one-line summary;
- category, stack, vertical, collection, task, or alternatives route context;
- public report title, slug, kind, date, and path;
- reviewed public official site URL already present in local repo data;
- local editorial notes that are already committed to this repository.

The packet must not read emails, phone numbers, personal handles, direct
messages, CRM exports, customer lists, private founder materials, analytics
dashboards, browser profiles, browser sessions, unreviewed crawl output, or
data-repo files.

## Output Contract

A compliant local packet contains only:

- `manifest.json`, with source context and no-send safety flags;
- `README.md`, explaining the packet is for human review only;
- `review-queue.md`, with finite public project review cards;
- `project-summaries.json`, with public-safe project summary fields only;
- `drafts/*.md`, with outreach-style copy templates that remain unsent;
- `manual-review-checklist.md`;
- `redaction-checklist.md`;
- `decision-log-template.md`, for humans to copy outside Codex if needed.

No output file may be committed by default. If a future executable generator is
approved, it must write under `/tmp` or another ignored local path by default.

## Public-Safe Project Card Template

```json
{
  "projectSlug": "aurora-code",
  "projectPath": "/projects/aurora-code",
  "projectName": "Aurora Code",
  "reviewedSummary": "Reviewed public one-line project summary from 123Charts.",
  "routeContext": [
    "/landscape",
    "/tasks/evaluate-ai-builder-infrastructure"
  ],
  "sourceReports": [
    "/reports/weekly-ai-project-signals-2026-06-21"
  ],
  "contactFieldsIncluded": false,
  "requiresHumanReview": true
}
```

## Manifest Template

```json
{
  "task": "GROWTH1B",
  "mode": "local_draft_only",
  "packetType": "founder_acquisition_review_packet",
  "safetyFlags": {
    "externalWrites": false,
    "emailSend": false,
    "dmSend": false,
    "socialPost": false,
    "platformLogin": false,
    "crmWrite": false,
    "piiIncluded": false,
    "browserSessionExport": false,
    "contactEnrichment": false,
    "dataRepoMutation": false,
    "deploy": false
  }
}
```

## Draft Templates

All examples are local drafts only. A human must edit, approve, and execute any
external use outside Codex.

### Founder Review Note

```text
Draft only - human review required.

123Charts has a public project page for {project_name}:
{project_path}

The page is based on reviewed public signals and can be checked for accuracy or
correction needs. This draft includes no private contact data and must not be
sent by Codex.
```

### Correction / Claim Prompt

```text
Draft only - human review required.

If you are the founder or maintainer of {project_name}, you may review the
public profile at {project_path}. A human reviewer should confirm the project
summary, official site, and public signal context before any external use.
```

### Manual Follow-Up Note

```text
Draft only - human review required.

Possible human follow-up: verify whether {project_name} wants a reviewed public
profile correction or founder claim path. Do not use this as an automated send
instruction.
```

## Manual Review Checklist

Before any human uses a draft externally:

- confirm the project is public and reviewed in 123Charts;
- confirm the project path and any report paths are correct;
- remove any private contact, account, CRM, customer, analytics, or billing
  detail;
- remove unsupported claims about adoption, traffic, ranking, funding,
  endorsement, customers, or search visibility;
- confirm the draft does not instruct Codex to send, post, comment, log in, or
  call platform APIs;
- decide outside Codex whether to edit, discard, or use the draft.

## Negative Boundary Probes

GROWTH1Q should verify that this GROWTH1B artifact does not introduce:

- executable sender code;
- platform credentials or account handles;
- contact enrichment logic;
- emails, phone numbers, direct-message handles, CRM fields, or customer lists;
- committed generated lead lists;
- browser cookie/session export;
- unreviewed external scraping;
- route, sitemap, app, API, MCP, Supabase, package, script, deploy, or public
  asset changes;
- data-repo mutation;
- live social, email, DM, GitHub issue, comment, or platform API action.

## Validation Evidence

GROWTH1B must pass:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run agent:redact:check`
- `npm run agent:scope:check -- GROWTH1B`
- `npm run agent:batch:check`
- `npm run agent:train-plan:check`
- `node scripts/agent/train-plan-check.mjs --batch TRAIN-GROWTH1-FOUNDER-ACQUISITION-DRAFTS`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run agent:gate`
- direct landscape, sector-density, task-discovery, alternatives, and report
  distribution dry-run checks

The GROWTH1A boundary has been merged on `origin/main` at
`9647b943b803167a58e756a968f2127ead20c4c9`.

## What This PR Does Not Do

This PR does not add executable generator code, generate lead packets, collect
founder contacts, create a committed lead database, send email, send DMs, post
externally, create GitHub Issues or comments, log in to platforms, write CRM
records, store PII, export browser sessions, call social APIs, connect live
analytics, write Supabase, change app/runtime code, change sitemap behavior,
deploy, mutate the data repo, start GROWTH1Q, start GROWTH3A, start GROWTH4Q,
start GROWTHQ, start BETA1, start I18N0, start OPS8D, start OPS10A, or start
PR101.
