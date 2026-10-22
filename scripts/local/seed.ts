import { publishCategory } from "../../lib/charts/publishing";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import { randomBytes, createHash } from "node:crypto";
import fs from "node:fs/promises";
import sharp from "sharp";
import { loadEnv } from "./env.mjs";
loadEnv();
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    realtime: { transport: WebSocket as any },
    auth: { persistSession: false },
  },
);
if (
  !["localhost", "127.0.0.1"].includes(
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname,
  )
)
  throw new Error("Local seed refuses remote databases.");
function ck(r: any) {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}
await fs.mkdir(".local", { recursive: true });
const accountsPath = ".local/accounts.json";
let accounts: any;
try {
  accounts = JSON.parse(await fs.readFile(accountsPath, "utf8"));
} catch {
  accounts = {
    founder: {
      email: "founder@123charts.local",
      password: `Charts!${randomBytes(12).toString("hex")}`,
    },
    admin: {
      email: "admin@123charts.local",
      password: `Charts!${randomBytes(12).toString("hex")}`,
    },
    other: {
      email: "other@123charts.local",
      password: `Charts!${randomBytes(12).toString("hex")}`,
    },
  };
  await fs.writeFile(accountsPath, JSON.stringify(accounts, null, 2), {
    mode: 0o600,
  });
}
const existingUsers = ck(
  await db.auth.admin.listUsers({ perPage: 1000 }),
).users;
for (const [role, a] of Object.entries(accounts) as [string, any][]) {
  let user = existingUsers.find((u: any) => u.email === a.email);
  if (!user)
    user = ck(
      await db.auth.admin.createUser({
        email: a.email,
        password: a.password,
        email_confirm: true,
      }),
    ).user;
  a.id = user.id;
  if (role === "admin")
    ck(
      await db
        .from("admin_users")
        .upsert(
          { user_id: user.id, granted_by: "local-setup" },
          { onConflict: "user_id" },
        ),
    );
}
await fs.writeFile(accountsPath, JSON.stringify(accounts, null, 2), {
  mode: 0o600,
});
const categoryRows = [
  {
    slug: "ai-coding",
    name_en: "AI coding assistants",
    name_zh: "AI 编程辅助",
    description_en: "Tools for writing, reviewing and understanding software.",
    description_zh: "用于编写、审查与理解软件的工具。",
  },
  {
    slug: "workflow-automation",
    name_en: "Workflow automation",
    name_zh: "工作流自动化",
    description_en: "Connect applications and automate recurring work.",
    description_zh: "连接应用并自动处理重复工作。",
  },
  {
    slug: "knowledge-search",
    name_en: "Knowledge search & RAG",
    name_zh: "知识搜索与 RAG",
    description_en: "Search, retrieve and work with documents and knowledge.",
    description_zh: "搜索、检索与使用文档和知识。",
  },
];
ck(await db.from("charts_categories").upsert(categoryRows));
// Original concise descriptions; official URLs are sources, not copied directory content.
const groups: [string, string[][]][] = [
  [
    "ai-coding",
    [
      [
        "Cursor",
        "cursor.com",
        "An editor with AI assistance for working on codebases.",
        "提供代码库 AI 辅助功能的编辑器。",
      ],
      [
        "Windsurf",
        "windsurf.com",
        "An AI editor for software development workflows.",
        "面向软件开发流程的 AI 编辑器。",
      ],
      [
        "Replit",
        "replit.com",
        "A browser workspace for building and running applications.",
        "用于构建和运行应用的浏览器工作空间。",
      ],
      [
        "Tabnine",
        "tabnine.com",
        "AI assistance for coding and code completion.",
        "提供编程辅助与代码补全。",
      ],
      [
        "Sourcegraph",
        "sourcegraph.com",
        "Code search and tooling for understanding codebases.",
        "用于搜索和理解代码库的工具。",
      ],
      [
        "Continue",
        "continue.dev",
        "An open-source approach to configurable AI coding workflows.",
        "可配置 AI 编程流程的开源工具。",
      ],
      [
        "Aider",
        "aider.chat",
        "A terminal-based assistant for editing code with AI.",
        "在终端中使用 AI 编辑代码的助手。",
      ],
      [
        "CodeRabbit",
        "coderabbit.ai",
        "AI assistance for reviewing code changes.",
        "辅助审查代码变更的 AI 工具。",
      ],
      [
        "Qodo",
        "qodo.ai",
        "AI tools for code review and software development.",
        "用于代码审查和软件开发的 AI 工具。",
      ],
      [
        "AWS · whole website",
        "aws.amazon.com",
        "Cloud services with developer tooling. The measurement covers the whole AWS website, not an individual assistant.",
        "提供云服务与开发工具，测量对象为 AWS 整站，并非某个独立编程助手。",
      ],
      [
        "JetBrains",
        "jetbrains.com",
        "Developer tools with integrated AI assistance.",
        "集成 AI 辅助能力的开发工具；测量范围是官网整体。",
      ],
    ],
  ],
  [
    "workflow-automation",
    [
      [
        "n8n",
        "n8n.io",
        "A workflow builder for connecting services and automating tasks.",
        "连接服务并自动执行任务的工作流构建器。",
      ],
      [
        "Zapier",
        "zapier.com",
        "Application integrations and automation for recurring work.",
        "用于重复工作的应用集成与自动化。",
      ],
      [
        "Make",
        "make.com",
        "A visual workspace for connecting application workflows.",
        "用于连接应用工作流的可视化工作空间。",
      ],
      [
        "Activepieces",
        "activepieces.com",
        "An automation builder with open-source components.",
        "包含开源组件的自动化构建工具。",
      ],
      [
        "Pipedream",
        "pipedream.com",
        "Developer workflows for connecting APIs and services.",
        "供开发者连接 API 与服务的工作流工具。",
      ],
      [
        "IFTTT",
        "ifttt.com",
        "App and device connections based on triggers and actions.",
        "基于触发条件与动作连接应用和设备。",
      ],
      [
        "Node-RED",
        "nodered.org",
        "A flow-based development tool for event-driven applications.",
        "用于事件驱动应用的流程式开发工具。",
      ],
      [
        "Huginn",
        "huginn.io",
        "An open-source system for agents that monitor and automate tasks.",
        "使用代理监测事件并自动执行任务的开源系统。",
      ],
      [
        "Windmill",
        "windmill.dev",
        "Build internal workflows with scripts and interfaces.",
        "通过脚本和界面构建内部工作流。",
      ],
      [
        "Kestra",
        "kestra.io",
        "Orchestration for scheduled and event-driven workflows.",
        "用于定时与事件驱动工作流的编排工具。",
      ],
      [
        "Temporal",
        "temporal.io",
        "Infrastructure for durable application workflows.",
        "支持持久化应用工作流的基础设施。",
      ],
    ],
  ],
  [
    "knowledge-search",
    [
      [
        "Dify",
        "dify.ai",
        "Build applications that combine language models and knowledge.",
        "构建结合语言模型与知识的应用。",
      ],
      [
        "AnythingLLM",
        "anythingllm.com",
        "Work with documents through a configurable AI workspace.",
        "在可配置的 AI 工作空间中使用文档。",
      ],
      [
        "Open WebUI",
        "openwebui.com",
        "A web interface for interacting with models and knowledge.",
        "用于与模型及知识交互的网页界面。",
      ],
      [
        "Flowise",
        "flowiseai.com",
        "Visually build workflows for language-model applications.",
        "以可视化方式构建语言模型应用流程。",
      ],
      [
        "Langflow",
        "langflow.org",
        "A visual builder for AI application flows.",
        "用于 AI 应用流程的可视化构建器。",
      ],
      [
        "LlamaIndex",
        "llamaindex.ai",
        "Tools for connecting application data to language models.",
        "连接应用数据与语言模型的工具。",
      ],
      [
        "Haystack",
        "haystack.deepset.ai",
        "An open-source framework for retrieval and AI applications.",
        "用于检索与 AI 应用的开源框架。",
      ],
      [
        "Weaviate",
        "weaviate.io",
        "A vector database for search and retrieval applications.",
        "面向搜索与检索应用的向量数据库。",
      ],
      [
        "Qdrant",
        "qdrant.tech",
        "A vector search engine for similarity retrieval.",
        "用于相似度检索的向量搜索引擎。",
      ],
      [
        "Chroma",
        "trychroma.com",
        "An embedding database for AI retrieval applications.",
        "用于 AI 检索应用的嵌入数据库。",
      ],
      [
        "Pinecone",
        "pinecone.io",
        "A managed vector database for retrieval workloads.",
        "用于检索工作负载的托管向量数据库。",
      ],
    ],
  ],
];
let checks: any[] = [];
try {
  checks = JSON.parse(await fs.readFile(".local/source-checks.json", "utf8"));
} catch {}
for (const [category, rows] of groups)
  for (const [name, domain, en, zh] of rows) {
    const prior = ck(
      await db
        .from("charts_projects")
        .select("id")
        .eq("domain", domain)
        .maybeSingle(),
    );
    if (prior) continue;
    let ok = false,
      status = 0;
    try {
      const r = await fetch(`https://${domain}`, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(6000),
      });
      status = r.status;
      ok = r.ok;
    } catch {}
    checks.push({ domain, checked_at: new Date().toISOString(), status, ok });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    ck(
      await db.from("charts_projects").insert({
        slug,
        name,
        domain,
        website_url: `https://${domain}`,
        measurement_domain: domain,
        category,
        description_en: en,
        description_zh: zh,
        price_type: [
          "nodered.org",
          "huginn.io",
          "aider.chat",
          "continue.dev",
          "haystack.deepset.ai",
        ].includes(domain)
          ? "free"
          : "freemium",
        publication: "published",
        official_source: `https://${domain}`,
        source_checked_at: ok ? new Date().toISOString() : null,
      }),
    );
  }
