# Backers / Alpha Data Feed Landing v0

## Purpose

PR54 adds a restrained read-only landing page for future Alpha Data Feed interest.

The page is an informational public surface for research-oriented signal snapshots. It does not launch a feed endpoint, payment path, commitment flow, or private backer intake.

## Public Page

Route:

- `/backers`

The page is static and intentionally indexable. It links only to existing public 123Charts surfaces:

- `/projects`
- `/reports`

## Allowed Copy Frame

The page can describe:

- future data feed interest
- read-only signal snapshots
- public project metadata
- aggregate public signals
- research-oriented review
- backer interest
- capital signal as a high-level interest label

## Boundary

The page must not:

- create a payment or commitment flow
- collect private backer data
- launch a public API feed
- expose private project data
- promise outcomes or returns
- describe ownership sale mechanics
- use restricted capital-product claims

## Data Boundary

PR54 does not add database tables, database writes, public API routes, MCP routes, or external service calls.

## Checker

Run:

```bash
npm run backers-landing:check
```

The checker verifies:

- the `/backers` route exists
- copy contains the required read-only public-signal framing
- restricted capital/commercial wording is absent
- no forms or inputs exist
- no public API, payment, MCP, database, sitemap, deployment, or server surfaces are changed
