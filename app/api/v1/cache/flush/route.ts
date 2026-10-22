import { NextRequest, NextResponse } from "next/server";
import { validWorker } from "@/lib/charts/worker-auth";
import { flushCatalog } from "@/lib/charts/catalog";
export async function POST(r: NextRequest) {
  if (
    !validWorker(
      r.headers.get("x-charts-time") || "",
      r.headers.get("x-charts-signature") || "",
    )
  )
    return NextResponse.json(
      { error: "Worker authentication required" },
      { status: 403 },
    );
  return NextResponse.json(await flushCatalog());
}
