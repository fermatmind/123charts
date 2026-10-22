# GROWTH1A Founder Acquisition Agent Boundary v0

Date: 2026-06-20
Role: Codex-Research
Result: GO_GROWTH1B
Next task: GROWTH1B Founder Lead Queue + Outreach Draft Generator v0

## Scope

GROWTH1A defines the safe boundary for a founder acquisition assistant before
any local lead-queue or outreach-draft work. This is boundary and handoff
documentation only. It does not collect contact data, create a lead database,
send messages, post externally, log in to platforms, create GitHub Issues or
comments, write CRM records, store PII, connect analytics, write Supabase,
mutate `/Users/rainie/Desktop/88cn-index-data`, or deploy.

The current GROWTH1B roadmap scope is docs/status/roadmap only. GROWTH1B must
not add executable generator code, scripts, app/runtime files, package metadata,
committed generated output, data-repo files, or outreach automation unless a
later roadmap task explicitly changes that scope.

## Safe Inputs

Future local-only founder acquisition draft work may reference only reviewed,
public, non-contact project signals already present in the 123Charts repo:

- public project name;
- 123Charts public project path;
- public report path;
- category, stack, vertical, collection, task, or alternatives route context;
- public project one-line description already reviewed in 123Charts;
- public project official site URL when already present in reviewed local data;
- published report title, slug, kind, and date;
- public-signal readiness notes already approved in 123Charts docs.

Every input must be treated as editorial context for a human reviewer, not as a
permission to contact a founder.

## Unsafe Inputs

The assistant must not collect, infer, enrich, store, or import:

- emails, phone numbers, personal handles, DMs, or account IDs;
- CRM fields, customer lists, contact exports, newsletter lists, private
  community member lists, or paid-tool lead exports;
- private founder identity documents or verification material;
- private revenue, billing, payment, analytics, or server-log material;
- browser cookies, sessions, local profile exports, or logged-in platform data;
- unreviewed crawl output or scraped profile content;
- private data from `/Users/rainie/Desktop/88cn-index-data`;
- any field that would make a generated artifact a contact database.

Unknown data must remain absent or use neutral wording such as `not reviewed`.

## Allowed Local-Only Artifacts

Within the current docs-only roadmap scope, GROWTH1B may document a future
artifact contract for:

- finite project review queue grouped by public 123Charts route context;
- public project summary card template;
- outreach draft template for human review;
- manual review checklist;
- redaction checklist;
- no-send safety manifest;
- reviewer notes explaining what a human must verify before any external use.

No output should be committed as a generated lead list. A future executable
generator, if separately approved, must write only to `/tmp` or another ignored
local path by default.

## Draft Copy Rules

Local drafts must:

- describe 123Charts as a public AI project discovery and growth-signal surface;
- cite only public 123Charts routes or reviewed public project facts;
- avoid private contact fields and personal account targeting;
- avoid invented traffic, adoption, ranking, funding, endorsement, customer, or
  search-visibility claims;
- avoid platform-specific send instructions;
- make human review mandatory before any external use;
- keep the decision to contact, edit, discard, or publish outside Codex.

## Hard Prohibitions

The founder acquisition assistant must not:

- send outreach;
- send email;
- send DMs;
- post externally;
- create GitHub Issues or comments;
- log in to GitHub, X, LinkedIn, Discord, Slack, email, CRM, newsletter, or any
  other platform;
- read browser cookies or export browser sessions;
- scrape or enrich contact data;
- store PII;
- create a committed lead database;
- call social, email, CRM, or platform APIs;
- connect live analytics;
- write Supabase;
- mutate `/Users/rainie/Desktop/88cn-index-data`;
- deploy.

## GROWTH1B Handoff

GROWTH1B may proceed only as a local-only draft/queue contract task within its
roadmap allowed paths. It should produce a reviewable no-send packet spec with
safety flags that remain false for:

- external writes;
- email sends;
- DM sends;
- social posts;
- platform login;
- CRM writes;
- PII inclusion;
- browser session export;
- contact enrichment;
- data repo mutation;
- deploy.

If the team later wants executable queue generation, that requires a separate
scope change before implementation. GROWTH1B must not infer permission to edit
`scripts/**`, `app/**`, `lib/**`, package files, public assets, or the data
repo from this boundary.

## Validation Evidence

GROWTH1A must pass:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run agent:redact:check`
- `npm run agent:scope:check -- GROWTH1A`
- `npm run agent:batch:check`
- `npm run agent:train-plan:check`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run agent:gate`
- direct landscape, sector-density, task-discovery, alternatives, and report
  distribution dry-run checks

The GROWTH2 train has been closed on `origin/main` at
`57ebc79b56fb72b4858a9cb31c02f954f8720011`.

## What This PR Does Not Do

This PR does not collect founder contacts, create a lead database, generate
outreach drafts, send email, send DMs, post externally, create GitHub Issues or
comments, log in to platforms, write CRM records, store PII, export browser
sessions, call social APIs, connect live analytics, write Supabase, change
app/runtime code, change sitemap behavior, deploy, mutate the data repo, start
GROWTH1B, start GROWTH1Q, start GROWTH3A, start GROWTH4Q, start GROWTHQ, start
BETA1, start I18N0, start OPS8D, start OPS10A, or start PR101.
