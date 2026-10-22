import type { ProblemDetail } from "@/lib/api/problem";

export function publicApiDisabledProblem(
  instance: string,
  requestId: string
): ProblemDetail {
  return {
    type: "https://123charts.com/problems/public-api-disabled",
    title: "Public API is disabled",
    status: 503,
    detail: "The public API is not enabled for this environment.",
    instance,
    request_id: requestId,
  };
}
