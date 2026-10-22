import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import { randomBytes, createHash } from "node:crypto";
import fs from "node:fs/promises";
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
        "Amazon Web Services (AWS)",
        "aws.amazon.com",
        "Cloud computing infrastructure and developer services; not an individual coding assistant.",
        "提供计算、存储等云基础设施与开发服务，不是独立编程助手。",
      ],
      [
        "JetBrains",
        "jetbrains.com",
        "Developer tools with integrated AI assistance.",
        "提供集成开发环境与团队开发工具。",
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
// Offline base library: concise task descriptions from prior research. Unknown pricing is not certified.
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
    ck(
      await db.from("charts_projects").insert({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        domain,
        website_url: "https://" + domain,
        measurement_domain: domain,
        category,
        review_state: domain === "aws.amazon.com" ? "reference" : "approved",
        description_en: en,
        description_zh: zh,
        price_type: "unknown",
        publication: "published",
        official_source: "https://" + domain,
      }),
    );
  }
const projects = ck(await db.from("charts_projects").select("*"));
const tasks: Record<string, string> = {
  "ai-coding": "Software development assistance · 编程辅助",
  "workflow-automation": "Connect services into workflows · 应用工作流自动化",
  "knowledge-search":
    "Build knowledge retrieval applications · 构建知识检索应用",
};
for (const p of projects) {
  if (
    p.task ||
    p.demo ||
    !groups.some(([, rows]) => rows.some((row) => row[1] === p.domain))
  )
    continue;
  ck(
    await db
      .from("charts_projects")
      .update({
        task: tasks[p.category],
        differentiator: p.description_en + " " + p.description_zh,
        supported_languages: ["Unconfirmed / 待确认"],
        conditions:
          "Detailed conditions have not been reviewed. Confirm pricing, hosting and usage limits with the official website. / 详细使用条件尚未核实，请向官网确认价格、托管及使用限制。",
        price_verified: false,
      })
      .eq("id", p.id),
  );
}
// Factual editorial review, 2026-10-21. Do not overwrite user-maintained profiles on repeated setup.
const reviewed: Record<string, any> = {
  "zapier.com": {
    task: "Connect app triggers and actions · 连接应用触发器与动作",
    differentiator:
      "Managed app integrations and trigger/action workflows; free plan limited to two-step Zaps. / 托管应用集成与触发动作流程，免费方案限两步工作流。",
    price_type: "freemium",
    conditions:
      "Free forever plan: 100 tasks/month and two-step Zaps. Premium apps and multi-step Zaps require a paid plan. / 持续免费方案每月 100 个任务、两步 Zaps；高级应用与多步流程需付费。",
    price_verified: true,
    supported_languages: ["English"],
    official_source: "https://zapier.com/pricing",
  },
  "activepieces.com": {
    task: "Connect app triggers and actions · 连接应用触发器与动作",
    differentiator:
      "Build automations with flows, agents and tables; cloud and deployment options have plan conditions. / 通过工作流、代理及表格构建自动化，云端与部署方式受方案条件约束。",
    price_type: "freemium",
    conditions:
      "Free forever plan: 1,000 credits/month, unlimited flows, up to 5 users. Extra capacity and enterprise features are paid. / 持续免费方案每月 1,000 点、无限工作流、最多 5 位用户；额外容量和企业能力收费。",
    price_verified: true,
    supported_languages: ["English"],
    official_source: "https://www.activepieces.com/pricing",
  },
  "n8n.io": {
    task: "Connect app triggers and actions · 连接应用触发器与动作",
    differentiator:
      "Build node-based workflows; managed cloud and self-hosted offerings have distinct terms. / 基于节点构建工作流，托管云与自部署方案条款不同。",
    price_type: "trial",
    conditions:
      "Managed cloud has a free trial followed by paid plans. Self-hosted Community has separate license and operating-cost conditions; cloud trial is not sustained free use. / 托管云提供免费试用，之后付费；社区自部署另有许可证与运维成本，云试用不等于持续免费。",
    price_verified: true,
    supported_languages: ["English"],
    official_source: "https://n8n.io/pricing/",
  },
  "make.com": {
    task: "Connect app triggers and actions · 连接应用触发器与动作",
    differentiator:
      "Visual scenarios connect apps and transform data; actions consume credits. / 通过可视化场景连接应用并转换数据，动作消耗点数。",
    conditions:
      "Actions consume credits; confirm current allowance, interval limits and plan eligibility on the official pricing page. / 动作消耗点数，当前额度、运行间隔与方案条件请在官网确认。",
    price_type: "unknown",
    price_verified: false,
    supported_languages: ["English"],
    official_source: "https://www.make.com/pricing",
  },
  "nodered.org": {
    task: "Connect event-driven application flows · 连接事件驱动应用流程",
    differentiator:
      "Browser-based flow editor with JavaScript functions and a Node.js runtime; suited to self-managed event flows. / 浏览器流程编辑器、JavaScript 函数与 Node.js 运行时，适合自主维护的事件流程。",
    conditions:
      "Core software uses Apache 2.0. Self-hosting, hardware, external services and third-party nodes can have separate costs and licenses. / 核心软件采用 Apache 2.0；自部署、硬件、外部服务及第三方节点另有成本或许可。",
    price_type: "free",
    price_verified: true,
    is_open_source: true,
    open_source_url: "https://nodered.org/about/license/",
    supported_languages: ["English"],
    official_source: "https://nodered.org/about/license/",
  },
  "cursor.com": {
    task: "AI-assisted code editing · AI 辅助代码编辑",
    differentiator:
      "An editor and agent workflow for changes across a codebase. / 在编辑器与代理流程中修改代码库。",
    supported_languages: ["Unconfirmed / 待确认"],
    official_source: "https://cursor.com/en-US",
  },
  "continue.dev": {
    task: "AI-assisted code editing · AI 辅助代码编辑",
    differentiator:
      "Configurable AI agents in VS Code and JetBrains, including chat, edit and autocomplete. / 在 VS Code 与 JetBrains 中配置代理，提供聊天、编辑与补全。",
    supported_languages: ["Unconfirmed / 待确认"],
    official_source: "https://docs.continue.dev/",
  },
  "aider.chat": {
    task: "AI-assisted code editing · AI 辅助代码编辑",
    differentiator:
      "Terminal-based pair programming in an existing Git codebase, using local or cloud models. Model service costs vary. / 在终端中结对修改 Git 代码库，可使用本地或云模型，模型成本另计。",
    supported_languages: ["Unconfirmed / 待确认"],
    official_source: "https://aider.chat/",
  },
  "langflow.org": {
    task: "Build agentic knowledge applications · 构建代理与知识应用",
    differentiator:
      "Visual components for agents, retrieval and MCP servers, with Python underneath. / 用可视化组件构建代理、检索与 MCP 服务，底层可使用 Python。",
    supported_languages: ["Unconfirmed / 待确认"],
    official_source: "https://www.langflow.org/",
  },
  "dify.ai": {
    task: "Build agentic knowledge applications · 构建代理与知识应用",
    differentiator:
      "Workflow Studio and Knowledge Pipeline organize agent workflows and searchable knowledge. / 通过 Workflow Studio 与 Knowledge Pipeline 组织代理流程和可检索知识。",
    supported_languages: ["Unconfirmed / 待确认"],
    official_source: "https://dify.ai/",
  },
};
for (const [domain, patch] of Object.entries(reviewed)) {
  const p = projects.find((p: any) => p.domain === domain);
  if (
    !p ||
    (p.source_checked_at?.startsWith("2026-10-21") && p.task === patch.task)
  )
    continue; // Explicit editorial seed, only once per fixture revision.
  const marker = ck(
    await db
      .from("charts_settings")
      .select("key")
      .eq("key", "discovery-fixture:" + domain)
      .maybeSingle(),
  );
  if (marker) continue;
  ck(
    await db
      .from("charts_projects")
      .update({
        ...patch,
        source_checked_at: "2026-10-21T08:00:00Z",
        updated_at: new Date().toISOString(),
      })
      .eq("id", p.id),
  );
  ck(
    await db.from("charts_settings").insert({
      key: "discovery-fixture:" + domain,
      value: {
        version: 1,
        reviewed: "2026-10-21",
        source: patch.official_source,
      },
    }),
  );
}
// Changed/retiring products stay in history and are not recommended as current choices.
for (const domain of ["windsurf.com", "flowiseai.com"]) {
  const marker = ck(
    await db
      .from("charts_settings")
      .select("key")
      .eq("key", "discovery-maintenance:" + domain)
      .maybeSingle(),
  );
  if (marker) continue;
  ck(
    await db
      .from("charts_projects")
      .update({
        publication: "draft",
        conditions:
          domain === "windsurf.com"
            ? "Official editor URL redirects to Devin Desktop; canonical product identity needs review. / 官网编辑器地址已跳转 Devin Desktop，需复核产品身份。"
            : "Official homepage announces sunsetting. Current availability needs review. / 官网已公告停止维护，需复核当前可用性。",
      })
      .eq("domain", domain),
  );
  ck(
    await db.from("charts_settings").insert({
      key: "discovery-maintenance:" + domain,
      value: { reason: "Official website checked 2026-10-21" },
    }),
  );
}
// Reviewed editorial relationships are not founder enrollments or nominations-as-popularity.
const all = ck(await db.from("charts_projects").select("*"));
for (const [source, targets, task, basis] of [
  [
    "n8n.io",
    ["zapier.com", "make.com", "activepieces.com"],
    "Connect app triggers and actions · 连接应用触发器与动作",
    "Official product and pricing pages describe app-trigger/action workflows. Compare managed hosting, steps and usage limits, not full feature equivalence. / 官网产品及价格说明均涉及触发器与动作流程，比较托管、步骤及额度，不表示功能全面等同。",
  ],
  [
    "cursor.com",
    ["aider.chat", "continue.dev"],
    "AI-assisted code editing · AI 辅助代码编辑",
    "Official feature documentation describes model-assisted code edits; terminal, editor and configurable-extension workflows differ. / 官网功能说明均涉及模型辅助代码编辑，终端、编辑器与可配置扩展的工作方式不同。",
  ],
  [
    "langflow.org",
    ["dify.ai"],
    "Build agentic knowledge applications · 构建代理与知识应用",
    "Official pages describe visual agent workflows and knowledge integration. Deployment and component systems differ. / 官网描述可视化代理流程与知识整合，部署和组件体系存在差异。",
  ],
] as [string, string[], string, string][]) {
  const project = all.find((p: any) => p.domain === source);
  if (!project) continue;
  const key = "editorial-discovery:" + source;
  const old = ck(
    await db
      .from("charts_applications")
      .select("id")
      .eq("feedback", key)
      .maybeSingle(),
  );
  if (old) continue;
  const app = ck(
    await db
      .from("charts_applications")
      .insert({
        owner_id: accounts.admin.id,
        project_id: project.id,
        kind: "update",
        status: "approved",
        draft: { ...project, peers: [] },
        feedback: key,
        demo: false,
        reviewed_at: new Date().toISOString(),
      })
      .select("id")
      .single(),
  );
  for (const target of targets) {
    const peer = all.find((p: any) => p.domain === target);
    if (peer)
      ck(
        await db.from("charts_relations").insert({
          application_id: app.id,
          project_id: project.id,
          peer_domain: target,
          peer_name: peer.name,
          task,
          rationale: basis,
          status: "approved",
          feedback: "Editorial source review 2026-10-21",
        }),
      );
  }
}
// Fictional records are isolated; no synthetic traffic is generated by current setup.
for (const [i, name] of [
  "Atlas Note",
  "Query Nest",
  "Paper Trail",
  "Local Lens",
  "Scope Desk",
  "Relay Garden",
  "Code Harbor",
  "Node Lantern",
].entries()) {
  const domain = "discovery-" + i + ".example";
  if (
    ck(
      await db
        .from("charts_projects")
        .select("id")
        .eq("domain", domain)
        .maybeSingle(),
    )
  )
    continue;
  ck(
    await db.from("charts_projects").insert({
      name,
      slug: "discovery-" + i,
      domain,
      website_url: "https://" + domain,
      measurement_domain: domain,
      category:
        i === 6
          ? "ai-coding"
          : i === 5 || i === 7
            ? "workflow-automation"
            : "knowledge-search",
      description_en:
        "Fictional " +
        name +
        " for exercising discovery, review and comparison locally.",
      description_zh: "虚构的 " + name + "，用于体验本地发现、审核与对比。",
      task:
        i === 6
          ? "Code editing · 编程辅助"
          : i === 5 || i === 7
            ? "Automate tasks · 自动化任务"
            : "Find team documents · 团队文档检索",
      differentiator:
        "Fictional local example / 虚构本地案例 · " +
        (i % 2
          ? "Self-managed deployment · 自部署"
          : "Managed workspace · 托管工作空间"),
      supported_languages: ["English", "中文"],
      price_type:
        i === 2 ? "trial" : i === 3 ? "paid" : i % 2 ? "free" : "freemium",
      price_verified: true,
      conditions:
        "DEMO ONLY: " +
        (i === 2
          ? "14-day trial"
          : i === 3
            ? "Paid subscription"
            : "Sustained free document search with a fictional allowance") +
        " / 仅演示：使用限制为虚构测试条件。",
      is_open_source: i === 1,
      open_source_url: i === 1 ? "https://discovery-1.example/license" : "",
      publication: "published",
      controller_id: "demo-discovery-controller-" + i,
      demo: true,
    }),
  );
}
const demoAll = ck(
  await db.from("charts_projects").select("*").eq("demo", true),
);
const own = demoAll.find((p: any) => p.slug === "discovery-0");
if (
  own &&
  !ck(
    await db
      .from("charts_applications")
      .select("id")
      .eq("feedback", "discovery-demo-sample")
      .maybeSingle(),
  )
) {
  const peers = demoAll
    .filter((p: any) =>
      ["discovery-1", "discovery-2", "discovery-3"].includes(p.slug),
    )
    .map((p: any) => ({
      domain: p.domain,
      name: p.name,
      task: "Find team documents · 团队文档检索",
      rationale:
        "DEMO: compare document search with different deployment and pricing conditions. / 演示：比较部署方式及价格条件不同的文档检索。",
    }));
  const app = ck(
    await db.rpc("charts_save_draft", {
      aid: null,
      actor: accounts.founder.id,
      d: { ...own, peers },
      is_demo: true,
      update_project: null,
    }),
  );
  ck(
    await db
      .from("charts_applications")
      .update({ status: "submitted" })
      .eq("id", app.id),
  );
  ck(
    await db
      .from("charts_relations")
      .update({ status: "approved" })
      .eq("application_id", app.id),
  );
  ck(
    await db.rpc("charts_approve_discovery", {
      aid: app.id,
      actor: accounts.admin.id,
      reference:
        "DEMO only: fictional local review fixture; no real product claims.",
      pricing_confirmed: true,
    }),
  );
  ck(
    await db
      .from("charts_applications")
      .update({ feedback: "discovery-demo-sample" })
      .eq("id", app.id),
  );
}
console.log(
  "Discovery fixtures ready: real research stays separate from fictional review examples. Credentials remain in .local/accounts.json.",
);
