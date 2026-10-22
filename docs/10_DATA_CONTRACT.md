# 10 Data Contract

123Charts expects a future split between the main web repository and a public index-data repository.

## Public JSON Scope

Public JSON may contain only public project metadata:

- project name
- official website
- category slug
- one-line description
- public GitHub URL
- public docs URL
- public pricing URL
- public launch URL
- public founder social URL

## Excluded Data

Public repositories must not collect contact addresses, private revenue proof, payment screenshots, keys, analytics exports, bank records, identity documents, customer lists, or login credentials.

## Import Boundary

External JSON must enter an import staging table first. Admin review is required before data moves into primary project records.

External imports must not create published project pages directly. Import workers may create staging rows, normalized snapshots, and review tasks only.

## Snapshot Boundary

Public rendering must use reviewed local snapshots. External APIs must not be called at render time for public project pages.

Long-term storage should prefer normalized snapshots. Raw payloads are short-term evidence only and must have bounded retention.

## Unknown Values

When a value is unavailable, use:

- Not verified
- Public signals only
- Not enough data
- Founder not claimed
- Source unavailable
