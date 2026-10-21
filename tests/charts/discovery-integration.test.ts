import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { request } from "@playwright/test";
import { loadEnv } from "../../scripts/local/env.mjs";
loadEnv();
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    realtime: { transport: WebSocket as any },
    auth: { persistSession: false },
  },
);
const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: { transport: WebSocket as any },
    auth: { persistSession: false },
  },
);
const ck = (r: any) => {
  if (r.error) throw Error(r.error.message);
  return r.data;
};
const accounts = JSON.parse(await fs.readFile(".local/accounts.json", "utf8"));
const baseURL = "http://127.0.0.1:3100";
async function login(role?: string) {
  const c = await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      Origin: baseURL,
      "User-Agent": "123ChartsIntegrationTest",
    },
  });
  if (role) {
    const r = await c.post("/api/charts/auth", {
      data: {
        action: "signin",
        email: accounts[role].email,
        password: accounts[role].password,
      },
    });
    assert.equal(r.status(), 200, await r.text());
  }
  return c;
}
test(
  "discovery workflow: no images, review supplements, private data, canonical updates and first listing history",
  { timeout: 120000 },
  async () => {
    const founder = await login("founder"),
      admin = await login("admin"),
      other = await login("other"),
      guest = await login();
    const apps: string[] = [],
      projects: string[] = [],
      follows: { target: string; kind: string }[] = [];
    try {
      const suffix = randomUUID().slice(0, 8);
      const peers = ck(
        await db
          .from("charts_projects")
          .select("*")
          .eq("demo", true)
          .in("slug", ["discovery-1", "discovery-2", "discovery-3"]),
      ).map((p: any) => ({
        name: p.name,
        domain: p.domain,
        task: "Find team documents",
        rationale:
          "Compare document retrieval with different hosting and usage conditions.",
      }));
      const draft = {
        name: "Discovery test " + suffix,
        slug: "discovery-test-" + suffix,
        website_url: "https://discovery-test-" + suffix + ".example",
        domain: "discovery-test-" + suffix + ".example",
        category: "knowledge-search",
        price_type: "free",
        description_en:
          "A fictional document retrieval project used for testing.",
        description_zh: "用于测试的虚构文档检索项目。",
        task: "Find team documents",
        supported_languages: ["English", "中文"],
        differentiator: "Self-managed search for a small team.",
        conditions: "Fictional free allowance, API and hosting costs separate.",
        is_open_source: false,
        peers,
      };
      assert.equal(
        (
          await guest.post("/api/charts/draft", { data: { draft, demo: true } })
        ).status(),
        401,
      );
      assert.equal(
        (
          await founder.post("/api/charts/draft", {
            headers: { Origin: "https://attacker.example" },
            data: { draft, demo: true },
          })
        ).status(),
        403,
      );
      let r = await founder.post("/api/charts/draft", {
        data: {
          draft: {
            ...draft,
            peers: [
              peers[0],
              { ...peers[0], domain: "www." + peers[0].domain },
            ],
          },
          demo: true,
        },
      });
      assert.equal(r.status(), 400);
      r = await founder.post("/api/charts/draft", {
        data: { draft, demo: true },
      });
      assert.equal(r.status(), 200, await r.text());
      const app = await r.json();
      apps.push(app.id);
      assert.equal(
        (
          await other.post("/api/charts/submit", { data: { id: app.id } })
        ).status(),
        404,
      );
      assert.equal(
        (
          await founder.post("/api/charts/submit", { data: { id: app.id } })
        ).status(),
        200,
        "no screenshots required",
      );
      r = await admin.post("/api/charts/admin/application", {
        data: {
          id: app.id,
          action: "approve",
          reference: "Local fictional test review.",
        },
      });
      assert.equal(r.status(), 400, "relationships require review");
      assert.equal(
        (
          await admin.post("/api/charts/admin/application", {
            data: {
              id: app.id,
              action: "needs_info",
              feedback: "Explain how the same document search task is shared.",
            },
          })
        ).status(),
        200,
      );
      assert.equal(
        (
          await founder.post("/api/charts/draft", {
            data: { id: app.id, draft, demo: true },
          })
        ).status(),
        200,
      );
      assert.equal(
        (
          await founder.post("/api/charts/submit", { data: { id: app.id } })
        ).status(),
        200,
      );
      for (const rel of ck(
        await db
          .from("charts_relations")
          .select("*")
          .eq("application_id", app.id),
      ))
        assert.equal(
          (
            await admin.post("/api/charts/admin/relation", {
              data: {
                id: rel.id,
                state: "approved",
                feedback: "Same search task confirmed.",
              },
            })
          ).status(),
          200,
        );
      const before = await guest.get("/api/charts/bootstrap?dataset=demo");
      assert.ok(
        !(await before.json()).relations.some(
          (x: any) => x.application_id === app.id,
        ),
        "unapproved application relations stay private",
      );
      r = await admin.post("/api/charts/admin/application", {
        data: {
          id: app.id,
          action: "approve",
          reference: "DEMO: confirmed shared task, no external data used.",
          pricing_confirmed: false,
        },
      });
      assert.equal(r.status(), 200, await r.text());
      const pid = (await r.json()).project_id;
      projects.push(pid);
      const p = ck(
        await db.from("charts_projects").select("*").eq("id", pid).single(),
      );
      assert.equal(
        p.price_verified,
        false,
        "submission does not certify pricing",
      );
      const stamp = p.first_published_at;
      assert.ok(stamp);
      assert.equal(p.first_publication_inferred, false);
      assert.equal(
        ck(
          await db
            .from("charts_evidence")
            .select("id")
            .eq("application_id", app.id),
        ).length,
        0,
      );
      const again = await admin.post("/api/charts/admin/application", {
        data: {
          id: app.id,
          action: "approve",
          reference: "Repeat click test.",
        },
      });
      assert.equal((await again.json()).project_id, pid);
      const reports = ck(
        await db
          .from("charts_reports")
          .select("*")
          .eq("application_id", app.id),
      );
      assert.equal(reports.length, 1);
      const report = reports[0];
      assert.equal(report.peers.length, 3);
      assert.ok(report.peers.every((p: any) => p.traffic === null));
      assert.equal(
        (await founder.get("/api/charts/bootstrap?dataset=demo")).status(),
        200,
      );
      const unrelated = await other.get("/api/charts/bootstrap?dataset=demo");
      assert.ok(
        !(await unrelated.json()).reports.some((x: any) => x.id === report.id),
      );
      const noRls = await anon
        .from("charts_reports")
        .select("id")
        .eq("id", report.id);
      assert.ok(noRls.error || !noRls.data?.length);
      assert.ok(
        (
          await anon.rpc("charts_approve_discovery", {
            aid: app.id,
            actor: accounts.admin.id,
            reference: "Fake authority",
            pricing_confirmed: true,
          })
        ).error,
      );
      assert.equal(
        (
          await other.post("/api/charts/share", {
            data: { id: report.id, enabled: true },
          })
        ).status(),
        404,
      );
      r = await founder.post("/api/charts/share", {
        data: { id: report.id, enabled: true },
      });
      const token = (await r.json()).share_token;
      assert.equal(
        (await guest.get("/api/charts/shared/" + token)).status(),
        200,
      );
      await founder.post("/api/charts/share", {
        data: { id: report.id, enabled: false },
      });
      assert.equal(
        (await guest.get("/api/charts/shared/" + token)).status(),
        404,
      );
      for (const kind of ["bookmark", "alternatives"]) {
        assert.equal(
          (
            await founder.post("/api/charts/follow", {
              data: { target: pid, kind },
            })
          ).status(),
          200,
        );
        follows.push({ target: pid, kind });
      }
      assert.equal(
        (
          await founder.post("/api/charts/draft", {
            data: {
              draft: { ...draft, peers: [] },
              demo: true,
              project_id: pid,
            },
          })
        ).status(),
        400,
        "contribution does not grant management",
      );
      r = await founder.post("/api/charts/claim", {
        data: {
          project_id: pid,
          message: "DEMO local ownership identity proof for test only.",
        },
      });
      const claim = await r.json();
      assert.equal(
        (
          await admin.post("/api/charts/admin/claim", {
            data: {
              id: claim.id,
              state: "approved",
              feedback: "DEMO ownership independently confirmed.",
            },
          })
        ).status(),
        200,
      );
      assert.equal(
        (
          await founder.post("/api/charts/draft", {
            data: {
              draft: {
                ...draft,
                website_url: "https://another-domain.example",
                peers: [],
              },
              demo: true,
              project_id: pid,
            },
          })
        ).status(),
        400,
        "updates cannot silently change a saved official domain",
      );
      const update = {
        ...draft,
        differentiator: "Updated focus shared across every page.",
        conditions: "New fictional sustained free allowance.",
      };
      r = await founder.post("/api/charts/draft", {
        data: { draft: { ...update, peers: [] }, demo: true, project_id: pid },
      });
      assert.equal(r.status(), 200, await r.text());
      const next = await r.json();
      apps.push(next.id);
      assert.equal(
        (
          await founder.post("/api/charts/submit", { data: { id: next.id } })
        ).status(),
        200,
      );
      r = await admin.post("/api/charts/admin/application", {
        data: {
          id: next.id,
          action: "approve",
          reference:
            "DEMO updated pricing and conditions independently reviewed.",
          pricing_confirmed: true,
        },
      });
      assert.equal(r.status(), 200, await r.text());
      const updated = ck(
        await db.from("charts_projects").select("*").eq("id", pid).single(),
      );
      assert.equal(updated.first_published_at, stamp);
      assert.equal(updated.differentiator, update.differentiator);
      assert.equal(updated.price_verified, true);
      const carried = ck(
        await db
          .from("charts_reports")
          .select("peers")
          .eq("application_id", next.id)
          .single(),
      );
      assert.equal(
        carried.peers.length,
        3,
        "later profile updates preserve the existing comparison group",
      );
      // Explicit group replacement soft-withdraws the public edge while preserving historical records.
      r = await founder.post("/api/charts/draft", {
        data: {
          draft: { ...update, peers: [], replace_peer_group: true },
          demo: true,
          project_id: pid,
        },
      });
      assert.equal(r.status(), 200, await r.text());
      const replacement = await r.json();
      apps.push(replacement.id);
      assert.equal(
        (
          await founder.post("/api/charts/submit", {
            data: { id: replacement.id },
          })
        ).status(),
        200,
      );
      r = await admin.post("/api/charts/admin/application", {
        data: {
          id: replacement.id,
          action: "approve",
          reference: "DEMO explicitly confirmed withdrawal of the old group.",
          pricing_confirmed: true,
        },
      });
      assert.equal(r.status(), 200, await r.text());
      const historical = ck(
        await db
          .from("charts_relations")
          .select("withdrawn_at")
          .eq("application_id", app.id),
      );
      assert.equal(historical.length, 3);
      assert.ok(historical.every((x: any) => x.withdrawn_at));
      const publicAfter = await (
        await guest.get("/api/charts/bootstrap?dataset=demo")
      ).json();
      assert.ok(!publicAfter.relations.some((x: any) => x.project_id === pid));
      r = await admin.post("/api/charts/admin/project", {
        data: {
          id: pid,
          project: updated,
          publication: "published",
          reference: "DEMO canonical profile editor review.",
          price_verified: true,
        },
      });
      assert.equal(r.status(), 200, await r.text());
      assert.equal(
        ck(
          await db
            .from("charts_projects")
            .select("first_published_at")
            .eq("id", pid)
            .single(),
        ).first_published_at,
        stamp,
      );

      assert.equal(
        (
          await guest.get(`/api/charts/card/${pid}?dataset=demo&kind=free`)
        ).status(),
        200,
      );
      assert.equal(
        (await guest.get(`/api/charts/card/${pid}?dataset=real`)).status(),
        404,
      );
      assert.equal((await guest.post("/api/charts/upload")).status(), 410);
      assert.equal(
        (
          await admin.post("/api/charts/admin/verification-settings", {
            data: { enabled: true },
          })
        ).status(),
        410,
      );
      const real = await (
        await guest.get("/api/charts/bootstrap?dataset=real")
      ).json();
      assert.ok(real.projects.every((p: any) => !p.demo));
      const demo = await (
        await guest.get("/api/charts/bootstrap?dataset=demo")
      ).json();
      assert.ok(demo.projects.every((p: any) => p.demo));
      assert.equal(real.verificationTasks.length, 0);
      assert.ok(!real.projects.some((p: any) => p.id === pid));
    } finally {
      for (const f of follows)
        await db
          .from("charts_follows")
          .delete()
          .eq("owner_id", accounts.founder.id)
          .eq("target", f.target)
          .eq("kind", f.kind);
      for (const table of ["charts_reports", "charts_relations"])
        if (apps.length)
          await db.from(table).delete().in("application_id", apps);
      if (apps.length)
        await db.from("charts_applications").delete().in("id", apps);
      for (const table of [
        "charts_claims",
        "charts_events",
        "charts_contributions",
        "charts_memberships",
      ])
        if (projects.length)
          await db.from(table).delete().in("project_id", projects);
      if (projects.length)
        await db.from("charts_projects").delete().in("id", projects);
      await Promise.all([
        founder.dispose(),
        admin.dispose(),
        other.dispose(),
        guest.dispose(),
      ]);
    }
  },
);
