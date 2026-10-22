#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://123charts.com}"
CURL_BIN="${CURL:-$(command -v curl)}"
EXTRA_PATHS="${EXTRA_PATHS:-}"
REQUIRED_SITEMAP_PATHS="${REQUIRED_SITEMAP_PATHS:-}"

BASE_URL="${BASE_URL%/}"

paths=(
  "/api/healthz"
  "/"
  "/projects"
  "/submit"
  "/geo-checker"
  "/sitemap.xml"
  "/robots.txt"
  "/admin"
)

if [[ -n "${EXTRA_PATHS}" ]]; then
  read -r -a extra_paths <<< "${EXTRA_PATHS}"
  for path in "${extra_paths[@]}"; do
    [[ -z "${path}" ]] && continue
    if [[ "${path}" != /* ]]; then
      path="/${path}"
    fi
    paths+=("${path}")
  done
fi

for path in "${paths[@]}"; do
  url="${BASE_URL}${path}"
  status="$("${CURL_BIN}" -sS -o /dev/null -w "%{http_code}" "${url}")"
  echo "${status} ${path}"
  if [[ "${status}" -lt 200 || "${status}" -ge 400 ]]; then
    echo "live smoke failed for ${path}" >&2
    exit 1
  fi
done

if [[ -n "${REQUIRED_SITEMAP_PATHS}" ]]; then
  sitemap_tmp="$(mktemp)"
  trap 'rm -f "${sitemap_tmp}"' EXIT
  "${CURL_BIN}" -fsSL "${BASE_URL}/sitemap.xml" > "${sitemap_tmp}"

  read -r -a required_sitemap_paths <<< "${REQUIRED_SITEMAP_PATHS}"
  for path in "${required_sitemap_paths[@]}"; do
    [[ -z "${path}" ]] && continue
    if [[ "${path}" == http://* || "${path}" == https://* ]]; then
      expected_url="${path}"
    else
      if [[ "${path}" != /* ]]; then
        path="/${path}"
      fi
      expected_url="${BASE_URL}${path}"
    fi

    if ! grep -Fq "${expected_url}" "${sitemap_tmp}"; then
      echo "sitemap missing required URL: ${expected_url}" >&2
      exit 1
    fi
    echo "sitemap contains ${expected_url}"
  done
fi

echo "live smoke passed"
