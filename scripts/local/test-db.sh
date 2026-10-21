#!/bin/bash
set -euo pipefail
container=supabase_db_123charts-local
checkdb="charts_migration_check_$$"
if docker exec "$container" psql -U postgres -d postgres -Atc "select datname from pg_database where datname='$checkdb'" | rg -q .; then
  echo 'Dedicated migration check database already exists; stopping without changing it.'
  exit 1
fi
docker exec "$container" createdb -U postgres "$checkdb"
trap 'docker exec "$container" dropdb -U postgres "$checkdb"' EXIT
docker exec "$container" pg_dump -U postgres -d postgres --schema-only --no-owner --no-privileges --schema=auth --schema=storage > .local/supabase-base-schema.sql
docker exec "$container" psql -U postgres -d "$checkdb" -v ON_ERROR_STOP=1 -c 'create schema if not exists extensions; create extension if not exists pgcrypto with schema extensions;'
docker exec -i "$container" psql -U postgres -d "$checkdb" -v ON_ERROR_STOP=1 < .local/supabase-base-schema.sql
for migration in supabase/migrations/*.sql; do
  echo "Applying $migration"
  docker exec -i "$container" psql -U postgres -d "$checkdb" -v ON_ERROR_STOP=1 < "$migration"
done
docker exec "$container" psql -U postgres -d "$checkdb" -Atc "select count(*) from public.charts_projects; select count(*) from public.charts_snapshots;"
docker exec -i "$container" psql -U postgres -d "$checkdb" -v ON_ERROR_STOP=1 < tests/charts/source-corrections.sql
docker exec -i "$container" psql -U postgres -d "$checkdb" -v ON_ERROR_STOP=1 < tests/charts/discovery.sql
echo 'PASS: empty-schema migrations and isolated source correction tests; runtime database untouched.'
