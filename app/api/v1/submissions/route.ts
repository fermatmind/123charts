import { NextRequest } from "next/server";
import { POST as submit } from "@/app/api/charts/[...path]/route";
export async function POST(r: NextRequest) {
  const body = await r.json();
  const route = body.action === "draft" ? "draft" : "submit";
  return submit(
    new NextRequest(r.url, {
      method: "POST",
      headers: r.headers,
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ path: [route] }) },
  );
}
