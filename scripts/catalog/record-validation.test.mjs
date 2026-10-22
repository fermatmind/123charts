import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import {
  validateOfficialSourceDomain,
  validateResearchedPricing,
} from "./record-validation.mjs";

const read = (p) =>
  JSON.parse(
    fs.readFileSync(new URL(`../../data/catalog/${p}`, import.meta.url)),
  );
const registry = read("source-authorities.json");
const userzoomPath = "projects/ux-design/userzoom-2b8e3317.json";
const userzoom = read(userzoomPath);
const product = userzoom.sources.find((s) => s.id === "product");

test("documentation can be researched while pricing remains unknown", () => {
  for (const p of [
    userzoomPath,
    "projects/ux-design/userexperior-438cef80.json",
    "projects/ai-meetings/meeedly-3f73efff.json",
  ]) {
    const row = read(p);
    const before = structuredClone(row);
    validateResearchedPricing(row);
    assert.deepEqual(row, before);
    assert.equal(row.pricing.officially_checked, false);
  }
});

test("unknown pricing cannot carry a normalized price, currency or known tier", () => {
  for (const change of [
    { normalized_monthly_price: 10 },
    { currency: "USD" },
    { price_type: "freemium" },
    { status: "official_documentation_read" },
  ]) {
    const row = structuredClone(userzoom);
    Object.assign(row.pricing, change);
    assert.throws(() => validateResearchedPricing(row));
  }
});

test("setting the price flag cannot upgrade a product document to pricing proof", () => {
  const row = structuredClone(userzoom);
  Object.assign(row.pricing, {
    officially_checked: true,
    status: "official_documentation_read",
  });
  assert.throws(
    () => validateResearchedPricing(row),
    /official pricing source/,
  );
  validateResearchedPricing(
    read("projects/workflow-automation/zapier-054d95f6.json"),
  );
});

test("all recorded official domain transitions match their exact sources", () => {
  let matched = 0;
  for (const [projectPath, authority] of Object.entries(registry.projects)) {
    const row = read(projectPath);
    for (const allowed of authority.sources) {
      const source = row.sources.find((s) => s.id === allowed.id);
      validateOfficialSourceDomain(row, projectPath, source, registry);
      matched += 1;
    }
  }
  assert.equal(matched, 12);
});

test("unrelated hosts and other paths on an approved host are rejected", () => {
  for (const url of [
    "https://unrelated.example/product",
    "https://www.usertesting.com/platform/another-product",
  ]) {
    assert.throws(() =>
      validateOfficialSourceDomain(
        userzoom,
        userzoomPath,
        { ...product, url },
        registry,
      ),
    );
  }
});

test("domain provenance cannot be reused for another project or changed snapshot", () => {
  assert.throws(() =>
    validateOfficialSourceDomain(
      userzoom,
      "projects/other.json",
      product,
      registry,
    ),
  );
  assert.throws(() =>
    validateOfficialSourceDomain(
      userzoom,
      userzoomPath,
      { ...product, excerpt_sha256: "0".repeat(64) },
      registry,
    ),
  );
});

test("missing lineage evidence and a different legacy redirect origin fail", () => {
  const missing = structuredClone(registry);
  delete missing.projects[userzoomPath].basis.source_ref;
  assert.throws(() =>
    validateOfficialSourceDomain(userzoom, userzoomPath, product, missing),
  );
  const wrongOrigin = structuredClone(registry);
  wrongOrigin.projects[userzoomPath].basis.requested_url =
    "https://unrelated.example/";
  assert.throws(() =>
    validateOfficialSourceDomain(userzoom, userzoomPath, product, wrongOrigin),
  );
});
