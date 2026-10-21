import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { adminDb, checked } from "@/lib/charts/server";
import { priceLabel, sustainedFree } from "@/lib/charts/discovery";
export const runtime = "nodejs";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params,
    db = adminDb();
  const demo = request.nextUrl.searchParams.get("dataset") === "demo";
  const p = checked(
    await db
      .from("charts_projects")
      .select("*")
      .eq("id", id)
      .eq("publication", "published")
      .eq("demo", demo)
      .maybeSingle(),
  );
  if (!p)
    return NextResponse.json(
      { error: "Published project not found" },
      { status: 404 },
    );
  const zh = request.nextUrl.searchParams.get("lang") === "zh",
    kind = request.nextUrl.searchParams.get("kind") || "listing";
  const label = (en: string, cn: string) => (zh ? cn : en);
  if (!["listing", "free", "alternative"].includes(kind))
    return NextResponse.json(
      {
        error:
          "Only factual listing, free condition and reviewed alternative cards are available in this MVP.",
      },
      { status: 400 },
    );
  if (kind === "free" && !sustainedFree(p))
    return NextResponse.json(
      { error: "Confirmed sustained free conditions required" },
      { status: 409 },
    );
  let task = p.task;
  if (kind === "alternative") {
    const edges = checked(
      await db
        .from("charts_relations")
        .select("task,peer_domain,project_id,charts_applications!inner(status)")
        .eq("charts_applications.status", "approved")
        .eq("status", "approved")
        .is("withdrawn_at", null)
        .or(`project_id.eq.${p.id},peer_domain.eq.${p.domain}`),
    );
    let found = false;
    for (const e of edges) {
      const other = checked(
        await db
          .from("charts_projects")
          .select("id")
          .eq("publication", "published")
          .eq("demo", demo)
          .neq("id", p.id)
          .eq(
            e.project_id === p.id ? "domain" : "id",
            e.project_id === p.id ? e.peer_domain : e.project_id,
          )
          .maybeSingle(),
      );
      if (other) {
        task = e.task;
        found = true;
        break;
      }
    }
    if (!found)
      return NextResponse.json(
        { error: "A confirmed public alternative relationship is required" },
        { status: 409 },
      );
  }
  const c = checked(
    await db
      .from("charts_categories")
      .select("*")
      .eq("slug", p.category)
      .single(),
  );
  const font = await fs.readFile(
    path.join(process.cwd(), ".local/fonts/preview-unicode.ttf"),
  );
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#0b0e15",
        color: "#eef2ff",
        padding: 58,
        flexDirection: "column",
        fontFamily: "PreviewUnicode",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 25,
        }}
      >
        <strong>123Charts</strong>
        <span style={{ color: "#9badca", fontSize: 19 }}>
          {demo
            ? label("FICTIONAL DEMONSTRATION", "虚构演示样本")
            : label("PUBLIC WEBSITE LISTING", "公开网站收录")}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 66,
          color: "#86aaf2",
          fontSize: 22,
        }}
      >
        {kind === "alternative"
          ? label("Another way to " + task, "完成「" + task + "」的另一种选择")
          : kind === "free"
            ? label(
                "A choice with confirmed free conditions",
                "具备已确认免费条件的选择",
              )
            : label(
                "We’re on 123Charts. See where we fit.",
                "已加入 123Charts，看看适合哪些用途。",
              )}
      </div>
      <div style={{ display: "flex", fontSize: 68, marginTop: 22 }}>
        {p.name}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 27,
          color: "#b5c1d6",
          marginTop: 16,
        }}
      >
        {task || label("Purpose being maintained", "用途资料待完善")}
      </div>
      <div style={{ display: "flex", fontSize: 21, marginTop: 26, gap: 25 }}>
        <span>{zh ? c.name_zh : c.name_en}</span>
        <span>{priceLabel(p, zh)}</span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 18,
          color: "#8f9db4",
          marginTop: 18,
        }}
      >
        {(
          p.conditions ||
          label(
            "Check current conditions on the official website.",
            "请前往官网确认当前使用条件。",
          )
        ).slice(0, 150)}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          justifyContent: "space-between",
          fontSize: 19,
          color: "#9badca",
        }}
      >
        <span>{`123charts.com/${zh ? "zh" : "en"}/projects/${p.slug}`}</span>
        <span>
          {label("Profile updated ", "资料更新 ") + p.updated_at.slice(0, 10)}
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "PreviewUnicode", data: font, weight: 400 }],
      headers: {
        "X-Robots-Tag": "noindex",
        "Cache-Control": "no-store",
        "Content-Disposition": `inline; filename="123charts-${p.slug}-${kind}.png"`,
      },
    },
  );
}
