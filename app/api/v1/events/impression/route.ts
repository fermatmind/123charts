import { NextRequest } from "next/server";
import { POST as event } from "@/app/api/charts/[...path]/route";
export async function POST(r: NextRequest) {
  const body = await r.json();
  return event(
    new NextRequest(r.url, {
      method: "POST",
      headers: r.headers,
      body: JSON.stringify({ ...body, kind: "impression" }),
    }),
    { params: Promise.resolve({ path: ["event"] }) },
  );
}
