# 20 Future Protocol Modules

## Date

2026-06-15

## Purpose

Record planned future modules that are NOT part of Day 1 or Day 2 scope. These are aspirational features documented for architectural awareness. None of these modules should be implemented until their respective phases are approved and dependencies are met.

## Module List

### 1. Read-Only Public API

**Phase:** After Supabase snapshots are stable and published data exists.

**Description:** A read-only REST API that exposes public project data in JSON format. Endpoints for project listing, project detail, category listing, and collection listing.

**Dependencies:**
- Supabase integration with reviewed data snapshots
- Stable data schema
- API key or rate limiting infrastructure
- Public API documentation

**Not before:** Day 3+

---

### 2. MCP Server (Model Context Protocol)

**Phase:** After public API stabilizes.

**Description:** An MCP server implementation that allows AI applications to query 123Charts project data through the Model Context Protocol. Enables AI tools to access structured project information, Signal Scores, and category data.

**Dependencies:**
- Working read-only public API
- MCP protocol specification stability
- Provider-agnostic MCP implementation

**Not before:** After public API v1 stabilizes.

---

### 3. Curated Compare Pages

**Phase:** After Supabase snapshots exist with consistent project data.

**Description:** Side-by-side project comparison pages showing Signal Score dimensions, public sources, and editorial notes for 2-3 projects. Curated by editorial team, not auto-generated.

**Dependencies:**
- Supabase with reviewed project data
- Consistent Signal Score data across projects
- Editorial workflow for comparison curation

**Not before:** Day 3+

---

### 4. Signal Alerts

**Phase:** After claim + score system is operational.

**Description:** Optional notifications when a claimed project's Signal Score changes significantly, when new projects appear in a tracked category, or when collection membership changes.

**Dependencies:**
- Founder claim system
- Working Signal Score recalculation pipeline
- Notification infrastructure (email or in-app)
- User preference management

**Not before:** After founder claim system v1.

---

### 5. Soft Archive

**Phase:** After lifecycle states are fully operational.

**Description:** Projects that become inactive or unreachable are moved to a soft archive state. Archived projects remain in the index for historical reference but are excluded from active rankings, reports, and sitemaps by default.

**Dependencies:**
- Full lifecycle state machine
- Archive eligibility rules
- Stale source detection
- Historical data preservation

**Not before:** After lifecycle states v2.

---

### 6. Data Exposure Preferences

**Phase:** After founder dashboard exists.

**Description:** Claimed project founders can configure which public signal dimensions are displayed, which public sources are shown, and whether their project appears in specific collections or reports.

**Dependencies:**
- Founder dashboard
- Claimed project management
- Per-project preference storage
- Editorial override for public-interest data

**Not before:** After founder dashboard v1.

---

### 7. AI PR Reviewer

**Phase:** After 88cn-index-data repository exists with structured project data.

**Description:** An AI system that reviews pull requests to the 88cn-index-data repository, checking data validation, schema compliance, forbidden pattern detection, and editorial guideline adherence.

**Dependencies:**
- 88cn-index-data repository
- Structured project data pipeline
- Editorial guideline encoding
- PR review automation infrastructure

**Not before:** After 88cn-index-data repository is operational.

---

### 8. Limited Localization

**Phase:** After English traction is established.

**Description:** Add Chinese-language (zh-CN) versions of key public pages including the home page, founders page, and Genesis Badge page. Category and collection pages remain English-only initially.

**Dependencies:**
- Established English content baseline
- i18n infrastructure (Next.js i18n routing or middleware)
- Translation workflow and review process
- SEO considerations for localized pages (hreflang, localized sitemaps)

**Not before:** Post-launch, after English content is stable and indexed.

---

## Implementation Rules

1. None of these modules may be implemented before their dependencies are met.
2. Each module requires a separate design document and PR.
3. Modules must not introduce banned language or patterns.
4. Modules must not bypass editorial review gates.
5. MCP server must not write to 123Charts databases. Read-only only.
6. AI PR Reviewer is advisory only — must not auto-merge or auto-close PRs.
7. Localization must maintain all data integrity and language bans across locales.

## Current Phase Boundary

Day 1-2 scope:
- Next.js App Router scaffold (Day 1 — complete)
- SEO/GEO content topology (Day 1 — current PR)
- Supabase integration (Day 2)
- Project submission API (Day 2)
- Admin review skeleton (Day 2)
- Queue abstraction (Day 2)

Everything in this Future Protocol Modules document is post-Day 2.
