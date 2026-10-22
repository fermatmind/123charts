# PR86 Snapshot Export + Cleansing QA v0

- Date: 2026-06-19
- Role: Codex-QA
- Scope: QA-only validation for PR84 local snapshot export and PR85 data cleansing rules.
- Result: PASS
- Deployment: none
- External writes: none
- Data repository mutation: none

## Summary

PR86 validates that the PR84 local-only dry-run exporter and PR85 data cleansing
contract are ready for the next gated train. The QA pass used only existing
scripts and local read-only inspection. It did not modify product code, scripts,
schemas, package metadata, runtime routes, API surfaces, or the data repository.

## Positive Dry Run Evidence

Command:

```bash
node scripts/export-alpha-feed-snapshot.mjs --dry-run --out /tmp/123charts-alpha-snapshot-pr86-qa --source local --no-external-write
```

Observed manifest summary:

```json
{
  "snapshot_version": "pr84-dry-run-v0",
  "dry_run": true,
  "source": "local",
  "output_dir": "/tmp/123charts-alpha-snapshot-pr86-qa",
  "record_count": 5,
  "formats": ["csv", "ndjson"],
  "written_files": ["snapshot.ndjson", "snapshot.csv"],
  "denied_runtime_surfaces": [
    "endpoint",
    "customer_access",
    "external_write",
    "data_repo_mutation",
    "api_key_runtime",
    "metering_runtime"
  ]
}
```

## Snapshot Field Review

The generated CSV header was:

```text
snapshot_version,project_slug,project_name,canonical_url,category,technology_tags,published_status,public_source_links,machine_readability_summary,last_reviewed_at,public_profile_url,public_changelog_summary
```

The generated NDJSON rows were checked for:

| Check | Result |
| --- | --- |
| Manifest `dry_run` is true | PASS |
| Manifest source is local | PASS |
| Manifest row count matches NDJSON rows | PASS |
| CSV and NDJSON files exist under `/tmp/123charts-alpha-snapshot-pr86-qa` | PASS |
| Every row has `published_status: "published"` | PASS |
| Every row uses only PR82 allowlisted fields | PASS |
| Denied private/admin/payment/customer/metering/raw/internal fields are absent | PASS |

## Negative Probe Evidence

The existing checker passed:

```bash
node scripts/check-alpha-feed-snapshot.mjs
```

Additional PR86 probes confirmed the exporter fails closed:

| Probe | Result | First error line |
| --- | --- | --- |
| Missing `--dry-run` | PASS | `explicit --dry-run is required` |
| Output under this repository | PASS | `output must be under the OS temp directory` |
| Output under `/Users/rainie/Desktop/88cn-index-data` | PASS | `output must be under the OS temp directory` |
| URL-style external destination | PASS | `external destinations are not allowed` |
| Remote source | PASS | `only --source local is allowed` |

## PR85 Contract Review

`ops/contracts/data-cleansing-freshness.json` was reviewed as a rules-only
contract. It defines:

- Dedupe handling for duplicate slugs and canonical URLs.
- URL canonicalization rules for host casing, fragments, trailing slash handling,
  and tracking query removal.
- Freshness buckets for fresh, watch, stale, and unknown records.
- Source failure handling for DNS errors, 404, 410, 5xx, redirects, and malformed
  URLs.
- Lifecycle handling for archived, renamed, merged, and removed records.
- Public-safe Source Confidence outputs that avoid raw internal confidence data.

The contract explicitly keeps runtime feed, endpoint, database migration,
customer output, external write, and data repository mutation disabled.

## Repository State

| Repository | Check | Result |
| --- | --- | --- |
| `/Users/rainie/Desktop/123charts.com/123charts` | QA branch had no product-code changes before docs/status updates | PASS |
| `/Users/rainie/Desktop/88cn-index-data` | `git status --short --branch` stayed clean on `main...origin/main` | PASS |

## Non-Goals Confirmed

- No deploy.
- No public API endpoint.
- No API keys.
- No metering runtime.
- No Laravel runtime.
- No dependency change.
- No Supabase webhook or migration.
- No Redis production configuration.
- No B2B endpoint.
- No customer-facing export.
- No snapshot committed to this repository.
- No snapshot committed to `/Users/rainie/Desktop/88cn-index-data`.
- No payment or billing behavior.
- No investor product behavior.
- No data repository mutation.
- No external write.

## Recommendation

PR86 can merge after required checks pass. Stop before PR87 after merge,
post-merge cleanup, final validation, and next-train readiness reporting.
