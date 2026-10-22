# AGENT0R Agent Automation Strategy Review

Result: `AGENT0R_READY_FOR_WORKER_AGENT_IMPLEMENTATION`

Date: 2026-06-21

## 1. Decision

AGENT0R accepts the AUTO0R strategy with a narrower execution gate:

- 123Charts may start `AGENT1 / Worker CLI Contract Stabilization` in `88cn-scout-worker`.
- `AGENT1` must be contract/CLI/dry-run only.
- `AGENT1` must not start a runtime worker, crawler, Redis, queue runtime, HTTP audit runtime, browser fallback, staging write, production write, `published_projection` write, sitemap change, deploy, external outreach, or data repo mutation.

The strategic model is:

```text
agent produces recommendation
human performs final review
123Charts admin gate controls publication
published_projection controls public frontend/search/sitemap
```

The rejected model is:

```text
agent discovers project -> agent publishes project -> sitemap/search update automatically
```

That rejected model remains forbidden.

## 2. Reviewed Inputs

Local AUTO0R artifacts:

- `/tmp/123charts-agent-auto0r-strategy-readiness-scan.md`
- `/tmp/123charts-agent-auto0r-task-split.json`
- `/tmp/123charts-agent-auto0r-architecture-map.md`

123Charts repo evidence:

- `docs/infra/SCOUT_WORKER_REPO_BOOTSTRAP.md`
- `docs/infra/WORKER_QA.md`
- `docs/infra/PRODUCTION_DEPLOY_GATE.md`
- `docs/infra/SECURITY_FIREWALL.md`
- `docs/scout/CONTROL_PANEL_QA.md`
- `docs/scout/FRONTEND_QA.md`
- `supabase/migrations/013_project_contract_staging_schema.sql`
- `app/admin/bulk-review/page.tsx`
- `app/api/admin/project-entities/[id]/review-state/route.ts`
- `lib/projects/published-projection.ts`
- `lib/projects/search-index.ts`
- `app/sitemap.ts`
- `ops/tasks/current.json`
- `ops/tasks/roadmap.json`
- `ops/trains/current.json`
- `ops/trains/batches.json`

Worker repo evidence reviewed in AUTO0R:

- `contracts/*.json`
- `src/import/**`
- `src/canonical/**`
- `src/audit/**`
- `src/queue/**`
- `tests/worker-boundary-qa.test.mjs`
- `docs/NO_RUNTIME_BOUNDARY.md`
- `docs/SECURITY_BOUNDARY.md`

Index-data evidence reviewed in AUTO0R:

- public project JSON schema and taxonomy
- reviewed public-safe data policy
- no automatic publication policy
- no private data policy

External architecture references used as patterns only:

- Scrapy architecture separates engine, scheduler, downloader, spider, and item pipeline stages: https://docs.scrapy.org/en/latest/topics/architecture.html
- Scrapy item pipelines validate, dedupe, drop, or persist items after extraction: https://docs.scrapy.org/en/latest/topics/item-pipeline.html
- Crawlee exposes crawl limits, retries, robots handling, and blocked-request behavior as explicit options: https://crawlee.dev/python/api/class/BasicCrawlerOptions
- LangGraph interrupts and persistence support human-in-the-loop pause/resume patterns: https://docs.langchain.com/oss/python/langgraph/interrupts and https://docs.langchain.com/oss/python/langgraph/persistence
- Airflow dynamic task mapping creates task instances from upstream runtime data, which is useful later for scheduled dry-run expansion: https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/dynamic-task-mapping.html

No external source is copied into product data, category language, ranking, scoring, or public page copy.

## 3. Current Repo Truth

AGENT0R was prepared in a clean worktree from `origin/main` at:

```text
5c82ae0e3ed143e691e669891ae09c7da6875977
```

Current 123Charts state:

- CONTENT27 public MVP exists through `published_projection`.
- `staging/projects-review-queue.jsonl` has 50 review queue rows.
- `lib/projects/published-projection.jsonl` has 27 public projection rows.
- Public list/detail/search/sitemap read through projection helpers.
- Admin bulk review and manual state switcher exist.
- PR212 finite collection route patch is merged on current `origin/main`.
- Production deploy remains behind exact SHA approval.

Important local safety note: the primary desktop worktree had unrelated UI modifications before this task. AGENT0R uses a clean temp worktree and does not touch those files.

## 4. Strategic Boundary

AGENT0R confirms this split:

