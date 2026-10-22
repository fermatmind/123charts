import fs from "node:fs/promises";
import { brand } from "@/lib/charts/brand";
import { localText } from "@/lib/charts/navigation";
import path from "node:path";
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { adminDb, checked } from "@/lib/charts/server";
import {
  priceLabel,
  sustainedFree,
  profileReady,
} from "@/lib/charts/discovery";
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
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("publication", "published")
      .eq("demo", demo)
      .maybeSingle(),
  );
  if (!p || !profileReady(p))
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
  let task = localText(p.task, zh ? "zh" : "en");
  if (kind === "alternative") {
    const edges = checked(
      await db
        .from("competitor_relations")
        .select("task")
        .eq("candidate_id", p.id)
        .eq("demo", demo)
        .limit(1),
    );
    const found = edges.length > 0;
    if (found) task = localText(edges[0].task, zh ? "zh" : "en");
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
          fontSize: 16,
          color: "#9badca",
          marginTop: 12,
        }}
      >
        {brand[zh ? "zh" : "en"].positioning}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 40,
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
            : brand[zh ? "zh" : "en"].listed}
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
          localText(p.conditions, zh ? "zh" : "en") ||
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
        <span>{`123charts.com/${zh ? "zh" : "en"}/products/${p.slug}`}</span>
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
