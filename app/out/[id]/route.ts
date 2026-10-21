import { eventExclusion } from "@/lib/charts/events";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { context, checked } from "@/lib/charts/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params,
    { db, user, isAdmin } = await context();
  const p = checked(
    await db
      .from("charts_projects")
      .select("id,website_url,demo,controller_id,name")
      .eq("id", id)
      .eq("publication", "published")
      .maybeSingle(),
  );
  if (!p)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const jar = await cookies();
  let visitor = jar.get("charts_visitor")?.value;
  if (!visitor || !/^[0-9a-f-]{36}$/i.test(visitor)) {
    visitor = randomUUID();
    jar.set("charts_visitor", visitor, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 31536000,
      path: "/",
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
    false,
    !!(user && (isAdmin || p.controller_id === user.id || claim.length)),
  );
  const rawSurface = request.nextUrl.searchParams.get("surface") ?? "/projects";
  const surface = /^\/[a-z0-9/_-]{0,120}$/i.test(rawSurface)
    ? rawSurface
    : "/projects";
  checked(
    await db.from("charts_events").insert({
      project_id: p.id,
      kind: "outbound",
      visitor_id: visitor,
      session_id: visitor,
      surface,
      excluded: !!reason,
      exclusion_reason: reason,
    }),
  );
  // A fictional project has no external website. Still record the attempted outbound click honestly.
  if (p.demo) {
    const zh = request.nextUrl.searchParams.get("lang") === "zh";
    return new NextResponse(
      `<!doctype html><html lang="${zh ? "zh" : "en"}"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width"><title>123Charts · Demo destination</title><body style="background:#0b0c10;color:#edf2ff;font:16px system-ui;padding:10vw;line-height:1.9"><h1>${zh ? "演示项目没有真实官网" : "This demonstration has no real website."}</h1><p>${zh ? "此项目为虚构演示样本。出站点击尝试已记录，不代表目标页面成功加载。" : "This is a fictional project. The outbound click attempt was recorded; it does not represent a loaded destination."}</p><a style="color:#a7c0ff" href="/${zh ? "zh" : "en"}/dashboard">${zh ? "返回工作台" : "Back to workspace"}</a></body></html>`,
      {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Robots-Tag": "noindex",
          "Cache-Control": "no-store",
        },
      },
    );
  }
  const url = new URL(p.website_url);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    return NextResponse.json(
      { error: "Invalid official URL" },
      { status: 400 },
    );
  return NextResponse.redirect(url, 302);
}
