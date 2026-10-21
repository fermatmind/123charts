import { ensureDiscoveryCycle } from "./discovery-cycle";
import { discover } from "../../lib/charts/discovery";
import {
  scheduleVerification,
  verificationTick,
  queueVerification,
  PUBLIC_SOURCE,
} from "../../lib/charts/verification";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import { createWorker } from "tesseract.js";
import { createHash } from "node:crypto";
import path from "node:path";
import nodemailer from "nodemailer";
import { loadEnv } from "./env.mjs";
import { parseTraffic, suggestCategory } from "../../lib/charts/rules";
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
            href: `/projects/${p.slug}`,
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
    const sourceEvidence = !!job.payload.source_evidence_id;
    const table = sourceEvidence ? "charts_source_evidence" : "charts_evidence";
    const e = check(
      await db
        .from(table)
        .select("*")
        .eq("id", job.payload.source_evidence_id ?? job.payload.evidence_id)
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
      if (sourceEvidence) {
        fields.domain = result.data.text.toLowerCase().includes(e.domain)
          ? e.domain
          : fields.domain;
        fields.source = /SEMRUSH/i.test(result.data.text) ? PUBLIC_SOURCE : "";
        fields.scope =
          /All Devices/i.test(result.data.text) &&
          /Worldwide/i.test(result.data.text)
            ? "worldwide-all-devices-domain"
            : "";
        // Source-layout fallback: a single abbreviated traffic candidate in the
        // visible overview. This remains a candidate until the actual page agrees.
        if (fields.value === null && /Traffic Stats/i.test(result.data.text)) {
          const candidates = Array.from(
            new Set(result.data.text.match(/\b\d+(?:\.\d+)?[KMB]\b/g) ?? []),
          );
          if (candidates.length === 1) {
            const parsed = parseTraffic(`Monthly Visits ${candidates[0]}`);
            fields.value = parsed.value;
            fields.unit = parsed.unit;
            fields.raw_display = parsed.raw_display;
            fields.precision_step = parsed.precision_step;
            fields.metric = "visits";
          }
        }
        const named = result.data.text.match(
          /(January|February|March|April|May|June|July|August|September|October|November|December) (20\d{2})/i,
        );
        if (named)
          fields.month = `${named[2]}-${String(["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"].indexOf(named[1].toLowerCase()) + 1).padStart(2, "0")}`;
      }
      // Extraction never grants verification. A reviewer must check scope, source and attribution.
      check(
        await db
          .from(table)
          .update({
            raw_text: result.data.text.slice(0, 30000),
            extracted: fields,
            state: "pending_review",
          })
          .eq("id", e.id)
          .eq("state", "pending_extraction"),
      );
      if (sourceEvidence) {
        await queueVerification(db, {
          domain: e.domain,
          source: e.source,
          month: e.month,
          source_evidence_id: e.id,
          priority: 10,
        });
        return { confidence: result.data.confidence, fields };
      }
      if (!e.demo && fields.month)
        await queueVerification(db, {
          domain: e.peer_domain,
          source: PUBLIC_SOURCE,
          month: fields.month,
          evidence_id: e.id,
          priority: 5,
        });
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
    const metadata = extractMetadata(fetched.html);
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
console.log("123Charts local worker ready.");
let lastScheduled = 0;
while (!stopping) {
  try {
    if (Date.now() - lastScheduled > 60000) {
      lastScheduled = Date.now();
      // External traffic and OCR are intentionally outside the discovery MVP.
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
