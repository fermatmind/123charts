#!/usr/bin/env bash
set -u

if [ -n "${APP_URL:-}" ]; then
  BASE_URL="$APP_URL"
else
  BASE_URL="http://localhost:${PORT:-3100}"
fi
APP_URL="$BASE_URL"
HEALTH_URL="${APP_URL%/}/api/healthz"
ERROR_FILE="docs/BUILD_ERRORS.md"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

mkdir -p "$(dirname "$ERROR_FILE")"

HTTP_STATUS="$(curl -sS -o /tmp/123charts-healthz.out -w "%{http_code}" --max-time 8 "$HEALTH_URL" 2>/tmp/123charts-healthz.err || true)"

if [ "$HTTP_STATUS" = "200" ]; then
  echo "codex-preflight passed: $HEALTH_URL returned 200"
  rm -f /tmp/123charts-healthz.out /tmp/123charts-healthz.err
  exit 0
fi

ERROR_TEXT="$(tr '\n' ' ' </tmp/123charts-healthz.err | sed 's/|/\\|/g')"
if [ -z "$ERROR_TEXT" ]; then
  ERROR_TEXT="HTTP status ${HTTP_STATUS:-unavailable}"
fi

{
  printf '\n| %s | %s | %s | Open |\n' "$TIMESTAMP" "codex-preflight $HEALTH_URL" "$ERROR_TEXT"
} >> "$ERROR_FILE"

echo "codex-preflight failed: $HEALTH_URL did not return 200" >&2
echo "Recorded failure in $ERROR_FILE" >&2

rm -f /tmp/123charts-healthz.out /tmp/123charts-healthz.err
exit 1
