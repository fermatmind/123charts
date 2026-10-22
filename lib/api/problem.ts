export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  request_id?: string;
  errors?: Record<string, string[]>;
}

const PROBLEM_BASE =
  process.env.APP_URL ?? "http://localhost:3000";

function problem(
  status: number,
  title: string,
  detail: string,
  instance?: string,
  errors?: Record<string, string[]>,
  request_id?: string
): ProblemDetail {
  return {
    type: `${PROBLEM_BASE}/docs/api-errors#${title.toLowerCase().replace(/\s+/g, "-")}`,
    title,
    status,
    detail,
    instance: instance ?? "urn:123charts:api:v0",
    ...(request_id ? { request_id } : {}),
    ...(errors ? { errors } : {}),
  };
}

export function badRequest(
  detail: string,
  instance?: string,
  errors?: Record<string, string[]>,
  request_id?: string
): ProblemDetail {
  return problem(400, "Bad Request", detail, instance, errors, request_id);
}

export function notFound(
  detail: string,
  instance?: string,
  request_id?: string
): ProblemDetail {
  return problem(404, "Not Found", detail, instance, undefined, request_id);
}

export function methodNotAllowed(
  detail: string,
  instance?: string,
  request_id?: string
): ProblemDetail {
  return problem(405, "Method Not Allowed", detail, instance, undefined, request_id);
}

export function notAcceptable(
  detail: string,
  instance?: string,
  request_id?: string
): ProblemDetail {
  return problem(406, "Not Acceptable", detail, instance, undefined, request_id);
}

export function conflict(
  detail: string,
  instance?: string,
  request_id?: string
): ProblemDetail {
  return problem(409, "Conflict", detail, instance, undefined, request_id);
}

export function tooManyRequests(
  detail: string,
  instance?: string,
  request_id?: string
): ProblemDetail {
  return problem(429, "Too Many Requests", detail, instance, undefined, request_id);
}

export function internalError(
  detail: string,
  instance?: string,
  request_id?: string
): ProblemDetail {
  return problem(500, "Internal Server Error", detail, instance, undefined, request_id);
}

export function serviceUnavailable(
  detail: string,
  instance?: string,
  request_id?: string
): ProblemDetail {
  return problem(503, "Service Unavailable", detail, instance, undefined, request_id);
}

export function forbidden(
  detail: string,
  instance?: string,
  request_id?: string
): ProblemDetail {
  return problem(403, "Forbidden", detail, instance, undefined, request_id);
}

export function unauthorized(
  detail: string,
  instance?: string,
  request_id?: string
): ProblemDetail {
  return problem(401, "Unauthorized", detail, instance, undefined, request_id);
}

export function payloadTooLarge(
  detail: string,
  instance?: string,
  request_id?: string
): ProblemDetail {
  return problem(413, "Payload Too Large", detail, instance, undefined, request_id);
}
