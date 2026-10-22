# 29 Environment Variables

## Date

2026-06-15

## Purpose

Document all environment variables required for 123Charts local development, production deployment, and future services. This file is the single source of truth for environment configuration.

## Variable Reference

### Core Application

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `development` | `production`, `development`, or `test` |
| `PORT` | No | `3000` | Port for the Next.js server |
| `APP_URL` | Yes | `http://localhost:3000` | Public URL of the application (used for sitemap, robots, OG metadata) |

### Supabase

| Variable | Required | Public | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (for Supabase features) | Yes | Supabase project URL (e.g., `https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (for Supabase features) | Yes | Supabase anonymous API key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | No (admin-only) | **NO** | Supabase service role key — bypasses RLS, must never be exposed to the client |

### Future Variables (Not Yet Active)

These variables are documented for future phases but are NOT required in the current deployment:

| Variable | Phase | Description |
|---|---|---|
| `RESEND_API_KEY` | Future | Email delivery via Resend |
| `STRIPE_SECRET_KEY` | Future | Stripe payment processing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Future | Stripe client-side key |
| `TURNSTILE_SECRET_KEY` | Future | Cloudflare Turnstile (anti-spam) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Future | Turnstile client-side key |
| `CRON_SECRET` | Future | Secret for cron job authentication |
| `WEBHOOK_SIGNING_SECRET` | Future | Webhook signature verification |

## Security Rules

1. **Never commit secrets to git.** `.env.local`, `.env.production`, and any file containing real keys must be in `.gitignore`.
2. **`.env.example` is safe to commit** — it contains only placeholder values and documentation.
3. **`NEXT_PUBLIC_*` variables are baked into the JavaScript bundle** at build time. They are visible in browser dev tools. Only put non-sensitive values in `NEXT_PUBLIC_*` variables.
4. **`SUPABASE_SERVICE_ROLE_KEY` must NEVER be prefixed with `NEXT_PUBLIC_`**. It bypasses Row-Level Security and grants full database access.
5. **Set secrets on the server via PM2 env or a server-side `.env` file** — never include them in the repository.

## How to Set Variables

### Local Development

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

`.env.local` is in `.gitignore` and will never be committed.

### Production (PM2)

Option A — via ecosystem file (for non-secret vars):
```js
// deploy/pm2/ecosystem.config.cjs
env: {
  NODE_ENV: "production",
  PORT: "3000",
}
```

Option B — via PM2 env command (for secrets):
```bash
pm2 env 123charts-web set NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
pm2 env 123charts-web set NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
pm2 env 123charts-web set SUPABASE_SERVICE_ROLE_KEY=eyJ...
pm2 restart 123charts-web --update-env
```

Option C — via `.env` file on server:
```bash
# Create /var/www/123charts/.env.production with real values
echo 'NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co' >> .env.production
# PM2 will load this automatically if present
```

### CI/CD (GitHub Actions)

Set variables as GitHub Secrets and inject them at build time via workflow YAML.

## Variable Validation

The application validates environment variables at startup:
- If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set, Supabase-dependent features are disabled gracefully (503 responses for API endpoints, configuration notice for admin pages).
- The build does not crash when Supabase variables are missing.

## Future Variable Expansion

When new services are added:
1. Add the variable to this document
2. Add it to `.env.example` with a placeholder
3. Add validation in `lib/supabase/env.ts` or a new env module
4. Never add secrets as `NEXT_PUBLIC_*`
