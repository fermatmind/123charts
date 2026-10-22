import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "app/alpha-feed/page.tsx");
const docPath = path.join(root, "docs/PR95_ALPHA_FEED_LANDING_BOUNDARY_V0.md");
const roadmapPath = path.join(root, "ops/tasks/roadmap.json");

const failures = [];

function addFailure(message) {
  failures.push(message);
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function has(content, value) {
  return content.toLowerCase().includes(value.toLowerCase());
}

function normalize(content) {
  return content.replace(/\s+/g, " ");
}

function joined(parts) {
  return parts.join("");
}

const denied = [
  joined(["invest ", "now"]),
  joined(["guaranteed ", "ranking"]),
  joined(["guaranteed ", "return"]),
  joined(["guaranteed ", "yield"]),
  joined(["guaranteed ", "profit"]),
  joined(["principal ", "protection"]),
  joined(["S", "PV"]),
  joined(["f", "und"]),
  joined(["AI ", "f", "und"]),
  joined(["equ", "ity"]),
  joined(["to", "ken"]),
  joined(["I", "CO"]),
  joined(["I", "DO"]),
  joined(["secur", "ities"]),
  joined(["buy ", "equ", "ity"]),
  joined(["deposit ", "f", "unds"]),
  joined(["real-money ", "commitment"]),
  "payment link",
  "request an api key",
  "submit your email",
  "enter your email",
  "crm",
  "supabase insert"
];

const requiredPagePhrases = [
  "Static Boundary",
  "reviewed public metadata",
  "machine-readable evidence",
  "no private data",
  "no payment",
  "no external delivery",
  "no API access",
  "not financial advice",
  "not an investment recommendation"
];

if (!fs.existsSync(pagePath)) {
  addFailure("Missing app/alpha-feed/page.tsx");
}

if (!fs.existsSync(docPath)) {
  addFailure("Missing docs/PR95_ALPHA_FEED_LANDING_BOUNDARY_V0.md");
}

let page = "";
if (fs.existsSync(pagePath)) {
  page = read(pagePath);
  const normalizedPage = normalize(page);
  for (const phrase of requiredPagePhrases) {
    if (!has(normalizedPage, phrase)) {
      addFailure(`Missing required landing phrase: ${phrase}`);
    }
  }

  for (const term of denied) {
    const matcher = /[A-Za-z0-9]/.test(term)
      ? new RegExp(`(?<![A-Za-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9])`, "i")
      : new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (matcher.test(normalizedPage)) {
      addFailure(`Landing page contains denied phrase: ${term}`);
    }
  }

  if (/<form\b/i.test(page)) {
    addFailure("Landing page must not render a form");
  }
  if (/onSubmit\s*=|action\s*=/i.test(page)) {
    addFailure("Landing page must not define submit behavior");
  }
  if (/mailto:|https?:\/\//i.test(page.replace("https://123charts.com/alpha-feed", ""))) {
    addFailure("Landing page must not include external contact or service links");
  }
}

if (fs.existsSync(roadmapPath)) {
  const roadmap = JSON.parse(read(roadmapPath));
  const pr95 = roadmap.tasks?.find((task) => task.id === "PR95");
  if (!pr95) {
    addFailure("PR95 roadmap task is missing");
  } else {
    const forbidden = pr95.forbidden_paths ?? [];
    if (forbidden.includes("app/**")) {
      addFailure("PR95 must not keep broad app/** forbidden while app/alpha-feed/** is allowed");
    }
    if (forbidden.includes("scripts/**")) {
      addFailure("PR95 must not keep broad scripts/** forbidden while exact checker is allowed");
    }
    if (pr95.human_checkpoint !== false) {
      addFailure("PR95 human_checkpoint must remain false");
    }
    if (pr95.deployment !== "none") {
      addFailure("PR95 deployment must remain none");
    }
  }
}

if (failures.length) {
  console.error("alpha-feed landing check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("alpha-feed landing check passed");
