# OPS8C Internal Beta Test Plan + Manual Feedback Protocol v0

Date: 2026-06-20
Role: Codex-Build
Result: BETA_PLAN_READY
Exact next recommended task: BETA1 Founder / Data Buyer Internal Test Run

## Scope

OPS8C defines the internal beta operating plan after OPS8B production deploy
returned `LIVE_PASS`. It is docs/ops only.

OPS8C does not contact testers, send email, send DMs, post on social platforms,
create CRM records, collect PII, create write-capable forms, deploy, modify
product code, modify runtime code, enable feature flags, write to Supabase,
mutate `/Users/rainie/Desktop/88cn-index-data`, start BETA1, start TRAFFIC0,
start I18N0, or start PR101.

## Preconditions

| Precondition | Evidence | Result |
| --- | --- | --- |
| OPS8A complete | `docs/OPS8A_PRODUCTION_RELEASE_CANDIDATE_INTERNAL_BETA_READINESS_SCAN.md` records `GO_DEPLOY_RC` | PASS |
| OPS8B complete | `docs/OPS8B_PRODUCTION_DEPLOY_LIVE_SMOKE_V0.md` records `LIVE_PASS` | PASS |
| Production SHA | OPS8B deployed `d68413fa456ae03b8ee9e83e66af9dc5ce7dfdd6` | PASS |
| Disabled surfaces | OPS8B verified Public API, MCP, payment checkout, API-key shell, and buyer-interest routes return 503 Problem Details | PASS |
| Data repo | `/Users/rainie/Desktop/88cn-index-data` clean on `main...origin/main` | PASS |
| OPS8C roadmap scope | `ops/tasks/roadmap.json` lists OPS8C as docs/ops only with `deployment: none` | PASS |

## Beta Objective

The internal beta should answer four questions without adding new runtime or
collection behavior:

1. Do target users understand what 123Charts does in one sentence?
2. Which public routes create real founder, builder, or researcher value?
3. Does the current positioning feel credible and bounded rather than spammy,
   overpromising, or commercially confusing?
4. Which next operating lane should proceed: BETA1, TRAFFIC0, I18N0, or a hold?

The beta is a manual learning loop. It is not a growth blast, public launch,
sales campaign, data-product release, customer access rollout, or automated
outreach program.

## Tester Cohorts

### Cohort A: Early AI Founders

| Item | Definition |
| --- | --- |
| Purpose | Test founder understanding, submit/claim/correction pathways, and value perception. |
| Initial size | 10-20 testers. |
| Example tester profile | Solo AI founder; open-source AI tool maintainer; early AI SaaS builder; project with live website and public GitHub/docs. |
| Required privacy posture | Use anonymized tester IDs only. Do not commit names, emails, handles, private project details, or private company metrics. |

### Cohort B: AI Builders / Tool Users

| Item | Definition |
| --- | --- |
| Purpose | Test demand-side discovery, landscape/navigation expectations, reports, and checker usefulness. |
| Initial size | 5-10 testers. |
| Example tester profile | Agent/RAG builder; AI coding workflow user; newsletter reader; developer evaluating tools. |
| Required privacy posture | Record task outcomes and redacted observations only. Do not commit private workspace, client, employer, or project data. |

### Cohort C: Data Buyer / Researcher

| Item | Definition |
| --- | --- |
| Purpose | Test Alpha Feed concept, evidence dossier clarity, snapshot value, public field needs, and risk concerns. |
| Initial size | 3-5 testers. |
| Example tester profile | AI search builder; RAG dataset builder; VC analyst or researcher; AI tooling newsletter operator. |
| Required privacy posture | Discuss public-signal data only. Do not collect private contact records, private company data, customer lists, or private financial details. |

## Tester Recruitment Rules

Allowed:

- Human team may manually invite known testers outside the repository.
- Human team may track private contact details outside git in an approved private system.
- Codex may create redacted templates and aggregated summaries only.
- Tester IDs in committed docs must be anonymized, for example `manual-tester-001`.

Not allowed:

- No emails, DMs, social posts, or automated outreach from Codex.
- No CRM records created by Codex.
- No committed private contact details, raw messages, raw transcripts, private
  company metrics, customer names, or private financial details.
