# PR84 Local Snapshot Exporter Dry Run v0

## Result

Validation target: PR84 adds a local-only dry-run exporter for the future Alpha Data Feed.

The exporter writes only to `/tmp/123charts-alpha-snapshot-*` and requires explicit `--dry-run`. It rejects repo output paths, data repo output paths, external destinations, unsafe temp names, and non-local sources.

## Files

- `scripts/export-alpha-feed-snapshot.mjs`
- `scripts/check-alpha-feed-snapshot.mjs`

## CLI

Default dry-run:

```bash
node scripts/export-alpha-feed-snapshot.mjs --dry-run
```

Explicit output:

```bash
node scripts/export-alpha-feed-snapshot.mjs --dry-run --out /tmp/123charts-alpha-snapshot-test
```

Optional flags:

- `--format ndjson`
- `--format csv`
- `--source local`
- `--no-external-write`

## Output

The exporter writes:

- `snapshot.ndjson`
- `snapshot.csv`
- `manifest.json`

The manifest records dry-run mode, local source, output directory, record count, written files, and denied runtime surfaces.

## Data Boundary

The exporter reads local public demo records from the repository and emits only `published` records.

Allowed output fields follow the PR82 snapshot schema:

- `snapshot_version`
- `project_slug`
- `project_name`
- `canonical_url`
- `category`
- `technology_tags`
- `published_status`
- `public_source_links`
- `machine_readability_summary`
- `last_reviewed_at`
- `public_profile_url`
- `public_changelog_summary`

Denied fields are blocked by the checker, including private contact fields, admin and review fields, payment fields, API key fields, customer key fields, metering fields, raw payloads, raw Supabase rows, private telemetry, Source Confidence internals, and Signal Score internals.

## Rejection Rules

The exporter rejects:

- missing `--dry-run`;
- output outside `/tmp`;
- output directory names that do not start with `123charts-alpha-snapshot-`;
- output inside this repository;
- output inside `/Users/rainie/Desktop/88cn-index-data`;
- external destinations such as URL-style outputs;
- non-local sources.

## Definition Of Done

| Requirement | Status | Evidence |
| --- | --- | --- |
| Outputs only to `/tmp` by default | PASS | Default output path uses OS temp directory and required prefix |
| No external write | PASS | URL-style destinations and non-local sources rejected |
| No customer access | PASS | No endpoint or customer surface is created |
| No secrets | PASS | No env, credential, or secret inputs are required |
| No data repo mutation | PASS | Data repo paths are rejected |
| Checker validates privacy | PASS | `scripts/check-alpha-feed-snapshot.mjs` validates denied fields and path boundaries |

## Validation Plan

Required PR84 validations:

- `npm run verify:day0`
- `npm run policy:scan`
- `npm run third-party:check`
- `npm run agent:scope:check -- PR84`

Task-specific validation:

- `node scripts/check-alpha-feed-snapshot.mjs`

Additional train-runner validations:

- `npm run agent:redact:check`
- `npm run agent:tool:check`
- `npm run agent:mcp-config:check`
- `npm run agent:plugin-policy:check`
- `npm run agent:batch:check`
- `npm run agent:train-plan:check`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run agent:gate`

## Next Task

PR85 may proceed after PR84 is merged, local `main` is synced to `origin/main`, the worktree is clean, and post-merge validation passes.
