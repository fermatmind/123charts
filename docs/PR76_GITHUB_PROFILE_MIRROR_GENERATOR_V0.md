# PR76 GitHub Profile Mirror Generator v0

## Scope

PR76 adds a local-only dry-run generator for GitHub profile mirror markdown.

This task does not add package scripts, dependencies, app code, public routes, sitemap entries, API routes, MCP behavior, payment behavior, deploy configuration, GitHub mutation calls, GitHub Pages deployment, external pull requests, external index pings, generated committed mirror output, or data repository writes.

## Generator

Script:

```text
scripts/generate-github-profile-mirror.mjs
```

Required invocation:

```text
node scripts/generate-github-profile-mirror.mjs --dry-run --source local --out /tmp/123charts-github-profile-mirror --no-write-external
```

Optional single-project invocation:

```text
node scripts/generate-github-profile-mirror.mjs --dry-run --source local --out /tmp/123charts-github-profile-mirror --no-write-external --slug aurora-code
```

The generator refuses to run unless all of these are true:

- `--dry-run` is present;
- `--source local` is used;
- `--no-write-external` is present;
- output path is under the system temp directory;
- output path is outside this repository;
- output path is outside `/Users/rainie/Desktop/88cn-index-data`;
- selected project status is `published`, `claimed`, or `owner_verified`.

## Source Boundary

PR76 reads only the existing local `lib/demo-projects.ts` project records. It does not modify that file and does not read or write the external data repository.

Allowed project fields:

- `slug`
- `name`
- `tagline`
- `category`
- `website`
- `status`
- `publicSources`
- public editorial note only if it is not pending human review

The generator intentionally excludes raw `signalScore`, dimension scores, `sourceConfidence`, and any private, admin, payment, analytics, credential, reviewer, audit, or notification fields.

## Output Boundary

Generated markdown is written only to the requested temp directory. No generated markdown profile is committed in this PR.

The output contains:

- project name and reviewed public tagline;
- public profile URL placeholder;
- official site;
- public GitHub URL when present in local public sources;
- public docs URL when present in local public sources;
- category and public lifecycle state;
- public-signal labels instead of raw internal score values;
- approved unknown labels for unavailable or not-human-reviewed data;
- explicit boundaries against private metadata and outcome promises.

## Human Checkpoint Review

The roadmap marks PR76 as human-checkpointed for data repository writes and external repository writes.

This implementation does not trigger those checkpoint reasons:

- no data repository mutation;
- no external repository write;
- no generated profile commit;
- no GitHub push outside this repository branch;
- no external pull request creation;
- no GitHub Pages deployment;
- no GitHub API mutation;
- no Public API, MCP, payment, deploy, server, dependency, or package change.

Because the train-level roadmap has `auto_merge_allowed=false` and PR76 reports `can_auto_merge=no`, this PR must stop at merge-ready after validation.

## Validation Evidence

Task-specific validation:

```text
node scripts/generate-github-profile-mirror.mjs --dry-run --source local --out /tmp/123charts-github-profile-mirror --no-write-external
```

Expected behavior:

- writes sanitized markdown files under `/tmp/123charts-github-profile-mirror`;
- reports `externalWrite: false`;
- reports `dataRepoMutation: false`;
- exits non-zero for non-local source, missing dry-run, missing `--no-write-external`, or output outside the system temp directory.

Roadmap validation:

```text
npm run verify:day0
npm run policy:scan
npm run third-party:check
npm run agent:scope:check -- PR76
```

## Definition Of Done

- [x] Local-only generator exists.
- [x] Generator requires dry-run mode.
- [x] Generator writes only to a temp output path.
- [x] Generator reads only local reviewed public data.
- [x] Generated files are not committed.
- [x] Data repository mutation is blocked.
- [x] External writes are blocked.
- [x] Private, admin, payment, analytics, credential, reviewer, audit, and notification fields are blocked.
- [x] Raw internal score/source-confidence fields are excluded.
- [x] No auto PR to another repository is created.

## Proceed Decision

PR77 can proceed only after PR76 is merged and cleaned. PR77 must remain QA-only and verify the dry-run output boundary without editing generator code.
