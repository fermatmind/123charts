# GROWTH0 Growth Agent Boundary Scan v0

Date: 2026-06-20
Role: Codex-Research / Codex-Build
Result: SPLIT_REGISTERED_NO_TRAIN
Exact next task: GROWTH1A Founder Acquisition Agent Boundary v0

## Scope

GROWTH0 defines the growth-agent boundary after OPS9B LIVE_PASS and the completed
demand-side traffic surface. It is policy, roadmap, and status work only.

This task does not implement a growth agent, does not contact founders, does not
send messages, does not post externally, does not log in to platforms, does not
create GitHub Issues, does not write CRM records, does not store PII, does not
connect live analytics, does not write Supabase, does not mutate
`/Users/rainie/Desktop/88cn-index-data`, and does not deploy.

## Source Inputs

- `docs/OPS8C_INTERNAL_BETA_TEST_PLAN_MANUAL_FEEDBACK_PROTOCOL.md`
- `docs/OPS9B_DEMAND_SIDE_TRAFFIC_SURFACE_DEPLOY_LIVE_SMOKE_V0.md`
- `docs/traffic/TRAFFIC7_DEMAND_SIDE_TRAFFIC_QA_V0.md`
- `docs/traffic/TRAFFIC6A_REPORT_DISTRIBUTION_PACK_BOUNDARY_V0.md`
- `docs/traffic/TRAFFIC6B_REPORT_DISTRIBUTION_PACK_GENERATOR_V0.md`
- `docs/traffic/TRAFFIC6Q_REPORT_DISTRIBUTION_PACK_QA_V0.md`
- `docs/traffic/TRAFFIC0R_COMPETITOR_PAGE_PATTERN_SEO_DEEP_SCAN.md`
- `docs/traffic/TRAFFIC1_DEMAND_SIDE_SEARCH_INTENT_TAXONOMY.md`
- `docs/traffic/TRAFFIC2B_AI_PROJECT_LANDSCAPE_LANDING_IMPLEMENTATION_V0.md`
- `docs/traffic/TRAFFIC4R_REMAINING_DEMAND_SIDE_TRAFFIC_SPLIT.md`
- `docs/TASK_STATUS.md`
- `docs/QA_REPORT.md`
- `docs/SIDECAR_ISSUES.md`
- `ops/tasks/roadmap.json`
- `ops/tasks/current.json`
- `ops/trains/current.json`
- `ops/trains/batches.json`

## Growth-Agent Principle

Codex may prepare. Humans execute.

Growth agents may help produce local drafts, checklists, summaries, and manual
review queues. They must not perform external actions. Any real outreach,
posting, account access, customer handling, or private-data handling remains
human-owned.

## Allowed Behaviors

Growth agents may:

- generate draft lists from repo-safe or manually supplied non-private inputs;
- generate public project research summaries;
- generate founder outreach draft packets for human review;
- generate report distribution draft packets;
- generate channel checklists and manual posting instructions;
- generate weekly review templates;
- generate redacted aggregate summaries;
- generate local-only queues under `/tmp/123charts-growth-*` or ignored local paths;
- suggest follow-up drafts without sending or scheduling them;
- summarize merged PRs, QA findings, and manually supplied aggregate metrics.

## Forbidden Behaviors

Growth agents must not:

- send email;
- send DMs;
- post to X, V2EX, Jike, Reddit, HN, GitHub, Telegram, Discord, or similar
  platforms;
- create GitHub Issues or comments;
- log in to external platforms;
- use browser cookies or logged-in sessions;
- store PII or private contact data;
- scrape or enrich private contacts;
- write CRM records;
- submit forms;
- auto-follow-up;
- auto-comment;
- buy ads or operate paid placement;
- connect live analytics;
- write Supabase;
- mutate the data repo;
- deploy;
- affect Signal Score, Source Confidence, sitemap inclusion, Public API order,
  MCP payload order, or organic ordering through commercial placement.

Any design requiring those behaviors is `BLOCKED_GROWTH_BOUNDARY_RISK`.

## Data Classification

