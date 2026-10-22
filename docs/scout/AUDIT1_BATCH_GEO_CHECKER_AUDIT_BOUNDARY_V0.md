# AUDIT1 Batch Geo-Checker Audit Boundary v0

Status: validation passed  
Task: PR139 / AUDIT1  
Result: GO_AUDIT2_DEPENDENCY  
Date: 2026-06-20

## Decision

AUDIT1 defines the local batch audit boundary for future geo-checker style readiness checks against scouted sandbox records. It does not implement a batch runner, queue, script, audit worker, external scan, crawler, browser automation, public route, sitemap change, Public API change, MCP tool, deployment, Supabase write, or companion data repo mutation.

AUDIT2 may use this as a dependency for a local dry-run contract only if its own roadmap scope allows it.

## Eligibility

Only records with these sandbox statuses may be considered for future batch audit planning:

- `audit_pending`
- `review_candidate`

Records in `scouted` need source/canonical completion first. Records in `quarantined` are ineligible until a human reviewer clears the issue.

## URL Boundary

Audit targets must be public URL only:

- `https://` preferred;
- `http://` only if no secure official URL exists and the task explicitly allows it;
- no private IPs, localhost, internal hostnames, file URLs, data URLs, credentialed URLs, forms, login pages, cookies, or browser sessions;
- no competitor database URLs as source-of-truth targets;
- no recursive crawl targets.

## Local Dry-Run First

Any future implementation must support a local dry-run mode before any write-capable mode exists. Dry-run output must default outside the repo, such as `/tmp/123charts-audit-dry-run`, and must not be committed unless a later task explicitly allows committed fixtures.

Dry-run output must include:

- input count;
- eligible count;
- skipped count by reason;
- per-target audit status;
- failure taxonomy from AUDIT0;
- safety flags for external writes, public surface changes, Supabase writes, data repo mutation, and deploy, all false.

## Batch Limits

| Limit | Boundary |
| --- | --- |
| Default jobs per run | 20 maximum |
| Concurrency | 3 maximum |
| Timeout | 8 seconds maximum |
| Retries | 3 maximum including initial attempt |
| Host cooldown | Required |
| Failed scans | Must not zero out prior successful snapshots |
| Snapshot handling | Keep last successful snapshot and mark stale when needed |

## Result Contract

Future audit result rows should use:

```json
{
  "audit_version": "batch_geo_audit_v0",
  "sandbox_id": "local-stable-id",
  "target_url": "https://example.com",
  "eligible": true,
  "status": "source_unavailable",
  "failure_taxonomy": "timeout",
  "snapshot_action": "keep_last_successful",
  "quarantine_recommended": false,
  "recheck_after": "2026-07-20",
  "external_write_performed": false,
  "public_surface_changed": false,
  "supabase_write_performed": false,
  "data_repo_mutated": false
}
```

## Stop Conditions

A future batch audit must stop on:

- forbidden path mutation;
- public surface change;
- external write;
- Supabase write;
- data repo mutation;
- private/contact-like data capture;
- copied restricted source text;
- login/form/cookie/session requirement;
- WAF or rate-limit bypass attempt;
- required check failure;
- P0/P1 safety finding.

## Handoff

AUDIT2 may define a local batch audit dry-run contract. If AUDIT2 remains docs-only, it must stop at a contract and not create executable audit code.

Do not start AUDIT2 implementation, SCOUT3, REPORT1, REPORT2, SCOUTQ, second-round Growth, BETA1, I18N0, OPS8D, OPS10A, or PR101 from this PR.

## Validation

| Check | Result |
| --- | --- |
| `npm run verify:day0` | PASS |
| `npm run agent:redact:check` | PASS |
| `npm run agent:train-plan:check -- --batch TRAIN-PR140-PR141-LOCAL-DRY-RUNS` | PASS |
| `npm run agent:scope:check -- PR139` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
