#!/usr/bin/env node
import process from "node:process";
import {
  DEFAULT_REPORT_DISTRIBUTION_OUT_DIR,
  buildReportDistributionPackPlan,
  loadPublishedReportDistributionSources,
  resolveOutputDirectory,
  writeReportDistributionPack,
} from "../lib/traffic-distribution/report-pack.mjs";

function parseArgs(argv) {
  const options = {
    dryRun: false,
    outputDirectory: DEFAULT_REPORT_DISTRIBUTION_OUT_DIR,
    baseUrl: "https://123charts.com",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--out") {
      options.outputDirectory = argv[index + 1];
      index += 1;
    } else if (arg === "--base-url") {
      options.baseUrl = argv[index + 1];
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.outputDirectory) throw new Error("--out requires a directory");
  if (!options.baseUrl) throw new Error("--base-url requires a URL");

  return options;
}

function printHelp() {
  console.log(`Usage: npm run report-distribution-pack:generate -- [options]

Options:
  --dry-run             Print the local draft plan without writing files.
  --out <dir>           Output directory outside the repo.
                        Default: ${DEFAULT_REPORT_DISTRIBUTION_OUT_DIR}
  --base-url <url>      Public base URL for report links.
                        Default: https://123charts.com
`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const root = process.cwd();
  const outputDirectory = resolveOutputDirectory(root, options.outputDirectory);
  const reports = await loadPublishedReportDistributionSources(root);
  const plan = buildReportDistributionPackPlan({
    root,
    outputDirectory,
    reports,
    baseUrl: options.baseUrl,
  });

  if (options.dryRun) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  const result = await writeReportDistributionPack(plan);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(`report-distribution-pack failed: ${error.message}`);
  process.exit(1);
});
