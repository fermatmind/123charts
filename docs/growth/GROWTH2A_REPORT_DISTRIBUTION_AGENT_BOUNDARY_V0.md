# GROWTH2A Report Distribution Agent Boundary v0

Date: 2026-06-20
Role: Codex-Research
Result: GO_GROWTH2B
Next task: GROWTH2B Report Distribution Draft Generator v0

## Scope

GROWTH2A defines the safe boundary for a report distribution assistant. This is
boundary and handoff documentation only. It does not generate distribution
drafts, post externally, send email, send DMs, log in to platforms, write CRM
records, store PII, export browser sessions, call social APIs, mutate the data
repo, write Supabase, or deploy.

## Supported Draft Channels

Future local-only draft work may prepare:

- X thread draft text;
- V2EX post draft text;
- Jike post draft text;
- Hacker News title candidates;
- GitHub Discussion draft text;
- newsletter snippet;
- Reddit-style technical post draft;
- manual posting checklist.

Every channel output is a draft for human review. Humans decide whether to edit,
post, discard, or adapt it outside Codex.

## Allowed Local-Only Artifacts

GROWTH2B may document or produce local-only artifacts under `/tmp` or another
ignored local path only if its roadmap scope allows it. In the current roadmap
scope, GROWTH2B is docs/status/roadmap only, so it must not add `scripts/**`,
runtime code, package metadata, app routes, or committed generated output.

Allowed artifact shapes:

- manifest with source report slugs and paths;
- channel draft markdown or text examples;
- manual posting checklist;
- redaction checklist;
- source report reference list;
- reviewer notes explaining required human edits.

## Channel Safety Rules

All draft copy must:

- identify 123Charts as a public growth-signal index or project-discovery surface;
- cite only public report titles, slugs, dates, and 123Charts public paths;
- avoid invented metrics, founder claims, traffic claims, rankings, AI citation
  claims, backlink promises, or guaranteed outcomes;
- avoid copied competitor descriptions;
- avoid private contact details, personal handles, emails, phone numbers, CRM
  fields, customer names, and private analytics;
- keep manual review requirements visible.

## Hard Prohibitions

The report distribution assistant must not:

- post externally;
- call platform APIs;
- send email;
- send DMs;
- create GitHub Issues or comments;
- log in to X, V2EX, Jike, HN, Reddit, GitHub, newsletter tools, or any other
  platform;
- read or export browser cookies or sessions;
- write CRM records;
- collect account handles or private contact details;
- store PII;
- buy ads or operate paid placement;
- connect live analytics;
- write Supabase;
- mutate `/Users/rainie/Desktop/88cn-index-data`;
- deploy.

## GROWTH2B Handoff

GROWTH2B may proceed only as a local-only draft generator task within its
roadmap allowed paths. It should produce a finite, reviewable draft-package
contract and safe examples, with safety flags that remain false for:

- external writes;
- email sends;
- DM sends;
- social posts;
- platform login;
- CRM writes;
- PII inclusion;
- browser session export;
- data repo mutation;
- deploy.

If GROWTH2B needs executable generator code later, that requires a separate
roadmap/scope change before implementation. GROWTH2B must not infer permission
to edit `scripts/**` from this boundary.

## Validation Evidence

Preflight passed on clean `origin/main` at
`de7544beeec9e16fbb4cca8a20158bba46a74c06`:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run agent:redact:check`
- `npm run agent:batch:check`
- `npm run agent:train-plan:check`
- explicit Growth train-plan checks
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run agent:gate`
- landscape, sector-density, task-discovery, alternatives, and report dry-run
  checks

GROWTH2A post-edit validation must include `npm run agent:scope:check --
GROWTH2A`.

## What This PR Does Not Do

This PR does not generate distribution drafts, create a sender, call platform
APIs, send email, send DMs, post externally, create GitHub Issues, log in to
platforms, write CRM records, store PII, scrape contacts, use browser sessions
or cookies, connect live analytics, write Supabase, mutate the data repo, deploy,
start GROWTH2B, start GROWTH1A, start GROWTH3A, start BETA1, start I18N0, start
OPS8D, start OPS10A, or start PR101.
