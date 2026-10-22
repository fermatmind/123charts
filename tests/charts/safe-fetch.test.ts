import test from "node:test";
import assert from "node:assert/strict";
import dns from "node:dns/promises";
import https from "node:https";
import http from "node:http";
import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { safeHtml, extractMetadata } from "../../lib/charts/safe-fetch";

type Reply = {
  status?: number;
  type?: string;
  location?: string;
  body?: string;
};
function transport(t: any, reply: (url: URL, options: any) => Reply) {
  const get = (input: URL, options: any, callback: any) => {
    const request = new EventEmitter() as any;
    request.setTimeout = () => request;
    request.destroy = (e: Error) => {
      queueMicrotask(() => request.emit("error", e));
      return request;
    };
    queueMicrotask(() => {
      try {
        const r = reply(new URL(String(input)), options);
        const response = Readable.from([Buffer.from(r.body || "")]) as any;
        response.statusCode = r.status ?? 200;
        response.headers = {
          "content-type": r.type || "text/html",
          ...(r.location ? { location: r.location } : {}),
        };
        callback(response);
      } catch (e) {
        request.emit("error", e);
      }
    });
    return request;
  };
  t.mock.method(https, "get", get);
  t.mock.method(http, "get", get);
}
function dnsReply(
  url: URL,
  data = "185.199.108.153",
  overrides: object = {},
): Reply {
  const type = Number(url.searchParams.get("type"));
  const name = url.searchParams.get("name")!;
  return {
    type: "application/json",
    body: JSON.stringify({
      Status: 0,
      Question: [{ name: name + ".", type }],
      Answer: type === 1 ? [{ type, name, data }] : [],
      ...overrides,
    }),
  };
}
function pinned(options: any) {
  let addresses: unknown;
  options.lookup("ignored", { all: true }, (error: any, result: any) => {
    assert.equal(error, null);
    addresses = result;
  });
  return addresses;
}
const html =
  "<title>Aider - AI Pair Programming</title><h1>Terminal coding</h1><p>Use a model to edit your code.</p>";

test("ordinary public DNS stays pinned without using a fallback resolver", async (t) => {
  const lookup = t.mock.method(dns, "lookup", async () => [
    { address: "8.8.4.4", family: 4 },
  ]);
  transport(t, (url, options) => {
    assert.equal(url.hostname, "tool.example");
    assert.deepEqual(pinned(options), [{ address: "8.8.4.4", family: 4 }]);
    return { body: html };
  });
  assert.equal((await safeHtml("https://tool.example")).html, html);
  assert.equal(lookup.mock.callCount(), 1);
});

test("proxy benchmark DNS is replaced by validated A/AAAA answers and an IP-pinned target", async (t) => {
  const lookup = t.mock.method(dns, "lookup", async () => [
    { address: "198.18.1.95", family: 4 },
  ]);
  const calls: string[] = [];
  transport(t, (url, options) => {
    calls.push(url.hostname);
    if (url.hostname === "dns.google") {
      assert.deepEqual(pinned(options), [{ address: "8.8.8.8", family: 4 }]);
      assert.equal(url.searchParams.get("edns_client_subnet"), "0.0.0.0/0");
      return dnsReply(url);
    }
    assert.equal(url.hostname, "aider.chat");
    assert.deepEqual(pinned(options), [
      { address: "185.199.108.153", family: 4 },
    ]);
    return { body: html };
  });
  assert.equal(
    extractMetadata((await safeHtml("https://aider.chat")).html).name,
    "Aider",
  );
  assert.equal(lookup.mock.callCount(), 1);
  assert.equal(calls.filter((x) => x === "dns.google").length, 2);
  assert.equal(calls.at(-1), "aider.chat");
});

test("private, mapped, mixed and literal benchmark targets never get a fallback or connection", async (t) => {
  let addresses = [{ address: "127.0.0.1", family: 4 }];
  t.mock.method(dns, "lookup", async () => addresses);
  transport(t, () => {
    throw Error("Unexpected connection");
  });
  for (const ip of [
    "127.0.0.1",
    "10.0.0.1",
    "169.254.169.254",
    "fc00::1",
    "::ffff:127.0.0.1",
  ]) {
    addresses = [{ address: ip, family: ip.includes(":") ? 6 : 4 }];
    await assert.rejects(safeHtml("https://tool.example"), /blocked/);
  }
  addresses = [
    { address: "8.8.8.8", family: 4 },
    { address: "198.18.1.95", family: 4 },
  ];
  await assert.rejects(safeHtml("https://tool.example"), /blocked/);
  for (const url of [
    "https://198.18.1.95",
    "http://[::1]",
    "http://169.254.169.254",
  ])
    await assert.rejects(safeHtml(url), /blocked/);
});

