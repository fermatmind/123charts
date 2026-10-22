# 14 Open Source Reuse Policy

123Charts may learn from public projects, but copying requires a license, provenance, and review trail.

## Reuse Levels

- Direct Fork Allowed
- Module Extraction Allowed
- Reference Only
- Forbidden

## Direct Fork Allowed

Direct forks are allowed only for MIT, Apache-2.0, BSD, or clearly permissive repositories.

Required records:

- LICENSE
- copyright
- upstream URL
- commit SHA
- copied files
- adapted files
- entry in `third_party/NOTICE.md`

## Module Extraction Allowed

Small modules may be extracted from permissive repositories only when the copied files, adaptation scope, license, and upstream commit are recorded in `third_party/NOTICE.md`.

## Reference Only

Treat these sources as reference only:

- EULA projects
- no visible license
- unclear license
- paid templates
- competitor UI
- competitor content databases

Reference-only means reading for product understanding. It does not permit copying code, copy, screenshots, logos, data rows, or proprietary structure.

## Forbidden

Explicitly forbidden:

- copying no-license code
- copying EULA-restricted template code
- copying competitor UI pixel-by-pixel
- copying tool descriptions
- copying project descriptions
- copying screenshots or logos
- copying paid-only scripts
- bulk importing third-party data directly as published 123Charts pages

## Current Upstream Candidates

### Direct Fork / Strong Reference

| Repository | License | Allowed Use |
| --- | --- | --- |
| `gijsverheijke/directorystarter` | MIT | Main web scaffold candidate. |
| `Durgesh-Vaigandla/AI-tools-database` | MIT | Data repo schema, validation, and aggregation candidate. |
| `AlbertYang666/ainav` | MIT | i18n, admin, submit, and compare reference. |
| `DiscovAI/DiscovAI-search` | Apache-2.0 | Future semantic search reference. |

### Candidate Source Only

| Repository | Allowed Use |
| --- | --- |
| `lakey009/AI-Tools-List` | Candidate URL pool only. |
| `mahseema/awesome-ai-tools` | Candidate pool and community PR pattern only. |
| `ToolkitlyAI/awesome-ai-tools` | Candidate pool and category reference only. |

### Reference Only / Do Not Copy

| Repository | Reason |
| --- | --- |
| `aitoollist/awesome-ai-tool-list` | No confirmed visible license in current research; do not copy code or content. |
| `nolly-studio/cult-directory-template` | EULA / paid feature constraints; do not copy code or paid enrichment scripts. |

## Review Rule

No upstream code, schema, template, or dataset may be copied into 123Charts until `third_party/NOTICE.md` has a complete entry for that source.
