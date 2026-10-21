import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import { createWorker } from "tesseract.js";
import { createHash } from "node:crypto";
import path from "node:path";
import nodemailer from "nodemailer";
import { loadEnv } from "./env.mjs";
import { parseTraffic } from "../../lib/charts/rules";
import { safeHtml, extractMetadata } from "../../lib/charts/safe-fetch";
loadEnv();
const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL!;
if (
  !endpoint ||
  !["127.0.0.1", "localhost"].includes(new URL(endpoint).hostname)
)
  throw new Error("Worker requires a local database.");
const db = createClient(endpoint, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  realtime: { transport: WebSocket as any },
  auth: { persistSession: false },
});
let stopping = false;
process.on("SIGINT", () => {
  stopping = true;
});
process.on("SIGTERM", () => {
  stopping = true;
});
function check(r: any) {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}
const snooze = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function recommendations() {
  const today = new Date().toISOString().slice(0, 10);
  const settings = check(
    await db
      .from("charts_settings")
      .select("value")
      .eq("key", "recommendations")
      .single(),
  ).value;
  const all = check(
    await db
      .from("charts_projects")
      .select("*")
      .eq("publication", "published")
      .not("enrolled_at", "is", null),
  );
  for (const demo of [true, false])
    for (const category of [
      "all",
      "ai-coding",
      "workflow-automation",
      "knowledge-search",
    ]) {
      if (
        check(
          await db
            .from("charts_recommendations")
            .select("id")
            .eq("day", today)
            .eq("context", category)
            .eq("demo", demo)
            .limit(1),
        ).length
      )
        continue;
      const projects = all.filter(
        (p: any) =>
          p.demo === demo && (category === "all" || p.category === category),
      );
      const recent = Date.now() - settings.recentDays * 86400000;
      const used = new Set<string>();
      const selected: { p: any; reason: string; slot: number }[] = [];
      const pick = (pool: any[], reason: string, slot: number) => {
        const candidate = pool
          .filter((p) => !used.has(p.controller_id ?? p.id))
          .sort((a, b) =>
            createHash("sha256")
              .update(today + category + a.id)
              .digest("hex")
              .localeCompare(
                createHash("sha256")
                  .update(today + category + b.id)
                  .digest("hex"),
              ),
          )[0];
        if (candidate) {
          used.add(candidate.controller_id ?? candidate.id);
          selected.push({ p: candidate, reason, slot });
        }
      };
      const latest = projects.filter(
        (p: any) => new Date(p.enrolled_at).getTime() >= recent,
      );
      pick(latest, "newly_enrolled", 1);
      pick(latest, "newly_enrolled", 2);
      const contributions = check(
        await db
          .from("charts_contributions")
          .select("project_id")
          .eq("eligible", true)
          .eq("demo", demo)
          .gte("adopted_at", new Date(recent).toISOString()),
      );
      pick(
        projects.filter((p: any) =>
          contributions.some((c: any) => c.project_id === p.id),
        ),
        "adopted_contribution",
        3,
      );
      const impressions = check(
        await db
          .from("charts_events")
          .select("project_id")
          .eq("kind", "impression")
          .eq("excluded", false)
          .gte(
            "created_at",
            new Date(
              Date.now() - settings.lowExposureDays * 86400000,
            ).toISOString(),
          )
          .limit(20000),
      );
      const counts = new Map<string, number>();
      for (const e of impressions)
        counts.set(e.project_id, (counts.get(e.project_id) ?? 0) + 1);
      const remaining = projects.filter(
        (p: any) => !used.has(p.controller_id ?? p.id),
      );
      const min = Math.min(...remaining.map((p: any) => counts.get(p.id) ?? 0));
      pick(
        remaining.filter((p: any) => (counts.get(p.id) ?? 0) === min),
        "low_exposure",
        4,
      );
      if (selected.length)
        check(
          await db.from("charts_recommendations").upsert(
            selected.map(({ p, reason, slot }) => ({
              day: today,
              context: category,
              slot,
              reason,
              project_id: p.id,
              demo,
            })),
            { onConflict: "day,context,slot,demo", ignoreDuplicates: true },
          ),
        );
    }
}
async function digest(owner?: string) {
  let follows = db
    .from("charts_follows")
    .select("*")
    .in("kind", ["project", "category"]);
  if (owner) follows = follows.eq("owner_id", owner);
  for (const f of check(await follows.limit(300))) {
    let q = db
      .from("charts_projects")
      .select("*")
      .eq("publication", "published");
    q =
      f.kind === "project" ? q.eq("id", f.target) : q.eq("category", f.target);
    for (const p of check(
      await q.order("updated_at", { ascending: false }).limit(10),
    )) {
      const key = `follow:${f.owner_id}:${f.kind}:${f.target}:${p.id}:${p.updated_at}`;
      check(
        await db.from("charts_notifications").upsert(
          {
            owner_id: f.owner_id,
            title_en: `Update: ${p.name}`,
            title_zh: `项目动态：${p.name}`,
            body_en: p.description_en,
            body_zh: p.description_zh,
            href: `/projects/${p.slug}`,
            dedupe_key: key,
          },
          { onConflict: "dedupe_key", ignoreDuplicates: true },
        ),
      );
    }
  }
  const watched = check(
    await (
      owner
        ? db.from("charts_follows").select("*").eq("owner_id", owner)
        : db.from("charts_follows").select("*")
    )
      .in("kind", ["project", "category"])
      .limit(300),
  );
  for (const f of watched) {
    if (f.kind === "category") {
      const snapshots = check(
        await db
          .from("charts_snapshots")
          .select("*")
          .eq("category", f.target)
          .eq("demo", false)
          .order("created_at", { ascending: false })
          .limit(1),
      );
      for (const snapshot of snapshots)
        check(
          await db.from("charts_notifications").upsert(
            {
              owner_id: f.owner_id,
              title_en: `New monthly chart: ${snapshot.month}`,
              title_zh: `月榜已更新：${snapshot.month}`,
              body_en: `${snapshot.category} · ${snapshot.source} · ${snapshot.coverage_count}/${snapshot.total_count} covered · v${snapshot.version}`,
              body_zh: `${snapshot.category} · ${snapshot.source} · 覆盖 ${snapshot.coverage_count}/${snapshot.total_count} · v${snapshot.version}`,
              href: `/charts?category=${snapshot.category}&month=${snapshot.month}`,
              dedupe_key: `snapshot:${f.owner_id}:${snapshot.id}`,
            },
            { onConflict: "dedupe_key", ignoreDuplicates: true },
          ),
        );
    }
  }
  // Observation groups are a bounded batch; emit changes only after the report's saved versions.
  let reportQuery = db.from("charts_reports").select("*");
  if (owner) reportQuery = reportQuery.eq("owner_id", owner);
  const reports = check(
    await reportQuery.order("created_at", { ascending: false }).limit(100),
  );
  const traffic = check(
    await db
      .from("charts_traffic")
      .select("*")
      .eq("state", "verified")
      .eq("source", "AITDK")
      .eq("metric", "visits")
      .eq("scope", "worldwide-all-devices-domain")
      .order("month", { ascending: false })
      .order("version", { ascending: false })
      .limit(1000),
  );
  for (const f of watched.filter((f: any) => f.kind === "project")) {
    const p = check(
      await db
        .from("charts_projects")
        .select("id,slug,measurement_domain,demo,name")
        .eq("id", f.target)
        .maybeSingle(),
    );
    if (!p) continue;
    const current = traffic.find(
      (x: any) => x.domain === p.measurement_domain && x.demo === p.demo,
    );
    if (!current) continue;
    const prefix = current.demo ? "DEMO · " : "";
    check(
      await db.from("charts_notifications").upsert(
        {
          owner_id: f.owner_id,
          title_en: `${prefix}Monthly data: ${p.name}`,
          title_zh: `${prefix}月度数据：${p.name}`,
          body_en: `${current.month} · ${current.source} · ${current.value} visits · v${current.version}`,
          body_zh: `${current.month} · ${current.source} · ${current.value} 访问量 · v${current.version}`,
          href: `/projects/${p.slug}`,
          dedupe_key: `project-data:${f.owner_id}:${current.id}`,
        },
        { onConflict: "dedupe_key", ignoreDuplicates: true },
      ),
    );
  }
  for (const report of reports)
    for (const peer of report.peers) {
      const current = traffic.find(
        (t: any) => t.domain === peer.domain && t.demo === report.demo,
      );
      if (!current) continue;
      const prior = peer.traffic;
      if (
        prior &&
        (current.month < prior.month ||
          (current.month === prior.month && current.version <= prior.version))
      )
        continue;
      if (
        !prior &&
        new Date(current.verified_at) <= new Date(report.created_at)
      )
        continue;
      const prefix = report.demo ? "DEMO · " : "";
      check(
        await db.from("charts_notifications").upsert(
          {
            owner_id: report.owner_id,
            title_en: `${prefix}Peer data updated: ${peer.name}`,
            title_zh: `${prefix}同行数据更新：${peer.name}`,
            body_en: `${current.month} · ${current.source} · ${current.value} visits · v${current.version}. The saved report retains its original snapshot.`,
            body_zh: `${current.month} · ${current.source} · ${current.value} 访问量 · v${current.version}。原报告保留审核时的快照。`,
            href: `/reports/${report.id}`,
            dedupe_key: `peer-data:${report.owner_id}:${report.project_id}:${current.id}`,
          },
          { onConflict: "dedupe_key", ignoreDuplicates: true },
        ),
      );
    }
  const notifications = check(
    await db
      .from("charts_notifications")
      .select("*")
      .is("email_sent_at", null)
      .order("created_at", { ascending: false })
      .limit(100),
  );
  const mail = nodemailer.createTransport({
    host: "127.0.0.1",
    port: Number(process.env.CHARTS_SMTP_PORT ?? 54325),
    secure: false,
  });
  for (const n of notifications) {
    const follow = check(
      await db
        .from("charts_follows")
        .select("target,kind")
        .eq("owner_id", n.owner_id)
        .eq("email_enabled", true)
        .limit(100),
    );
    if (!follow.length) continue;
    let subscribed = false;
    const location = new URL(n.href, "http://127.0.0.1:3100");
    if (location.pathname.startsWith("/projects/")) {
      const p = check(
        await db
          .from("charts_projects")
          .select("id,category")
          .eq("slug", location.pathname.split("/")[2])
          .maybeSingle(),
      );
      subscribed =
        !!p &&
        follow.some(
          (f: any) =>
            (f.kind === "project" && f.target === p.id) ||
            (f.kind === "category" && f.target === p.category),
        );
    } else if (location.pathname === "/charts")
      subscribed = follow.some(
        (f: any) =>
          f.kind === "category" &&
          f.target === location.searchParams.get("category"),
      );
    else if (location.pathname.startsWith("/reports/")) {
      const r = check(
        await db
          .from("charts_reports")
          .select("project_id")
          .eq("id", location.pathname.split("/")[2])
          .maybeSingle(),
      );
      subscribed =
        !!r &&
        follow.some(
          (f: any) => f.kind === "project" && f.target === r.project_id,
        );
    }
    if (!subscribed) continue;
    const {
      data: { user },
    } = await db.auth.admin.getUserById(n.owner_id);
    if (!user?.email) continue;
    await mail.sendMail({
      from: "123Charts <updates@123charts.local>",
      to: user.email,
      subject: `${n.title_en} / ${n.title_zh}`,
      messageId: `<${n.id}@123charts.local>`,
      text: `${n.body_en}\n\n${n.body_zh}\n\nhttp://127.0.0.1:3100/en${n.href}\nManage subscriptions: http://127.0.0.1:3100/en/following`,
    });
    check(
      await db
        .from("charts_notifications")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", n.id),
    );
  }
}
async function processJob(job: any) {
  if (job.kind === "ocr") {
    const e = check(
      await db
        .from("charts_evidence")
        .select("*")
        .eq("id", job.payload.evidence_id)
        .maybeSingle(),
    );
    if (!e) return { removed: true };
    const blob = check(
      await db.storage.from("charts-evidence").download(e.storage_path),
    );
    const worker = await createWorker(["eng", "chi_sim"], 1, {
      langPath: path.resolve("public/ocr"),
      cachePath: path.resolve(".local/ocr"),
      corePath: path.resolve("node_modules/tesseract.js-core"),
      logger: () => {},
    });
    try {
      const result = await worker.recognize(
        Buffer.from(await blob.arrayBuffer()),
      );
      const fields = parseTraffic(result.data.text);
      // Extraction never grants verification. A reviewer must check scope, source and attribution.
      check(
        await db
          .from("charts_evidence")
          .update({
            raw_text: result.data.text.slice(0, 30000),
            extracted: fields,
            state: "pending_review",
          })
          .eq("id", e.id)
          .eq("state", "pending_extraction"),
      );
      return { confidence: result.data.confidence, fields };
    } finally {
      await worker.terminate();
    }
  }
  if (job.kind === "metadata") {
    const fetched = await safeHtml(job.payload.url);
    if (job.payload.project_id)
      check(
        await db
          .from("charts_projects")
          .update({ source_checked_at: new Date().toISOString() })
          .eq("id", job.payload.project_id)
          .eq("publication", "draft"),
      );
    return { ...extractMetadata(fetched.html), website_url: fetched.url };
  }
  if (job.kind === "digest") {
    await digest(job.owner_id);
    return { processed: true };
  }
  if (job.kind === "recommendations") {
    await recommendations();
    return { processed: true };
  }
  throw new Error("Unknown job type.");
}
console.log("123Charts local worker ready.");
let lastScheduled = 0;
while (!stopping) {
  try {
    if (Date.now() - lastScheduled > 60000) {
      lastScheduled = Date.now();
      await recommendations().catch((e) =>
        console.error("Recommendation scheduling:", e.message),
      );
      await digest().catch((e) =>
        console.error("Notification scheduling:", e.message),
      );
    }
    const jobs = check(await db.rpc("charts_claim_job"));
    const job = jobs?.[0];
    if (!job) {
      await snooze(1200);
      continue;
    }
    try {
      const started = Date.now();
      const result = {
        ...(await processJob(job)),
        elapsed_ms: Date.now() - started,
      };
      check(
        await db
          .from("charts_jobs")
          .update({
            state: "done",
            result,
            finished_at: new Date().toISOString(),
            locked_at: null,
            error: null,
          })
          .eq("id", job.id),
      );
      console.log(`${job.kind} completed ${job.id.slice(0, 8)}`);
    } catch (e) {
      const message = (e as Error).message;
      const final = job.attempts >= 3;
      check(
        await db
          .from("charts_jobs")
          .update({
            state: final ? "failed" : "pending",
            locked_at: null,
            error: message.slice(0, 500),
            run_after: new Date(Date.now() + job.attempts * 5000).toISOString(),
          })
          .eq("id", job.id),
      );
      if (final && job.kind === "ocr")
        check(
          await db
            .from("charts_evidence")
            .update({
              state: "pending_review",
              review_note:
                "OCR failed. Review the original or request a clearer image.",
            })
            .eq("id", job.payload.evidence_id)
            .eq("state", "pending_extraction"),
        );
      console.error(`${job.kind}: ${message}`);
    }
  } catch (e) {
    console.error("Worker:", (e as Error).message);
    await snooze(5000);
  }
}
console.log("Worker stopped; queued jobs are persisted.");