- No web form, API route, or Supabase write path for feedback collection.
- No customer signup, payment, API-key, MCP, Laravel, or Alpha Feed runtime
  activation.

## Manual Test Tasks

### Founder Tasks

| Task | Evidence to record | Success signal |
| --- | --- | --- |
| Open `/` and explain what 123Charts is in one sentence. | Redacted sentence summary and understanding score. | Tester can describe 123Charts without prompt correction. |
| Visit `/reports/early-ai-project-machine-readability-2026`. | Pages tested and clearest/confusing phrase. | Tester understands machine-readability angle. |
| Run `/geo-checker` on their own project or a known AI project. | Whether run completed; no private input committed. | Tester sees value in checking project discoverability. |
| Visit `/submit`. | CTA expectation and submit/correct/remove intent. | Tester understands submit pathway without assuming publication is automatic. |
| Visit relevant `/claim` flow if applicable. | Whether claim/correction intent exists. | Tester understands claim is reviewed and not instant ownership verification. |
| Review `/founders`. | Founder value notes. | Tester understands founder-facing benefits. |
| Review `/genesis`. | Trust and origin notes. | Tester understands the early public index posture. |
| Review `/alpha-feed`. | Alpha Feed comprehension and risk concerns. | Tester understands public-signal-only data posture. |
| Explain published / claimed / scouted distinctions. | Distinction understood: yes/no/partial. | Tester can distinguish lifecycle states. |
| Explain whether they would submit, claim, correct, remove, or ignore. | One selected intent and reason. | At least one actionable founder intent appears. |

### Builder / Tool User Tasks

| Task | Evidence to record | Success signal |
| --- | --- | --- |
| Visit `/landscape` only if it exists. If absent, note missing demand-side route. | Route exists: yes/no; expectation note. | Missing route becomes route-planning input, not a blocker. |
| Visit `/projects`. | Discovery usefulness score. | Tester can browse project inventory. |
| Visit `/stacks/ai-coding-workflows`. | Stack route usefulness. | Tester understands workflow grouping. |
| Visit `/collections/open-source-ai-agents`. | Collection usefulness. | Tester sees curated discovery value. |
| Visit `/verticals/ai-builder-infrastructure`. | Vertical route usefulness. | Tester sees vertical grouping value. |
| Visit `/alternatives/aurora-code-vs-nucleus-ml`. | Comparison clarity. | Tester understands alternatives framing without defamation risk. |
| Visit `/reports`. | Report discovery score. | Tester can identify a report worth opening. |
| Run `/geo-checker`. | Completion and usefulness score. | Tester would use checker before evaluating or launching a project. |
| Explain whether 123Charts helps find or evaluate AI projects. | Demand-side value summary. | Tester names at least one practical discovery/evaluation job. |

### Data Buyer / Researcher Tasks

| Task | Evidence to record | Success signal |
| --- | --- | --- |
| Visit `/alpha-feed`. | Public-signal-only comprehension. | Tester does not interpret it as private-data access. |
| Read the PR97 evidence dossier summary if shared internally. | Field and trust concerns. | Tester understands the source/evidence boundary. |
| Review fields needed in a public signal snapshot. | Requested fields as public-only categories. | Tester asks for allowed public fields or sample format. |
| Explain whether public-only data is enough. | Enough/partial/not enough and reason. | Data need can be met without private collection. |
| Explain what fields are noise or risk. | Redacted risk categories. | Risk categories are actionable without collecting private data. |
| Choose preferred delivery format: report, CSV, NDJSON, API, or manual snapshot. | Preferred format. | Format preference supports next-lane decision. |
| Explain what would make them continue the conversation. | Redacted continuation trigger. | Interest is based on public evidence, not private promises. |

## Feedback Questions

All questions should be asked after task completion. They are task-based, not
open-ended opinion collection.

### Understanding

- What do you think 123Charts does?
- Which page made that clearest?
- Which phrase confused you?
- Did it feel like a directory, a checker, a data layer, or something else?

### Value

- What job would you use 123Charts for?
- Would you use it to find AI projects?
- Would you use it before launching an AI product?
- Would you use it to check your own project website?
- Would you submit or claim a project?

### Trust

- Does 123Charts feel credible?
- Does anything look like SEO spam or backlink marketing?
- Does any copy overpromise ranking, traffic, AI citation, commercial value, or exposure?
- What would make you trust the data more?

