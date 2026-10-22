import { errorResponse } from "@/lib/api/response";
import { getOrCreateRequestId } from "@/lib/api/request-id";
import { isFeaturedSignalCommercialFlowEnabled } from "@/lib/payments/feature-flags";
import type { ProblemDetail } from "@/lib/api/problem";

const INSTANCE = "/api/payments/featured-signals/checkout";

function commercialFlowDisabledProblem(requestId: string): ProblemDetail {
  return {
    type: "https://123charts.com/problems/commercial-flow-disabled",
    title: "Featured Signals checkout is disabled",
    status: 503,
    detail: "Commercial checkout is not enabled for this environment.",
    instance: INSTANCE,
    request_id: requestId,
  };
}

export async function POST() {
  const requestId = getOrCreateRequestId();

  // PR51 is a disabled boundary shell only. Even if future flags are set,
  // checkout execution remains unimplemented until a separate human checkpoint.
  if (!isFeaturedSignalCommercialFlowEnabled()) {
    return errorResponse(commercialFlowDisabledProblem(requestId), requestId);
  }

  return errorResponse(commercialFlowDisabledProblem(requestId), requestId);
}

export async function GET() {
  const requestId = getOrCreateRequestId();
  return errorResponse(commercialFlowDisabledProblem(requestId), requestId);
}
