import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { context, checked } from "./server";
import { eventExclusion } from "./events";
const uuid = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
export async function officialDestination(id: string) {
  if (!uuid.test(id)) return null;
  return checked(
    await (
      await context()
    ).db
      .from("charts_projects")
      .select("id,website_url,name,demo,controller_id")
      .eq("id", id)
      .eq("publication", "published")
      .maybeSingle(),
  );
}
export async function outboundGet(request: NextRequest) {
  const p = await officialDestination(
    request.nextUrl.searchParams.get("product_id") || "",
  );
  if (!p)
    return NextResponse.json(
      { error: "Public product not found" },
      { status: 404 },
    );
  const url = new URL(p.website_url);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    return NextResponse.json(
      { error: "Invalid saved official URL" },
      { status: 400 },
    );
  if (p.demo)
    return new NextResponse(
      "Fictional local demonstration. No external website is operated for this example.",
      { headers: { "X-Robots-Tag": "noindex", "Content-Type": "text/plain" } },
    );
  return NextResponse.redirect(url, 302);
}
export async function outboundPost(request: NextRequest) {
  try {
    if (
      request.headers.get("origin") !==
      new URL(process.env.APP_URL || request.url).origin
    )
      return NextResponse.json(
        { error: "Same-origin request required" },
        { status: 403 },
      );
    const raw = await request.text();
    if (raw.length > 4096)
      return NextResponse.json({ error: "Event too large" }, { status: 413 });
    const b = JSON.parse(raw);
    if (
      !uuid.test(b.event_id || "") ||
      !uuid.test(b.product_id || "") ||
      !/^\/[a-z0-9/_-]{0,120}$/i.test(b.surface || "")
    )
      return NextResponse.json(
        { error: "Invalid click event" },
        { status: 400 },
      );
    const { db, user, isAdmin } = await context();
    const p = checked(
      await db
        .from("charts_projects")
        .select("id,controller_id")
        .eq("id", b.product_id)
        .eq("publication", "published")
        .maybeSingle(),
    );
    if (!p)
      return NextResponse.json(
        { error: "Public product not found" },
        { status: 404 },
      );
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
            .eq("owner_id", user.id)
            .eq("project_id", p.id)
            .eq("state", "approved")
            .limit(1),
        )
      : [];
    const reason = eventExclusion(
      request.headers.get("user-agent") || "",
      b.automated === true,
      !!(user && (isAdmin || p.controller_id === user.id || claim.length)),
    );
    const saved = await db.from("charts_events").insert({
      event_id: b.event_id,
      kind: "outbound",
      project_id: p.id,
      visitor_id: visitor,
      session_id: visitor,
      surface: b.surface,
      excluded: !!reason,
      exclusion_reason: reason,
    });
    if (saved.error && saved.error.code !== "23505") throw saved.error;
    return NextResponse.json({
      recorded: true,
      duplicate: saved.error?.code === "23505",
    });
  } catch {
    return NextResponse.json({ recorded: false }, { status: 202 });
  } // Metrics never own the navigation path.
}
