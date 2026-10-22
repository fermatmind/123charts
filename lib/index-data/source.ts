import fs from "node:fs";
import path from "node:path";
import type { IndexDataProject } from "./types";

export interface ProjectEntry {
  path: string;
  project: IndexDataProject;
}

export interface ReadResult {
  entries: ProjectEntry[];
  commit: string | null;
}

const DEFAULT_GITHUB_OWNER = "fermatmind";
const DEFAULT_GITHUB_REPO = "88cn-index-data";
const DEFAULT_GITHUB_BRANCH = "main";
const DEFAULT_LOCAL_PATH = "../88cn-index-data";

export async function readIndexData(mode: "local" | "github"): Promise<ReadResult> {
  if (mode === "local") {
    return readLocal();
  }
  return readGitHub();
}

async function readLocal(): Promise<ReadResult> {
  const localPath =
    process.env.INDEX_DATA_LOCAL_PATH ||
    path.resolve(process.cwd(), DEFAULT_LOCAL_PATH);

  const projectsDir = path.join(localPath, "data", "projects");

  if (!fs.existsSync(projectsDir)) {
    throw new Error(`Local index data not found at ${projectsDir}`);
  }

  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith(".json"));
  const entries: ProjectEntry[] = [];

  for (const file of files) {
    const filePath = path.join(projectsDir, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const project: IndexDataProject = JSON.parse(raw);
    entries.push({ path: `data/projects/${file}`, project });
  }

  return { entries, commit: "local-dev" };
}

async function readGitHub(): Promise<ReadResult> {
  const owner = process.env.INDEX_DATA_GITHUB_OWNER || DEFAULT_GITHUB_OWNER;
  const repo = process.env.INDEX_DATA_GITHUB_REPO || DEFAULT_GITHUB_REPO;
  const branch = process.env.INDEX_DATA_GITHUB_BRANCH || DEFAULT_GITHUB_BRANCH;
  const token = process.env.INDEX_DATA_GITHUB_TOKEN || "";

  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "123charts-web/0.1",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Get the tree for data/projects
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const treeRes = await fetch(treeUrl, { headers });
  if (!treeRes.ok) {
    throw new Error(`GitHub API error: ${treeRes.status} ${treeRes.statusText}`);
  }

  const treeData = await treeRes.json() as {
    sha?: string;
    tree?: { path: string; sha: string }[];
  };

  const projectFiles = (treeData.tree || []).filter(
    (item) => item.path.startsWith("data/projects/") && item.path.endsWith(".json")
  );

  const entries: ProjectEntry[] = [];
  for (const item of projectFiles) {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
    const rawRes = await fetch(rawUrl, { headers });
    if (!rawRes.ok) continue;
    const project: IndexDataProject = await rawRes.json();
    entries.push({ path: item.path, project });
  }

  return { entries, commit: treeData.sha || null };
}
