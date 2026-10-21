import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { loadEnv } from "../../../scripts/local/env.mjs";
import {
  verificationTick,
  queueVerification,
} from "../../../lib/charts/verification";
import { publishCategory, check } from "../../../lib/charts/publishing";
loadEnv();
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    realtime: { transport: WebSocket as any },
    auth: { persistSession: false },
  },
);
test(
  "real source receipt, cached recheck, mismatched month and budget preserve publication truth",
  { timeout: 60000 },
  async () => {
    const cfg = check<any>(
      await db
        .from("charts_settings")
        .select("value")
        .eq("key", "verification")
        .single(),
    ).value;
    const before = check<any>(
      await db
        .from("charts_verification_tasks")
        .select("*")
        .eq("domain", "cursor.com")
        .eq("source", "Semrush public")
        .eq("month", "2026-09")
        .single(),
    );
    assert.equal(
      before.state,
      "verified",
      "Run the actual source sample first",
    );
    assert.ok(before.source_evidence_id);
    const evidence = check<any>(
      await db
        .from("charts_source_evidence")
        .select("*")
        .eq("id", before.source_evidence_id)
        .single(),
    );
    assert.equal(evidence.state, "verified");
    assert.equal(evidence.extracted.value, 35490000);
    assert.ok(evidence.raw_text);
    const receipt = check<any[]>(
      await db
        .from("charts_verification_receipts")
        .select("*")
        .eq("task_id", before.id)
        .eq("outcome", "matched")
        .not("response_body", "is", null)
        .order("attempted_at", { ascending: false }),
    )[0];
    assert.ok(receipt.response_hash);
    assert.ok(receipt.response_body.includes("<title>"));
    assert.equal(receipt.extracted.month, "2026-09");
    const baseline = await publishCategory(
      db,
      "ai-coding",
      "2026-09",
      false,
      "Category scope review: unchanged real sample.",
      "Semrush public",
    );
    const tempDomain = `budget-${randomUUID().slice(0, 8)}.example`;
    let wrong: any, budget: any;
    try {
      check(
        await db
          .from("charts_verification_tasks")
          .update({ state: "pending", next_check_at: new Date().toISOString() })
          .eq("id", before.id),
      );
      await verificationTick(db);
      const after = check<any>(
        await db
          .from("charts_verification_tasks")
          .select("*")
          .eq("id", before.id)
          .single(),
      );
      assert.equal(
        after.last_success_at,
        before.last_success_at,
        "cached read must not invent a fresh successful source retrieval",
      );
      assert.equal(
        after.last_attempt_at,
        before.last_attempt_at,
        "cache reuse is not a new network request",
      );
      assert.equal(after.actual_calls, before.actual_calls);
      const unchanged = await publishCategory(
        db,
        "ai-coding",
        "2026-09",
        false,
        "Repeated unchanged verification.",
        "Semrush public",
      );
      assert.equal(
        unchanged.id,
        baseline.id,
        "no content-identical new snapshot",
      );
      wrong = await queueVerification(db, {
        domain: "cursor.com",
        month: "2000-01",
        priority: 20,
      });
      await verificationTick(db);
      const mismatch = check<any>(
        await db
          .from("charts_verification_tasks")
          .select("*")
          .eq("id", wrong.id)
          .single(),
      );
      assert.equal(mismatch.last_success_at, null);
      assert.match(mismatch.error, /Months were not mixed/);
      assert.equal(
        check<any[]>(
          await db
            .from("charts_traffic")
            .select("id")
            .eq("source", "Semrush public")
            .eq("month", "2000-01"),
        ).length,
        0,
      );
      check(
        await db
          .from("charts_settings")
          .update({
            value: {
              ...cfg,
              enabled: true,
              max_requests_daily: 0,
              domains: [...cfg.domains, tempDomain],
            },
          })
          .eq("key", "verification"),
      );
      budget = await queueVerification(db, {
        domain: tempDomain,
        month: "2026-09",
        priority: 30,
      });
      await verificationTick(db);
      const deferred = check<any>(
        await db
          .from("charts_verification_tasks")
          .select("*")
          .eq("id", budget.id)
          .single(),
      );
      assert.equal(deferred.state, "deferred");
      assert.equal(deferred.last_attempt_at, null);
      assert.equal(deferred.last_success_at, null);
      assert.equal(deferred.actual_calls, 0);
      const bad = await db.rpc("charts_record_observation", {
        fields: {
          domain: "cursor.com",
          source: "Semrush public",
          month: "2026-08",
          scope: "worldwide-all-devices-domain",
          metric: "visits",
          value: 123,
        },
        receipt: receipt.id,
      });
      assert.ok(bad.error, "one month receipt cannot authorize another month");
      const invented = await db.rpc("charts_record_observation", {
        fields: { ...receipt.extracted, value: 123 },
        receipt: receipt.id,
      });
      assert.ok(
        invented.error,
        "a source receipt cannot authorize an invented value",
      );
    } finally {
      check(
        await db
          .from("charts_settings")
          .update({ value: cfg })
          .eq("key", "verification"),
      );
      for (const task of [wrong, budget])
        if (task)
          check(
            await db
              .from("charts_verification_tasks")
              .delete()
              .eq("id", task.id),
          );
    }
  },
);

test("publication cannot silently approve an existing pending classification", async () => {
  const suffix = randomUUID().slice(0, 8);
  const p = check<any>(
    await db
      .from("charts_projects")
      .insert({
        slug: `classification-${suffix}`,
        name: "Classification fixture",
        domain: `classification-${suffix}.example`,
        website_url: `https://classification-${suffix}.example`,
        measurement_domain: `classification-${suffix}.example`,
        category: "ai-coding",
        publication: "draft",
        demo: true,
      })
      .select()
      .single(),
  );
  try {
    assert.equal(
      check<any>(
        await db
          .from("charts_memberships")
          .select("state")
          .eq("project_id", p.id)
          .single(),
      ).state,
      "pending",
    );
    check(
      await db
        .from("charts_projects")
        .update({ publication: "published" })
        .eq("id", p.id),
    );
    assert.equal(
      check<any>(
        await db
          .from("charts_memberships")
          .select("state")
          .eq("project_id", p.id)
          .single(),
      ).state,
      "pending",
    );
  } finally {
    check(await db.from("charts_projects").delete().eq("id", p.id));
  }
});