| Class | Storage | Allowed examples |
| --- | --- | --- |
| A: repo-safe committed data | Git repo | growth policies, redacted templates, fake examples, aggregate counts, channel checklists, draft prompts, QA reports, manual review instructions |
| B: local-only temporary data | `/tmp/123charts-growth-*` or ignored local paths | draft outreach packets, draft distribution packs, manually supplied non-private leads, manual review queues, temporary scoring outputs |
| C: human-owned private data | never committed | real people tied to contact details, private messages, raw call notes, unredacted screenshots, CRM exports, private buyer conversations, private company metrics |
| D: forbidden for Codex | must not collect or use | browser cookies, logged-in sessions, passwords, access credentials, private contact enrichment, scraped contact details, paid platform data, private analytics exports |

## Founder Acquisition Boundary

A founder acquisition assistant can exist safely only as a draft assistant.

Allowed future work:

- project-level lead queue from reviewed public project data;
- public project summaries;
- local machine-readability pre-audit summaries;
- founder outreach packet drafts;
- manual review queues;
- follow-up draft suggestions.

Forbidden future work:

- sending or scheduling outreach;
- collecting private contact details;
- scraping emails or private social handles;
- storing PII;
- logging in to GitHub, X, LinkedIn, Product Hunt, or similar platforms;
- creating GitHub Issues;
- writing CRM records.

Safe inputs are 123Charts public project data, a manually supplied seed list, public
project URLs, public GitHub repository URLs, and locally generated geo-checker
results. Unsafe inputs are private contact-finder tools, logged-in platform
scrapes, CRM exports, browser sessions, and paid enrichment sources.

## Report Distribution Boundary

A report distribution assistant can exist safely only as a draft assistant.

Allowed future work:

- X thread drafts;
- V2EX draft posts;
- Jike draft posts;
- HN title candidates;
- GitHub Discussion drafts;
- newsletter snippets;
- Reddit-style technical post drafts;
- manual posting checklists;
- UTM suggestions if a later policy explicitly allows them.

Forbidden future work:

- posting externally;
- sending emails or DMs;
- logging in to platforms;
- calling social APIs;
- storing account handles;
- collecting PII;
- auto-commenting, auto-voting, or auto-submitting links.

Distribution copy must avoid promised rankings, promised traffic, promised AI
citations, backlink-style offers, paid inclusion, fake stats, copied competitor
descriptions, and restricted capital-product claims.

## Weekly Growth Review Boundary

Weekly growth review generation can be safe if it uses repo-safe and manually
supplied aggregate inputs only.

Allowed inputs:

- manually supplied aggregate metrics;
- repo-safe counts;
- redacted QA findings;
- merged PR summaries;
- manual campaign notes.

Forbidden inputs without a future explicit checkpoint:

- live analytics APIs;
- Google Search Console API;
- Cloudflare analytics;
- Vercel analytics;
- private server logs;
- CRM data;
- email platform data;
- social platform stats;
- unredacted user data.

## GROWTHQ Policy

GROWTHQ is registered as the final growth QA closer. It must verify:

- no auto-send;
- no auto-post;
- no email sender;
- no DM sender;
- no CRM write;
- no PII storage;
- no platform login;
- no cookies/session use;
- no external write;
- no contact scraping;
- drafts-only output;
- manual review required;
- redaction safety;
- policy scan safety;
- data repo cleanliness.

## BETA / I18N / OPS Future-Scan Policy

BETA1 remains paused. Before BETA1, run or confirm a BETA1 readiness scan, and
keep internal beta human-run rather than Codex-outreach-run.

I18N0 remains paused. Do not start I18N1 or I18N2 directly; run I18N0 first and
split core infrastructure, zh-CN pages, hreflang/canonical/sitemap QA, and
Chinese founder copy QA if needed.

OPS8D and any later OPS recut remain paused until beta or growth feedback exists.
They should be roadmap recuts, not product implementation.

PR101 remains paused.

## Split Recommendation

