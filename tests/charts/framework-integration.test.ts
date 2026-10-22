import test from "node:test";
import assert from "node:assert/strict";
import { request } from "@playwright/test";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "../../scripts/local/env.mjs";
loadEnv();
const baseURL = process.env.CHARTS_TEST_BASE_URL || "http://127.0.0.1:3100";
const accounts = JSON.parse(await fs.readFile(process.env.CHARTS_TEST_ACCOUNTS_FILE || ".local/accounts.json", "utf8"));
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
async function client(role?: string) {
  const c = await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      Origin: baseURL,
      "User-Agent": "123ChartsIntegrationTest",
    },
  });
  if (role)
    assert.equal(
      (
        await c.post("/api/charts/auth", {
          data: {
            action: "signin",
            email: accounts[role].email,
            password: accounts[role].password,
          },
        })
      ).status(),
      200,
    );
  return c;
}
test(
  "framework: review-first, independent directional relations, live revision, cache invalidation and full withdrawal",
  { timeout: 90000 },
  async () => {
    const founder = await client("founder"),
      admin = await client("admin"),
      guest = await client(),
      other = await client("other");
    const appIds: string[] = [],
      ids: string[] = [],
      domains: string[] = [];
    try {
      const suffix = randomUUID().slice(0, 8);
      const draft = {
        name: "Framework " + suffix,
        website_url: `https://framework-${suffix}.example`,
        domain: `framework-${suffix}.example`,
        slug: "framework-" + suffix,
        category: "knowledge-search",
        price_type: "freemium",
        description_en:
          "A fictional framework acceptance product for document search.",
        description_zh: "用于架构验收的虚构文档检索项目。",
        task: "Find team documents",
        supported_languages: ["English"],
        differentiator: "Search documents with a self-managed workspace.",
        conditions:
          "DEMO: a sustained fictional free allowance with paid hosting options.",
        is_open_source: false,
        peers: Array.from({ length: 3 }, (_, i) => ({
          name: "Reference " + i,
          domain: `ref-${i}-${suffix}.example`,
          task: "Find team documents",
          rationale:
            "A candidate way to search documents; task relation requires review.",
        })),
      };
      domains.push(draft.domain, ...draft.peers.map((p) => p.domain));
      let r = await founder.post("/api/v1/submissions", {
        data: { action: "draft", draft, demo: true },
      });
      assert.equal(r.status(), 200, await r.text());
      const a = await r.json();
      appIds.push(a.id);
      assert.equal(
        (
          await founder.post("/api/v1/submissions", {
            data: { action: "submit", id: a.id },
          })
        ).status(),
        200,
      );
      assert.equal(
        ck(
          await db
            .from("charts_projects")
            .select("id")
            .eq("domain", draft.domain),
        ).length,
        0,
        "submission is a private preview, not public publication",
      );
      assert.equal(
        (
          await other.post(`/api/v1/reviews/${a.id}/decision`, {
            data: { action: "approve", reference: "Not authorized." },
          })
        ).status(),
        403,
      );
      r = await admin.post(`/api/v1/reviews/${a.id}/decision`, {
        data: {
          action: "approve",
          reference:
            "DEMO: base profile reviewed, relationships continue separately.",
          pricing_confirmed: true,
        },
      });
      assert.equal(r.status(), 200, await r.text());
      const pid = (await r.json()).project_id;
      ids.push(pid);
      const first = ck(
        await db.from("charts_projects").select("*").eq("id", pid).single(),
      );
      assert.equal(first.first_indexed_at, first.first_published_at);
      assert.equal(first.publication, "published");
      assert.equal(
        ck(
          await db
            .from("charts_contributions")
            .select("id")
            .eq("project_id", pid),
        ).length,
        0,
        "pending relations grant no adopted contribution",
      );
      assert.equal(
        ck(
          await db
            .from("charts_relations")
            .select("id")
            .eq("application_id", a.id)
            .eq("status", "pending"),
        ).length,
        3,
        "pending relations did not block profile publication",
      );
      const pub = await (
        await guest.get("/api/charts/bootstrap?dataset=demo&zone=public")
      ).json();
      assert.ok(pub.projects.some((p: any) => p.id === pid));
      assert.equal(pub.applications.length, 0);
      assert.equal(pub.events.length, 0);
      assert.equal(
        (
          await founder.post("/api/charts/follow", {
            data: { kind: "bookmark", target: pid },
          })
        ).status(),
        200,
      );
      const personalPublic = await (
        await founder.get("/api/charts/bootstrap?dataset=demo&zone=public")
      ).json();
      assert.ok(
        personalPublic.follows.some(
          (f: any) => f.kind === "bookmark" && f.target === pid,
        ),
        "public page retains the current user's bookmark state",
      );
      assert.equal(
        personalPublic.events.length,
        0,
        "unclaimed applicant cannot see private metrics",
      );
      assert.equal(
        (
          await guest.get(
            `/api/charts/card/${pid}?dataset=demo&kind=alternative`,
          )
        ).status(),
        409,
        "unreviewed nomination cannot produce alternative card",
      );
      const rel = ck(
        await db
          .from("charts_relations")
          .select("*")
          .eq("application_id", a.id)
          .limit(1),
      )[0];
      r = await admin.post("/api/charts/admin/relation", {
        data: {
          id: rel.id,
          state: "approved",
          feedback:
            "DEMO: independently confirmed common document retrieval task.",
        },
      });
      assert.equal(r.status(), 200, await r.text());
      const target = ck(
        await db
          .from("charts_projects")
          .select("*")
          .eq("domain", rel.peer_domain)
          .single(),
      );
      ids.push(target.id);
      assert.equal(target.review_state, "reference");
      assert.equal(
        (
          await guest.get("/en/alternatives/" + target.slug + "?dataset=demo")
        ).status(),
        200,
      );
      const edges = ck(
        await db
          .from("competitor_relations")
          .select("anchor_id,candidate_id,use_case")
          .eq("candidate_id", pid),
      );
      assert.equal(edges.length, 1);
      assert.equal(edges[0].anchor_id, target.id);
      assert.equal(edges[0].use_case, draft.task);
      assert.equal(
        ck(
          await db
            .from("competitor_relations")
            .select("id")
            .eq("anchor_id", pid),
        ).length,
        0,
        "no automatic reverse relation",
      );
      const claim = await founder.post("/api/charts/claim", {
        data: {
          project_id: pid,
          message:
            "DEMO: management identity proof for isolated acceptance only.",
        },
      });
      const cid = (await claim.json()).id;
      assert.equal(
        (
          await admin.post("/api/charts/admin/claim", {
            data: {
              id: cid,
              state: "approved",
              feedback: "DEMO: identity evidence reviewed independently.",
            },
          })
        ).status(),
        200,
      );
      const changed = {
        ...draft,
        peers: [],
        differentiator:
          "New reviewed focus propagated across all public surfaces.",
      };
      r = await founder.post("/api/v1/submissions", {
        data: { action: "draft", draft: changed, demo: true, project_id: pid },
      });
      assert.equal(r.status(), 200, await r.text());
      const revision = await r.json();
      appIds.push(revision.id);
      await founder.post("/api/v1/submissions", {
        data: { action: "submit", id: revision.id },
      });
      const pending = await (
        await guest.get("/api/charts/bootstrap?dataset=demo&zone=public")
      ).json();
      assert.equal(
        pending.projects.find((p: any) => p.id === pid).differentiator,
        first.differentiator,
        "pending edit kept old public content",
      );
      r = await admin.post(`/api/v1/reviews/${revision.id}/decision`, {
        data: {
          action: "approve",
          reference: "DEMO: revised public description checked.",
          pricing_confirmed: true,
        },
      });
      assert.equal(r.status(), 200, await r.text());
      assert.equal(
        ck(
          await db
            .from("charts_projects")
            .select("differentiator")
            .eq("id", pid)
            .single(),
        ).differentiator,
        changed.differentiator,
        "approved revision persisted in database",
      );
      const after = await (
        await guest.get("/api/charts/bootstrap?dataset=demo&zone=public")
      ).json();
      const current = after.projects.find((p: any) => p.id === pid);
      assert.equal(
        current.differentiator,
        changed.differentiator,
        "tag invalidation returned the new data immediately",
      );
      assert.equal(current.first_indexed_at, first.first_indexed_at);
      const sessionId = randomUUID();
      const impression = {
        project_id: pid,
        session_id: sessionId,
        surface: "/categories/knowledge-search",
        automated: true,
      };
      for (let i = 0; i < 2; i++)
        assert.equal(
          (
            await guest.post("/api/v1/events/impression", { data: impression })
          ).status(),
          200,
        );
      assert.equal(
        ck(
          await db
            .from("charts_events")
            .select("id")
            .eq("project_id", pid)
            .eq("kind", "impression")
            .eq("session_id", sessionId),
        ).length,
        1,
        "impressions dedupe per session, product, surface",
      );
      assert.equal(
        (
          await guest.post("/api/v1/events/impression", {
            data: { ...impression, surface: "/products/test" },
          })
        ).status(),
        200,
      );
      assert.equal(
        ck(
          await db
            .from("charts_events")
            .select("id")
            .eq("project_id", pid)
            .eq("kind", "impression")
            .eq("session_id", sessionId),
        ).length,
        2,
        "different surfaces remain distinct",
      );
      const eventId = randomUUID();
      const payload = {
        product_id: pid,
        event_id: eventId,
        surface: "/categories/knowledge-search",
        automated: true,
      };
      for (let i = 0; i < 2; i++)
        assert.equal(
          (
            await guest.post("/api/v1/events/outbound", { data: payload })
          ).status(),
          200,
        );
      assert.equal(
        ck(
          await db.from("outbound_clicks").select("id").eq("event_id", eventId),
        ).length,
        1,
        "retry did not duplicate click",
      );
      const cursor = ck(
        await db
          .from("charts_projects")
          .select("id,website_url")
          .eq("domain", "cursor.com")
          .single(),
      );
      const count = ck(
        await db
          .from("charts_events")
          .select("id")
          .eq("project_id", cursor.id)
          .eq("kind", "outbound"),
      ).length;
      const jump = await guest.get(
        `/api/v1/events/outbound?product_id=${cursor.id}&url=https://attacker.example`,
        { maxRedirects: 0 },
      );
      assert.equal(jump.status(), 302);
      assert.equal(jump.headers().location, new URL(cursor.website_url).href);
      assert.equal(
        ck(
          await db
            .from("charts_events")
            .select("id")
            .eq("project_id", cursor.id)
            .eq("kind", "outbound"),
        ).length,
        count,
        "GET and prefetch do not count as active clicks",
      );
      r = await admin.post("/api/charts/admin/project", {
        data: {
          id: pid,
          project: current,
          publication: "archived",
          reference: "DEMO: hide this fixture consistently.",
          price_verified: true,
        },
      });
      assert.equal(r.status(), 200, await r.text());
      const hidden = await (
        await guest.get("/api/charts/bootstrap?dataset=demo&zone=public")
      ).json();
      assert.ok(!hidden.projects.some((p: any) => p.id === pid));
      assert.ok(!hidden.relations.some((e: any) => e.project_id === pid));
      assert.equal(
        (
          await guest.get("/en/products/" + first.slug + "?dataset=demo")
        ).status(),
        404,
      );
      assert.equal(
        (await guest.get("/api/charts/card/" + pid + "?dataset=demo")).status(),
        404,
      );
      assert.equal(
        (await guest.get("/api/v1/outbound?product_id=" + pid)).status(),
        404,
      );
      r = await founder.post("/api/v1/submissions", {
        data: {
          action: "draft",
          draft: {
            ...changed,
            differentiator: "Another reviewed edit while hidden.",
          },
          demo: true,
          project_id: pid,
        },
      });
      const hiddenRevision = await r.json();
      appIds.push(hiddenRevision.id);
      await founder.post("/api/v1/submissions", {
        data: { action: "submit", id: hiddenRevision.id },
      });
      r = await admin.post(`/api/v1/reviews/${hiddenRevision.id}/decision`, {
        data: {
          action: "approve",
          reference: "DEMO: approve edit without restoring visibility.",
          pricing_confirmed: true,
        },
      });
      assert.equal(r.status(), 200, await r.text());
      const stillHidden = ck(
        await db.from("charts_projects").select("*").eq("id", pid).single(),
      );
      assert.equal(stillHidden.publication, "archived");
      assert.equal(stillHidden.first_published_at, first.first_published_at);
      assert.equal((await guest.post("/api/v1/cache/flush")).status(), 403);
    } finally {
      if (appIds.length) {
        await db
          .from("charts_notifications")
          .delete()
          .in(
            "dedupe_key",
            appIds.map((id) => "approved:" + id),
          );
        for (const table of ["charts_reports", "charts_relations"])
          await db.from(table).delete().in("application_id", appIds);
        await db.from("charts_applications").delete().in("id", appIds);
      }
      const extra = domains.length
        ? ck(
            await db.from("charts_projects").select("id").in("domain", domains),
          )
        : [];
      const all = [...new Set([...ids, ...extra.map((p: any) => p.id)])];
      if (all.length)
        await db.from("charts_follows").delete().in("target", all);
      if (all.length) {
        for (const table of [
          "charts_claims",
          "charts_contributions",
          "charts_events",
          "charts_memberships",
        ])
          await db.from(table).delete().in("project_id", all);
        await db.from("charts_projects").delete().in("id", all);
      }
      await Promise.all([
        founder.dispose(),
        admin.dispose(),
        guest.dispose(),
        other.dispose(),
      ]);
    }
  },
);
