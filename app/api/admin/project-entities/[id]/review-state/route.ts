import { checkAdminGuard } from "@/lib/auth/admin";
import {
  buildReviewedFieldsPayload,
  parseReviewStateForm,
  reviewDecisionForLifecycle,
  reviewStateForLifecycle,
} from "@/lib/admin/review-state";
import { errorResponse } from "@/lib/api/response";
import { badRequest, forbidden, methodNotAllowed, serviceUnavailable } from "@/lib/api/problem";
import { getOrCreateRequestId } from "@/lib/api/request-id";
import { getAdminClient } from "@/lib/supabase/admin-server";
import { NextResponse } from "next/server";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const requestId = getOrCreateRequestId();
  const instance = `/api/admin/project-entities/${params.id}/review-state`;
  const guard = await checkAdminGuard();

  if (!guard.isAdmin) {
    return errorResponse(forbidden("Admin privileges required.", instance, requestId), requestId);
  }

  const client = getAdminClient();
  if (!client) {
    return errorResponse(serviceUnavailable("Admin service is not configured.", instance, requestId), requestId);
  }

  let input;
  try {
    input = parseReviewStateForm(await request.formData());
  } catch (error) {
    return errorResponse(
      badRequest(error instanceof Error ? error.message : "Invalid review state request.", instance, undefined, requestId),
      requestId,
    );
  }

  const { data: entity, error: entityError } = await client
    .from("project_entities")
    .select("id, lifecycle_status, review_state")
    .eq("id", params.id)
    .single();

  if (entityError || !entity) {
    return errorResponse(badRequest("Project entity was not found.", instance, undefined, requestId), requestId);
  }

  const nextReviewState = reviewStateForLifecycle(input.nextState);
  const reviewedFields = buildReviewedFieldsPayload({
    previousLifecycle: entity.lifecycle_status,
    previousReviewState: entity.review_state,
    input,
    reviewer: { userId: guard.userId, email: guard.userEmail },
  });

  const { error: updateError } = await client
    .from("project_entities")
    .update({
      lifecycle_status: input.nextState,
      review_state: nextReviewState,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id);

  if (updateError) {
    return errorResponse(badRequest(updateError.message, instance, undefined, requestId), requestId);
  }

  const { error: insertError } = await client.from("review_decisions").insert({
    project_entity_id: params.id,
    review_state: nextReviewState,
    decision: reviewDecisionForLifecycle(input.nextState),
    reviewer_ref: guard.userId ?? null,
    decision_reason: input.decisionReason,
    reviewed_fields: reviewedFields,
  });

  if (insertError) {
    return errorResponse(badRequest(insertError.message, instance, undefined, requestId), requestId);
  }

  return NextResponse.redirect(new URL("/admin/bulk-review?updated=1", request.url), 303);
}

export async function GET(request: Request) {
  const requestId = getOrCreateRequestId();
  return errorResponse(
    methodNotAllowed("GET is not supported. Use POST.", "/api/admin/project-entities/review-state", requestId),
    requestId,
  );
}
