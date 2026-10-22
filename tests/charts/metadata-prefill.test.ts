import test from "node:test";
import assert from "node:assert/strict";
import {
  MetadataPrefill,
  metadataTarget,
  completeDraftDescriptions,
} from "../../lib/charts/metadata-prefill";
import { draftSchema } from "../../lib/charts/rules";
import type { Draft } from "../../lib/charts/types";

function draft(): Draft {
  return {
    website_url: "https://n8n.io",
    name: "",
    description_en: "",
    description_zh: "",
    category: "ai-coding",
    slug: "",
    domain: "",
    price_type: "unknown",
    peers: [],
  };
}
const n8n = {
  name: "n8n",
  description: "Workflow automation",
  suggested_category: "workflow-automation",
};
const activepieces = {
  name: "Activepieces",
  description: "Build automated workflows",
  suggested_category: "workflow-automation",
};

test("switching websites removes only the previous automatic details", () => {
  let d = draft();
  const state = new MetadataPrefill(d.website_url);
  d = { ...d, ...state.apply(state.begin(), n8n, d) };
  assert.equal(d.name, "n8n");
  d = {
    ...d,
    ...state.changeURL("https://activepieces.com", d),
    website_url: "https://activepieces.com",
  };
  assert.equal(d.name, "");
  assert.equal(d.description_en, "");
  assert.equal(d.category, "ai-coding");
  d = { ...d, ...state.apply(state.begin(), activepieces, d) };
  assert.equal(d.name, "Activepieces");
  assert.equal(d.description_en, activepieces.description);
});

test("a late previous-website request cannot fill the current or a revisited website", () => {
  const d = draft();
  const state = new MetadataPrefill(d.website_url);
  const old = state.begin();
  state.changeURL("https://activepieces.com", d);
  const active = state.begin();
  state.changeURL(d.website_url, d);
  assert.deepEqual(state.apply(old, n8n, d), {});
  assert.deepEqual(state.apply(active, activepieces, d), {});
  assert.equal(state.accepts(state.begin(), d.website_url), true);
});

test("late responses from an earlier retry of the same URL are ignored", () => {
  const d = draft();
  const state = new MetadataPrefill(d.website_url);
  const old = state.begin();
  const latest = state.begin();
  assert.deepEqual(state.apply(old, n8n, d), {});
  assert.equal(state.apply(latest, n8n, d).name, "n8n");
});

test("manual edits during a request win, including intentionally empty fields", () => {
  let d = draft();
  const state = new MetadataPrefill(d.website_url);
  const request = state.begin();
  state.edit("name");
  state.edit("description_en");
  state.edit("category");
  d = {
    ...d,
    name: "My project",
    description_en: "",
    category: "knowledge-search",
  };
  assert.deepEqual(state.apply(request, n8n, d), {});
  assert.deepEqual(state.apply(state.begin(), n8n, d), {});
});

test("editing an automatic field preserves it on switching, even if its text is unchanged", () => {
  let d = draft();
  const state = new MetadataPrefill(d.website_url);
  d = {
    ...d,
    ...state.apply(state.begin(), n8n, d),
    description_zh: "手填内容",
  };
  state.edit("name"); // User explicitly typed the same name.
  d = {
    ...d,
    ...state.changeURL("https://activepieces.com", d),
    website_url: "https://activepieces.com",
  };
  d = { ...d, ...state.apply(state.begin(), activepieces, d) };
  assert.equal(d.name, "n8n");
  assert.equal(d.description_zh, "手填内容");
  assert.equal(d.description_en, activepieces.description);
});

test("resumed draft fields and imported facts are never treated as automatic values", () => {
  const d = { ...draft(), name: "Saved name", description_en: "Saved text" };
  const state = new MetadataPrefill(d.website_url, true);
  assert.deepEqual(state.apply(state.begin(), n8n, d), {});
  state.edit("name");
  state.edit("description_en");
  state.edit("category");
  assert.deepEqual(state.changeURL("https://activepieces.com", d), {});
  assert.deepEqual(
    state.apply(state.begin(), activepieces, {
      ...d,
      website_url: "https://activepieces.com",
    }),
    {},
  );
});

test("www, scheme and path edits for the same root keep the request and automatic fields", () => {
  const d = draft();
  const state = new MetadataPrefill(d.website_url);
  const request = state.begin();
  assert.equal(state.changeURL("http://www.n8n.io/docs/", d), null);
  assert.equal(state.accepts(request, "http://www.n8n.io/docs/"), true);
  assert.notEqual(
    metadataTarget("https://a.example.com"),
    metadataTarget("https://b.example.com"),
  );
});

function saved(d: Draft, state: MetadataPrefill): Draft {
  // Exercise the same schema and language fallback as the actual save endpoint.
  return JSON.parse(
    JSON.stringify(
      completeDraftDescriptions(
        draftSchema.parse({ ...d, metadata_prefill: state.snapshot() }),
      ),
    ),
  );
}