### Friction

- Where did you stop?
- What felt too abstract?
- What was hard to understand?
- Which CTA did you expect next?

### Alpha Feed

- Do you understand Alpha Feed as public-signal data only?
- What fields would you need?
- What fields should never be included?
- Would you ask for a sample snapshot?
- Would you prefer API, CSV, NDJSON, or report?

## Manual Feedback Record Schema

Committed examples must stay synthetic and redacted. Raw notes, if any, must
stay local and non-committed.

```json
{
  "tester_id": "manual-tester-001",
  "cohort": "founder|builder|data_researcher",
  "date": "YYYY-MM-DD",
  "session_type": "manual_call|async_review|screen_share",
  "pages_tested": [],
  "completed_tasks": [],
  "understanding_score": 0,
  "trust_score": 0,
  "activation_score": 0,
  "top_confusions": [],
  "top_objections": [],
  "feature_requests": [],
  "bug_reports": [],
  "follow_up_interest": "none|low|medium|high",
  "redaction_status": "redacted",
  "contains_private_contact": false,
  "contains_private_company_data": false,
  "notes_redacted": ""
}
```

Score scale:

| Score | Meaning |
| --- | --- |
| 0 | Not assessed. |
| 1 | Failed: tester could not complete or understand the task. |
| 2 | Weak: tester completed task only with heavy explanation. |
| 3 | Partial: tester understood the task but value or trust was unclear. |
| 4 | Good: tester understood and saw a plausible use case. |
| 5 | Strong: tester understood, trusted, and named an actionable next step. |

## Privacy And Redaction Rules

Rules:

- No real names required in repo.
- No emails.
- No phone numbers.
- No private company information.
- No private revenue or financing details.
- No raw call transcript unless redacted.
- No private LinkedIn, WeChat, Telegram, or similar contact handles.
- No private customer names.
- No raw screenshots with private information.
- No unredacted user messages.
- Use local non-committed files for raw notes if needed.
- Convert raw quotes into short redacted summaries before committing.
- Replace tester identity with `manual-tester-###`.
- Replace company-specific details with generic category labels.

## Storage Rules

Safe committed artifacts:

- Aggregated feedback summaries.
- Redacted issue categories.
- Anonymized tester IDs.
- Task completion counts.
- Severity-classified bug summaries.
- Roadmap recommendations.
- Synthetic examples that clearly contain no private data.

Not allowed in repo:

- Personal email.
- Phone number.
- Private social/contact handle.
- Raw call transcripts.
- Private company metrics.
- Private revenue or financing details.
- Private customer names.
- Raw screenshots with private information.
- Unredacted tester messages.
- CRM exports.
- Any credential, cookie, browser session value, or private URL.

Recommended raw local folder:

```text
/tmp/123charts-beta-feedback/
```

This folder must remain local and uncommitted. OPS8C does not create a committed
CRM or any write-capable feedback collection surface.

## Success Metrics

### First 7-14 Day Minimum Thresholds

| Metric | Low threshold |
| --- | ---: |
| Testers completed | 10 |
| Founder testers | 5 |
| Builder/tool-user testers | 3 |
| Data/research testers | 2 |
| Users who understand 123Charts in one sentence | 60% |
| Users willing to run geo-checker | 50% |
| Founders willing to submit, claim, or correct | 20% |
| Data/research testers asking for fields or sample format | 2 |
| P0/P1 bugs | 0 |

### Good Thresholds

| Metric | Good threshold |
| --- | ---: |
| Testers completed | 25 |
| Geo-checker runs from beta | 50 |
| Valid submissions | 5 |
| Claim/correction interest | 3 |
| Data/research conversations | 5 |
| Sample snapshot requests | 1-3 |

Metric rules:

- Use aggregate counts only.
- Do not invent unknown counts.
- Do not commit raw tester identities.
- Do not add analytics, tracking, CRM, email, or Supabase write behavior for
  OPS8C.

## Stop Conditions

Stop or hold beta if any of these occur:

