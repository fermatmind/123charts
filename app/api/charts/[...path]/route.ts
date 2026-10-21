import { eventExclusion } from "@/lib/charts/events";
import { queueVerification, PUBLIC_SOURCE } from "@/lib/charts/verification";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import {
  bootstrap,
  context,
  checked,
  createSnapshot,
} from "@/lib/charts/server";
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
    if (route === "admin/source-upload") {
      admin();
      if (Number(request.headers.get("content-length")) > 11 * 1024 * 1024)
        throw new HttpError(413, "Image too large.");
      const form = await request.formData(),
        file = form.get("file");
      if (
        !(file instanceof File) ||
        file.size > 10 * 1024 * 1024 ||
        !["image/png", "image/jpeg", "image/webp"].includes(file.type)
      )
        throw new HttpError(
          400,
          "A PNG, JPEG or WebP up to 10 MB is required.",
        );
      const domain = normalizeWebsite(String(form.get("domain"))).domain,
        month = String(form.get("month"));
      if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month))
        throw new HttpError(400, "Explicit source month required.");
      const buffer = Buffer.from(await file.arrayBuffer()),
        meta = await sharp(buffer, { limitInputPixels: 30000000 }).metadata();
      if (!["png", "jpeg", "webp"].includes(meta.format ?? ""))
        throw new HttpError(400, "Invalid image.");
      const id = randomUUID(),
        key = `source/${user!.id}/${id}.${meta.format}`;
      checked(
        await db.storage
          .from("charts-evidence")
          .upload(key, buffer, { contentType: file.type }),
      );
      const inserted = await db.from("charts_source_evidence").insert({
        id,
        owner_id: user!.id,
        domain,
        source: PUBLIC_SOURCE,
        month,
        storage_path: key,
        file_hash: createHash("sha256").update(buffer).digest("hex"),
      });
      if (inserted.error) {
        await db.storage.from("charts-evidence").remove([key]);
        throw new Error(inserted.error.message);
      }
      checked(
        await db.from("charts_jobs").insert({
          kind: "ocr",
          owner_id: user!.id,
          payload: { source_evidence_id: id },
        }),
      );
      return NextResponse.json(
        { id, state: "pending_extraction" },
        { status: 201 },
      );
    }
    if (route === "upload") {
      required();
      if (Number(request.headers.get("content-length")) > 11 * 1024 * 1024)
        throw new HttpError(413, "Maximum image size is 10 MB.");
      const form = await request.formData(),
        file = form.get("file");
      if (
        !(file instanceof File) ||
        file.size > 10 * 1024 * 1024 ||
        !["image/png", "image/jpeg", "image/webp"].includes(file.type)
      )
        throw new HttpError(
          400,
          "Upload a PNG, JPEG or WebP image up to 10 MB.",
        );
      const app = await ownedApp(String(form.get("application_id")));
      if (
        app.owner_id !== user!.id ||
        !["draft", "needs_info"].includes(app.status)
      )
        throw new HttpError(
          409,
          "Evidence uploads require an editable application.",
        );
      const peer = normalizeWebsite(
        String(form.get("peer_domain")),
        app.demo,
      ).domain;
      if (
        !(app.draft.peers ?? []).some(
          (p: { domain: string }) => p.domain === peer,
        )
      )
        throw new HttpError(
          400,
          "Choose one of the peers in this application.",
        );
      const existing = checked(
        await db
          .from("charts_evidence")
          .select("id")
          .eq("application_id", app.id),
      );
      if (existing.length >= 30)
        throw new HttpError(
          400,
          "At most 30 images per application; each peer is counted once.",
        );
      const buffer = Buffer.from(await file.arrayBuffer()),
        meta = await sharp(buffer, { limitInputPixels: 30000000 }).metadata();
      if (!["png", "jpeg", "webp"].includes(meta.format ?? ""))
        throw new HttpError(400, "The file is not a supported image.");
      const hash = createHash("sha256").update(buffer).digest("hex");
      const duplicate = checked(
        await db
          .from("charts_evidence")
          .select("id,peer_domain")
          .eq("application_id", app.id)
          .eq("file_hash", hash)
          .maybeSingle(),
      );
      if (duplicate) {
        if (duplicate.peer_domain !== peer)
          throw new HttpError(
            409,
            "This image is already associated with another peer.",
          );
        return NextResponse.json(duplicate);
      }
      const prior = checked(
        await db
          .from("charts_evidence")
          .select("traffic_id,raw_text,extracted,reviewed_at")
          .eq("file_hash", hash)
          .eq("peer_domain", peer)
          .eq("demo", app.demo)
          .eq("state", "verified")
          .order("reviewed_at", { ascending: false })
          .limit(1),
      )[0];
      let reusable: any = null;
      if (prior?.traffic_id) {
        const traffic = checked(
          await db
            .from("charts_traffic")
            .select("id,source,month,metric,scope,state")
            .eq("id", prior.traffic_id)
            .eq("state", "verified")
            .maybeSingle(),
        );
        if (
          traffic &&
          traffic.source === "AITDK" &&
          traffic.metric === "visits" &&
          traffic.scope === "worldwide-all-devices-domain"
        ) {
          const released = checked(
            await db
              .from("charts_source_months")
              .select("month")
              .eq("source", traffic.source)
              .eq("month", traffic.month)
              .eq("demo", app.demo)
              .eq("accepted", true)
              .maybeSingle(),
          );
          if (released)
            reusable = {
              state: "verified",
              traffic_id: traffic.id,
              raw_text: prior.raw_text,
              extracted: prior.extracted,
              reviewed_at: prior.reviewed_at,
              review_channel: "Reused same-source reviewed record",
              review_reference: `traffic-version:${traffic.id}`,
              review_note:
                "An exact image and peer match reuses an already reviewed, currently usable record. This is not an independent measurement.",
            };
        }
      }
      const id = randomUUID(),
        key = `${user!.id}/${app.id}/${id}.${meta.format}`;
      checked(
        await db.storage
          .from("charts-evidence")
          .upload(key, buffer, { contentType: file.type, upsert: false }),
      );
      const inserted = await db
        .from("charts_evidence")
        .insert({
          id,
          application_id: app.id,
          owner_id: user!.id,
          peer_domain: peer,
          storage_path: key,
          file_hash: hash,
          original_name: file.name.slice(0, 200),
          demo: app.demo,
          ...(reusable ?? {}),
        })
        .select()
        .single();
      if (inserted.error) {
        await db.storage.from("charts-evidence").remove([key]);
        throw new Error(inserted.error.message);
      }
      if (!reusable)
        checked(
          await db.from("charts_jobs").insert({
            kind: "ocr",
            owner_id: user!.id,
            payload: { evidence_id: id },
          }),
        );
      return NextResponse.json(
        { id, state: reusable ? "verified" : "pending_extraction" },
        { status: 201 },
      );
    }
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
        await db
          .from("charts_applications")
          .update({
            status: "submitted",
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", a.id)
          .in("status", ["draft", "needs_info"])
          .select()
          .single(),
      );
      return NextResponse.json(data);
    }
    if (route === "delete-evidence") {
      required();
      const e = checked(
        await db
          .from("charts_evidence")
          .select("*")
          .eq("id", b.id)
          .maybeSingle(),
      );
      if (!e || e.owner_id !== user!.id)
        throw new HttpError(404, "Evidence not found.");
      const a = await ownedApp(e.application_id);
      if (!["draft", "needs_info"].includes(a.status))
        throw new HttpError(409, "This application is not editable.");
      if (e.state === "verified")
        throw new HttpError(
          409,
          "Verified evidence is retained for provenance. Ask for a correction.",
        );
      checked(
        await db
          .from("charts_jobs")
          .delete()
          .eq("kind", "ocr")
          .contains("payload", { evidence_id: e.id }),
      );
      checked(await db.from("charts_evidence").delete().eq("id", e.id));
      checked(
        await db.storage.from("charts-evidence").remove([e.storage_path]),
      );
      return NextResponse.json({ ok: true });
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
      if (b.remove)
        checked(
          await db
            .from("charts_follows")
            .delete()
            .eq("owner_id", u.id)
            .eq("target", b.target)
            .eq("kind", b.kind),
        );
      else {
        checked(
          await db.from("charts_follows").upsert({
            owner_id: u.id,
            target: b.target,
            kind: b.kind,
            email_enabled: !!b.email_enabled,
          }),
        );
        checked(
          await db
            .from("charts_jobs")
            .insert({ kind: "digest", owner_id: u.id, payload: {} }),
        );
      }
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
      const recent = checked(
        await db
          .from("charts_events")
          .select("id")
          .eq("project_id", p.id)
          .eq("kind", b.kind)
          .eq("visitor_id", visitor)
          .gte("created_at", since)
          .limit(1),
      );
      if (b.kind === "outbound" || !recent.length)
        checked(
          await db.from("charts_events").insert({
            kind: b.kind,
            project_id: p.id,
            visitor_id: visitor,
            surface: b.surface,
            session_id: session,
            excluded: !!reason,
            exclusion_reason: reason,
          }),
        );
      return NextResponse.json({ ok: true });
    }
    if (route.startsWith("admin/")) {
      admin();
      if (route === "admin/source-correction") {
        const id = checked(
          await db.rpc("charts_resolve_observation", {
            rid: b.id,
            actor: user!.id,
            reason: b.reason,
          }),
        );
        const value = checked(
          await db.from("charts_traffic").select("*").eq("id", id).single(),
        );
        const projects = checked(
          await db
            .from("charts_projects")
            .select("id")
            .eq("measurement_domain", value.domain),
        );
        const memberships = projects.length
          ? checked(
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
        for (const category of new Set(memberships.map((m) => m.category)))
          await createSnapshot(
            category,
            value.month,
            false,
            b.reason,
            value.source,
          );
        return NextResponse.json({ id });
      }
      if (route === "admin/verification-settings") {
        const old = checked(
          await db
            .from("charts_settings")
            .select("value")
            .eq("key", "verification")
            .single(),
        ).value;
        const domains = (b.domains ?? old.domains).map(
          (d: string) => normalizeWebsite(d).domain,
        );
        if (domains.length > 40)
          throw new HttpError(400, "At most 40 approved source domains.");
        const value = {
          ...old,
          enabled: !!b.enabled,
          source: PUBLIC_SOURCE,
          mode: b.mode === "library" ? "library" : "selected",
          domains,
        };
        checked(
          await db
            .from("charts_settings")
            .update({ value })
            .eq("key", "verification"),
        );
        return NextResponse.json({ ok: true });
      }
      if (route === "admin/verification") {
        const task = await queueVerification(db, {
          domain: normalizeWebsite(b.domain).domain,
          source: PUBLIC_SOURCE,
          month: b.month,
          priority: 10,
        });
        checked(
          await db
            .from("charts_verification_tasks")
            .update({
              state: "pending",
              attempts: 0,
              force_refresh: !!b.force_refresh,
              next_check_at: new Date().toISOString(),
            })
            .eq("id", task.id),
        );
        return NextResponse.json(task);
      }
      if (route === "admin/membership") {
        checked(
          await db.rpc("charts_review_membership", {
            pid: b.project_id,
            cat: b.category,
            decision: {
              state: b.state,
              placement: b.placement,
              basis: b.basis,
            },
            actor: user!.id,
          }),
        );
        const snapshots = checked(
          await db
            .from("charts_snapshots")
            .select("*")
            .eq("category", b.category),
        );
        const handled = new Set<string>();
        for (const snapshot of snapshots) {
          const key = `${snapshot.source}:${snapshot.month}:${snapshot.demo}`;
          if (handled.has(key)) continue;
          handled.add(key);
          await createSnapshot(
            b.category,
            snapshot.month,
            snapshot.demo,
            `Classification review: ${b.basis}`,
            snapshot.source,
          );
        }
        return NextResponse.json({ ok: true });
      }
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
              await db.rpc("charts_approve_discovery", {
                aid: a.id,
                actor: user!.id,
                reference: b.reference ?? "",
                pricing_confirmed: !!b.pricing_confirmed,
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
        const relation = checked(
          await db
            .from("charts_relations")
            .select("application_id")
            .eq("id", b.id)
            .single(),
        );
        const app = await ownedApp(relation.application_id);
        if (app.status === "approved")
          throw new HttpError(
            409,
            "Reviewed relationships are retained; submit an update instead.",
          );
        if (!["approved", "rejected"].includes(b.state))
          throw new HttpError(400, "Invalid relationship decision.");
        checked(
          await db
            .from("charts_relations")
            .update({ status: b.state, feedback: b.feedback ?? null })
            .eq("id", b.id),
        );
        return NextResponse.json({ ok: true });
      }
      if (route === "admin/evidence") {
        if (b.action === "invalid") {
          const existing = checked(
            await db
              .from("charts_evidence")
              .select("state")
              .eq("id", b.id)
              .single(),
          );
          if (existing.state === "verified")
            throw new HttpError(
              409,
              "Verified evidence requires a versioned correction, not removal.",
            );
          if (!b.note || b.note.length < 5)
            throw new HttpError(400, "Explain why the evidence is invalid.");
          checked(
            await db
              .from("charts_evidence")
              .update({
                state: "invalid",
                review_note: b.note,
                reviewed_by: user!.id,
                reviewed_at: new Date().toISOString(),
              })
              .eq("id", b.id),
          );
          return NextResponse.json({ ok: true });
        }
        return NextResponse.json(
          checked(
            await db.rpc("charts_verify_evidence", {
              eid: b.id,
              actor: user!.id,
              fields: b.fields,
              channel: b.channel ?? "",
              reference: b.reference ?? "",
              note: b.note ?? "",
              revision: !!b.revision,
            }),
          ),
        );
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
              official_source: b.reference || project.official_source,
              price_verified: !!b.price_verified,
              updated_at: new Date().toISOString(),
            })
            .eq("id", b.id),
        );
        return NextResponse.json({ ok: true });
      }
      if (route === "admin/snapshot")
        return NextResponse.json(
          await createSnapshot(
            b.category,
            b.month,
            !!b.demo,
            b.note ?? "",
            b.source ?? "AITDK",
          ),
        );
      if (route === "admin/month") {
        if (
          !/^20\d{2}-(0[1-9]|1[0-2])$/.test(b.month) ||
          typeof b.reference !== "string" ||
          b.reference.length < 8
        )
          throw new HttpError(
            400,
            "A valid month and publication reference are required.",
          );
        if (!b.demo && b.reference.startsWith("demo:"))
          throw new HttpError(
            400,
            "A demo publication reference cannot authorize real months.",
          );
        checked(
          await db.from("charts_source_months").upsert({
            source: "AITDK",
            month: b.month,
            published_at: new Date().toISOString(),
            accepted: !!b.accepted,
            reference: b.reference,
            demo: !!b.demo,
          }),
        );
        const accepted = checked(
          await db
            .from("charts_source_months")
            .select("month")
            .eq("source", "AITDK")
            .eq("demo", !!b.demo)
            .eq("accepted", true)
            .order("month", { ascending: false }),
        );
        if (accepted.length > 3)
          checked(
            await db
              .from("charts_source_months")
              .update({ accepted: false })
              .eq("source", "AITDK")
              .eq("demo", !!b.demo)
              .in(
                "month",
                accepted.slice(3).map((m) => m.month),
              ),
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
export { handle as GET, handle as POST, handle as DELETE };
