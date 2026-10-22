import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const routePath = 'app/api/alpha-feed/api-keys/route.ts';
const adminPagePath = 'app/admin/api-keys/page.tsx';
const flagsPath = 'lib/api-keys/flags.ts';
const problemPath = 'lib/api-keys/problem.ts';
const docPath = 'docs/PR88_DISABLED_API_KEY_SHELL_V0.md';
const boundaryPath = 'ops/contracts/api-key-metering-boundary.json';

const failures = [];

function addFailure(list, message) {
  list.push(message);
}

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function gitLines(args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' })
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function changedFiles() {
  return new Set([
    ...gitLines(['diff', '--name-only', 'HEAD']),
    ...gitLines(['diff', '--name-only', '--cached']),
    ...gitLines(['diff', '--name-only', 'origin/main...HEAD']),
    ...gitLines(['ls-files', '--others', '--exclude-standard'])
  ]);
}

function assertNoForbiddenRouteBehavior(file, content, list = failures) {
  const forbidden = [
    'crypto.randomBytes',
    'randomUUID',
    'nanoid',
    'createClient',
    '@supabase',
    'stripe',
    'Stripe',
    '.insert(',
    '.update(',
    '.delete(',
    '.upsert(',
    '.from(',
    'NextResponse.json({ key',
    'status: 200'
  ];

  for (const marker of forbidden) {
    if (content.includes(marker)) addFailure(list, `${file} contains forbidden marker ${marker}`);
  }

  const keyLikePattern = new RegExp(`(?:sk_|ak_|123charts_live_|${'api' + '_key' + '_'})`);
  if (keyLikePattern.test(content)) {
    addFailure(list, `${file} contains key-like fixture material`);
  }
}

function validateFlags(content, list = failures) {
  for (const flag of [
    'API_KEYS_ENABLED',
    'API_KEY_ISSUANCE_ENABLED',
    'CUSTOMER_ACCESS_ENABLED',
    'METERING_ENABLED',
    'BILLING_ENABLED'
  ]) {
    if (!content.includes(flag)) addFailure(list, `missing flag ${flag}`);
  }

  if (!content.includes('value === "true"')) {
    addFailure(list, 'flags must enable only on exact string true');
  }

  if (/\btrue\b/.test(content.replace(/value === "true"/g, ''))) {
    addFailure(list, 'flag file must not default any flag to true');
  }
}

function validateRoute(content, list = failures) {
  if (!content.includes('export async function GET')) addFailure(list, 'GET handler missing');
  if (!content.includes('export async function POST')) addFailure(list, 'POST handler missing');
  if (!content.includes('apiKeysDisabledProblem')) addFailure(list, 'disabled problem missing');
  if (!content.includes('application/problem+json')) addFailure(list, 'problem content type missing');
  if (!content.includes('status: problem.status')) addFailure(list, 'route must return Problem Details status');
  assertNoForbiddenRouteBehavior(routePath, content, list);
}

function validateProblem(content) {
  for (const marker of [
    'https://123charts.com/problems/api-keys-disabled',
    'API key access is disabled',
    '503',
    'Alpha Data Feed API key access is not enabled for this environment.',
    '/api/alpha-feed/api-keys'
  ]) {
    if (!content.includes(marker)) addFailure(failures, `problem details missing ${marker}`);
  }
}

function validateAdminPage(content) {
  if (!content.includes('checkAdminGuard')) addFailure(failures, 'admin page must follow admin guard pattern');
  if (!content.includes('disabled')) addFailure(failures, 'admin page must state disabled posture');
  if (content.includes('<form') || content.includes('fetch(')) {
    addFailure(failures, 'admin page must not submit forms or call APIs');
  }
  assertNoForbiddenRouteBehavior(adminPagePath, content);
}

function validateChangedFileBoundaries() {
  const changed = changedFiles();
  for (const file of changed) {
    if (file.startsWith('supabase/migrations/')) addFailure(failures, `Supabase migration changed: ${file}`);
    if (file.startsWith('deploy/')) addFailure(failures, `deploy file changed: ${file}`);
    if (file === 'package.json' || file === 'package-lock.json') addFailure(failures, `${file} must not change`);
    if (file.includes('laravel')) addFailure(failures, `Laravel runtime-like path changed: ${file}`);
    if (file.startsWith('app/api/metering/')) addFailure(failures, `metering runtime route changed: ${file}`);
    if (file.startsWith('app/api/customers/')) addFailure(failures, `customer access route changed: ${file}`);
    if (file.startsWith('app/api/payments/')) addFailure(failures, `payment route changed: ${file}`);
  }
}

function validateFixture(name, files) {
  const tmpRoot = path.join('/tmp', `123charts-pr88-${name}`);
  fs.rmSync(tmpRoot, { recursive: true, force: true });
  for (const [relative, content] of Object.entries(files)) {
    const full = path.join(tmpRoot, relative);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }

  const localFailures = [];
  for (const [relative, content] of Object.entries(files)) {
    if (relative.endsWith('flags.ts')) validateFlags(content, localFailures);
    if (relative.endsWith('route.ts')) assertNoForbiddenRouteBehavior(relative, content, localFailures);
    if (relative.startsWith('app/api/metering/')) addFailure(localFailures, `metering runtime route changed: ${relative}`);
    if (relative.startsWith('app/api/customers/')) addFailure(localFailures, `customer access route changed: ${relative}`);
    if (relative.startsWith('supabase/migrations/')) addFailure(localFailures, `Supabase migration changed: ${relative}`);
  }
  fs.rmSync(tmpRoot, { recursive: true, force: true });
  if (localFailures.length === 0) {
    addFailure(failures, `negative probe ${name} did not fail as expected`);
  }
}

for (const file of [boundaryPath, routePath, adminPagePath, flagsPath, problemPath, docPath]) {
  if (!exists(file)) addFailure(failures, `missing required file ${file}`);
}

if (exists(flagsPath)) validateFlags(read(flagsPath));
if (exists(routePath)) validateRoute(read(routePath));
if (exists(problemPath)) validateProblem(read(problemPath));
if (exists(adminPagePath)) validateAdminPage(read(adminPagePath));
validateChangedFileBoundaries();

if (exists(docPath)) {
  const doc = read(docPath);
  for (const marker of [
    'Human Checkpoint',
    'Problem Details',
    'No Real Key Issuance',
    'No Data Repository Mutation'
  ]) {
    if (!doc.includes(marker)) addFailure(failures, `doc missing ${marker}`);
  }
}

validateFixture('flag-default-true', {
  'lib/api-keys/flags.ts': 'export const API_KEYS_ENABLED = true;'
});
validateFixture('random-bytes', {
  'app/api/alpha-feed/api-keys/route.ts': 'crypto.randomBytes(32);'
});
validateFixture('plaintext-output', {
  'app/api/alpha-feed/api-keys/route.ts': `NextResponse.json({ ${'api' + '_key' + '_plaintext'}: "disabled" }, { status: 200 });`
});
validateFixture('supabase-import', {
  'app/api/alpha-feed/api-keys/route.ts': 'import { createClient } from "@supabase/supabase-js";'
});
validateFixture('stripe-import', {
  'app/api/alpha-feed/api-keys/route.ts': 'import Stripe from "stripe";'
});
validateFixture('metering-route', {
  'app/api/metering/route.ts': 'export async function POST() { return Response.json({ ok: true }); }'
});
validateFixture('customer-route', {
  'app/api/customers/route.ts': 'export async function GET() { return Response.json({ ok: true }); }'
});
validateFixture('supabase-migration', {
  'supabase/migrations/999_api_keys.sql': 'create table api_keys(id text);'
});
validateFixture('key-like-string', {
  'app/api/alpha-feed/api-keys/route.ts': 'const sample = "sk_disabled";'
});
validateFixture('route-returns-key', {
  'app/api/alpha-feed/api-keys/route.ts': `export async function POST() { return Response.json({ ${'api' + '_key' + '_plaintext'}: "not_enabled" }, { status: 200 }); }`
});

if (failures.length > 0) {
  console.error('api-key-shell check failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('api-key-shell check passed');
