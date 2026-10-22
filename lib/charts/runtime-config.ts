type Environment = Record<string, string | undefined>;
export function publicIndexing(env: Environment) {
  return (
    env.CHARTS_LOCAL_PREVIEW === "false" && env.CHARTS_RUNTIME === "production"
  );
}
const loopback = (url: URL) =>
  ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
export function databaseEndpoint(env: Environment) {
  const value = env.SUPABASE_INTERNAL_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value || !env.SUPABASE_SERVICE_ROLE_KEY)
    throw Error("Supabase configuration is missing.");
  const url = new URL(value);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw Error(
      "Supabase endpoint must be an origin without credentials or path.",
    );
  if (env.CHARTS_LOCAL_PREVIEW !== "false") {
    if (!loopback(url))
      throw Error("Local preview refuses non-local database connections.");
  } else if (
    !["production", "staging"].includes(env.CHARTS_RUNTIME || "") ||
    url.origin !== env.CHARTS_DATABASE_ORIGIN
  ) {
    throw Error(
      "Deployed runtime requires an explicit mode and matching database origin.",
    );
  }
  if (!["http:", "https:"].includes(url.protocol))
    throw Error("Invalid database protocol.");
  return url.origin;
}
export function workerConfiguration(env: Environment) {
  const endpoint = databaseEndpoint(env);
  const local = env.CHARTS_LOCAL_PREVIEW !== "false";
  const publicUrl = new URL(env.APP_URL || "http://127.0.0.1:3100");
  const webUrl = new URL(env.CHARTS_INTERNAL_WEB_URL || publicUrl.origin);
  if (
    !local &&
    (!env.CHARTS_INTERNAL_WEB_URL ||
      !env.CHARTS_SMTP_HOST ||
      !env.CHARTS_MAIL_FROM ||
      !env.CHARTS_WORKER_HEALTH_FILE)
  )
    throw Error(
      "Deployed worker requires Web, SMTP, sender and health-file configuration.",
    );
  const secure = env.CHARTS_SMTP_SECURE === "true";
  return {
    endpoint,
    publicUrl: publicUrl.origin,
    webUrl: webUrl.origin,
    from: env.CHARTS_MAIL_FROM || "123Charts <updates@123charts.local>",
    mail: {
      host: env.CHARTS_SMTP_HOST || "127.0.0.1",
      port: Number(env.CHARTS_SMTP_PORT || (local ? 54325 : 587)),
      secure,
      requireTLS: !local && !secure,
      ...(env.CHARTS_SMTP_USER
        ? {
            auth: {
              user: env.CHARTS_SMTP_USER,
              pass: env.CHARTS_SMTP_PASSWORD || "",
            },
          }
        : {}),
    },
  };
}
