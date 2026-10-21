import { NextRequest } from "next/server";
import { POST as review } from "@/app/api/charts/[...path]/route";
export async function POST(
  r: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params,
    body = await r.json();
  return review(
    new NextRequest(r.url, {
      method: "POST",
      headers: r.headers,
      body: JSON.stringify({ ...body, id }),
    }),
    { params: Promise.resolve({ path: ["admin", "application"] }) },
  );
}
