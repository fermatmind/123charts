#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
# Build tools are required. Only the packaged artifact goes to the runtime nodes.
npm ci
CHARTS_BUILD_DIR=.next-production npm run build
node deploy/scripts/package-release.mjs