| Capability | Agent may do | Agent must not do |
| --- | --- | --- |
| Discovery | Produce source-backed hints | Bulk crawl, copy competitor metadata, collect private contacts |
| Source resolution | Identify official public URLs | Treat directory pages as official sources |
| Canonical identity | Produce candidates and ambiguity states | Merge by name only or publish slugs |
| HTTP audit | Produce bounded observations after approval | Use browser fallback, login, cookies, WAF bypass, or proxy evasion |
| Quarantine | Classify ambiguity/failure/privacy risk | Make public negative claims from unreviewed data |
| Review packaging | Produce sanitized review-ready payloads | Write `published_projection` or sitemap |
| Publish recommendation | Recommend with transparent reasons | Final publish, final ranking, paid/organic mixing |
| Report draft | Draft aggregate methodology/report text | Public report release or external posting |

The permanent publication rule:

```text
worker output -> review_ready -> human admin review -> published_projection -> frontend/sitemap/search
```

No worker task before `AGENT-INTEGRATION0` may write `123Charts` review queue. No worker task before a later human-reviewed publish task may write `published_projection`.

## 5. Why AGENT1 Is The Correct Next Step

AGENT1 is the right next task because the current worker repo has useful dry-run code, but the CLI contract is not yet a durable operations interface.

AGENT1 should stabilize:

- exact local commands;
- input manifest shapes;
- output directory layout;
- result manifest fields;
- deterministic hashes;
- dry-run proof fields;
- no-public-projection proof;
- no-runtime proof;
- rollback package conventions;
- fixture-only audit conventions;
- stable failure taxonomy across import, canonical, audit, queue, and report draft modules.

AGENT1 should not add:

- long-running daemon;
- Redis connection;
- package dependency unless separately approved;
- live external HTTP audit;
- crawler;
- browser automation;
- Supabase client;
- staging or production write;
- 123Charts repo mutation;
- index-data mutation;
- deploy or server configuration.

## 6. Approved Task Split

AGENT0R approves the AUTO0R split as the roadmap, with these execution gates:

| Task | Repo | Gate |
| --- | --- | --- |
| `AGENT1` Worker CLI Contract Stabilization | `88cn-scout-worker` | contract/CLI/dry-run only |
| `AGENT2` Discovery Hint Agent | `88cn-scout-worker` | no competitor copy, no private contacts |
| `AGENT3` Official Source Resolver Agent | `88cn-scout-worker` | official public source verification only |
| `AGENT4` Canonical Entity Agent | `88cn-scout-worker` | candidates only, no public slug write |
| `AGENT5` HTTP Audit Agent | `88cn-scout-worker` | fixture first, external HTTP only after approval |
| `AGENT6` Quarantine Classifier Agent | `88cn-scout-worker` | admin-safe failure classification |
| `AGENT7` Review Queue Packager | `88cn-scout-worker` | package only, no 123Charts write |
| `AGENT8` Publish Recommendation Engine | `88cn-scout-worker` | recommendation only |
| `AGENT9` Report Draft Generator | `88cn-scout-worker` | local aggregate drafts only |
| `AGENTQ` Agent No-Auto-Publish QA | `88cn-scout-worker` | negative tests and static checks |
| `AGENT-INTEGRATION0` Worker Output to 123Charts Review Queue | `123Charts` | first approved handoff to admin queue |
| `BULK200_AGENT_DRY_RUN` | `88cn-scout-worker` | local/staging rehearsal only |
| `BULK1000_AGENT_DRY_RUN` | `88cn-scout-worker` | capacity rehearsal only |

`AGENT-INTEGRATION0` remains the first convergence point with `123Charts`. Before that point, worker tasks must not mutate `123Charts`.

## 7. Data State Decision

AGENT0R accepts this state machine:

```text
seed_hint
identity_candidate
source_verified
canonical_candidate
canonical_review_needed
audit_pending
audit_observed
quarantined
review_ready
publish_recommended
published
stale
archived
rejected
```

Mapping:

| State family | Owner before integration | Public eligibility |
| --- | --- | --- |
| `seed_hint`, `identity_candidate` | worker only | never public |
| `source_verified`, `canonical_candidate` | worker, then admin review package | not public by itself |
| `canonical_review_needed`, `quarantined`, `rejected` | worker/admin | never public except aggregate QA counts |
| `audit_pending`, `audit_observed`, `stale` | worker/admin | sanitized evidence only after review |
| `review_ready`, `publish_recommended` | worker/admin | not public until human publish |
| `published` | 123Charts admin | eligible for projection, frontend, sitemap, snapshot |
| `archived` | 123Charts admin | no active sitemap unless a later archive policy allows it |

Compatibility note: existing DB enum uses `audit_observation`. AGENT docs may use `audit_observed` as the process-state label, but implementation must preserve compatibility or add a migration only under a separate approval.

## 8. Runtime Strategy

Approved now:

- local batch;
- manual CLI;
- deterministic fixtures;
- static QA;
- local report artifacts.

Deferred:

- cron;
- queue;
- Redis;
- staging queue;
- server worker;
- production daemon.