for (const scenario of [
  "private A",
  "private AAAA",
  "wrong question",
  "NXDOMAIN",
  "redirect",
  "malformed",
] as const) {
  test(`encrypted DNS fails closed: ${scenario}`, async (t) => {
    t.mock.method(dns, "lookup", async () => [
      { address: "198.18.1.95", family: 4 },
    ]);
    let targetRequests = 0;
    transport(t, (url) => {
      if (url.hostname !== "dns.google") {
        targetRequests++;
        return { body: html };
      }
      if (scenario === "redirect")
        return {
          status: 302,
          type: "application/json",
          location: "http://127.0.0.1",
        };
      if (scenario === "malformed")
        return { type: "application/json", body: "not JSON" };
      if (scenario === "private A") return dnsReply(url, "10.0.0.1");
      if (scenario === "private AAAA" && url.searchParams.get("type") === "28")
        return dnsReply(url, undefined, {
          Answer: [{ type: 28, data: "::ffff:127.0.0.1" }],
        });
      if (scenario === "wrong question")
        return dnsReply(url, undefined, {
          Question: [{ name: "other.example", type: 1 }],
        });
      if (scenario === "NXDOMAIN")
        return dnsReply(url, undefined, { Status: 3 });
      return dnsReply(url);
    });
    await assert.rejects(
      safeHtml("https://aider.chat"),
      /blocked|Public DNS|public DNS/,
    );
    assert.equal(targetRequests, 0);
  });
}

test("redirects to a private domain or IP are checked before any next socket opens", async (t) => {
  t.mock.method(dns, "lookup", async (host: string) => [
    { address: host === "tool.example" ? "8.8.8.8" : "10.0.0.1", family: 4 },
  ]);
  let next = "https://internal.example",
    requests = 0;
  transport(t, () => {
    requests++;
    return { status: 302, location: next };
  });
  for (const url of [
    "https://internal.example",
    "http://169.254.169.254/latest/meta-data",
    "http://[::1]",
  ]) {
    next = url;
    await assert.rejects(safeHtml("https://tool.example"), /blocked/);
  }
  assert.equal(requests, 3);
});

test("public redirects are separately resolved and pinned; redirect limit remains enforced", async (t) => {
  t.mock.method(dns, "lookup", async (host: string) => [
    { address: host === "tool.example" ? "8.8.8.8" : "1.1.1.1", family: 4 },
  ]);
  let loop = false;
  transport(t, (url, options) => {
    assert.deepEqual(pinned(options), [
      {
        address: url.hostname === "tool.example" ? "8.8.8.8" : "1.1.1.1",
        family: 4,
      },
    ]);
    return url.hostname === "tool.example" || loop
      ? { status: 302, location: "https://final.example" }
      : { body: html };
  });
  assert.equal(
    (await safeHtml("https://tool.example")).url,
    "https://final.example/",
  );
  loop = true;
  await assert.rejects(safeHtml("https://tool.example"), /Too many redirects/);
});

test("HTML type and 512 KB response limits remain enforced", async (t) => {
  t.mock.method(dns, "lookup", async () => [{ address: "8.8.8.8", family: 4 }]);
  let oversized = false;
  transport(t, () =>
    oversized
      ? { body: "x".repeat(524289) }
      : { type: "application/json", body: "{}" },
  );
  await assert.rejects(safeHtml("https://tool.example"), /did not return HTML/);
  oversized = true;
  await assert.rejects(safeHtml("https://tool.example"), /exceeds 512 KB/);
});

test("missing meta description uses an actual H1 intro, excludes scripts and does not invent copy", () => {
  assert.deepEqual(extractMetadata(html), {
    name: "Aider",
    description: "Use a model to edit your code.",
    description_source: "page_intro",
  });
  assert.equal(
    extractMetadata(
      "<title>Tool</title><h1>Tool</h1><script><p>fake</p></script><p>Real intro.</p>",
    ).description,
    "Real intro.",
  );
  assert.equal(
    extractMetadata(
      "<title>Tool</title><h1>Tool</h1><footer><p>Legal text</p></footer>",
    ).description,
    "",
  );
  assert.equal(
    extractMetadata(
      '<h1>Tool</h1><p>Fallback</p><meta name="description" content="Preferred">',
    ).description_source,
    "meta",
  );
});

test("website names prefer declared site names and match brands at either end of a title", () => {
  assert.equal(
    extractMetadata(
      "<title>AI Workflow Automation Platform - n8n</title>",
      "https://n8n.io/",
    ).name,
    "n8n",
  );
  assert.equal(
    extractMetadata(
      '<title>Activepieces: unify your team&#x27;s AI</title><meta content="Activepieces" property="og:site_name">',
      "https://www.activepieces.com/",
    ).name,
    "Activepieces",
  );
  assert.equal(
    extractMetadata(
      '<title>Fallback</title><meta name="application-name" content="Example App">',
    ).name,
    "Example App",
  );
  assert.equal(
    extractMetadata(
      "<title>Editor - Tagline</title>",
      "https://unknown.example",
    ).name,
    "Editor",
  );
});
test("meta values retain apostrophes inside double quotes and decode numeric entities", () => {
  assert.equal(
    extractMetadata(
      `<title>Tool</title><meta name="description" content="It's a team's workflow tool.">`,
    ).description,
    "It's a team's workflow tool.",
  );
  assert.equal(
    extractMetadata(
      '<title>Tool</title><meta content="Your team&#x27;s work &#38; data&#160;tools" name="description">',
    ).description,
    "Your team's work & data tools",
  );
});
