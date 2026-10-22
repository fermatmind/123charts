import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

export const DEFAULT_REPORT_DISTRIBUTION_OUT_DIR =
  "/tmp/123charts-report-distribution-pack";

export const REPORT_DISTRIBUTION_CHANNELS = [
  "internal_brief",
  "newsletter_draft",
  "social_draft",
  "website_snippet",
];

export const REPORT_DISTRIBUTION_SAFETY_FLAGS = {
  externalWrites: false,
  emailSend: false,
  dmSend: false,
  socialPost: false,
  platformLogin: false,
  crmWrite: false,
  piiIncluded: false,
  browserSessionExport: false,
  dataRepoMutation: false,
  deploy: false,
};

const SOURCE_FILES = {
  publishedReports: "lib/reports/published-reports.ts",
  demoReports: "lib/demo-reports.ts",
  founderIntent: "lib/reports/seed-100-readiness-report.ts",
  submissionChannels: "lib/reports/submission-channels-report.ts",
};

const CONTACT_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const SECRET_PATTERN =
  new RegExp(
    [
      "\\b(cookie=|session[_-]?id|session[_-]?",
      "tok",
      "en|bearer\\s+[a-z0-9._-]+|secret=|api[_-]?key=|password=|private[_-]?key)\\b",
    ].join(""),
    "i"
  );
const EXTERNAL_WRITE_PATTERN =
  /\b(mailchimp|hubspot|salesforce|linkedin api|twitter api|x api|sendgrid)\b/i;

function sourceFileFor(filePath, sourceText) {
  return ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
}

