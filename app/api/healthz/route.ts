import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "123charts-web",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
