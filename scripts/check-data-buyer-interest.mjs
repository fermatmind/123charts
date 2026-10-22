import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const pagePath = "app/alpha-feed/page.tsx";
const routePath = "app/api/alpha-feed/buyer-interest/route.ts";
const docPath = "docs/PR96_DATA_BUYER_INTEREST_FORM_SHELL_V0.md";
const roadmapPath = "ops/tasks/roadmap.json";

function joined(parts) {
  return parts.join("");
}

const deniedPhrases = [
  joined(["invest ", "now"]),
  joined(["guaranteed ", "ranking"]),
  joined(["guaranteed ", "return"]),
  joined(["guaranteed ", "revenue"]),
  joined(["guaranteed ", "traffic"]),
  joined(["guaranteed ", "citations"]),
  joined(["guaranteed ", "funding"]),
  joined(["private ", "deal ", "flow"]),
  joined(["S", "PV"]),
  joined(["f", "und"]),
  joined(["equ", "ity"]),
  joined(["to", "ken"]),
  joined(["secur", "ities"]),
  "buy signal",
  "request an api key",
  "submit your email",
  "enter your email",
  "active waitlist",
  "live waitlist",
  "customer signup is open",
  "open customer signup",
];

const deniedCodePatterns = [
  { label: "Supabase import", pattern: /from\s+["'][^"']*supabase|createClient\s*\(/i },
  { label: "CRM integration", pattern: /hubspot|salesforce|pipedrive|crm/i },
  { label: "email provider integration", pattern: /sendgrid|mailchimp|resend|postmark|nodemailer/i },
  { label: "payment integration", pattern: /stripe|checkout|paymentintent|billing/i },
  { label: "external network call", pattern: /\bfetch\s*\(|axios|XMLHttpRequest/i },
  { label: "API key runtime", pattern: /issueApiKey|createApiKey|apiKeyRequest|api key request/i },
  { label: "metering runtime", pattern: /usageLedger|metering|meteredUsage|recordUsage/i },
  { label: "environment dependency", pattern: /process\.env/i },
];

function repoPath(filePath) {
  return path.join(root, filePath);
}

function readProjectFile(projectRoot, filePath) {
  return fs.readFileSync(path.join(projectRoot, filePath), "utf8");
}

function existsProjectFile(projectRoot, filePath) {
  return fs.existsSync(path.join(projectRoot, filePath));
}

function normalize(content) {
  return content.replace(/\s+/g, " ").trim();
}

function phraseMatcher(phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (/[A-Za-z0-9]/.test(phrase)) {
    return new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, "i");
  }
  return new RegExp(escaped, "i");
}

function gitChangedFiles() {
  try {
    const commands = [
      ["diff", "--name-only", "HEAD"],
      ["diff", "--name-only", "--cached"],
      ["ls-files", "--others", "--exclude-standard"],
    ];
    return new Set(
      commands.flatMap((args) =>
        execFileSync("git", args, { cwd: root, encoding: "utf8" })
          .split(/\r?\n/)
          .filter(Boolean),
      ),
    );
  } catch {
    return new Set();
  }
}

function checkProject(projectRoot, options = {}) {
  const failures = [];
  const add = (message) => failures.push(message);

  for (const filePath of [pagePath, routePath, docPath, roadmapPath]) {
    if (!existsProjectFile(projectRoot, filePath)) {
      add(`Missing ${filePath}`);
    }
  }

  const page = existsProjectFile(projectRoot, pagePath)
    ? readProjectFile(projectRoot, pagePath)
    : "";
  const route = existsProjectFile(projectRoot, routePath)
    ? readProjectFile(projectRoot, routePath)
    : "";
  const doc = existsProjectFile(projectRoot, docPath)
    ? readProjectFile(projectRoot, docPath)
    : "";
  const combined = normalize([page, route, doc].join("\n"));

  const requiredPagePhrases = [
    "Buyer interest shell",
    "disabled preview only",
    "not collecting private contact details",
    "no API access",
    "Interest collection disabled",
  ];
  for (const phrase of requiredPagePhrases) {
    if (!page.toLowerCase().includes(phrase.toLowerCase())) {
      add(`Missing page phrase: ${phrase}`);
    }
  }

  if (/<form\b[^>]*(action|onSubmit)\s*=/i.test(page)) {
    add("Form must not define action or submit behavior");
  }
  if (/<button\b(?![^>]*\bdisabled\b)[^>]*>/i.test(page)) {
    add("Every button in the buyer-interest shell must be disabled");
  }
  if (/<input\b(?![^>]*\bdisabled\b)[^>]*>/i.test(page)) {
    add("Every input in the buyer-interest shell must be disabled");
  }
  if (/<input\b[^>]*\bname\s*=/i.test(page)) {
    add("Disabled preview inputs must not include name attributes");
  }
  if (/<input\b[^>]*type=["']email["']/i.test(page)) {
    add("Buyer-interest shell must not include an email input type");
  }

  const requiredRouteFragments = [
    "application/problem+json",
    "https://123charts.com/problems/data-buyer-interest-disabled",
    "Data buyer interest is disabled",
    "status: 503",
    "Alpha Feed buyer interest collection is not enabled for this environment.",
  ];
  for (const fragment of requiredRouteFragments) {
    if (!route.includes(fragment)) {
      add(`Missing route fragment: ${fragment}`);
    }
  }
  if (/request\.(json|formData|text|arrayBuffer|blob)\s*\(/i.test(route)) {
    add("Disabled route must not parse request bodies");
  }
  if (/status\s*:\s*20\d/i.test(route)) {
    add("Disabled route must not return success status");
  }

  for (const { label, pattern } of deniedCodePatterns) {
    if (pattern.test(route)) {
      add(`Forbidden runtime behavior detected: ${label}`);
    }
  }

  for (const phrase of deniedPhrases) {
    if (phraseMatcher(phrase).test(combined)) {
      add(`Denied copy phrase detected: ${phrase}`);
    }
  }

  if (existsProjectFile(projectRoot, roadmapPath)) {
    const roadmap = JSON.parse(readProjectFile(projectRoot, roadmapPath));
    const pr96 = roadmap.tasks?.find((task) => task.id === "PR96");
    if (!pr96) {
      add("PR96 roadmap task is missing");
    } else {
      const forbidden = pr96.forbidden_paths ?? [];
      if (forbidden.includes("app/**")) {
        add("PR96 must not keep broad app/** forbidden while exact app paths are allowed");
      }
      if (forbidden.includes("lib/**")) {
        add("PR96 must not keep broad lib/** forbidden while exact lib/alpha-feed/** is allowed");
      }
      if (forbidden.includes("scripts/**")) {
        add("PR96 must not keep broad scripts/** forbidden while exact checker is allowed");
      }
      if (pr96.human_checkpoint !== true) {
        add("PR96 human_checkpoint must remain true");
      }
      if (pr96.deployment !== "none") {
        add("PR96 deployment must remain none");
      }
    }
  }

  if (!options.fixture) {
    const changed = gitChangedFiles();
    for (const file of changed) {
      if (/PR97|alpha-feed-evidence|evidence-dossier/i.test(file)) {
        add(`PR97 appears to be started: ${file}`);
      }
    }
  }

  return failures;
}

function copyFixture(dest) {
  for (const filePath of [pagePath, routePath, docPath, roadmapPath]) {
    const source = repoPath(filePath);
    const target = path.join(dest, filePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

function mutateFile(projectRoot, filePath, mutate) {
  const target = path.join(projectRoot, filePath);
  const content = fs.readFileSync(target, "utf8");
  fs.writeFileSync(target, mutate(content));
}

function runNegativeProbes() {
  const probes = [
    {
      name: "fake Supabase import fails",
      mutate(rootPath) {
        mutateFile(rootPath, routePath, (content) => `${content}\nimport { createClient } from "@/lib/supabase/server";\n`);
      },
    },
    {
      name: "fake CRM import fails",
      mutate(rootPath) {
        mutateFile(rootPath, routePath, (content) => `${content}\nconst crmProvider = "hubspot";\n`);
      },
    },
    {
      name: "fake email provider import fails",
      mutate(rootPath) {
        mutateFile(rootPath, routePath, (content) => `${content}\nconst deliveryProvider = "sendgrid";\n`);
      },
    },
    {
      name: "fake payment import fails",
      mutate(rootPath) {
        mutateFile(rootPath, routePath, (content) => `${content}\nconst checkoutProvider = "stripe";\n`);
      },
    },
    {
      name: "fake external fetch fails",
      mutate(rootPath) {
        mutateFile(rootPath, routePath, (content) => `${content}\nfetch("https://example.com");\n`);
      },
    },
    {
      name: "fake active email input fails",
      mutate(rootPath) {
        mutateFile(rootPath, pagePath, (content) => content.replace("disabled\n                placeholder", 'name="email"\n                type="email"\n                placeholder'));
      },
    },
    {
      name: "fake active company input fails",
      mutate(rootPath) {
        mutateFile(rootPath, pagePath, (content) => content.replace("disabled\n                placeholder", 'name="company"\n                placeholder'));
      },
    },
    {
      name: "fake API route returning 200 fails",
      mutate(rootPath) {
        mutateFile(rootPath, routePath, (content) => content.replace("status: 503", "status: 200"));
      },
    },
    {
      name: "fake customer signup copy fails",
      mutate(rootPath) {
        mutateFile(rootPath, pagePath, (content) => `${content}\n<p>Customer signup is open.</p>\n`);
      },
    },
    {
      name: "fake restricted capital language fails",
      mutate(rootPath) {
        mutateFile(rootPath, pagePath, (content) => `${content}\n<p>${joined(["S", "PV"])} access.</p>\n`);
      },
    },
    {
      name: "fake API key request fails",
      mutate(rootPath) {
        mutateFile(rootPath, pagePath, (content) => `${content}\n<p>Request an API key.</p>\n`);
      },
    },
  ];

  const results = [];
  for (const probe of probes) {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "123charts-pr96-"));
    try {
      copyFixture(tempRoot);
      probe.mutate(tempRoot);
      const failures = checkProject(tempRoot, { fixture: true });
      if (failures.length === 0) {
        results.push({ name: probe.name, status: "FAIL" });
      } else {
        results.push({ name: probe.name, status: "PASS" });
      }
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  return results;
}

const failures = checkProject(root);
const negativeResults = runNegativeProbes();
const failedProbes = negativeResults.filter((probe) => probe.status !== "PASS");

if (failures.length || failedProbes.length) {
  console.error("data-buyer-interest shell check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  for (const probe of failedProbes) {
    console.error(`- negative probe did not fail as expected: ${probe.name}`);
  }
  process.exit(1);
}

console.log("data-buyer-interest shell check passed");
console.log("negative probes:");
for (const probe of negativeResults) {
  console.log(`- ${probe.status}: ${probe.name}`);
}
