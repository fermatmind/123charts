import fs from 'node:fs';

const contract = JSON.parse(fs.readFileSync('ops/contracts/telemetry.json', 'utf8'));
const failures = [];

if (contract.default !== 'opt-in-only') failures.push('default must be opt-in-only');
if (contract.github_action_default !== false) failures.push('CI default must be false');
if (contract.publish_flag_required !== 'publish_to_123charts') failures.push('publish flag missing');
if (contract.publish_flag_value !== true) failures.push('publish flag value must be true');

const forbidden = new Set(contract.forbidden || []);
for (const item of ['secrets', 'environment_values', 'logs', 'private_repo_data']) {
  if (!forbidden.has(item)) failures.push(`missing forbidden item ${item}`);
}

if (contract.mcp?.allowed !== 'aggregate counters only') {
  failures.push('MCP telemetry must be aggregate counters only');
}

if (failures.length > 0) {
  console.error('telemetry-contract-check failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('telemetry-contract-check passed');
