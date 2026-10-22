import { workerSignature } from "../../lib/charts/worker-auth";
import { ensureDiscoveryCycle } from "./discovery-cycle";
import { discover } from "../../lib/charts/discovery";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import { workerConfiguration } from "../../lib/charts/runtime-config";
import nodemailer from "nodemailer";
import { loadEnv } from "./env.mjs";
import { suggestCategory } from "../../lib/charts/rules";
import { safeHtml, extractMetadata } from "../../lib/charts/safe-fetch";
if (
  process.env.CHARTS_RUNTIME !== "production" &&
  process.env.CHARTS_RUNTIME !== "staging"
)
  loadEnv();
const configuration = workerConfiguration(process.env);
const endpoint = configuration.endpoint;
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
  for (const demo of [true, false]) await ensureDiscoveryCycle(db, demo);
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
      if (p.updated_at < f.created_at) continue;
      const key = `follow:${f.owner_id}:${f.kind}:${f.target}:${p.id}:${p.updated_at}`;
      check(
        await db.from("charts_notifications").upsert(
          {
            owner_id: f.owner_id,
            title_en: `Update: ${p.name}`,
            title_zh: `项目动态：${p.name}`,
            body_en: p.description_en,
            body_zh: p.description_zh,
            href: `/products/${p.slug}`,
            dedupe_key: key,
          },
          { onConflict: "dedupe_key", ignoreDuplicates: true },
        ),
      );
    }
  }
  // Alternatives follows track only published, reviewed relationship changes.
  for (const f of check(
    await db
      .from("charts_follows")
      .select("*")
      .eq("kind", "alternatives")
      .limit(300),
  )) {
    if (owner && f.owner_id !== owner) continue;
    const target = check(
      await db
        .from("charts_projects")
        .select("*")
        .eq("id", f.target)
        .eq("publication", "published")
        .maybeSingle(),
    );
    if (!target) continue;
    const edges = check(
      await db
        .from("charts_relations")
        .select("id,application_id,project_id,peer_domain")
        .eq("status", "approved")
        .or(`project_id.eq.${target.id},peer_domain.eq.${target.domain}`),
    );
    for (const edge of edges) {
      const app = check(
        await db
          .from("charts_applications")
          .select("status,reviewed_at")
          .eq("id", edge.application_id)
          .single(),
      );
      if (app.status !== "approved" || app.reviewed_at < f.created_at) continue;
      check(
        await db.from("charts_notifications").upsert(
          {
            owner_id: f.owner_id,
            title_en: `Alternative update: ${target.name}`,
            title_zh: `替代方案更新：${target.name}`,
            body_en: "A reviewed task relationship is available.",
            body_zh: "新增一条已确认的用途关系。",
            href: `/alternatives/${target.slug}`,
            dedupe_key: `alternative:${f.owner_id}:${edge.id}`,
          },
          { onConflict: "dedupe_key", ignoreDuplicates: true },
        ),
      );
    }
  }
  const notifications = check(
    await db
      .from("charts_notifications")
      .select("*")
      .is("email_sent_at", null)
      .order("created_at", { ascending: false })
      .limit(100),
  );
  const mail = nodemailer.createTransport(configuration.mail);
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
    if (/^\/(projects|products)\//.test(location.pathname)) {
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
    } else if (location.pathname.startsWith("/alternatives/")) {
      const p = check(
        await db
          .from("charts_projects")
          .select("id")
          .eq("slug", location.pathname.split("/")[2])
          .maybeSingle(),
      );
      subscribed =
        !!p &&
        follow.some((f: any) => f.kind === "alternatives" && f.target === p.id);
    } else if (location.pathname.startsWith("/charts/"))
      subscribed = follow.some(
        (f: any) =>
          f.kind === "category" && f.target === location.pathname.split("/")[2],
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
      from: configuration.from,
      to: user.email,
      subject: `${n.title_en} / ${n.title_zh}`,
      messageId: `<${n.id}@${new URL(configuration.publicUrl).hostname}>`,
      text: `${n.body_en}\n\n${n.body_zh}\n\n${configuration.publicUrl}/en${n.href}\nManage subscriptions: ${configuration.publicUrl}/en/following`,
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
    const metadata = extractMetadata(fetched.html, fetched.url);
    return {
      ...metadata,
      suggested_category: suggestCategory(
        metadata.name + " " + metadata.description,
      ),
      website_url: fetched.url,
    };
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
console.log("123Charts worker ready.");
let lastScheduled = 0;
while (!stopping) {
  try {
    if (Date.now() - lastScheduled > 60000) {
      lastScheduled = Date.now();
      // External traffic and OCR are intentionally outside the discovery MVP.
      const cachePending = check(
        await db
          .from("charts_cache_invalidations")
          .select("id")
          .is("processed_at", null)
          .limit(1),
      );
      if (cachePending.length) {
        const time = String(Date.now());
        await fetch(configuration.webUrl + "/api/v1/cache/flush", {
          method: "POST",
          headers: {
            "x-charts-time": time,
            "x-charts-signature": workerSignature(time),
          },
          signal: AbortSignal.timeout(6000),
        }).catch(() => {});
      }
      await recommendations().catch((e) =>
        console.error("Recommendation scheduling:", e.message),
      );
      await digest().catch((e) =>
        console.error("Notification scheduling:", e.message),
      );
    }
    const jobs = check(await db.rpc("charts_claim_job"));
    if (process.env.CHARTS_WORKER_HEALTH_FILE)
      await fs.writeFile(
        process.env.CHARTS_WORKER_HEALTH_FILE,
        String(Date.now()),
        { mode: 0o600 },
      );
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
      console.error(`${job.kind}: ${message}`);
    }
  } catch (e) {
    console.error("Worker:", (e as Error).message);
    await snooze(5000);
  }
}
console.log("Worker stopped; queued jobs are persisted.");
