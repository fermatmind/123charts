import { flushCatalog } from "@/lib/charts/catalog";
import { eventExclusion } from "@/lib/charts/events";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, randomUUID } from "node:crypto";
import { bootstrap, context, checked } from "@/lib/charts/server";
import {
  draftSchema,
  normalizeWebsite,
  validatePeers,
  validateSubmission,
  slugify,
} from "@/lib/charts/rules";
export const runtime = "nodejs";
const uuid = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function handle(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params,
      route = path.join("/");
    if (request.method === "GET" && route === "bootstrap")
      return NextResponse.json(
        await bootstrap(
          request.nextUrl.searchParams.get("dataset") === "real"
            ? "real"
            : "demo",
          request.nextUrl.searchParams.get("zone") === "public"
            ? "public"
            : "dashboard",
        ),
        { headers: { "Cache-Control": "no-store" } },
      );
    if (
      [
        "upload",
        "admin/source-upload",
        "admin/verification",
        "admin/verification-settings",
        "admin/evidence",
        "admin/snapshot",
        "admin/month",
        "admin/source-correction",
        "delete-evidence",
        "admin/membership",
      ].includes(route)
    )
      return NextResponse.json(
        {
          error:
            "External traffic and screenshot processing are deferred beyond the discovery MVP.",
        },
        { status: 410 },
      );
    const c = await context(),
      { db, auth, user, isAdmin } = c;
    const required = () => {
      if (!user) throw new HttpError(401, "Sign in to continue.");
      return user;
    };
    const admin = () => {
      required();
      if (!isAdmin) throw new HttpError(403, "Administrator access required.");
    };
    const ownedApp = async (id: string) => {
      required();
      if (!uuid.test(id)) throw new HttpError(400, "Invalid application ID.");
      const a = checked(
        await db
          .from("charts_applications")
          .select("*")
          .eq("id", id)
          .maybeSingle(),
      );
      if (!a || (!isAdmin && a.owner_id !== user!.id))
        throw new HttpError(404, "Application not found.");
      return a;
    };
    if (request.method === "GET") {
      if (path[0] === "snapshot" && uuid.test(path[1] ?? "")) {
        const snap = checked(
          await db
            .from("charts_snapshots")
            .select("*")
            .eq("id", path[1])
            .eq("demo", request.nextUrl.searchParams.get("dataset") !== "real")
            .maybeSingle(),
        );
        if (!snap) throw new HttpError(404, "Snapshot not found.");
        const ids = snap.entries.map((e: any) => e.traffic_id);
        const rows = ids.length
          ? checked(
              await db
                .from("charts_traffic")
                .select(
                  "id,verified_at,raw_display,precision_step,state,correction_note",
                )
                .in("id", ids),
            )
          : [];
        const receipts = ids.length
          ? checked(
              await db
                .from("charts_verification_receipts")
                .select("traffic_id,source_url,response_hash,success_at")
                .in("traffic_id", ids)
                .not("success_at", "is", null)
                .order("success_at", { ascending: false }),
            )
          : [];
        return NextResponse.json(
          {
            ...snap,
            description:
              "Estimated visits; not unique visitors, active users or quality.",
            entries: snap.entries.map((e: any) => ({
              ...e,
              source: snap.source,
              month: snap.month,
              metric: snap.metric,
              scope: snap.scope,
              snapshot_version: snap.version,
              verification: rows.find((r: any) => r.id === e.traffic_id),
              source_receipt:
                receipts.find((r: any) => r.traffic_id === e.traffic_id) ??
                null,
            })),
          },
          {
            headers: { "X-Robots-Tag": "noindex", "Cache-Control": "no-store" },
          },
        );
      }
      if (path[0] === "source-evidence" && uuid.test(path[1] ?? "")) {
        admin();
        const e = checked(
          await db
            .from("charts_source_evidence")
            .select("*")
            .eq("id", path[1])
            .maybeSingle(),
        );
        if (!e) throw new HttpError(404, "Source evidence not found.");
        return NextResponse.json({
          ...e,
          signed_url: checked(
            await db.storage
              .from("charts-evidence")
              .createSignedUrl(e.storage_path, 120),
          ).signedUrl,
        });
      }

      if (path[0] === "evidence" && uuid.test(path[1] ?? "")) {
        required();
        const e = checked(
          await db
            .from("charts_evidence")
            .select("*")
            .eq("id", path[1])
            .maybeSingle(),
        );
        if (!e || (!isAdmin && e.owner_id !== user!.id))
          throw new HttpError(404, "Evidence not found.");
        const s = checked(
          await db.storage
            .from("charts-evidence")
            .createSignedUrl(e.storage_path, 120),
        );
        return NextResponse.json(
          { url: s.signedUrl },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
      if (path[0] === "shared" && uuid.test(path[1] ?? "")) {
        const r = checked(
          await db
            .from("charts_reports")
            .select("id,project_id,peers,demo,created_at")
            .eq("share_token", path[1])
            .maybeSingle(),
        );
        if (!r) throw new HttpError(404, "Shared report not found or revoked.");
        return NextResponse.json(r, {
          headers: { "X-Robots-Tag": "noindex", "Cache-Control": "no-store" },
        });
      }
      return NextResponse.json({ error: "Unknown endpoint." }, { status: 404 });
    }
    if (!["POST", "DELETE"].includes(request.method))
      throw new HttpError(405, "Method not allowed.");
    const origin = request.headers.get("origin");
    const allowedOrigins = new Set([
      new URL(process.env.APP_URL ?? "http://127.0.0.1:3100").origin,
    ]);
    if (process.env.CHARTS_LOCAL_PREVIEW === "true")
      allowedOrigins.add("http://localhost:3100");
    if (origin && !allowedOrigins.has(origin))
      throw new HttpError(403, "Cross-origin writes are not allowed.");
    if (request.headers.get("sec-fetch-site") === "cross-site")
      throw new HttpError(403, "Cross-site writes are not allowed.");
    if (Number(request.headers.get("content-length")) > 65536)
      throw new HttpError(413, "Request body too large.");
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 65536)
      throw new HttpError(413, "Request body too large.");
    const b = raw ? JSON.parse(raw) : {};
    if (route === "auth") {
      if (b.action === "signout") {
        await auth.auth.signOut();
        return NextResponse.json({ ok: true });
      }
      if (
        typeof b.email !== "string" ||
        typeof b.password !== "string" ||
        b.password.length < 8 ||
        b.password.length > 128
      )
        throw new HttpError(
          400,
          "Email and a password of at least eight characters are required.",
        );
      if (b.action === "signup") {
        const { error, data } = await auth.auth.signUp({
          email: b.email,
          password: b.password,
        });
        if (error) throw new HttpError(400, error.message);
        return NextResponse.json({
          ok: true,
          confirmationRequired: !data.session,
        });
      }
      const { error } = await auth.auth.signInWithPassword({
        email: b.email,
        password: b.password,
      });
      if (error) throw new HttpError(400, "Invalid email or password.");
      return NextResponse.json({ ok: true });
    }
    if (route === "draft") {
      const u = required(),
        d = draftSchema.parse(b.draft);
      d.description_en = d.description_en || d.description_zh;
      d.description_zh = d.description_zh || d.description_en;
      if (d.is_open_source && !d.open_source_url)
        throw new HttpError(
          400,
          "Provide the open source license reference, or leave it unconfirmed.",
        );
      if (d.website_url) {
        const site = normalizeWebsite(d.website_url, !!b.demo);
        d.domain = site.domain;
        d.website_url = site.website_url;
      }
      const targetProject =
        b.project_id || (b.id ? (await ownedApp(b.id)).project_id : null);
      if (targetProject) {
        const target = checked(
          await db
            .from("charts_projects")
            .select("domain")
            .eq("id", targetProject)
            .single(),
        );
        if (target.domain !== d.domain)
          throw new HttpError(
            400,
            "Project updates must keep the saved official domain. Use the correction workflow for a domain change.",
          );
      }
      d.slug = slugify(d.name || d.domain);
      d.peers = validatePeers(d.peers, d.domain, false, !!b.demo);
      if (b.id) {
        const existing = await ownedApp(b.id);
        if (existing.demo !== !!b.demo)
          throw new HttpError(400, "A draft cannot change its dataset.");
      }
      if (d.domain)
        d.slug =
          slugify(d.name || d.domain).slice(0, 60) +
          "-" +
          createHash("sha256").update(d.domain).digest("hex").slice(0, 8);
      const saved = checked(
        await db.rpc("charts_save_draft", {
          aid: b.id ?? null,
          actor: u.id,
          d,
          is_demo: !!b.demo,
          update_project: b.project_id ?? null,
        }),
      );
      return NextResponse.json(saved);
    }
    if (route === "submit") {
      const a = await ownedApp(b.id);
      if (
        a.owner_id !== user!.id ||
        !["draft", "needs_info"].includes(a.status)
      )
        throw new HttpError(409, "This application is not editable.");
      if (a.kind === "initial") validateSubmission(a.draft, a.demo);
      else if (
        !a.draft.name ||
        !a.draft.description_en ||
        !a.draft.description_zh
      )
        throw new HttpError(400, "Complete the project descriptions.");
      const data = checked(
        await db.rpc("charts_submit_public", { aid: a.id, actor: user!.id }),
      );
      return NextResponse.json(data);
    }
    if (route === "metadata") {
      const u = required(),
        site = normalizeWebsite(b.url);
      const j = checked(
        await db
          .from("charts_jobs")
          .insert({
            kind: "metadata",
            owner_id: u.id,
            payload: { url: site.website_url },
          })
          .select()
          .single(),
      );
      return NextResponse.json({ id: j.id });
    }
    if (route === "follow") {
      const u = required();
      if (
        !["bookmark", "project", "category", "alternatives"].includes(b.kind) ||
        typeof b.target !== "string"
      )
        throw new HttpError(400, "Invalid follow target.");
      // Removing a personal bookmark must also work when the public project is unavailable.
      if (b.remove) {
        checked(
          await db
            .from("charts_follows")
            .delete()
            .eq("owner_id", u.id)
            .eq("target", b.target)
            .eq("kind", b.kind),
        );
        return NextResponse.json({ ok: true });
      }
      if (b.kind === "category") {
        if (
          !checked(
            await db
              .from("charts_categories")
              .select("slug")
              .eq("slug", b.target)
              .maybeSingle(),
          )
        )
          throw new HttpError(404, "Category not found.");
      } else if (
        !checked(
          await db
            .from("charts_projects")
            .select("id")
            .eq("id", b.target)
            .eq("publication", "published")
            .maybeSingle(),
        )
      )
        throw new HttpError(404, "Project not found.");
      checked(
        await db
          .from("charts_follows")
          .upsert({
            owner_id: u.id,
            target: b.target,
            kind: b.kind,
            email_enabled: !!b.email_enabled,
          }),
      );
      if (b.kind !== "bookmark")
        checked(
          await db
            .from("charts_jobs")
            .insert({ kind: "digest", owner_id: u.id, payload: {} }),
        );
      return NextResponse.json({ ok: true });
    }
    if (route === "share") {
      const u = required(),
        r = checked(
          await db
            .from("charts_reports")
            .select("id,owner_id")
            .eq("id", b.id)
            .eq("owner_id", u.id)
            .maybeSingle(),
        );
      if (!r) throw new HttpError(404, "Report not found.");
      return NextResponse.json(
        checked(
          await db
            .from("charts_reports")
            .update({ share_token: b.enabled ? randomUUID() : null })
            .eq("id", r.id)
            .select("share_token")
            .single(),
        ),
      );
    }
    if (route === "claim" || route === "correction") {
      const u = required(),
        p = checked(
          await db
            .from("charts_projects")
            .select("id")
            .eq("id", b.project_id)
            .eq("publication", "published")
            .maybeSingle(),
        );
      if (!p) throw new HttpError(404, "Project not found.");
      if (
        typeof b.message !== "string" ||
        b.message.trim().length < 10 ||
        b.message.length > 3000
      )
        throw new HttpError(
          400,
          "Provide specific evidence or a correction of 10–3000 characters.",
        );
      return NextResponse.json(
        checked(
          await db
            .from(route === "claim" ? "charts_claims" : "charts_corrections")
            .insert(
              route === "claim"
                ? {
                    owner_id: u.id,
                    project_id: p.id,
                    evidence: b.message,
                    method: "manual_review",
                  }
                : { owner_id: u.id, project_id: p.id, message: b.message },
            )
            .select()
            .single(),
        ),
      );
    }
    if (route === "notification") {
      required();
      checked(
        await db
          .from("charts_notifications")
          .update({ seen: true })
          .eq("id", b.id)
          .eq("owner_id", user!.id),
      );
      return NextResponse.json({ ok: true });
    }
    if (route === "event") {
      if (
        !["impression", "project_view"].includes(b.kind) ||
        typeof b.surface !== "string" ||
        !/^\/[a-z0-9/_-]{0,120}$/i.test(b.surface)
      )
        throw new HttpError(400, "Invalid event.");
      const p = checked(
        await db
          .from("charts_projects")
          .select("id,controller_id")
          .eq("id", b.project_id)
          .eq("publication", "published")
          .maybeSingle(),
      );
      if (!p) throw new HttpError(404, "Project not found.");
      const jar = await cookies();
      let visitor = jar.get("charts_visitor")?.value;
      if (!visitor || !uuid.test(visitor)) {
        visitor = randomUUID();
        jar.set("charts_visitor", visitor, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 31536000,
        });
      }
      const claim = user
        ? checked(
            await db
              .from("charts_claims")
              .select("id")
              .eq("project_id", p.id)
              .eq("owner_id", user.id)
              .eq("state", "approved")
              .limit(1),
          )
        : [];
      const reason = eventExclusion(
        request.headers.get("user-agent") ?? "",
        b.automated === true,
        !!(
          user &&
          (p.controller_id === user.id || isAdmin || claim.length > 0)
        ),
      );
      const session =
        typeof b.session_id === "string" && uuid.test(b.session_id)
          ? b.session_id
          : visitor;
      const since = new Date(Date.now() - 30 * 60000).toISOString();
      let recentQuery = db
        .from("charts_events")
        .select("id")
        .eq("project_id", p.id)
        .eq("kind", b.kind);
      recentQuery =
        b.kind === "impression"
          ? recentQuery.eq("session_id", session).eq("surface", b.surface)
          : recentQuery.eq("visitor_id", visitor).gte("created_at", since);
      const recent = checked(await recentQuery.limit(1));
      if (!recent.length) {
        const saved = await db.from("charts_events").insert({
          kind: b.kind,
          project_id: p.id,
          visitor_id: visitor,
          surface: b.surface,
          session_id: session,
          excluded: !!reason,
          exclusion_reason: reason,
          dedupe_key:
            b.kind === "impression"
              ? createHash("sha256")
                  .update(`${session}:${p.id}:${b.surface}`)
                  .digest("hex")
              : null,
        });
        if (saved.error && saved.error.code !== "23505") checked(saved);
      }
      return NextResponse.json({ ok: true });
    }
    if (route.startsWith("admin/")) {
      admin();
      if (route === "admin/application") {
        const a = await ownedApp(b.id);
        if (a.status === "draft")
          throw new HttpError(
            409,
            "A draft must be submitted by its owner before review.",
          );
        if (b.action === "approve")
          return NextResponse.json({
            project_id: checked(
              await db.rpc("charts_review_version", {
                aid: a.id,
                actor: user!.id,
                reference: b.reference ?? "",
                pricing_confirmed: !!b.pricing_confirmed,
                expected_updated_at: b.expected_updated_at ?? null,
              }),
            ),
          });
        if (
          !["verifying", "needs_info", "rejected"].includes(b.action) ||
          a.status === "approved"
        )
          throw new HttpError(409, "Invalid review transition.");
        if (
          ["needs_info", "rejected"].includes(b.action) &&
          (!b.feedback || b.feedback.trim().length < 5)
        )
          throw new HttpError(400, "Provide actionable review feedback.");
        checked(
          await db
            .from("charts_applications")
            .update({
              status: b.action,
              feedback: b.feedback ?? null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", a.id),
        );
        return NextResponse.json({ ok: true });
      }
      if (route === "admin/relation") {
        checked(
          await db.rpc("charts_relation_decision", {
            rid: b.id,
            actor: user!.id,
            decision: b.state,
            basis: b.feedback || "",
          }),
        );
        return NextResponse.json({ ok: true });
      }
      if (route === "admin/category") {
        if (!/^[a-z0-9-]{3,70}$/.test(b.slug || ""))
          throw new HttpError(400, "Valid category required");
        const fields: any = {};
        for (const key of [
          "name_en",
          "name_zh",
          "description_en",
          "description_zh",
        ]) {
          if (typeof b[key] !== "string" || b[key].trim().length < 2)
            throw new HttpError(
              400,
              "Complete category names and purpose definitions",
            );
          fields[key] = b[key].trim().slice(0, 1000);
        }
        checked(
          await db.from("charts_categories").update(fields).eq("slug", b.slug),
        );
        return NextResponse.json({ ok: true });
      }
      if (route === "admin/project") {
        const project = checked(
          await db.from("charts_projects").select("*").eq("id", b.id).single(),
        );
        if (!["draft", "published", "archived"].includes(b.publication))
          throw new HttpError(400, "Invalid publication state.");
        const info = draftSchema
          .omit({
            peers: true,
            slug: true,
            domain: true,
            peer_exception_reason: true,
            supplementary_alternatives: true,
            replace_peer_group: true,
          })
          .parse(b.project);
        if (
          b.publication === "published" &&
          (!info.task?.trim() ||
            !info.differentiator?.trim() ||
            !info.supported_languages?.length ||
            (info.is_open_source && !info.open_source_url) ||
            !info.name.trim() ||
            info.description_en.trim().length < 20 ||
            info.description_zh.trim().length < 10 ||
            typeof b.reference !== "string" ||
            b.reference.length < 8)
        )
          throw new HttpError(
            400,
            "Reviewed bilingual descriptions and a factual source reference are required.",
          );
        const site = normalizeWebsite(info.website_url, project.demo);
        if (site.domain !== project.domain)
          throw new HttpError(
            400,
            "Use the correction workflow for canonical domain changes.",
          );
        checked(
          await db
            .from("charts_projects")
            .update({
              ...info,
              website_url: site.website_url,
              publication: b.publication,
              review_state:
                b.publication === "published"
                  ? "approved"
                  : project.review_state,
              official_source: b.reference || project.official_source,
              price_verified: !!b.price_verified,
              updated_at: new Date().toISOString(),
            })
            .eq("id", b.id),
        );
        return NextResponse.json({ ok: true });
      }
      if (route === "admin/claim" || route === "admin/correction") {
        const patch: Record<string, string> = {};
        if (route === "admin/correction" && b.patch) {
          for (const key of [
            "name",
            "description_en",
            "description_zh",
            "website_url",
          ])
            if (typeof b.patch[key] === "string" && b.patch[key].trim())
              patch[key] = b.patch[key].trim().slice(0, 2000);
          if (patch.website_url) {
            const correction = checked(
              await db
                .from("charts_corrections")
                .select("project_id")
                .eq("id", b.id)
                .single(),
            );
            const project = checked(
              await db
                .from("charts_projects")
                .select("demo")
                .eq("id", correction.project_id)
                .single(),
            );
            const website = normalizeWebsite(patch.website_url, project.demo);
            patch.website_url = website.website_url;
            patch.domain = website.domain;
          }
        }
        checked(
          await db.rpc("charts_review_decision", {
            kind: route === "admin/claim" ? "claim" : "correction",
            item_id: b.id,
            decision: b.state,
            feedback_text: b.feedback ?? "",
            patch,
          }),
        );
        return NextResponse.json({ ok: true });
      }
      if (route === "admin/retry") {
        const j = checked(
          await db.from("charts_jobs").select("*").eq("id", b.id).single(),
        );
        if (j.kind === "ocr")
          throw new HttpError(410, "OCR is deferred beyond this MVP.");
        if (j.state !== "failed")
          throw new HttpError(409, "Only failed jobs can be retried.");
        checked(
          await db
            .from("charts_jobs")
            .update({
              state: "pending",
              attempts: 0,
              error: null,
              run_after: new Date().toISOString(),
            })
            .eq("id", b.id),
        );
        return NextResponse.json({ ok: true });
      }
      if (route === "admin/recommendations") {
        checked(
          await db.from("charts_jobs").insert({
            kind: "recommendations",
            payload: {},
            owner_id: user!.id,
          }),
        );
        return NextResponse.json({ ok: true });
      }
    }
    throw new HttpError(404, "Unknown endpoint.");
  } catch (error) {
    const e = error as Error;
    const status =
      error instanceof HttpError
        ? error.status
        : e.name === "ZodError"
          ? 400
          : 400;
    return NextResponse.json(
      { error: e.message },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
export { handle as GET };
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const response = await handle(request, ctx);
  const { path } = await ctx.params;
  if (
    response.ok &&
    [
      "submit",
      "admin/application",
      "admin/relation",
      "admin/project",
      "admin/claim",
      "admin/correction",
      "admin/category",
    ].includes(path.join("/"))
  )
    await flushCatalog();
  return response;
}
export { POST as DELETE };
