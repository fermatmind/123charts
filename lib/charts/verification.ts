import { createHash } from "node:crypto";

import { parseTraffic, normalizeWebsite } from "./rules";
import { check, publishCategory } from "./publishing";
export const PUBLIC_SOURCE = "Semrush public";
export const SCOPE = "worldwide-all-devices-domain";
const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
// Fixed provider origin and path, never a user-selected destination. Standard
// HTTPS certificate validation remains enabled; redirects are rejected.
export async function readPublicSource(domain: string) {
  const canonical = normalizeWebsite(domain).domain;
  const url = `https://www.semrush.com/website/${encodeURIComponent(canonical)}/overview/`;
  const r = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(8000),
    headers: {
      Accept: "text/html",
      "User-Agent": "123Charts-Verification/1.0",
    },
  });
  if (r.status !== 200 || !r.headers.get("content-type")?.includes("text/html"))
    throw new Error(
      `Provider returned HTTP ${r.status}; no verified observation.`,
    );
  if (!r.body) throw new Error("Empty source response.");
  const reader = r.body.getReader(),
    chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 524288) throw new Error("Provider response exceeds 512 KB.");
      chunks.push(part.value);
    }
  } finally {
    await reader.cancel();
  }
  return { html: Buffer.concat(chunks).toString("utf8"), url };
}
export function parsePublicTraffic(html: string, domain: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const m = title.match(/\[(\w+) (20\d{2})\]/);
  const month = m
    ? `${m[2]}-${String(months.indexOf(m[1].toLowerCase()) + 1).padStart(2, "0")}`
    : "";
  const plain = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ");
  const n = plain.match(/\bVisits\s+([\d,.]+)\s*([KMB])\b/i);
  const worldwide =
    /"spatialCoverage"\s*:\s*\{[^}]*"name"\s*:\s*"Worldwide"/i.test(html);
  if (
    !title.toLowerCase().startsWith(domain.toLowerCase() + " ") ||
    !m ||
    !n ||
    !worldwide ||
    !plain.includes("All Devices")
  )
    throw new Error(
      "Public page lacks a matching domain, explicit month, Visits, worldwide or all-device scope.",
    );
  if (month.slice(5) === "00" || month >= new Date().toISOString().slice(0, 7))
    throw new Error("No completed published statistical month.");
  const f = parseTraffic(
    `${domain}\nAITDK\n${month}\nMonthly visits ${n[1]}${n[2]}\nWorldwide All devices`,
  );
  if (f.value === null) throw new Error("No numeric visits.");
  const decimal = n[1].split(".")[1]?.length ?? 0;
  const multiplier = ({ K: 1e3, M: 1e6, B: 1e9 } as Record<string, number>)[
    n[2].toUpperCase()
  ];
  return {
    ...f,
    source: PUBLIC_SOURCE,
    raw_display: n[1] + n[2].toUpperCase(),
    precision_step: multiplier / 10 ** decimal,
  };
}
export function screenshotMatches(extracted: any, observed: any) {
  if (
    !extracted ||
    ["domain", "source", "month", "metric", "scope"].some(
      (k) => extracted[k] !== observed[k],
    ) ||
    extracted.value == null
  )
    return false;
  const unit = extracted.unit?.toUpperCase();
  const step = observed.precision_step ?? 1;
  return (
    Math.abs(extracted.value - observed.value) <= step / 2 &&
    (!unit || ["VISITS", "K", "M", "B", "万", "亿"].includes(unit))
  );
}
export async function queueVerification(
  db: any,
  {
    domain,
    source = PUBLIC_SOURCE,
    month,
    evidence_id = null,
    source_evidence_id = null,
    priority = 0,
  }: {
    domain: string;
    source?: string;
    month: string;
    evidence_id?: string | null;
    source_evidence_id?: string | null;
    priority?: number;
  },
) {
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month))
    throw new Error("Explicit valid statistical month required.");
  const existing = check<any>(
    await db
      .from("charts_verification_tasks")
      .select("*")
      .eq("domain", domain)
      .eq("source", source)
      .eq("month", month)
      .eq("scope", SCOPE)
      .eq("demo", false)
      .maybeSingle(),
  );
  if (existing) {
    if (evidence_id || source_evidence_id)
      check(
        await db
          .from("charts_verification_tasks")
          .update({
            evidence_id,
            source_evidence_id,
            priority,
            state: "pending",
            next_check_at: new Date().toISOString(),
          })
          .eq("id", existing.id),
      );
    return existing;
  }
  return check<any>(
    await db
      .from("charts_verification_tasks")
      .insert({
        domain,
        source,
        month,
        scope: SCOPE,
        evidence_id,
        source_evidence_id,
        priority,
      })
      .select()
      .single(),
  );
}
async function confirmReleasedMonth(
  db: any,
  source: string,
  month: string,
  url: string,
) {
  check(
    await db.from("charts_source_months").upsert(
      {
        source,
        month,
        demo: false,
        published_at: new Date().toISOString(),
        accepted: true,
        reference: url,
      },
      { onConflict: "source,month,demo", ignoreDuplicates: true },
    ),
  );
  const accepted = check<any[]>(
    await db
      .from("charts_source_months")
      .select("month")
      .eq("source", source)
      .eq("demo", false)
      .eq("accepted", true)
      .order("month", { ascending: false }),
  );
  if (accepted.length > 3)
    check(
      await db
        .from("charts_source_months")
        .update({ accepted: false })
        .eq("source", source)
        .eq("demo", false)
        .in(
          "month",
          accepted.slice(3).map((m) => m.month),
        ),
    );
}
async function configuredDomains(db: any, cfg: any): Promise<string[]> {
  if (cfg.mode !== "library") return cfg.domains ?? [];
  return Array.from(
    new Set(
      check<any[]>(
        await db
          .from("charts_projects")
          .select("measurement_domain")
          .eq("publication", "published")
          .eq("demo", false),
      ).map((p) => p.measurement_domain),
    ),
  );
}
export async function scheduleVerification(db: any) {
  const cfg = check<any>(
    await db
      .from("charts_settings")
      .select("value")
      .eq("key", "verification")
      .single(),
  ).value;
  if (!cfg.enabled) return;
  const released = check<any[]>(
    await db
      .from("charts_source_months")
      .select("*")
      .eq("source", cfg.source)
      .eq("demo", false)
      .eq("accepted", true),
  );
  for (const domain of await configuredDomains(db, cfg))
    for (const m of released)
      await queueVerification(db, {
        domain,
        source: cfg.source,
        month: m.month,
      });
}
export async function verificationTick(db: any) {
  const cfg = check<any>(
    await db
      .from("charts_settings")
      .select("value")
      .eq("key", "verification")
      .single(),
  ).value;
  if (!cfg.enabled) return;
  const allowedDomains = await configuredDomains(db, cfg);
  const usage = check<any[]>(
    await db
      .from("charts_verification_receipts")
      .select("actual_calls,cost_usd")
      .gte("attempted_at", new Date().toISOString().slice(0, 10)),
  );
  let calls = usage.reduce((n, r) => n + r.actual_calls, 0);
  const cost = usage.reduce((n, r) => n + Number(r.cost_usd), 0);
  const start = Date.now();
  for (
    let batch = 0;
    batch < 5 && Date.now() - start < cfg.max_runtime_ms;
    batch++
  ) {
    const task = check<any[]>(await db.rpc("charts_claim_verification"))[0];
    if (!task) return;
    const url = `https://www.semrush.com/website/${encodeURIComponent(task.domain)}/overview/`;
    let callCount = 0;
    try {
      if (
        task.demo ||
        task.source !== PUBLIC_SOURCE ||
        !allowedDomains.includes(task.domain)
      )
        throw new Error(
          "Source or domain is not enabled for automated access; manual review required.",
        );
      const cached = task.force_refresh
        ? null
        : check<any[]>(
            await db
              .from("charts_verification_receipts")
              .select("response_body,success_at,attempted_at")
              .eq("source_url", url)
              .eq("outcome", "matched")
              .gte("success_at", new Date(Date.now() - 86400000).toISOString())
              .not("response_body", "is", null)
              .order("attempted_at", { ascending: false })
              .limit(1),
          )[0];
      if (
        !cached &&
        (calls >= cfg.max_requests_daily || cost >= cfg.budget_usd_daily)
      ) {
        check(
          await db
            .from("charts_verification_tasks")
            .update({
              state: "deferred",
              locked_at: null,
              next_check_at: new Date(Date.now() + 86400000).toISOString(),
              error: "Daily request or spending budget reached.",
              attempts: Math.max(0, task.attempts - 1),
            })
            .eq("id", task.id),
        );
        return;
      }
      let html = cached?.response_body;
      if (!html) {
        callCount = 1;
        check(
          await db
            .from("charts_verification_tasks")
            .update({ last_attempt_at: new Date().toISOString() })
            .eq("id", task.id),
        );
        calls++;
        const fetched = await readPublicSource(task.domain);
        if (new URL(fetched.url).hostname !== "www.semrush.com")
          throw new Error("Source redirected outside the approved provider.");
        html = fetched.html;
      }
      const fields = parsePublicTraffic(html, task.domain);
      if (fields.month !== task.month) {
        await confirmReleasedMonth(db, task.source, fields.month, url);
        await queueVerification(db, {
          domain: task.domain,
          source: task.source,
          month: fields.month,
          priority: 1,
        });
        throw new Error(
          `Source currently reports ${fields.month}; requested ${task.month}. Months were not mixed.`,
        );
      }
      await confirmReleasedMonth(db, task.source, fields.month, url);
      let screenshot: any = null;
      if (task.source_evidence_id) {
        screenshot = check<any>(
          await db
            .from("charts_source_evidence")
            .select("*")
            .eq("id", task.source_evidence_id)
            .single(),
        );
        if (screenshot.state === "pending_extraction")
          throw new Error("Screenshot extraction is not finished.");
        if (!screenshotMatches(screenshot.extracted, fields))
          throw new Error(
            "Screenshot and actual source differ in domain, month, metric, scope or displayed precision; review required.",
          );
      }
      const now = cached?.success_at ?? new Date().toISOString();
      const receipt = check<any>(
        await db
          .from("charts_verification_receipts")
          .insert({
            task_id: task.id,
            source_url: url,
            response_hash: createHash("sha256").update(html).digest("hex"),
            response_body: html,
            extracted: fields,
            outcome: "matched",
            detail: screenshot
              ? "Original screenshot matched an actual public source read, including period, metric and scope."
              : `Public provider page read; explicit completed month and worldwide/all-device/domain scope confirmed.${cached ? " Reused captured response; no new network request." : ""}`,
            actual_calls: callCount,
            success_at: now,
          })
          .select()
          .single(),
      );
      const result = check<any>(
        await db.rpc("charts_record_observation", {
          fields,
          receipt: receipt.id,
        }),
      );
      if (result.state === "conflict")
        check(
          await db
            .from("charts_verification_receipts")
            .update({
              outcome: "conflict",
              detail:
                receipt.detail +
                " Published value differs; explicit correction review required.",
            })
            .eq("id", receipt.id),
        );
      check(
        await db
          .from("charts_verification_tasks")
          .update({
            state: result.state === "conflict" ? "needs_review" : "verified",
            force_refresh: false,
            locked_at: null,
            last_success_at:
              result.state === "conflict" ? task.last_success_at : now,
            next_check_at: new Date(Date.now() + 7 * 86400000).toISOString(),
            actual_calls: task.actual_calls + callCount,
            error:
              result.state === "conflict"
                ? "Source revision conflicts with published data; explicit correction review required."
                : null,
          })
          .eq("id", task.id),
      );
      if (screenshot)
        check(
          await db
            .from("charts_source_evidence")
            .update({
              state: result.state === "conflict" ? "conflict" : "verified",
            })
            .eq("id", screenshot.id),
        );
      const projects = check<any[]>(
        await db
          .from("charts_projects")
          .select("id")
          .eq("measurement_domain", task.domain)
          .eq("demo", false),
      );
      const memberships = projects.length
        ? check<any[]>(
            await db
              .from("charts_memberships")
              .select("category")
              .in(
                "project_id",
                projects.map((p) => p.id),
              )
              .eq("state", "confirmed"),
          )
        : [];
      for (const category of new Set<string>(
        memberships.map((m) => m.category),
      ))
        await publishCategory(
          db,
          category,
          task.month,
          false,
          result.state === "conflict"
            ? "Unresolved source revision: affected value suspended."
            : "Source verification completed; data or category coverage updated.",
          task.source,
        );
    } catch (e) {
      const message = (e as Error).message;
      check(
        await db.from("charts_verification_receipts").insert({
          task_id: task.id,
          source_url: url,
          outcome: "needs_review",
          detail: message.slice(0, 1000),
          actual_calls: callCount,
        }),
      );
      const final =
        task.attempts >= cfg.max_retries ||
        /differ|scope|not enabled/.test(message);
      check(
        await db
          .from("charts_verification_tasks")
          .update({
            state: final ? "needs_review" : "deferred",
            locked_at: null,
            next_check_at: new Date(Date.now() + 86400000).toISOString(),
            actual_calls: task.actual_calls + callCount,
            error: message.slice(0, 1000),
            force_refresh: false,
          })
          .eq("id", task.id),
      );
    }
  }
}
