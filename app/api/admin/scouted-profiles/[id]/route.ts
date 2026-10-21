import { NextRequest } from "next/server";
import { checkAdminGuard } from "@/lib/auth/admin";
import { getOrCreateRequestId } from "@/lib/api/request-id";
import { success, errorResponse } from "@/lib/api/response";
import { badRequest, forbidden, methodNotAllowed, notFound, unauthorized } from "@/lib/api/problem";
import {
  isScoutedReviewAction,
  isScoutedIntentType,
} from "@/lib/scouted/profile-engine";
import {
  getScoutedProfileById,
  recordScoutedIntent,
  reviewScoutedProfile,
} from "@/lib/scouted/admin-queries";
import { insertAuditEvent } from "@/lib/admin/review-queries";

async function requireAdmin(requestId: string, instance: string) {
  const guard = await checkAdminGuard();
  if (!guard.isAuthenticated) {
    return {
      error: errorResponse(unauthorized("Authentication required.", instance, requestId), requestId),
      guard: null,
    };
  }
  if (!guard.isAdmin) {
    return {
      error: errorResponse(forbidden("Admin privileges required.", instance, requestId), requestId),
      guard: null,
    };
  }
  return { error: null, guard };
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const requestId = getOrCreateRequestId();
  const instance = `/api/admin/scouted-profiles/${params.id}`;
  const { error, guard } = await requireAdmin(requestId, instance);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(badRequest("Request body must be valid JSON.", instance, undefined, requestId), requestId);
  }

  const profile = await getScoutedProfileById(params.id);
  if (!profile) {
    return errorResponse(notFound("Scouted profile not found.", instance, requestId), requestId);
  }

  const action = typeof body === "object" && body ? (body as { action?: unknown }).action : undefined;
  const intentType = typeof body === "object" && body ? (body as { intent_type?: unknown }).intent_type : undefined;

  if (isScoutedReviewAction(action)) {
    const ok = await reviewScoutedProfile(params.id, action, guard!.userId ?? "unknown");
    if (!ok) {
      return errorResponse(badRequest("Scouted profile review action failed.", instance, undefined, requestId), requestId);
    }
    await insertAuditEvent(
      `scouted_profile_${action}`,
      "admin_scouted_review",
      { scouted_profile_id: params.id, reviewer: guard!.userId ?? "unknown" },
      requestId
    );
    return success({ message: `Scouted profile ${action} recorded. No public release side effect was executed.` }, requestId);
  }

  if (isScoutedIntentType(intentType)) {
    const payloadSummary =
      typeof body === "object" && body && typeof (body as { payload_summary?: unknown }).payload_summary === "object"
        ? ((body as { payload_summary: Record<string, unknown> }).payload_summary ?? {})
        : {};
    const ok = await recordScoutedIntent(params.id, intentType, payloadSummary);
    if (!ok) {
      return errorResponse(badRequest("Scouted profile intent could not be recorded.", instance, undefined, requestId), requestId);
    }
    await insertAuditEvent(
      `scouted_profile_intent_${intentType}`,
      "admin_scouted_review",
      { scouted_profile_id: params.id, intent_type: intentType, reviewer: guard!.userId ?? "unknown" },
      requestId
    );
    return success({ message: `Scouted profile ${intentType} intent recorded for admin review.` }, requestId);
  }

  return errorResponse(badRequest("Unsupported scouted profile action.", instance, undefined, requestId), requestId);
}

export async function GET() {
  const requestId = getOrCreateRequestId();
  return errorResponse(methodNotAllowed("GET is not supported. Use the admin page.", "/api/admin/scouted-profiles", requestId), requestId);
}

export async function PUT() {
  const requestId = getOrCreateRequestId();
  return errorResponse(methodNotAllowed("PUT is not supported. Use PATCH.", "/api/admin/scouted-profiles", requestId), requestId);
}

export async function DELETE() {
  const requestId = getOrCreateRequestId();
  return errorResponse(methodNotAllowed("DELETE is not supported.", "/api/admin/scouted-profiles", requestId), requestId);
}