Phase path:

1. Phase 1: local batch and manual CLI.
2. Phase 2: scheduled dry-run with no writes.
3. Phase 3: staging queue and review queue integration.
4. Phase 4: production worker after server, Redis, DB, rollback, observability, no-auto-publish QA, and explicit human approval.

## 9. Server Strategy

AGENT0R does not change server strategy.

Current server posture:

- HK public web host remains public-web-only.
- Shanghai admin/scout/ops hosts remain Workbench-only or partial per prior readiness docs.
- Worker runtime is not started.
- Local SSH/runtime automation remains insufficient for production daemon assumptions.

Future use:

| Target | Use only after |
| --- | --- |
| `SH-ALIYUN-03` | exact host access, reversible action list, EIP/network path, low-concurrency audit policy, human approval |
| `SH-ALIYUN-04` | queue/report ops maturity, dead-letter policy, access proof, human approval |
| Redis/queue | Phase 3 staging queue approval |
| production daemon | Phase 4 approval with rollback and observability |

## 10. AGENT1 Entry Contract

AGENT1 may start only if its opening prompt includes these exact constraints:

```text
Repo: /Users/rainie/Desktop/123charts.com/88cn-scout-worker
Mode: worker CLI contract stabilization only
Runtime allowed: no
Live network allowed: no
External HTTP audit runtime allowed: no
Browser fallback allowed: no
Redis/queue runtime allowed: no
Supabase/staging/production write allowed: no
123Charts repo mutation allowed: no
88cn-index-data mutation allowed: no
published_projection mutation allowed: no
sitemap mutation allowed: no
deploy/server/cloud action allowed: no
secrets/env read allowed: no
```

Required AGENT1 outputs:

- a stable CLI contract document;
- deterministic dry-run output contract;
- one fixture-driven validation command per module;
- a no-runtime/no-network/no-publish QA checklist;
- an explicit result enum.

Recommended AGENT1 result enum:

```text
AGENT1_READY_FOR_DISCOVERY_HINT_AGENT
AGENT1_READY_BUT_NEEDS_CONTRACT_FIX
AGENT1_BLOCKED_WORKER_REPO_STATE
AGENT1_BLOCKED_SCOPE_RISK
```

Expected AGENT1 default result:

```text
AGENT1_READY_FOR_DISCOVERY_HINT_AGENT
```

## 11. Rejected Alternatives

| Alternative | Rejection reason |
| --- | --- |
| One-step production daemon | Skips review load proof, server proof, Redis proof, rollback, and no-auto-publish QA |
| Browser-first crawler | Increases WAF/login/session/legal risk and violates current worker boundary |
| Direct worker to `published_projection` | Bypasses admin review and public no-leak gate |
| Direct worker to sitemap | Creates automatic public indexing from unreviewed data |
| Use `88cn-index-data` as raw intake | Violates public-safe snapshot boundary |
| Add AGENT1 into `123Charts` implementation | Wrong repo and risks mixing worker code into public web boundary |
| Start queue/Redis now | Local dry-run queue is enough; runtime queue is Phase 3 |

## 12. Validation Requirements For AGENT0R

AGENT0R validation should include:

```bash
npm run agent:scope:check -- AGENT0R
npm run agent:batch:check
npm run agent:train-plan:check -- --batch TRAIN-AGENT-AUTOMATION-STRATEGY
npm run agent:train-plan:check -- --batch AGENT1_WORKER_CLI_CONTRACT_ONLY
npm run agent:redact:check
npm run policy:scan
git diff --check
```

AGENT0R intentionally does not run build or start local dev servers. It does not change product runtime files.

## 13. Final AGENT0R Verdict

```text
Result: AGENT0R_READY_FOR_WORKER_AGENT_IMPLEMENTATION
Next task: AGENT1 / Worker CLI Contract Stabilization
Next repo: /Users/rainie/Desktop/123charts.com/88cn-scout-worker
Can enter AGENT1 now: yes, with contract-only constraints
Runtime allowed now: no
Auto-publish allowed: no
Server/DB writes allowed: no
123Charts public surface changes allowed by AGENT1: no
Index-data mutation allowed by AGENT1: no
```

## 14. What AGENT0R Does Not Do

- Does not start AGENT1.
- Does not mark AGENT1 complete.
- Does not edit `88cn-scout-worker`.
- Does not edit `88cn-index-data`.
- Does not start worker runtime.
- Does not start crawler or audit runtime.
- Does not create Redis or queue runtime.
- Does not write Supabase, staging DB, or production DB.
- Does not write `published_projection`.
- Does not change sitemap.
- Does not deploy.
- Does not SSH or use Workbench.
- Does not read `.env`.
- Does not print secrets.
- Does not copy competitor text, category language, rating, ranking, or review content.