- P0 privacy leak.
- P0 production outage.
- Disabled API, payment, MCP, API-key, or buyer route leaks or returns active data.
- Accidental PII collection.
- Admin/private data exposure.
- Sitemap exposes a forbidden route.
- Founder confusion is greater than 70%.
- More than two testers interpret 123Charts as a backlink marketplace.
- Alpha Feed is interpreted as an investment product.
- Payment or customer-access confusion is high.
- Geo-checker produces unsafe or misleading output.
- Any beta step requires CRM, email provider, social posting, runtime changes,
  deployment, Supabase writes, or external service integration.

Severity handling:

| Severity | Action |
| --- | --- |
| P0 | Stop immediately; do not proceed to BETA1. |
| P1 | Hold beta expansion until fixed or explicitly accepted by the human team. |
| P2 | Continue only with documented mitigation and owner. |
| P3 | Track as non-blocking issue if no privacy, trust, or runtime risk exists. |

## Decision Rules After BETA1

Continue founder acquisition if:

- Founders understand the value.
- Submit, claim, or correction interest exists.
- No major trust issue appears.
- Founder pathway confusion is below stop-condition level.

Prioritize traffic engine if:

- Builders use reports, route clusters, or checker workflows.
- Users want discovery more than founder flows.
- Founder supply is weak but demand-side usage exists.
- Missing demand-side route expectations, such as `/landscape`, appear repeatedly.

Prioritize Alpha Feed if:

- Data/research testers ask for fields, sample, NDJSON, CSV, or API format.
- Public-only data is acceptable.
- Data quality concerns are solvable without private collection.
- Follow-up interest is based on field shape and evidence, not active customer access.

Prioritize I18N0 if:

- Chinese founder testers understand Chinese copy materially better.
- English copy blocks domestic outbound founders.
- No major product ambiguity remains.
- Translation planning can remain boundary-first and non-runtime.

Pause PR101 if:

- No one asks for API, MCP, or agent integration.
- Beta feedback shows core positioning is still unclear.
- Public API or MCP release would distract from founder/discovery trust fixes.

## Next-Step Order

Recommended sequence after OPS8C:

1. BETA1 Founder / Data Buyer Internal Test Run.
2. TRAFFIC0 Competitor Intent Deconstruction + Demand-Side Route Planning.
3. I18N0 Internationalization Boundary Scan.

Priority logic:

- If beta tester recruitment is ready, run BETA1 first.
- If traffic strategy needs route planning before beta, run TRAFFIC0 before a
  broader beta.
- If Chinese founders are the first tester group, run I18N0 before BETA1
  expansion.

Default recommendation: BETA1 first, then TRAFFIC0, then I18N0.

OPS8C does not start any of those tasks.

## What This Task Does Not Do

- Does not contact testers.
- Does not send email, DMs, or social posts.
- Does not create CRM records.
- Does not collect PII.
- Does not create forms or routes that write feedback data.
- Does not deploy.
- Does not run live smoke.
- Does not modify product code, runtime code, route code, middleware, scripts,
  package metadata, deploy config, public assets, Supabase schema, gateway files,
  `.env*`, secrets, or server configuration files in git.
- Does not enable Public API, MCP, payment, API keys, metering, Laravel runtime,
  Supabase webhook sync, Redis gateway cache, customer access, CRM, email
  provider, live analytics collection, or live Alpha Feed delivery.
- Does not mutate `/Users/rainie/Desktop/88cn-index-data`.
- Does not start BETA1, TRAFFIC0, I18N0, or PR101.

## Definition Of Done

| Requirement | Result |
| --- | --- |
| Beta plan exists | PASS |
| Manual feedback protocol exists | PASS |
| Tester cohorts defined | PASS |
| Test tasks defined | PASS |
| Feedback questions defined | PASS |
| Feedback record schema defined | PASS |
| Privacy/redaction rules defined | PASS |
| Storage rules defined | PASS |
| Success metrics defined | PASS |
| Stop conditions defined | PASS |
| Decision rules defined | PASS |
| Next-step recommendation defined | PASS |
| No outreach executed | PASS |
| No PII collected | PASS |
| No product/runtime code modified | PASS |
| No deploy | PASS |
| Data repo clean | PASS |
| BETA1 not started | PASS |

## Decision

BETA_PLAN_READY.

123Charts can proceed to BETA1 only as a human-run internal test using this manual,
redacted protocol. The exact next recommended task is BETA1 Founder / Data Buyer
Internal Test Run.
