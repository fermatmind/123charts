import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const defaultOutDir = path.join(os.tmpdir(), "123charts-github-profile-mirror");
const localProjectSource = path.join(root, "lib/demo-projects.ts");
const dataRepoPath = path.resolve(root, "../88cn-index-data");
const allowedStatuses = new Set(["published", "claimed", "owner_verified"]);
const unknownLabel = "Not verified";
const signalLabel = "Public signals only";
const ignoredInternalFields = new Set(["signalScore", "scores", "sourceConfidence"]);
const privateFieldPatterns = [
  /email/i,
  /phone/i,
  /admin/i,
  /payment/i,
  /checkout/i,
  /billing/i,
  /invoice/i,
  /secret/i,
  /credential/i,
  /analytics/i,
  /customer/i,
  /reviewer/i,
  /audit/i,
  /notification/i,
  /sourceConfidence/i,
  /signalScore/i,
];
const forbiddenOutputPatterns = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /guaranteed\s+(ranking|traffic|citation|return|yield|profit)/i,
  /dofollow\s+backlink/i,
  /SEO\s+juice/i,
  /invest\s+now/i,
  /principal\s+protection/i,
  /fixed\s+yield/i,
  new RegExp(["buy", "\\s+", "equ", "ity"].join(""), "i"),
  /\bICO\b/i,
  /\bIDO\b/i,
];

function parseArgs(argv) {
  const options = {
    dryRun: false,
    source: "local",
    outDir: defaultOutDir,
    noWriteExternal: false,
    slug: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--no-write-external") {
      options.noWriteExternal = true;
    } else if (arg === "--source") {
      options.source = argv[++i];
    } else if (arg === "--out") {
      options.outDir = argv[++i];
    } else if (arg === "--slug") {
      options.slug = argv[++i];
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function existingAncestor(candidate) {
  let current = candidate;
  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) {
      return current;
    }
    current = parent;
  }
  return current;
}

function assertSafeOptions(options) {
  if (options.source !== "local") {
    throw new Error("Only --source local is allowed for PR76.");
  }

  if (options.dryRun !== true) {
    throw new Error("--dry-run is required for PR76.");
  }

  if (options.noWriteExternal !== true) {
    throw new Error("--no-write-external is required for PR76.");
  }

  const outDir = path.resolve(options.outDir);
  const tempRoots = [path.resolve(os.tmpdir()), path.resolve("/tmp")];
  const realOutDir = fs.realpathSync(existingAncestor(outDir));
  const realTempRoots = tempRoots
    .map((tempRoot) => fs.existsSync(tempRoot) ? fs.realpathSync(tempRoot) : tempRoot);

  if (!tempRoots.some((tempRoot) => isInside(tempRoot, outDir)) &&
      !realTempRoots.some((tempRoot) => isInside(tempRoot, realOutDir))) {
    throw new Error(`Output must stay under a temp directory: ${tempRoots.join(" or ")}`);
  }

  for (const forbidden of [root, dataRepoPath, path.join(root, "public"), path.join(root, "deploy")]) {
    if (isInside(path.resolve(forbidden), outDir)) {
      throw new Error(`Unsafe output path is inside a forbidden repository path: ${outDir}`);
    }
  }

  return outDir;
}

function loadLocalProjects() {
  const source = fs.readFileSync(localProjectSource, "utf8");
  const match = source.match(/export const demoProjects:\s*DemoProject\[\]\s*=\s*(\[[\s\S]*?\]);/);

  if (!match) {
    throw new Error("Could not locate local demoProjects array.");
  }

  return Function(`"use strict"; return (${match[1]});`)();
}

function safeUrl(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return unknownLabel;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : unknownLabel;
  } catch {
    return unknownLabel;
  }
}

function firstSource(project, predicate) {
  const sources = Array.isArray(project.publicSources) ? project.publicSources : [];
  const match = sources.find((source) => {
    try {
      const url = new URL(source);
      return predicate(url);
    } catch {
      return false;
    }
  });

  return safeUrl(match);
}

