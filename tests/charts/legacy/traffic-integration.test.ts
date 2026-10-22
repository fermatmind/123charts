import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import { request } from "@playwright/test";
import sharp from "sharp";
import { loadEnv } from "../../../scripts/local/env.mjs";
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
function ck(r: any) {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}
const baseURL = "http://127.0.0.1:3100";
const accounts = JSON.parse(await fs.readFile(".local/accounts.json", "utf8"));
const fresh = () =>
  request.newContext({
    baseURL,
    extraHTTPHeaders: {
      Origin: baseURL,
      "User-Agent": "123ChartsIntegrationTest",
    },
  });
async function login(role: string) {
  const client = await fresh();
  const r = await client.post("/api/charts/auth", {
    data: {
      action: "signin",
      email: accounts[role].email,
      password: accounts[role].password,
    },
  });
  assert.equal(r.status(), 200, await r.text());
  return client;
}
test(
  "full local workflow, RLS, conflicts, report sharing, updates and metrics",
  { timeout: 180000 },
  async () => {
    const founder = await login("founder"),
      admin = await login("admin"),
      other = await login("other"),
      guest = await fresh();
    const suffix = randomUUID().slice(0, 8),
      appIds: string[] = [],
      storagePaths: string[] = [],
      projectIds: string[] = [],
      trafficDomains: string[] = [];
    try {
      assert.equal(
        (await guest.post("/api/charts/draft", { data: {} })).status(),
        401,
      );
      assert.equal(
        (
          await founder.post("/api/charts/draft", {
            headers: { Origin: "https://attacker.example" },
            data: {},
          })
        ).status(),
        403,
      );
      const peerData = Array.from({ length: 10 }, (_, i) => ({
        domain: `peer${i}-${suffix}.example`,
        name: `Test peer ${i}`,
        task: "Document search",
        rationale:
          "Compare document retrieval approaches for the same user task.",
      }));
      const draft = {
        name: `Test project ${suffix}`,
        slug: `test-${suffix}`,
        website_url: `https://test-${suffix}.example`,
        domain: `test-${suffix}.example`,
        category: "knowledge-search",
        price_type: "free",
        description_en: "A synthetic test project.",
        description_zh: "用于测试的虚构项目。",
        peers: peerData,
      };
      let r = await founder.post("/api/charts/draft", {
        data: {
          draft: {
            ...draft,
            peers: [
              peerData[0],
              { ...peerData[0], domain: `www.${peerData[0].domain}` },
            ],
          },
          demo: true,
        },
      });
      assert.equal(r.status(), 400, "duplicate peer aliases must fail");
      r = await founder.post("/api/charts/draft", {
        data: { draft, demo: true },
      });
      assert.equal(r.status(), 200, await r.text());
      const app = await r.json();
      appIds.push(app.id);
      assert.equal(
        (
          await other.post("/api/charts/draft", {
            data: { id: app.id, draft, demo: true },
          })
        ).status(),
        404,
      );
      assert.equal(
        (
          await founder.post("/api/charts/submit", { data: { id: app.id } })
        ).status(),
        400,
        "five screenshot subjects required",
      );
      const ownerClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          realtime: { transport: WebSocket as any },
          auth: { persistSession: false },
        },
      );
      await ownerClient.auth.signInWithPassword(accounts.other);
      assert.equal(
        ck(
          await ownerClient
            .from("charts_applications")
            .select("id")
            .eq("id", app.id),
        ).length,
        0,
        "RLS hides other applications",
      );
      const evidence: any[] = [];
      const pngs: Buffer[] = [];
      for (const [i, p] of peerData.slice(0, 5).entries()) {
        const png = await sharp(
          Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700"><rect width="1200" height="700" fill="white"/><g fill="black" font-family="Arial" font-size="38"><text x="60" y="100">DEMONSTRATION - AITDK</text><text x="60" y="200">${p.domain}</text><text x="60" y="300">Month: 2026-09</text><text x="60" y="400">Total Visits: ${123000 + i * 1000}</text><text x="60" y="500">Worldwide All Devices Domain</text></g></svg>`,
          ),
        )
          .png()
          .toBuffer();
        pngs.push(png);
        const response = await founder.post("/api/charts/upload", {
          multipart: {
            application_id: app.id,
            peer_domain: p.domain,
            file: { name: `test-${i}.png`, mimeType: "image/png", buffer: png },
          },
        });
        assert.equal(response.status(), 201, await response.text());
        const e = await response.json();
        evidence.push(e.id);
        if (i === 0) {
          const duplicate = await founder.post("/api/charts/upload", {
            multipart: {
              application_id: app.id,
              peer_domain: p.domain,
              file: {
                name: "duplicate.png",
                mimeType: "image/png",
                buffer: png,
              },
            },
          });
          assert.equal((await duplicate.json()).id, e.id);
          const wrongPeer = await founder.post("/api/charts/upload", {
            multipart: {
              application_id: app.id,
              peer_domain: peerData[1].domain,
              file: {
                name: "duplicate.png",
                mimeType: "image/png",
                buffer: png,
              },
            },
          });
          assert.equal(wrongPeer.status(), 409);
        }
      }
      assert.equal(
        (await other.get(`/api/charts/evidence/${evidence[0]}`)).status(),
        404,
      );
      assert.equal(
        (await guest.get(`/api/charts/evidence/${evidence[0]}`)).status(),
        401,
      );
      const ev = ck(
        await db
          .from("charts_evidence")
          .select("*")
          .eq("application_id", app.id),
      );
      storagePaths.push(...ev.map((e: any) => e.storage_path));
      const privateUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/charts-evidence/${ev[0].storage_path}`;
      assert.notEqual(
        (await guest.get(privateUrl)).status(),
        200,
        "screenshot bucket is private",
      );
      r = await founder.post("/api/charts/submit", { data: { id: app.id } });
      assert.equal(r.status(), 200, await r.text());
      assert.equal(
        (
          await founder.post("/api/charts/admin/application", {
            data: { id: app.id, action: "approve" },
          })
        ).status(),
        403,
      );
      assert.equal(
        (
          await admin.post("/api/charts/admin/application", {
            data: { id: app.id, action: "approve" },
          })
        ).status(),
        400,
        "count alone is not approval",
      );
      const relations = ck(
        await db
          .from("charts_relations")
          .select("*")
          .eq("application_id", app.id),
      );
      for (const relation of relations)
        assert.equal(
          (
            await admin.post("/api/charts/admin/relation", {
              data: { id: relation.id, state: "approved" },
            })
          ).status(),
          200,
        );
      const until = Date.now() + 90000;
      while (Date.now() < until) {
        const done = ck(
          await db
            .from("charts_evidence")
            .select("state")
            .eq("application_id", app.id),
        );
        if (done.every((e: any) => e.state === "pending_review")) break;
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
      for (const [i, eid] of evidence.entries()) {
        const fields = {
          domain: peerData[i].domain,
          source: "AITDK",
          month: "2026-09",
          metric: "visits",
          scope: "worldwide-all-devices-domain",
          value: 123000 + i * 1000,
        };
        if (i === 0) {
          const oldMonth = await admin.post("/api/charts/admin/evidence", {
            data: {
              id: eid,
              fields: { ...fields, month: "2025-01" },
              channel: "Synthetic test review",
              reference: "demo://test",
              note: "Synthetic fixed fixture",
            },
          });
          assert.equal(
            oldMonth.status(),
            400,
            "out-of-window evidence cannot qualify",
          );
        }
        const result = await admin.post("/api/charts/admin/evidence", {
          data: {
            id: eid,
            fields,
            channel: "Synthetic fixed fixture",
            reference: "demo://test-fixed-source",
            note: "Synthetic evidence, not real traffic.",
          },
        });
        assert.equal(result.status(), 200, await result.text());
        assert.equal((await result.json()).state, "verified");
        trafficDomains.push(fields.domain);
      }
      // A same-source value conflict suspends use; a documented revision preserves history.
      await admin.post("/api/charts/admin/application", {
        data: {
          id: app.id,
          action: "needs_info",
          feedback:
            "Please supplement the first peer with the source revision.",
        },
      });
      const revisionPng = await sharp(
        Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700"><rect width="1200" height="700" fill="white"/><g fill="black" font-size="38" font-family="Arial"><text x="60" y="100">DEMONSTRATION AITDK</text><text x="60" y="200">${peerData[0].domain}</text><text x="60" y="300">2026-09</text><text x="60" y="400">Total Visits: 124000</text><text x="60" y="500">Worldwide All Devices Domain</text></g></svg>`,
        ),
      )
        .png()
        .toBuffer();
      const newUpload = await founder.post("/api/charts/upload", {
        multipart: {
          application_id: app.id,
          peer_domain: peerData[0].domain,
          file: {
            name: "revision.png",
            mimeType: "image/png",
            buffer: revisionPng,
          },
        },
      });
      assert.equal(newUpload.status(), 201, await newUpload.text());
      const revisionId = (await newUpload.json()).id;
      const revisionStorage = ck(
        await db
          .from("charts_evidence")
          .select("storage_path")
          .eq("id", revisionId)
          .single(),
      );
      storagePaths.push(revisionStorage.storage_path);
      await founder.post("/api/charts/submit", { data: { id: app.id } });
      const waitUntil = Date.now() + 30000;
      while (Date.now() < waitUntil) {
        const e = ck(
          await db
            .from("charts_evidence")
            .select("state")
            .eq("id", revisionId)
            .single(),
        );
        if (e.state === "pending_review") break;
        await new Promise((r) => setTimeout(r, 500));
      }
      const fields = {
        domain: peerData[0].domain,
        source: "AITDK",
        month: "2026-09",
        metric: "visits",
        scope: "worldwide-all-devices-domain",
        value: 124000,
      };
      const conflict = await admin.post("/api/charts/admin/evidence", {
        data: {
          id: revisionId,
          fields,
          channel: "Synthetic source revision",
          reference: "demo://revised-fixture",
          note: "Source revision supplied as a synthetic test.",
        },
      });
      assert.equal((await conflict.json()).state, "conflict");
      assert.equal(
        (
          await admin.post("/api/charts/admin/application", {
            data: { id: app.id, action: "approve" },
          })
        ).status(),
        400,
        "conflicted evidence cannot qualify",
      );
      const resolved = await admin.post("/api/charts/admin/evidence", {
        data: {
          id: revisionId,
          fields,
          channel: "Synthetic source revision",
          reference: "demo://revised-fixture",
          note: "Confirmed synthetic source revision; retain the earlier version.",
          revision: true,
        },
      });
      assert.equal(resolved.status(), 200, await resolved.text());
      const versions = ck(
        await db
          .from("charts_traffic")
          .select("*")
          .eq("domain", peerData[0].domain)
          .order("version"),
      );
      assert.equal(versions.length, 2);
      assert.equal(versions[0].value, 123000);
      assert.equal(versions[0].state, "superseded");
      assert.equal(versions[1].value, 124000);
      assert.equal(versions[1].state, "verified");
      const overwritten = await db
        .from("charts_traffic")
        .update({ value: 1 })
        .eq("id", versions[1].id);
      assert.ok(overwritten.error, "measurements cannot be overwritten");
      const forbiddenRpc = await anon.rpc("charts_approve_application", {
        aid: app.id,
        actor: accounts.founder.id,
      });
      assert.ok(forbiddenRpc.error, "transaction RPCs are service-only");
      const snapshot = (await db.from("charts_snapshots").select("*").limit(1))
        .data![0];
      const overwriteSnapshot = await db
        .from("charts_snapshots")
        .update({ version: 999 })
        .eq("id", snapshot.id);
      assert.ok(overwriteSnapshot.error, "snapshots are immutable");
      const ocrRows = ck(
        await db
          .from("charts_evidence")
          .select("raw_text,extracted")
          .eq("application_id", app.id),
      );
      assert.ok(
        ocrRows.every(
          (e: any) => e.raw_text && e.extracted?.source === "AITDK",
        ),
        "actual OCR produced extracted source fields",
      );
      const baselineSnapshot = ck(
        await db
          .from("charts_snapshots")
          .select("*")
          .eq("category", "ai-coding")
          .eq("month", "2026-09")
          .eq("demo", true)
          .order("version", { ascending: false })
          .limit(1),
      )[0];
      const sameSnapshot = await admin.post("/api/charts/admin/snapshot", {
        data: { category: "ai-coding", month: "2026-09", demo: true },
      });
      assert.equal(sameSnapshot.status(), 200, await sameSnapshot.text());
      assert.equal(
        (await sameSnapshot.json()).id,
        baselineSnapshot.id,
        "identical inputs reuse the published snapshot despite JSON key ordering",
      );
      const historical = await admin.post("/api/charts/admin/snapshot", {
        data: {
          category: "ai-coding",
          month: "2026-08",
          demo: true,
          note: "Initial historical demonstration snapshot.",
        },
      });
      assert.equal(historical.status(), 200, await historical.text());
      const originalRanks = ck(
        await db.from("charts_snapshots").select("id,entries").eq("demo", true),
      );
      const approved = await admin.post("/api/charts/admin/application", {
        data: { id: app.id, action: "approve" },
      });
      assert.equal(approved.status(), 200, await approved.text());
      const pid = (await approved.json()).project_id;
      projectIds.push(pid);
      assert.equal(
        (
          await admin.post("/api/charts/admin/application", {
            data: { id: app.id, action: "approve" },
          })
        ).status(),
        200,
        "repeat approval is idempotent",
      );
      const collectedPeers = ck(
        await db
          .from("charts_projects")
          .select("*")
          .in(
            "domain",
            peerData.map((p) => p.domain),
          ),
      );
      assert.equal(collectedPeers.length, 10);
      assert.ok(
        collectedPeers.every((p: any) => p.publication === "draft"),
        "peer nomination creates research candidates, not published pages",
      );
      const reports = ck(
        await db
          .from("charts_reports")
          .select("*")
          .eq("application_id", app.id),
      );
      const research = collectedPeers[0];
      projectIds.push(research.id);
      const publishBody = {
        id: research.id,
        publication: "published",
        reference: "demo://reviewed-research-source",
        price_verified: true,
        project: {
          name: research.name,
          website_url: research.website_url,
          category: "knowledge-search",
          price_type: "free",
          description_en:
            "A fictional project used to verify document retrieval research.",
          description_zh: "用于验收文档检索研究流程的虚构项目。",
        },
      };
      assert.equal(
        (
          await founder.post("/api/charts/admin/project", { data: publishBody })
        ).status(),
        403,
      );
      assert.equal(
        (
          await admin.post("/api/charts/admin/project", {
            data: {
              ...publishBody,
              project: {
                ...publishBody.project,
                description_en: "",
                description_zh: "",
              },
            },
          })
        ).status(),
        400,
        "incomplete research pages cannot be published",
      );
      const published = await admin.post("/api/charts/admin/project", {
        data: publishBody,
      });
      assert.equal(published.status(), 200, await published.text());
      assert.equal(
        ck(
          await anon
            .from("charts_public_projects")
            .select("id")
            .eq("id", research.id),
        ).length,
        1,
      );
      assert.ok(
        (
          await anon
            .from("charts_projects")
            .select("controller_id")
            .eq("id", research.id)
        ).error,
        "public clients cannot read internal control identities",
      );
      assert.ok(
        (await anon.from("charts_traffic").select("review_reference")).error,
        "private review references are not a public table",
      );
      const correction = await other.post("/api/charts/correction", {
        data: {
          project_id: research.id,
          message:
            "Synthetic factual correction of the official website, independent of contribution.",
        },
      });
      assert.equal(correction.status(), 200);
      const correctionId = (await correction.json()).id;
      const corrected = await admin.post("/api/charts/admin/correction", {
        data: {
          id: correctionId,
          state: "adopted",
          feedback:
            "Verified synthetic canonical-domain correction for this fixture.",
          patch: { website_url: `https://corrected-${suffix}.example` },
        },
      });
      assert.equal(corrected.status(), 200, await corrected.text());
      const correctedProject = ck(
        await db
          .from("charts_projects")
          .select("domain,measurement_domain")
          .eq("id", research.id)
          .single(),
      );
      assert.equal(correctedProject.domain, `corrected-${suffix}.example`);
      assert.equal(
        correctedProject.measurement_domain,
        correctedProject.domain,
        "a corrected official domain never inherits old-domain visits",
      );
      const cacheDraft = await founder.post("/api/charts/draft", {
        data: {
          draft: {
            ...draft,
            name: `Cache fixture ${suffix}`,
            website_url: `https://cache-${suffix}.example`,
            domain: `cache-${suffix}.example`,
          },
          demo: true,
        },
      });
      const cacheApp = await cacheDraft.json();
      appIds.push(cacheApp.id);
      const cached = await founder.post("/api/charts/upload", {
        multipart: {
          application_id: cacheApp.id,
          peer_domain: peerData[1].domain,
          file: { name: "reused.png", mimeType: "image/png", buffer: pngs[1] },
        },
      });
      assert.equal(cached.status(), 201, await cached.text());
      const cacheEvidence = await cached.json();
      assert.equal(
        cacheEvidence.state,
        "verified",
        "exact evidence can reuse a current same-source review without another OCR",
      );
      const reusedRow = ck(
        await db
          .from("charts_evidence")
          .select("storage_path")
          .eq("id", cacheEvidence.id)
          .single(),
      );
      storagePaths.push(reusedRow.storage_path);
      assert.equal(
        ck(
          await db
            .from("charts_jobs")
            .select("id")
            .contains("payload", { evidence_id: cacheEvidence.id }),
        ).length,
        0,
      );
      assert.equal(reports.length, 1);
      const rewards = ck(
        await db.from("charts_contributions").select("*").eq("project_id", pid),
      );
      assert.equal(
        rewards.filter((r: any) => r.eligible).length,
        1,
        "per-project contribution cap applies across adopted records",
      );
      assert.equal(reports[0].peers.length, 10);
      assert.equal(
        reports[0].peers.filter((p: any) => p.traffic === null).length,
        5,
        "unknown peers remain unknown",
      );
      assert.equal(
        ck(
          await db
            .from("charts_traffic")
            .select("id")
            .eq("domain", draft.domain),
        ).length,
        0,
        "no own traffic is invented",
      );
      assert.deepEqual(
        ck(
          await db
            .from("charts_snapshots")
            .select("id,entries")
            .eq("demo", true),
        ),
        originalRanks,
        "contribution does not change ranks",
      );
      assert.equal(
        ck(
          await anon
            .from("charts_reports")
            .select("id")
            .eq("id", reports[0].id),
        ).length,
        0,
        "reports private via RLS",
      );
      r = await founder.post("/api/charts/share", {
        data: { id: reports[0].id, enabled: true },
      });
      const token = (await r.json()).share_token;
      assert.ok(token);
      assert.equal(
        (await guest.get(`/api/charts/shared/${token}`)).status(),
        200,
      );
      assert.equal(
        (
          await other.post("/api/charts/share", {
            data: { id: reports[0].id, enabled: false },
          })
        ).status(),
        404,
      );
      await founder.post("/api/charts/share", {
        data: { id: reports[0].id, enabled: false },
      });
      assert.equal(
        (await guest.get(`/api/charts/shared/${token}`)).status(),
        404,
      );
      // A claimed owner can update without another initial ten-peer task.
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
        "contribution is not identity",
      );
      const claimResponse = await founder.post("/api/charts/claim", {
        data: {
          project_id: pid,
          message: "Synthetic local ownership proof for a fictional project.",
        },
      });
      const claim = await claimResponse.json();
      assert.equal(claimResponse.status(), 200);
      assert.equal(
        (
          await admin.post("/api/charts/admin/claim", {
            data: {
              id: claim.id,
              state: "approved",
              feedback: "Verified synthetic local ownership record.",
            },
          })
        ).status(),
        200,
      );
      r = await founder.post("/api/charts/draft", {
        data: {
          draft: {
            ...draft,
            description_en: "Updated synthetic description.",
            peers: [],
          },
          demo: true,
          project_id: pid,
        },
      });
      assert.equal(r.status(), 200, await r.text());
      const update = await r.json();
      appIds.push(update.id);
      assert.equal(update.kind, "update");
      await founder.post("/api/charts/submit", { data: { id: update.id } });
      assert.equal(
        (
          await admin.post("/api/charts/admin/application", {
            data: { id: update.id, action: "approve" },
          })
        ).status(),
        200,
      );
      const updateReport = ck(
        await db
          .from("charts_reports")
          .select("peers")
          .eq("application_id", update.id)
          .single(),
      );
      assert.equal(
        updateReport.peers.length,
        10,
        "information-only updates preserve the saved observation group",
      );
      assert.equal(
        (
          await founder.post("/api/charts/follow", {
            data: { target: pid, kind: "project", email_enabled: true },
          })
        ).status(),
        200,
      );
      assert.equal(
        (
          await founder.post("/api/charts/follow", {
            data: { target: pid, kind: "bookmark" },
          })
        ).status(),
        200,
      );
      // Raw clicks are retained; tests and self clicks remain excluded.
      const out = await founder.get(`/out/${pid}?surface=/reports/test`, {
        maxRedirects: 0,
      });
      assert.equal(out.status(), 200);
      const events = ck(
        await db.from("charts_events").select("*").eq("project_id", pid),
      );
      assert.equal(events.at(-1).kind, "outbound");
      assert.equal(events.at(-1).excluded, true);
      const real = await (
        await guest.get("/api/charts/bootstrap?dataset=real")
      ).json();
      assert.equal(
        real.projects.some((p: any) => p.id === pid),
        false,
      );
      assert.equal(
        real.traffic.some((x: any) => x.demo),
        false,
      );
      const chinese = await guest.get("/zh");
      assert.match(await chinese.text(), /<html lang="zh-CN"/);
      assert.equal((await guest.get("/en/unknown-route")).status(), 404);
      assert.equal(
        (await guest.get("/en", { maxRedirects: 0 })).headers()["x-robots-tag"],
        "noindex, follow",
      );
      assert.equal(
        (await guest.get("/api/project-submissions")).status(),
        410,
        "historical writes are inactive",
      );
      console.log(
        "Verified: persistence, genuine OCR, guarded approval, private evidence/report, owner claim, updates, follows and metrics.",
      );
    } finally {
      // Only IDs created by this test are removed; seed data and user records remain intact.
      if (projectIds.length) {
        await db.from("charts_follows").delete().in("target", projectIds);
        await db.from("charts_claims").delete().in("project_id", projectIds);
        await db
          .from("charts_corrections")
          .delete()
          .in("project_id", projectIds);
        await db.from("charts_events").delete().in("project_id", projectIds);
        await db
          .from("charts_contributions")
          .delete()
          .in("project_id", projectIds);
        await db
          .from("charts_notifications")
          .delete()
          .in(
            "dedupe_key",
            appIds.map((id) => "approved:" + id),
          );
      }
      if (appIds.length) {
        const evidenceRows = ck(
          await db
            .from("charts_evidence")
            .select("id")
            .in("application_id", appIds),
        );
        if (evidenceRows.length) {
          await db
            .from("charts_jobs")
            .delete()
            .in(
              "payload->>evidence_id",
              evidenceRows.map((e: any) => e.id),
            );
          await db
            .from("charts_evidence")
            .update({ traffic_id: null })
            .in("application_id", appIds);
          await db
            .from("charts_traffic")
            .delete()
            .in(
              "evidence_id",
              evidenceRows.map((e: any) => e.id),
            );
          await db
            .from("charts_evidence")
            .delete()
            .in("application_id", appIds);
        }
        await db.from("charts_reports").delete().in("application_id", appIds);
        await db.from("charts_relations").delete().in("application_id", appIds);
        await db.from("charts_applications").delete().in("id", appIds);
      }
      await db
        .from("charts_projects")
        .delete()
        .like("domain", `peer%-${suffix}.example`)
        .eq("demo", true)
        .eq("publication", "draft");
      if (storagePaths.length)
        await db.storage.from("charts-evidence").remove(storagePaths);
      if (projectIds.length)
        await db.from("charts_projects").delete().in("id", projectIds);
      await Promise.all([founder, admin, other, guest].map((c) => c.dispose()));
    }
  },
);

test(
  "new accounts are free, persistent and unprivileged",
  { timeout: 30000 },
  async () => {
    const client = await fresh(),
      email = `signup-${randomUUID().slice(0, 8)}@123charts.local`;
    let userId: string | undefined;
    try {
      const r = await client.post("/api/charts/auth", {
        data: {
          action: "signup",
          email,
          password: `LocalTest!${randomUUID()}`,
        },
      });
      assert.equal(r.status(), 200, await r.text());
      const state = await (
        await client.get("/api/charts/bootstrap?dataset=real")
      ).json();
      assert.equal(state.user.email, email);
      assert.equal(state.isAdmin, false);
      userId = state.user.id;
      assert.equal(
        (
          await client.post("/api/charts/admin/recommendations", { data: {} })
        ).status(),
        403,
      );
    } finally {
      await client.dispose();
      if (userId) await db.auth.admin.deleteUser(userId);
    }
  },
);
