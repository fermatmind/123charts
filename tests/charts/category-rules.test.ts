import { suggestCategory } from "../../lib/charts/rules";
import test from "node:test";
import assert from "node:assert/strict";
import { rankCategory } from "../../lib/charts/publishing";
import {
  parsePublicTraffic,
  screenshotMatches,
} from "../../lib/charts/verification";
const sample =
  '<title>cursor.com Website Traffic [September 2026]</title><script type="application/ld+json">{"spatialCoverage":{"name":"Worldwide"}}</script><div>All Devices Visits 35.49M</div>';
test("public source parser requires domain, completed month, visits and explicit device/geography scope", () => {
  const f = parsePublicTraffic(sample, "cursor.com");
  assert.equal(f.value, 35490000);
  assert.equal(f.precision_step, 10000);
  assert.equal(f.source, "Semrush public");
  assert.equal(f.raw_display, "35.49M");
  assert.throws(() => parsePublicTraffic(sample, "different.com"));
  assert.throws(() =>
    parsePublicTraffic(sample.replace("All Devices", "Desktop"), "cursor.com"),
  );
  assert.throws(() =>
    parsePublicTraffic(
      sample.replace("Worldwide", "United States"),
      "cursor.com",
    ),
  );
  assert.throws(() =>
    parsePublicTraffic(
      sample.replace("Visits 35.49M", "Visits unknown"),
      "cursor.com",
    ),
  );
  assert.ok(screenshotMatches({ ...f, unit: "M" }, f));
  assert.equal(screenshotMatches({ ...f, source: "AITDK" }, f), false);
  assert.equal(screenshotMatches({ ...f, month: "2026-08" }, f), false);
  assert.equal(screenshotMatches({ ...f, value: null }, f), false);
  assert.equal(screenshotMatches({ ...f, value: 35000000 }, f), false);
});
test("classification, measurement, ties and missing data are independent of enrollment and contribution", () => {
  const projects = ["a", "b", "c", "broad", "missing", "unknown"].map((id) => ({
    id,
    domain: id + ".com",
    measurement_domain: id + ".com",
    enrolled_at: id === "missing" ? "2026-01-01" : null,
    controller_id: null,
  }));
  const members = projects.map((p) => ({
    project_id: p.id,
    category: "coding",
    state: "confirmed",
    placement:
      p.id === "broad"
        ? "general"
        : p.id === "unknown"
          ? "scope_unknown"
          : "main",
  }));
  const traffic = ["a", "b", "c", "broad"].map((id, i) => ({
    id: "traffic-" + id,
    domain: id + ".com",
    value: id === "c" ? 50 : id === "broad" ? 9999 : 100,
    version: 1,
    state: "verified",
    raw_display: i === 0 ? "0.1K" : undefined,
    precision_step: 1,
  }));
  const ranked = rankCategory(projects as any, members as any, traffic as any);
  assert.deepEqual(
    ranked.entries.map((e) => [e.project_id, e.rank]),
    [
      ["a", 1],
      ["b", 1],
      ["c", 3],
    ],
  );
  assert.equal(ranked.total_count, 6);
  assert.equal(ranked.coverage_count, 3);
  assert.ok(
    ranked.exclusions.some(
      (x) => x.project_id === "missing" && x.reason === "missing_current_month",
    ),
  );
  assert.ok(
    ranked.exclusions.some(
      (x) => x.project_id === "broad" && x.reason === "general_platform",
    ),
  );
  const conflict = rankCategory(
    projects as any,
    members as any,
    [...traffic, { domain: "a.com", state: "conflict", value: 0 }] as any,
  );
  assert.equal(
    conflict.entries.some((e) => e.project_id === "a"),
    false,
  );
});

test("rounded display intervals do not manufacture precise rank differences", () => {
  const p = ["a", "b"].map((id) => ({
    id,
    domain: id + ".com",
    measurement_domain: id + ".com",
  }));
  const m = p.map((x) => ({
    project_id: x.id,
    state: "confirmed",
    placement: "main",
  }));
  const t = [
    {
      id: "1",
      domain: "a.com",
      value: 35490000,
      precision_step: 10000,
      state: "verified",
      version: 1,
    },
    {
      id: "2",
      domain: "b.com",
      value: 35492000,
      precision_step: 1,
      state: "verified",
      version: 1,
    },
  ];
  assert.deepEqual(
    rankCategory(p as any, m as any, t as any).entries.map((x) => x.rank),
    [1, 1],
  );
});

test("purpose hints propose a category without guessing ambiguous cases", () => {
  assert.equal(
    suggestCategory("A code editor with code completion."),
    "ai-coding",
  );
  assert.equal(
    suggestCategory("Enterprise search and document retrieval."),
    "knowledge-search",
  );
  assert.equal(suggestCategory("A directory of interesting websites."), null);
  assert.equal(suggestCategory("Code editor and workflow automation."), null);
});
