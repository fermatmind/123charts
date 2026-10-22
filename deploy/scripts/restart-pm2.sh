#!/usr/bin/env bash
# 123Charts PM2 Restart Script
# Usage: bash deploy/scripts/restart-pm2.sh
set -euo pipefail

cd "$(dirname "$0")/../.."

echo "[123Charts] Restarting PM2 process..."

if pm2 list | grep -q "123charts-web"; then
  pm2 restart 123charts-web
  echo "[123Charts] 123charts-web restarted successfully."
else
  echo "[123Charts] 123charts-web not running. Starting fresh..."
  pm2 start deploy/pm2/ecosystem.config.cjs
  pm2 save
  echo "[123Charts] 123charts-web started and saved to PM2 process list."
fi

echo "[123Charts] PM2 status:"
pm2 status
