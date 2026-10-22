/** Targeted local corrections, based on the official AWS / JetBrains homepages read 2026-10-22. */
import fs from "node:fs/promises";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./env.mjs";
loadEnv();
if (
  process.env.CHARTS_LOCAL_PREVIEW !== "true" ||
  !["127.0.0.1", "localhost"].includes(
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname,
  )
)
  throw Error("Local preview database required");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    realtime: { transport: WebSocket as any },
    auth: { persistSession: false },
  },
);
const ck = (r: any) => {
  if (r.error) throw Error(r.error.message);
  return r.data;
};
const rows = ck(
  await db
    .from("charts_projects")
    .select("*")
    .in("domain", ["aws.amazon.com", "jetbrains.com"])
    .eq("demo", false),
);
await fs.mkdir(".local", { recursive: true });
try {
  await fs.writeFile(
    ".local/navigation-data-before.json",
    JSON.stringify(rows, null, 2),
    { flag: "wx", mode: 0o600 },
  );
} catch (e: any) {
  if (e.code !== "EEXIST") throw e;
}
for (const p of rows) {
  if (p.domain === "aws.amazon.com" && p.name.includes("whole website"))
    ck(
      await db
        .from("charts_projects")
        .update({
          name: "Amazon Web Services (AWS)",
          description_en:
            "Cloud computing infrastructure and developer services; not an individual coding assistant.",
          description_zh:
            "提供计算、存储等云基础设施与开发服务，不是独立编程助手。",
          task: "Cloud computing infrastructure · 云计算基础设施",
          differentiator:
            "A cloud services platform, not a single coding assistant. / 云服务平台，并非单一的编程助手。",
          review_state: "reference",
          official_source: "https://aws.amazon.com/",
          source_checked_at: new Date().toISOString(),
        })
        .eq("id", p.id),
    );
  if (p.domain === "jetbrains.com" && p.description_zh.includes("测量"))
    ck(
      await db
        .from("charts_projects")
        .update({
          description_en:
            "Integrated development environments and team developer tools.",
          description_zh: "提供集成开发环境与团队开发工具。",
          differentiator:
            "A suite of developer tools rather than one standalone assistant. / 提供多种开发工具，不是单一的独立助手。",
          official_source: "https://www.jetbrains.com/",
          source_checked_at: new Date().toISOString(),
        })
        .eq("id", p.id),
    );
}
ck(
  await db
    .from("charts_categories")
    .update({
      name_zh: "知识库与检索开发",
      name_en: "Knowledge & retrieval development",
      description_zh: "构建知识库与检索应用的框架、工作空间和向量数据库。",
      description_en:
        "Frameworks, workspaces and vector databases for knowledge and retrieval applications.",
    })
    .eq("slug", "knowledge-search")
    .eq("name_zh", "知识搜索与 RAG"),
);
console.log(
  "Local navigation facts corrected; official domains, IDs and first publication times preserved.",
);
