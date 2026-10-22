# Live Deploy Skill

Use this card only when a roadmap task explicitly authorizes live deployment.

## Two-Step Operator Flow

Live deployment must use a two-step operator flow.

Step 1, prepare only:

```text
准备，不部署
```

In this step, run only local readiness and SHA resolution. Do not connect to the
production host and do not restart services.

```bash
npm run agent:deploy:prepare -- --prs <merge-sha> <merge-sha>
```

The prepare command fetches `origin`, prints the exact `origin/main` SHA,
verifies optional PR merge SHAs are contained in `origin/main`, and prints the
Workbench/SSH command to run later.

Step 2, deploy only after explicit SHA confirmation:

```text
我确认部署 123Charts origin/main SHA <target-sha> 到生产服务器，不启用任何新 env/payment/secret flag。
```

If the requested target SHA differs from the current `origin/main` SHA, stop and
ask for a fresh confirmation. Do not infer approval from an older message.

## Rules

- Keep deployment actions separate from product implementation.
- Never write secrets, server addresses, certificate files, or environment values to the repo.
- Record live evidence with redacted server details.
- Prefer dry-run commands before real deployment commands.
- Every live deployment must name an exact target commit SHA.
- Deploy the target SHA with the production deploy script, not with ad hoc shell steps:

```bash
cd /var/www/123charts
scripts/agent/deploy-production.sh --confirm --commit <target-sha>
```

- Workbench and SSH sessions may only run the repository deployment script and
  supporting smoke commands. Do not paste ad hoc GitHub tokens, environment
  values, private keys, server addresses, passwords, or certificate contents
  into the repo, PR body, issue comments, or chat transcript.
- Run smoke tests after PM2 and Nginx reloads.
- Run both the generic live smoke suite and current-PR-specific smoke paths.
- For PR-specific pages or sitemap entries, pass them explicitly:

```bash
cd /var/www/123charts
EXTRA_PATHS="/reports/example-report /new-public-page" \
REQUIRED_SITEMAP_PATHS="/reports/example-report" \
scripts/agent/deploy-production.sh --confirm --commit <target-sha>
```

## Required Evidence

- target region
- OS version
- Node version
- PM2 status summary
- Nginx status summary
- TLS status summary
- DNS status summary
- generic smoke checklist
- current PR smoke checklist
- sitemap inclusion checklist when the PR adds public indexable routes
- known limitations
- secrets: REDACTED
- server address: REDACTED

## Stop Conditions

- SSH is unstable and no stable execution channel is available.
- No exact target commit SHA is provided.
- The deployed server HEAD does not match the target SHA.
- DNS or TLS cannot be verified and the task requires LIVE PASS.
- Generic smoke or current-PR-specific smoke fails.
- Deployment would require storing secrets in Git.
