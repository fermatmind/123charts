import { NextResponse } from "next/server";
import type { ProblemDetail } from "./problem";

const PROBLEM_JSON = "application/problem+json";

interface SuccessEnvelope<T = unknown> {
  ok: true;
  service: string;
  data: T;
  request_id: string;
}

interface ErrorEnvelope {
  ok: false;
  service: string;
  error: ProblemDetail;
}

export function success<T>(
  data: T,
  requestId: string,
  status = 200
): NextResponse<SuccessEnvelope<T>> {
  return NextResponse.json(
    {
      ok: true,
      service: "123charts-web",
      data,
      request_id: requestId,
    },
    { status }
  );
}

export function errorResponse(
  problem: ProblemDetail,
  requestId?: string
): NextResponse<ErrorEnvelope> {
  const body: ErrorEnvelope = {
    ok: false,
    service: "123charts-web",
    error: {
      ...problem,
      request_id: problem.request_id ?? requestId,
    },
  };

  return NextResponse.json(body, {
    status: problem.status,
    headers: {
      "Content-Type": PROBLEM_JSON,
    },
  });
}

export function noContent(requestId: string): NextResponse<null> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "x-request-id": requestId,
    },
  });
}
