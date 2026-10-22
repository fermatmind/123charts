import { NextRequest } from "next/server";
import { LEGACY } from "@/lib/legacy-identifiers";
import { getOrCreateRequestId } from "@/lib/api/request-id";
import { success, errorResponse } from "@/lib/api/response";
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  serviceUnavailable,
} from "@/lib/api/problem";
import {
  isConversionMetricKey,
  normalizeCountDelta,
  normalizeMetricSurface,
  recordConversionMetric,
} from "@/lib/metrics/conversion-metrics";

const WRITE_KEY_HEADER = "x-123charts-metrics-key";

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId();
  const instance = "/api/metrics/conversion";
  const writeKey = process.env.INTERNAL_METRICS_WRITE_KEY;

  if (!writeKey) {
    return errorResponse(
      serviceUnavailable("Metrics write route is not configured.", instance, requestId),
      requestId
    );
  }

  if ((request.headers.get(WRITE_KEY_HEADER) ?? request.headers.get(LEGACY.metricsHeader)) !== writeKey) {
    return errorResponse(
      forbidden("Metrics write route requires an internal server key.", instance, requestId),
      requestId
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      badRequest("Request body must be valid JSON.", instance, undefined, requestId),
      requestId
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse(
      badRequest("Request body must be an object.", instance, undefined, requestId),
      requestId
    );
  }

  const keys = Object.keys(body);
  const allowedKeys = ["metric_key", "surface", "count_delta"];
  const unknownKeys = keys.filter((key) => !allowedKeys.includes(key));
  if (unknownKeys.length > 0) {
    return errorResponse(
      badRequest("Unknown metrics payload fields are not accepted.", instance, undefined, requestId),
      requestId
    );
  }

  const payload = body as Record<string, unknown>;
  if (!isConversionMetricKey(payload.metric_key)) {
    return errorResponse(
      badRequest("Unsupported conversion metric key.", instance, undefined, requestId),
      requestId
    );
  }

  const surface = normalizeMetricSurface(payload.surface);
  if (!surface) {
    return errorResponse(
      badRequest("Metric surface must be a local path without query parameters.", instance, undefined, requestId),
      requestId
    );
  }

  const result = await recordConversionMetric({
    metric_key: payload.metric_key,
    surface,
    count_delta: normalizeCountDelta(payload.count_delta),
  });

  if (!result.ok) {
    return errorResponse(
      serviceUnavailable("Conversion metric could not be recorded.", instance, requestId),
      requestId
    );
  }

  return success({ message: "Conversion metric recorded." }, requestId, 201);
}

export async function GET() {
  const requestId = getOrCreateRequestId();
  return errorResponse(
    methodNotAllowed("GET is not supported. Use POST from server-side instrumentation only.", "/api/metrics/conversion", requestId),
    requestId
  );
}

export async function PUT() {
  const requestId = getOrCreateRequestId();
  return errorResponse(
    methodNotAllowed("PUT is not supported. Use POST.", "/api/metrics/conversion", requestId),
    requestId
  );
}

export async function DELETE() {
  const requestId = getOrCreateRequestId();
  return errorResponse(
    methodNotAllowed("DELETE is not supported.", "/api/metrics/conversion", requestId),
    requestId
  );
}
