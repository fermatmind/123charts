#!/usr/bin/env bash
set -euo pipefail
# The historical git-pull/Web-only deployment is retired.
echo 'No deployment executed. See deploy/README.md for artifact, migration, worker and rollback procedures.'
if [[ "${1:-}" != "--help" && $# -gt 0 ]]; then exit 1; fi
