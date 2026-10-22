const REQUEST_ID_HEADER = "x-request-id";
export function generateRequestId(): string { return crypto.randomUUID(); }
export function getIncomingRequestId(incoming?: Headers): string | null {
 for (const key of ["x-request-id", "x-amzn-trace-id", "cf-ray"]) { const value=incoming?.get(key); if(value)return value; }return null;
}
export function getOrCreateRequestId(incoming?: Headers): string {return getIncomingRequestId(incoming) ?? generateRequestId();}
export { REQUEST_ID_HEADER };
