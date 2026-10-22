# Third-Party Notice Register

Use this register before copying, adapting, or directly forking upstream material into 123Charts.

## Notice Entry Template

### Repository

TBD

### Upstream URL

TBD

### License

TBD

### Commit SHA

TBD

### Files copied

TBD

### Files adapted

TBD

### Usage in 123Charts

TBD

### Review owner

TBD

### Date added

TBD

### Risk notes

TBD

## Active Notices

No third-party code, files, templates, or datasets have been copied into 123Charts as of Day 0.6.

## Research Snapshot: gijsverheijke/directorystarter

### Repository

gijsverheijke/directorystarter

### Upstream URL

https://github.com/gijsverheijke/directorystarter

### License

MIT

### Commit SHA

93c2f79a4721afdb1a84c6f6fe184dd372b17b10

### Files copied

None into production.

### Files adapted

None.

### Usage in 123Charts

Research only. Files downloaded to `.scratch` only: yes. Future copy requires separate PR.

### Review owner

Human team

### Date added

2026-06-15

### Risk notes

Research snapshot only; no production code copied.

## Research Snapshot: Durgesh-Vaigandla/AI-tools-database

### Repository

Durgesh-Vaigandla/AI-tools-database

### Upstream URL

https://github.com/Durgesh-Vaigandla/AI-tools-database

### License

MIT

### Commit SHA

95053fc0a2f596c9445472409db181a6d684e3af

### Files copied

None into production.

### Files adapted

None.

### Usage in 123Charts

Research only. Files downloaded to `.scratch` only: yes. Future copy requires separate PR.

### Review owner

Human team

### Date added

2026-06-15

### Risk notes

Research snapshot only; no production data copied.

## Research Snapshot: AlbertYang666/ainav

### Repository

AlbertYang666/ainav

### Upstream URL

https://github.com/AlbertYang666/ainav

### License

MIT

### Commit SHA

4b6bf7e2969b185642de16534789b6f809f7b0ca

### Files copied

None into production.

### Files adapted

None.

### Usage in 123Charts

Research only. Files downloaded to `.scratch` only: yes. Future copy requires separate PR.

### Review owner

Human team

### Date added

2026-06-15

### Risk notes

Research snapshot only; no production code, copy, or data copied.

## Research Snapshot: DiscovAI/DiscovAI-search

### Repository

DiscovAI/DiscovAI-search

### Upstream URL

https://github.com/DiscovAI/DiscovAI-search

### License

Apache-2.0

### Commit SHA

0499fae24f948cc831a5c1fabf6a9474fc202b55

### Files copied

None into production.

### Files adapted

None.

### Usage in 123Charts

Research only. Files downloaded to `.scratch` only: yes. Future copy requires separate PR.

### Review owner

Human team

### Date added

2026-06-15

### Risk notes

Research snapshot only; semantic search remains future phase only.

## 123Charts local V1 dependencies

The new 123Charts UI is original implementation, using installed packages rather than a copied site/template or competitor dataset. Radix Dialog supplies accessible dialog primitives (MIT); Recharts supplies chart rendering (MIT); Tesseract.js supplies local OCR (Apache-2.0); Next.js `ImageResponse` supplies PNG rendering (MIT). Package versions and resolved artifacts are recorded in `package-lock.json`; upstream notices remain in installed packages. No third-party component source was vendored. Existing project profiles were used as research candidates; new concise descriptions are original and official URLs/source-check outcomes are recorded locally.

Earlier local previews used an ignored Mac font, never redistributed. Current sharing cards use the licensed Noto Sans SC asset recorded below; no system font is required.

## Supabase self-hosted runtime templates

- Repository / upstream: https://github.com/supabase/supabase
- License: MIT; full license in `deploy/self-hosted/upstream/LICENSE`.
- Commit SHA: bc27d2661edd09a5d0b8d76ce33da6d4071a756e
- Copied: docker-compose.yml and docker-compose.kong.yml (reference copies), volumes/api/kong-entrypoint.sh and volumes/db/{roles,jwt,_supabase,webhooks}.sql.
- Adapted: volumes/api/kong.yml (Auth, REST and Storage routes only), deployment Compose (dedicated names/volumes, loopback or explicit private bind, resource and log bounds; unused services removed).
- Usage: isolated 123Charts self-hosted Supabase; no CLI stack exposed in production.
- Review owner: local project maintainer; date: 2026-10-22.
- Risk: resource admission, SMTP/TLS and host integration remain deployment prerequisites.

## Noto Sans SC sharing-card font

- Repository: https://github.com/google/fonts
- Commit SHA: 45e3d5269e4a17d823f6d84470bc084dc5ae46f6
- License: SIL Open Font License 1.1, retained in `public/fonts/OFL.txt`.
- Source: ofl/notosanssc/NotoSansSC[wght].ttf and OFL.txt.
- Adapted: a weight-400 static TrueType instance, public/fonts/NotoSansSC-Regular.ttf, using fontTools; names and license retained.
- Usage: server-generated Chinese/English sharing cards, independent of macOS fonts.
- Review owner: local project maintainer; date: 2026-10-22.
