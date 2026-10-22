# 123Charts Agent Boundary Policy

## Hard Rule

```text
Automatic recommendation, human final gate.
```

The agent system must never bypass human review or publish directly.

## Forbidden Actions

- worker runtime before explicit approval;
- crawler before explicit approval;
- live HTTP audit before explicit approval;
- Redis / queue runtime before explicit approval;
- Supabase write;
- staging DB write;
- production DB write;
- production deploy;
- sitemap mutation;
- `published_projection` mutation;
- `88cn-index-data` mutation;
- external outreach;
- email / DM / social / CRM write;
- auto-publish;
- browser fallback / Playwright;
- WAF bypass;
- login / cookie / session scraping;
- `.env` or secret reading;
- server/cloud/Aliyun/Tencent action.

## Risk Register

| Risk | Prevention | Detection | Required Human Gate |
| --- | --- | --- | --- |
| competitor content copying | store only source references, factual fields, and own review metadata | similarity review, source classification, redaction checks | reviewer approves final copy |
| raw data leak | keep raw worker evidence outside public frontend and public snapshots | no-leak checks, field allowlists, projection-only frontend reads | admin publish review |
| auto-publish | no worker write to `published_projection` or sitemap | negative tests, task boundary checks, AGENTQ | manual publish gate |
| wrong canonical merge | require official source, duplicate evidence, and ambiguity state | canonical conflict report and review-needed classification | reviewer resolves ambiguity |
| WAF/proxy/login violation | HTTP-first, public-only, no login/session/cookie/proxy bypass | audit logs and forbidden action checks | explicit audit approval before live HTTP |
| PII collection | public-safe schema only, no private contacts | schema validation and redaction check | reviewer rejects private fields |
| external outreach | no email, DM, social, CRM write | static task policy and audit of generated artifacts | separate outreach approval if ever needed |
| paid/organic mixing | separate sponsored/commercial flags from organic evidence | report field review and paid-signal checks | editorial/admin review |
| AI-generated hallucinated summaries | require source-backed facts and empty-state uncertainty | source coverage checks and reviewer QA | reviewer approves public text |
| sitemap pollution | only `published_projection` feeds sitemap | sitemap source checks and published-only tests | manual publish gate |

## Public-Surface Allowlist

Public frontend/search/sitemap may read only reviewed projection fields. They must not expose:

- raw seed;
- raw source evidence;
- raw audit payload;
- review notes;
- canonical ambiguity details;
- quarantine details;
- rejected details;
- private hashes;
- worker job payload;
- internal confidence.

## AGENT1 Entry Boundary

AGENT1 may start in `88cn-scout-worker` only as worker CLI contract stabilization:

```text
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