function publicGitHubUrl(project) {
  return firstSource(project, (url) => url.hostname === "github.com");
}

function docsUrl(project) {
  return firstSource(
    project,
    (url) => url.hostname.startsWith("docs.") || url.pathname.includes("/docs")
  );
}

function publicEditorialNote(project) {
  const note = typeof project.editorialNote === "string" ? project.editorialNote.trim() : "";
  if (!note || /pending human review/i.test(note)) {
    return "Not enough data";
  }
  return note;
}

function assertSafeProject(project) {
  for (const key of Object.keys(project)) {
    if (ignoredInternalFields.has(key)) {
      continue;
    }

    if (privateFieldPatterns.some((pattern) => pattern.test(key))) {
      throw new Error(`Project ${project.slug} includes forbidden private/internal field: ${key}`);
    }
  }

  if (!allowedStatuses.has(project.status)) {
    throw new Error(`Project ${project.slug} has ineligible lifecycle state: ${project.status}`);
  }
}

function escapeMarkdown(value) {
  return String(value ?? unknownLabel).replace(/\r?\n+/g, " ").trim() || unknownLabel;
}

function renderProject(project) {
  assertSafeProject(project);

  const profileUrl = `https://123charts.example/projects/${project.slug}`;
  const markdown = `# ${escapeMarkdown(project.name)}

${escapeMarkdown(project.tagline)}

## Public Profile

- 123Charts profile: ${profileUrl}
- Official site: ${safeUrl(project.website)}
- Public GitHub: ${publicGitHubUrl(project)}
- Docs: ${docsUrl(project)}
- Category: ${escapeMarkdown(project.category)}
- Review status: ${escapeMarkdown(project.status)}

## Public Signals

- Product readiness: ${signalLabel}
- Dev momentum: ${signalLabel}
- Market presence: ${signalLabel}
- Commercial readiness: ${signalLabel}
- SEO foundation: ${signalLabel}
- Trust confidence: ${signalLabel}

## 123Charts Editorial Note

${escapeMarkdown(publicEditorialNote(project))}

## Boundaries

- Generated from reviewed public 123Charts data only.
- Does not include private founder, payment, admin, analytics, or review metadata.
- Does not promise ranking, traffic, citation, funding, revenue, or adoption outcomes.
`;

  for (const pattern of forbiddenOutputPatterns) {
    if (pattern.test(markdown)) {
      throw new Error(`Generated markdown for ${project.slug} contains forbidden output content.`);
    }
  }

  for (const field of ignoredInternalFields) {
    if (markdown.includes(field)) {
      throw new Error(`Generated markdown for ${project.slug} leaked ignored internal field: ${field}`);
    }
  }

  return markdown;
}

function writeProject(outDir, project, markdown) {
  const filename = `${project.slug}.md`;
  const targetPath = path.resolve(outDir, filename);

  if (!isInside(outDir, targetPath)) {
    throw new Error(`Unsafe output target escaped output directory: ${targetPath}`);
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(targetPath, markdown, "utf8");
  return targetPath;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const outDir = assertSafeOptions(options);
  const projects = loadLocalProjects()
    .filter((project) => allowedStatuses.has(project.status))
    .filter((project) => (options.slug ? project.slug === options.slug : true));

  if (options.slug && projects.length === 0) {
    throw new Error(`No eligible local project found for slug: ${options.slug}`);
  }

  const files = projects.map((project) => {
    const markdown = renderProject(project);
    return writeProject(outDir, project, markdown);
  });

  console.log(JSON.stringify(
    {
      mode: "local-only-dry-run",
      source: options.source,
      dryRun: options.dryRun,
      externalWrite: false,
      dataRepoMutation: false,
      outDir,
      generated: files.length,
      files,
    },
    null,
    2
  ));
}

try {
  main();
} catch (error) {
  console.error(`github-profile-mirror generator failed: ${error.message}`);
  process.exit(1);
}
