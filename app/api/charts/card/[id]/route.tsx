import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { adminDb, checked } from "@/lib/charts/server";
export const runtime = "nodejs";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params,
    db = adminDb();
  const p = checked(
    await db
      .from("charts_projects")
      .select("*")
      .eq("id", id)
      .eq("publication", "published")
      .maybeSingle(),
  );
  if (!p)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const demo = request.nextUrl.searchParams.get("dataset") !== "real";
  if (!demo && p.demo)
    return NextResponse.json(
      { error: "Demo project is not available in real dataset" },
      { status: 404 },
    );
  const wanted = request.nextUrl.searchParams.get("snapshot");
  let query = db.from("charts_snapshots").select("*").eq("demo", demo);
  if (!wanted) query = query.eq("category", p.category);
  if (wanted) query = query.eq("id", wanted);
  const snapshot = checked(
    await query
      .order("month", { ascending: false })
      .order("version", { ascending: false })
      .limit(1),
  )[0];
  const entry = snapshot?.entries.find(
    (x: { project_id: string }) => x.project_id === p.id,
  );
  const t = entry
    ? checked(
        await db
          .from("charts_traffic")
          .select("state")
          .eq("id", entry.traffic_id)
          .maybeSingle(),
      )
    : null;
  const rank =
    entry && entry.domain === p.measurement_domain && t?.state === "verified"
      ? entry
      : null;
  const category = checked(
    await db
      .from("charts_categories")
      .select("*")
      .eq("slug", rank ? snapshot.category : p.category)
      .single(),
  );
  const zh = request.nextUrl.searchParams.get("lang") === "zh";
  const font = await fs.readFile(
    path.join(process.cwd(), ".local/fonts/preview-unicode.ttf"),
  );
  // System font is copied locally by setup; it is never redistributed in Git.
  const label = (en: string, cn: string) => (zh ? cn : en);
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#0b0e15",
        color: "#eef2ff",
        padding: "60px",
        flexDirection: "column",
        fontFamily: "PreviewUnicode",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>
          123Charts
        </div>
        <div style={{ display: "flex", fontSize: 18, color: "#9cb6ef" }}>
          {demo
            ? label("DEMONSTRATION — SYNTHETIC DATA", "演示样本 · 模拟数据")
            : label("RESEARCH PROFILE", "项目研究资料")}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 70,
          fontSize: 70,
          letterSpacing: -2,
          fontWeight: 700,
        }}
      >
        {p.name}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 24,
          color: "#909eb9",
          marginTop: 12,
        }}
      >
        {p.domain}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 24,
          marginTop: 38,
          color: "#c5d2ef",
        }}
      >
        {zh ? category.name_zh : category.name_en}
      </div>
      {rank ? (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginTop: 16,
            gap: 18,
          }}
        >
          <span style={{ fontSize: 54 }}>#{rank.rank}</span>
          <span style={{ fontSize: 26, color: "#a9bde5" }}>
            {rank.raw_display ??
              Number(rank.value).toLocaleString(zh ? "zh-CN" : "en-US")}{" "}
            {label("monthly visits", "月访问量")}
          </span>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#a4b4d3",
            marginTop: 18,
          }}
        >
          {label(
            "Discover this project · No verified ranking",
            "发现这个项目 · 暂无核验排名",
          )}
        </div>
      )}
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          borderTop: "1px solid #2d374b",
          paddingTop: 20,
          fontSize: 16,
          color: "#8796b4",
          justifyContent: "space-between",
        }}
      >
        <span>
          {rank
            ? `${snapshot.month} · ${snapshot.source} · worldwide / all devices / domain · snapshot v${snapshot.version} · coverage ${snapshot.coverage_count}/${snapshot.total_count}`
            : label(
                "Free project discovery · Visit the official site for current details",
                "免费发现项目 · 最新资料请以官网为准",
              )}
        </span>
        <span>123charts.com</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "PreviewUnicode", data: font, weight: 400, style: "normal" },
      ],
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
        ...(request.nextUrl.searchParams.has("download")
          ? { "Content-Disposition": `attachment; filename="${p.slug}.png"` }
          : {}),
      },
    },
  );
}
