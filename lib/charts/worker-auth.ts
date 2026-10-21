import { createHmac, timingSafeEqual } from "node:crypto";
export function workerSignature(timestamp: string) {
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
    .update("123charts-cache:" + timestamp)
    .digest("hex");
}
export function validWorker(timestamp: string, signature: string) {
  if (
    !timestamp ||
    Math.abs(Date.now() - Number(timestamp)) > 30000 ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  )
    return false;
  const expected = Buffer.from(workerSignature(timestamp));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(expected, actual);
}
