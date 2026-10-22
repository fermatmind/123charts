import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];

function read(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    errors.push(`missing file: ${file}`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}

const migration = read('supabase/migrations/010_conversion_metrics.sql');
const library = read('lib/metrics/conversion-metrics.ts');
const apiRoute = read('app/api/metrics/conversion/route.ts');
const adminPage = read('app/admin/metrics/page.tsx');
const adminHome = read('app/admin/page.tsx');
const component = read('components/admin/conversion-metric-summary.tsx');
const docs = read('docs/53_CONVERSION_METRICS_PIVOT_GATE_V0.md');

for (const table of ['conversion_metric_daily_counts', 'conversion_pivot_gate_snapshots']) {
  if (!new RegExp(`create table if not exists public\\.${table}`, 'i').test(migration)) {
    errors.push(`${table} table missing`);
  }
  if (!new RegExp(`alter table public\\.${table} enable row level security`, 'i').test(migration)) {
    errors.push(`${table} RLS missing`);
  }
  if (!new RegExp(`${table}_[a-z_]+_admin`, 'i').test(migration)) {
    errors.push(`${table} admin policy missing`);
  }
}

for (const metric of ['report_view', 'geo_checker_run', 'project_submission', 'project_claim']) {
  if (!migration.includes(metric) || !library.includes(metric)) {
    errors.push(`metric key missing: ${metric}`);
  }
}

for (const day of ['30', '60', '100']) {
  if (!library.includes(`day: ${day}`) || !docs.includes(`Day ${day}`)) {
    errors.push(`pivot gate day missing: ${day}`);
  }
}

if (!apiRoute.includes('INTERNAL_METRICS_WRITE_KEY')) {
  errors.push('metrics write API must require INTERNAL_METRICS_WRITE_KEY');
}
if (!apiRoute.includes('x-123charts-metrics-key')) {
  errors.push('metrics write API must require internal header');
}
if (!apiRoute.includes('Unknown metrics payload fields are not accepted')) {
  errors.push('metrics write API must reject unknown fields');
}
if (!apiRoute.includes('normalizeMetricSurface')) {
  errors.push('metrics write API must normalize local metric surfaces');
}
if (!adminPage.includes('checkAdminGuard') || !adminPage.includes('noIndex()')) {
  errors.push('admin metrics page must be admin-gated and noindex');
}
if (!adminHome.includes('/admin/metrics')) {
  errors.push('admin dashboard link missing');
}
if (!component.includes('Aggregate counters') || !component.includes('Pivot gates')) {
  errors.push('admin summary component missing expected sections');
}

const forbiddenMetricStorage = [
  'email',
  'ip_address',
  'user_agent',
  'cookie',
  'stripe',
  'analytics',
  'utm_',
];
for (const marker of forbiddenMetricStorage) {
  const tableDefinition = migration
    .replace(/comment on table[\s\S]*?;/gi, '')
    .toLowerCase();
  if (tableDefinition.includes(marker)) {
    errors.push(`forbidden metric storage marker: ${marker}`);
  }
}

const publicFiles = [
  'app/sitemap.ts',
  'app/projects/page.tsx',
  'app/reports/page.tsx',
  'app/reports/[slug]/page.tsx',
];
for (const file of publicFiles) {
  const content = read(file);
  if (content.includes('conversion_metric') || content.includes('/api/metrics')) {
    errors.push(`public surface must not auto-wire metrics: ${file}`);
  }
}

if (errors.length > 0) {
  console.error('conversion-metrics:check failed');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('conversion-metrics:check passed');