async function readSource(root, relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

function literalText(node) {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function propertyNameText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return undefined;
}

function objectStringProperties(objectNode) {
  const result = {};

  for (const property of objectNode.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = propertyNameText(property.name);
    const value = literalText(property.initializer);
    if (key && value !== undefined) result[key] = value;
  }

  return result;
}

function exportedConstants(sourceText, filePath) {
  const ast = sourceFileFor(filePath, sourceText);
  const constants = {};

  function visit(node) {
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        const value = literalText(declaration.initializer);
        if (value !== undefined) constants[declaration.name.text] = value;
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(ast);
  return constants;
}

function demoReports(sourceText, filePath) {
  const ast = sourceFileFor(filePath, sourceText);
  const reports = [];

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "demoReports" &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const element of node.initializer.elements) {
        if (!ts.isObjectLiteralExpression(element)) continue;
        const entry = objectStringProperties(element);
        if (entry.slug && entry.title && entry.date && entry.executiveSummary) {
          reports.push({
            slug: entry.slug,
            path: `/reports/${entry.slug}`,
            title: entry.title,
            description: entry.executiveSummary,
            date: entry.date,
            kind: "demo-report",
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(ast);
  return reports;
}

function templateReportPath(slug) {
  return `/reports/${slug}`;
}

function reportFromConstants(constants, prefix, kind) {
  const slug = constants[`${prefix}_SLUG`];
  const title = constants[`${prefix}_TITLE`];
  const description = constants[`${prefix}_SUBTITLE`];

  if (!slug || !title || !description) {
    throw new Error(`Missing required report constants for ${prefix}`);
  }

  return {
    slug,
    path: templateReportPath(slug),
    title,
    description,
    date: "2026-06-18",
    kind,
  };
}

export async function loadPublishedReportDistributionSources(root) {
  const [publishedReportsSource, demoReportsSource, founderSource, submissionSource] =
    await Promise.all([
      readSource(root, SOURCE_FILES.publishedReports),
      readSource(root, SOURCE_FILES.demoReports),
      readSource(root, SOURCE_FILES.founderIntent),
      readSource(root, SOURCE_FILES.submissionChannels),
    ]);

  if (
    !publishedReportsSource.includes("getPublishedReportRoutes") ||
    !publishedReportsSource.includes("demoReports")
  ) {
    throw new Error("Published report registry is missing expected local helpers");
  }

  const founder = reportFromConstants(
    exportedConstants(founderSource, SOURCE_FILES.founderIntent),
    "FOUNDER_INTENT_REPORT",
    "founder-intent"
  );
  const submission = reportFromConstants(
    exportedConstants(submissionSource, SOURCE_FILES.submissionChannels),
    "SUBMISSION_CHANNELS_REPORT",
    "founder-intent"
  );
  const demo = demoReports(demoReportsSource, SOURCE_FILES.demoReports);

  const byPath = new Map();
  for (const report of [founder, submission, ...demo]) {
    byPath.set(report.path, report);
  }

  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

export function resolveOutputDirectory(root, requestedOutputDirectory) {
  const outputDirectory = path.resolve(
    requestedOutputDirectory || DEFAULT_REPORT_DISTRIBUTION_OUT_DIR
  );
  const repoRoot = path.resolve(root);

  if (outputDirectory === repoRoot || outputDirectory.startsWith(`${repoRoot}${path.sep}`)) {
    throw new Error("Report distribution pack output must stay outside the repo");
  }

  return outputDirectory;
}

function safeFileName(slug) {
  return `${slug.replace(/[^a-z0-9-]/g, "-")}.md`;
}

function publicUrl(report, baseUrl) {
  return `${baseUrl.replace(/\/$/, "")}${report.path}`;
}

function draftMarkdown(report, baseUrl) {
  const url = publicUrl(report, baseUrl);

  return `# ${report.title} Distribution Draft

Source report: ${report.title}
Public URL: ${url}
Draft status: local review only

## Internal Brief

${report.description}

Use this brief for internal review of the published 123Charts report. Verify the source report, public URL, and review context before any manual reuse.

## Newsletter Draft

Subject: ${report.title}

This draft points readers to a published 123Charts report: ${url}

${report.description}

Keep this as a human-reviewed draft. Do not upload subscriber lists or send from this generator.

## Social Draft

Published 123Charts report for review: ${report.title}

${url}

${report.description}

Human review required before any manual platform use.

## Website Snippet

Title: ${report.title}

URL: ${url}

Summary: ${report.description}

Use only as a local draft snippet for manual CMS review.
`;
}

function readmeMarkdown(manifest) {
  return `# 123Charts Report Distribution Pack

Generated at: ${manifest.generatedAt}

This package contains local draft artifacts only. It does not send email, send DMs, post to social platforms, log in to external services, write CRM records, collect PII, export browser sessions, deploy, or mutate the data repository.

## Safety Flags

${Object.entries(manifest.safetyFlags)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

## Draft Channels

${manifest.channels.map((channel) => `- ${channel}`).join("\n")}

## Files

${manifest.files.map((file) => `- ${file}`).join("\n")}
`;
}

function linksJson(reports, baseUrl) {
  return reports.map((report) => ({
    slug: report.slug,
    title: report.title,
    url: publicUrl(report, baseUrl),
  }));
}

function validateArtifactText(relativePath, text) {
  const errors = [];

  if (CONTACT_PATTERN.test(text)) {
    errors.push(`${relativePath} contains a direct contact-like string`);
  }

  if (SECRET_PATTERN.test(text)) {
    errors.push(`${relativePath} contains a private credential/session pattern`);
  }

  if (EXTERNAL_WRITE_PATTERN.test(text)) {
    errors.push(`${relativePath} contains an external write platform pattern`);
  }

  return errors;
}

export function buildReportDistributionPackPlan({
  root,
  outputDirectory,
  reports,
  baseUrl = "https://123charts.com",
}) {
  const generatedAt = new Date().toISOString();
  const files = ["manifest.json", "README.md", "links.json"];

  for (const report of reports) {
    files.push(`drafts/${safeFileName(report.slug)}`);
  }

  return {
    root,
    outputDirectory,
    generatedAt,
    sourceFiles: SOURCE_FILES,
    channels: REPORT_DISTRIBUTION_CHANNELS,
    safetyFlags: REPORT_DISTRIBUTION_SAFETY_FLAGS,
    sourceReports: reports.map((report) => ({
      slug: report.slug,
      path: report.path,
      title: report.title,
      kind: report.kind,
      date: report.date,
    })),
    files,
    baseUrl,
  };
}

export async function writeReportDistributionPack(plan) {
  await fs.rm(plan.outputDirectory, { recursive: true, force: true });
  await fs.mkdir(path.join(plan.outputDirectory, "drafts"), { recursive: true });

  const manifestText = `${JSON.stringify(plan, null, 2)}\n`;
  const readmeText = readmeMarkdown(plan);
  const linksText = `${JSON.stringify(linksJson(plan.sourceReports, plan.baseUrl), null, 2)}\n`;

  const artifacts = [
    { relativePath: "manifest.json", text: manifestText },
    { relativePath: "README.md", text: readmeText },
    { relativePath: "links.json", text: linksText },
  ];

  for (const report of plan.sourceReports) {
    artifacts.push({
      relativePath: `drafts/${safeFileName(report.slug)}`,
      text: draftMarkdown(report, plan.baseUrl),
    });
  }

  const validationErrors = artifacts.flatMap((artifact) =>
    validateArtifactText(artifact.relativePath, artifact.text)
  );

  if (validationErrors.length > 0) {
    throw new Error(`Unsafe distribution pack artifact:\n${validationErrors.join("\n")}`);
  }

  for (const artifact of artifacts) {
    await fs.writeFile(path.join(plan.outputDirectory, artifact.relativePath), artifact.text);
  }

  return {
    outputDirectory: plan.outputDirectory,
    files: artifacts.map((artifact) => artifact.relativePath),
    sourceReportCount: plan.sourceReports.length,
    safetyFlags: plan.safetyFlags,
  };
}
