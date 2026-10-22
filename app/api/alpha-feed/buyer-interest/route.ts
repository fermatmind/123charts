import { NextResponse } from "next/server";

const PROBLEM_JSON = "application/problem+json";

const disabledProblem = {
  type: "https://123charts.com/problems/data-buyer-interest-disabled",
  title: "Data buyer interest is disabled",
  status: 503,
  detail: "Alpha Feed buyer interest collection is not enabled for this environment.",
};

function disabledResponse() {
  return NextResponse.json(disabledProblem, {
    status: disabledProblem.status,
    headers: {
      "Content-Type": PROBLEM_JSON,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  return disabledResponse();
}

export async function POST() {
  return disabledResponse();
}