await fs.writeFile(
  ".local/source-checks.json",
  JSON.stringify(checks, null, 2),
);
const already = ck(
  await db
    .from("charts_projects")
    .select("id")
    .eq("domain", "atlas-demo.example")
    .maybeSingle(),
);
if (!already) {
  const samples = [
    [
      "Atlas Workspace",
      "atlas-workspace-demo",
      "atlas-demo.example",
      "knowledge-search",
      "A fictional document workspace for exercising the local review flow.",
      "用于体验本地审核流程的虚构文档工作空间。",
    ],
    [
      "RelayBoard",
      "relayboard-demo",
      "relay-demo.example",
      "workflow-automation",
      "A fictional automation project used only for demonstration.",
      "仅用于演示的虚构自动化项目。",
    ],
    [
      "QueryDesk",
      "querydesk-demo",
      "query-demo.example",
      "knowledge-search",
      "A fictional knowledge search project for previewing recommendations.",
      "用于预览推荐机制的虚构知识搜索项目。",
    ],
    [
      "FluxTask",
      "fluxtask-demo",
      "flux-demo.example",
      "ai-coding",
      "A fictional coding project for exercising discovery and effect records.",
      "用于体验项目发现与效果记录的虚构编程项目。",
    ],
  ];
  for (const [i, [name, slug, domain, category, en, zh]] of samples.entries()) {
    const p = ck(
      await db
        .from("charts_projects")
        .insert({
          name,
          slug,
          domain,
          website_url: `https://${domain}`,
          measurement_domain: domain,
          category,
          description_en: en,
          description_zh: zh,
          price_type: "free",
          publication: "published",
          enrolled_at: new Date().toISOString(),
          controller_id: i === 0 ? accounts.founder.id : `demo-controller-${i}`,
          demo: true,
        })
        .select()
        .single(),
    );
    ck(
      await db.from("charts_contributions").insert({
        project_id: p.id,
        fingerprint: `seed-enrollment:${p.id}`,
        type: "enrollment",
        eligible: true,
        demo: true,
      }),
    );
  }
}
for (const month of ["2026-07", "2026-08", "2026-09"])
  ck(
    await db.from("charts_source_months").upsert({
      source: "AITDK",
      month,
      published_at: new Date(`${month}-28T00:00:00Z`).toISOString(),
      accepted: true,
      reference: "demo://synthetic-source-calendar",
      demo: true,
    }),
  );
