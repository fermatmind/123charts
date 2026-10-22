export async function waitForLocalServices(url, key, options = {}) {
  if (!key) throw Error("Missing local credentials. Run npm run local:setup.");
  const origin = new URL(url);
  if (
    origin.protocol !== "http:" ||
    !["127.0.0.1", "localhost"].includes(origin.hostname)
  )
    throw Error("Local readiness checks refuse a remote database.");
  const request = options.fetch || fetch;
  const pause =
    options.pause ||
    (() => new Promise((resolve) => setTimeout(resolve, 1500)));
  for (let attempt = 0; attempt < (options.attempts || 40); attempt++) {
    try {
      const responses = await Promise.all(
        [
          "/auth/v1/admin/users?page=1&per_page=1",
          "/rest/v1/charts_categories?select=slug&limit=1",
        ].map((route) =>
          request(origin.origin + route, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
            signal: AbortSignal.timeout(3000),
          }),
        ),
      );
      if (responses.every((r) => r.ok)) return;
    } catch {}
    await pause();
  }
  throw Error(
    "Local Auth/data services are not ready. Retry npm run local:setup; no reset is required.",
  );
}