GROWTH1 and GROWTH2 are too risky as single implementation tasks because they
touch outreach and distribution. They are split into boundary, local draft, and
QA tasks.

GROWTH3 is lower risk but still split because any generator needs structured
input rules and no-live-analytics QA.

## Registered Task Matrix

| Task | Purpose | Status |
| --- | --- | --- |
| GROWTH1A | Founder acquisition boundary | Registered; not started |
| GROWTH1B | Founder lead queue and outreach draft generator | Registered; not started |
| GROWTH1Q | Founder acquisition no-auto-send QA | Registered; not started |
| GROWTH2A | Report distribution boundary | Registered; not started |
| GROWTH2B | Report distribution draft generator | Registered; not started |
| GROWTH2Q | Report distribution no-external-post QA | Registered; not started |
| GROWTH3A | Weekly growth review boundary | Registered; not started |
| GROWTH3B | Weekly growth review generator | Registered; not started |
| GROWTH3Q | Weekly growth review QA | Registered; not started |
| GROWTHQ | Growth ops no-auto-send QA closer | Registered; not started |

## Registered Train Matrix

No train is registered in GROWTH0.

Reason: current `GROWTH0` roadmap scope allows docs/status/roadmap metadata but
does not allow `ops/trains/current.json` or `ops/trains/batches.json`. GROWTH0
therefore registers split tasks only and records `SPLIT_REGISTERED_NO_TRAIN`.

Future train candidates:

- `TRAIN-GROWTH1-FOUNDER-ACQUISITION-DRAFTS`
- `TRAIN-GROWTH2-REPORT-DISTRIBUTION-DRAFTS`
- `TRAIN-GROWTH3-WEEKLY-REVIEW-QA`

Register those only in a task whose allowed paths include train metadata and
only after `agent:batch:check` and explicit train-plan checks pass.

## Risk Classification

| Area | Risk | Decision |
| --- | --- | --- |
| Founder acquisition | High | Boundary first, drafts-only, no-send |
| Report distribution | High | Boundary first, drafts-only, no-post |
| Weekly growth review | Medium | Split if generator writes local files or validates structured input |
| GROWTHQ | Medium | Required closer before growth phase is considered complete |
| BETA1 | High | Remains paused |
| I18N0 | Medium | Remains paused |
| OPS8D / OPS10A | Medium | Remain paused until feedback exists |
| PR101 | High | Remains paused |

## Validation Evidence

Pre-edit baseline:

- `npm run verify:day0` PASS
- `npm run policy:scan` PASS
- `npm run third-party:check` PASS
- `npm run agent:redact:check` PASS
- `npm run agent:batch:check` PASS
- `npm run agent:train-plan:check` PASS
- `npm run lint` PASS
- `npm run typecheck` PASS
- `node scripts/check-landscape-boundary.mjs` PASS
- `npm run landscape:check` PASS
- `node scripts/check-sector-density-boundary.mjs` PASS
- `node scripts/check-task-discovery-boundary.mjs` PASS
- `node scripts/check-alternatives-canonical.mjs` PASS
- `npm run report-distribution-pack:generate -- --dry-run` PASS
- `npm run build` PASS
- `npm run agent:gate` PASS

Data repo preflight:

- `/Users/rainie/Desktop/88cn-index-data` clean on `main...origin/main`

## Exact Next Task

Run GROWTH1A as the next scoped task if the team wants to proceed with founder
acquisition planning.

Do not start GROWTH1B, GROWTH2A, GROWTH3A, GROWTHQ, BETA1, I18N0, OPS8D,
OPS10A, or PR101 directly from GROWTH0.

## What This PR Does Not Do

- Does not implement GROWTH1, GROWTH2, GROWTH3, or GROWTHQ.
- Does not send email or DMs.
- Does not post externally.
- Does not create GitHub Issues.
- Does not log in to platforms.
- Does not use browser sessions or cookies.
- Does not collect or store PII.
- Does not write CRM records.
- Does not connect live analytics.
- Does not write Supabase.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not deploy.
- Does not start BETA1, I18N0, OPS8D, OPS10A, or PR101.
