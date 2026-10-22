#!/usr/bin/env bash
# 123Charts Runtime Health Check
# Run after deployment to verify the application is healthy
# Usage: bash deploy/scripts/check-runtime.sh [APP_URL]
set -u

APP_URL="${1:-${APP_URL:-http://127.0.0.1:3000}}"
TIMEOUT=8
PASS=0
FAIL=0

check() {
  local label="$1"
  local url="$2"
  local expected="${3:-200}"

  echo -n "  $label ... "
  status=$(curl -sS -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null || echo "000")

  if [ "$status" = "$expected" ]; then
    echo "PASS ($status)"
    PASS=$((PASS + 1))
  else
    echo "FAIL (got $status, expected $expected)"
    FAIL=$((FAIL + 1))
  fi
}

echo "[123Charts] Runtime Health Check — $APP_URL"
echo ""

# Health endpoint
check "Health API"          "$APP_URL/api/healthz"       "200"

# Public API
check "Project API"         "$APP_URL/api/projects/aurora-code" "200"

# Static SEO files
check "Sitemap"             "$APP_URL/sitemap.xml"        "200"
check "Robots"              "$APP_URL/robots.txt"         "200"

# Public pages
check "Home"                "$APP_URL/"                   "200"
check "Projects"            "$APP_URL/projects"           "200"
check "Project Detail"      "$APP_URL/projects/aurora-code" "200"
check "Categories"          "$APP_URL/categories/ai-agents" "200"
check "Reports"             "$APP_URL/reports"            "200"
check "Founders"            "$APP_URL/founders"           "200"
check "Genesis"             "$APP_URL/genesis"            "200"

# Non-indexable pages
check "Submit (noindex)"    "$APP_URL/submit"             "200"
check "Claim (noindex)"     "$APP_URL/claim/aurora-code"  "200"

# Admin
check "Admin Login"         "$APP_URL/admin/login"        "200"

echo ""
echo "[123Charts] Results: $PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