const projects = ck(
  await db.from("charts_projects").select("*").order("domain"),
);
for (const [i, p] of projects.filter((p: any) => !p.demo).entries())
  for (const [m, month] of ["2026-07", "2026-08", "2026-09"].entries()) {
    if (
      ck(
        await db
          .from("charts_traffic")
          .select("id")
          .eq("domain", p.domain)
          .eq("month", month)
          .eq("demo", true)
          .limit(1),
      ).length
    )
      continue;
    const base = Number.parseInt(
      createHash("sha256").update(p.domain).digest("hex").slice(0, 5),
      16,
    );
    const value = Math.round(
      (50000 + base * 9) * (1 + (m - 1) * (i % 3 === 0 ? -0.045 : 0.073)),
    );
    ck(
      await db.from("charts_traffic").insert({
        domain: p.domain,
        source: "AITDK",
        month,
        metric: "visits",
        scope: "worldwide-all-devices-domain",
        value,
        version: 1,
        review_reference: "demo://synthetic-traffic-never-real",
        demo: true,
      }),
    );
  }
for (const cat of categoryRows) {
  if (
    ck(
      await db
        .from("charts_snapshots")
        .select("id")
        .eq("category", cat.slug)
        .eq("demo", true)
        .limit(1),
    ).length
  )
    continue;
  const cohort = projects.filter((p: any) => p.category === cat.slug),
    traffic = ck(
      await db
        .from("charts_traffic")
        .select("*")
        .eq("demo", true)
        .eq("month", "2026-09")
        .eq("state", "verified"),
    );
  const sorted = cohort
    .filter((p: any) =>
      traffic.some((t: any) => t.domain === p.measurement_domain),
    )
    .sort(
      (a: any, b: any) =>
        traffic.find((t: any) => t.domain === b.domain).value -
        traffic.find((t: any) => t.domain === a.domain).value,
    );
  const entries = sorted.map((p: any, i: number) => {
    const t = traffic.find((x: any) => x.domain === p.domain);
    return {
      project_id: p.id,
      domain: p.domain,
      value: t.value,
      rank: i + 1,
      traffic_id: t.id,
      data_version: 1,
    };
  });
  ck(
    await db.from("charts_snapshots").insert({
      category: cat.slug,
      source: "AITDK",
      month: "2026-09",
      metric: "visits",
      scope: "worldwide-all-devices-domain",
      version: 1,
      entries,
      coverage_count: entries.length,
      total_count: cohort.length,
      demo: true,
    }),
  );
}
const seedProject = projects.find(
  (p: any) => p.domain === "atlas-demo.example",
);
if (
  !ck(
    await db
      .from("charts_applications")
      .select("id")
      .eq("owner_id", accounts.founder.id)
      .eq("demo", true)
      .limit(1),
  ).length
) {
  const peerProjects = projects
    .filter((p: any) => p.category === "knowledge-search" && !p.demo)
    .slice(0, 10);
  const peers = peerProjects.map((p: any) => ({
    domain: p.domain,
    name: p.name,
    task: "Document retrieval / 文档检索",
    rationale:
      "Compare approaches to retrieving knowledge for AI applications; product layers differ. / 比较 AI 应用的知识检索方式，产品层次不同。",
  }));
  const draft = {
    name: seedProject.name,
    slug: seedProject.slug,
    website_url: seedProject.website_url,
    domain: seedProject.domain,
    category: seedProject.category,
    price_type: seedProject.price_type,
    description_en: seedProject.description_en,
    description_zh: seedProject.description_zh,
    peers,
  };
  const app = ck(
    await db.rpc("charts_save_draft", {
      aid: null,
      actor: accounts.founder.id,
      d: draft,
      is_demo: true,
      update_project: null,
    }),
  );
  await fs.mkdir(".local/fixtures", { recursive: true });
  for (const p of peerProjects.slice(0, 5)) {
    const traffic = ck(
      await db
        .from("charts_traffic")
        .select("*")
        .eq("domain", p.domain)
        .eq("demo", true)
        .eq("month", "2026-09")
        .single(),
    );
    const svg = `<svg width="1200" height="760" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="760" fill="white"/><g fill="#111111" font-family="Arial" font-size="36"><text x="70" y="85">123Charts DEMONSTRATION FIXTURE</text><text x="70" y="160">Synthetic screenshot — not real AITDK data</text><text x="70" y="260">${p.domain}</text><text x="70" y="340">Source: AITDK (demo)</text><text x="70" y="420">Month: 2026-09</text><text x="70" y="500">Total Visits: ${traffic.value}</text><text x="70" y="580">Worldwide - All Devices - Domain</text></g></svg>`;
    const buffer = await sharp(Buffer.from(svg)).png().toBuffer(),
      hash = createHash("sha256").update(buffer).digest("hex"),
      key = `${accounts.founder.id}/${app.id}/${p.domain}.png`;
    await fs.writeFile(`.local/fixtures/${p.domain}.png`, buffer);
    ck(
      await db.storage
        .from("charts-evidence")
        .upload(key, buffer, { contentType: "image/png", upsert: true }),
    );
    const ev = ck(
      await db
        .from("charts_evidence")
        .insert({
          application_id: app.id,
          owner_id: accounts.founder.id,
          peer_domain: p.domain,
          storage_path: key,
          file_hash: hash,
          original_name: `DEMO-${p.domain}.png`,
          demo: true,
        })
        .select()
        .single(),
    );
    ck(
      await db.from("charts_jobs").insert({
        kind: "ocr",
        owner_id: accounts.founder.id,
        payload: { evidence_id: ev.id },
      }),
    );
  }
  // The ready-to-review application exercises real OCR and the reviewer workflow.
  ck(
    await db
      .from("charts_applications")
      .update({ status: "submitted", submitted_at: new Date().toISOString() })
      .eq("id", app.id),
  );
  // An independent, explicitly synthetic completed report is available immediately.
  const reportApp = ck(
    await db
      .from("charts_applications")
      .insert({
        owner_id: accounts.founder.id,
        project_id: seedProject.id,
        draft,
        kind: "initial",
        status: "approved",
        demo: true,
        reviewed_at: new Date().toISOString(),
      })
      .select()
      .single(),
  );
  const traffic = ck(
    await db
      .from("charts_traffic")
      .select("*")
      .eq("demo", true)
      .eq("month", "2026-09"),
  );
  const reportPeers = peers.map((p: any) => {
    const t = traffic.find((x: any) => x.domain === p.domain);
    return {
      ...p,
      relationship_state: "approved",
      traffic: t
        ? {
            value: t.value,
            month: t.month,
            source: t.source,
            scope: t.scope,
            version: t.version,
            state: t.state,
          }
        : null,
    };
  });
  ck(
    await db.from("charts_reports").insert({
      application_id: reportApp.id,
      owner_id: accounts.founder.id,
      project_id: seedProject.id,
      peers: reportPeers,
      demo: true,
    }),
  );
  ck(
    await db.from("charts_claims").insert({
      owner_id: accounts.founder.id,
      project_id: seedProject.id,
      evidence: "DEMO ONLY: seeded local identity for fictional project.",
      state: "approved",
      feedback: "Local synthetic fixture. No real ownership claim.",
    }),
  );
  ck(
    await db.from("charts_notifications").insert({
      owner_id: accounts.founder.id,
      title_en: "Your local workspace is ready",
      title_zh: "本地工作空间已准备好",
      body_en:
        "A synthetic report and a separate review application are ready to explore.",
      body_zh: "可以查看演示报告，并使用另一份申请体验完整审核流程。",
      href: "/dashboard",
      dedupe_key: "local-welcome",
    }),
  );
}
// Publish changed category rules once; immutable older versions remain available.
const published = ck(
  await db.from("charts_snapshots").select("category,month,demo,source"),
);
const publishedKeys = new Set<string>();
for (const snapshot of published) {
  const key = `${snapshot.category}:${snapshot.month}:${snapshot.source}:${snapshot.demo}`;
  if (publishedKeys.has(key)) continue;
  publishedKeys.add(key);
  await publishCategory(
    db,
    snapshot.category,
    snapshot.month,
    snapshot.demo,
    "Category scope review: specialist ranking and broad-platform context separated.",
    snapshot.source,
  );
}
console.log(
  `Seed ready: ${projects.filter((p: any) => !p.demo).length} official-site profiles and 4 fictional demo projects. Accounts: .local/accounts.json`,
);