test("saved automatic fields and generated language copies clear after reload and URL switch", () => {
  let d = draft();
  let state = new MetadataPrefill(d.website_url);
  d = { ...d, ...state.apply(state.begin(), n8n, d) };
  d = saved(d, state);
  assert.equal(d.description_zh, n8n.description);
  state = new MetadataPrefill(d.website_url, true, d.metadata_prefill);
  d = {
    ...d,
    ...state.changeURL("https://activepieces.com", d),
    website_url: "https://activepieces.com",
  };
  assert.equal(d.name, "");
  assert.equal(d.description_en, "");
  assert.equal(d.description_zh, "");
  d = { ...d, ...state.apply(state.begin(), activepieces, d) };
  d = saved(d, state);
  assert.equal(d.name, "Activepieces");
  assert.equal(d.description_en, activepieces.description);
  assert.equal(d.description_zh, activepieces.description);
});

test("manual descriptions and category survive saving, reloading and switching websites", () => {
  let d = draft();
  let state = new MetadataPrefill(d.website_url);
  d = { ...d, ...state.apply(state.begin(), n8n, d) };
  state.edit("description_zh");
  state.edit("category");
  d = saved(
    { ...d, description_zh: "保留手填内容", category: "knowledge-search" },
    state,
  );
  state = new MetadataPrefill(d.website_url, true, d.metadata_prefill);
  d = {
    ...d,
    ...state.changeURL("https://activepieces.com", d),
    website_url: "https://activepieces.com",
  };
  d = { ...d, ...state.apply(state.begin(), activepieces, d) };
  assert.equal(d.name, "Activepieces");
  assert.equal(d.description_en, activepieces.description);
  assert.equal(d.description_zh, "保留手填内容");
  assert.equal(d.category, "knowledge-search");
});

test("explicitly empty or identically retyped fields remain user input across reloads", () => {
  let d = draft();
  let state = new MetadataPrefill(d.website_url);
  d = { ...d, ...state.apply(state.begin(), n8n, d) };
  state.edit("name");
  state.edit("description_en");
  d = saved({ ...d, description_en: "", description_zh: "中文手填" }, state);
  assert.equal(d.description_en, ""); // Fallback must not resurrect this field.
  state = new MetadataPrefill(d.website_url, true, d.metadata_prefill);
  d = {
    ...d,
    ...state.changeURL("https://activepieces.com", d),
    website_url: "https://activepieces.com",
  };
  d = { ...d, ...state.apply(state.begin(), activepieces, d) };
  assert.equal(d.name, "n8n"); // The user explicitly retyped this exact value.
  assert.equal(d.description_en, "");
  assert.equal(d.description_zh, "中文手填");
});

test("snapshots are immutable and re-saving does not lose the original default category", () => {
  let d = draft();
  let state = new MetadataPrefill(d.website_url);
  d = { ...d, ...state.apply(state.begin(), n8n, d) };
  const snapshot = state.snapshot();
  state.edit("name");
  assert.equal(snapshot.automatic.name?.value, "n8n");
  assert.deepEqual(snapshot.edited, []);
  d = saved(d, new MetadataPrefill(d.website_url, true, snapshot));
  state = new MetadataPrefill(d.website_url, true, d.metadata_prefill);
  assert.equal(
    state.changeURL("https://activepieces.com", d)?.category,
    "ai-coding",
  );
  d.website_url = "https://activepieces.com";
  d = { ...d, ...state.apply(state.begin(), activepieces, d) };
  assert.equal(d.category, "workflow-automation");
});

test("mismatched or inconsistent provenance cannot erase saved user fields", () => {
  let d = draft();
  const original = new MetadataPrefill(d.website_url);
  d = { ...d, ...original.apply(original.begin(), n8n, d) };
  const wrongTarget = { ...original.snapshot(), target: "another.example.com" };
  assert.deepEqual(
    new MetadataPrefill(d.website_url, true, wrongTarget).changeURL(
      "https://activepieces.com",
      d,
    ),
    {},
  );
  const altered = { ...d, name: "Untracked manual name" };
  const resumed = new MetadataPrefill(d.website_url, true, original.snapshot());
  assert.equal(
    resumed.changeURL("https://activepieces.com", altered)?.name,
    undefined,
  );
});

test("legacy drafts retain their contents and optional provenance stays schema-bounded", () => {
  const legacy = {
    ...draft(),
    name: "Legacy",
    description_en: "Existing facts",
  };
  const result = completeDraftDescriptions(draftSchema.parse(legacy));
  assert.equal(result.metadata_prefill, undefined);
  assert.equal(result.description_zh, legacy.description_en);
  assert.equal(
    draftSchema.safeParse({ ...legacy, metadata_prefill: { version: 9 } })
      .success,
    false,
  );
  assert.equal(
    draftSchema.safeParse({
      ...legacy,
      metadata_prefill: {
        version: 1,
        target: "n8n.io",
        automatic: { name: { value: "x".repeat(201), previous: "" } },
        edited: [],
      },
    }).success,
    false,
  );
});
