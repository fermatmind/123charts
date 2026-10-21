import { eventExclusion } from "../../lib/charts/events";
import test from "node:test";
import assert from "node:assert/strict";
import {
  draftSchema,
  validateSubmission,
  validatePeers,
} from "../../lib/charts/rules";
import {
  discoveryPageEligible,
  alternatives,
  discover,
  indexableAlternative,
  priceLabel,
  profileReady,
  sustainedFree,
} from "../../lib/charts/discovery";
import type { Draft, Project, Relation } from "../../lib/charts/types";
const p = (id: string, extra: Partial<Project> = {}): Project => ({
  id,
  slug: id,
  name: id,
  domain: id + ".com",
  website_url: "https://" + id + ".com",
  measurement_domain: id + ".com",
  category: "ai-coding",
  description_en: "A useful code editing tool.",
  description_zh: "用于编辑代码的工具。",
  price_type: "unknown",
  publication: "published",
  collected_at: "2026-10-01",
  enrolled_at: null,
  controller_id: null,
  official_source: null,
  source_checked_at: null,
  demo: false,
  updated_at: "2026-10-21",
  task: "Code editing",
  differentiator: "Terminal workflow for developers.",
  supported_languages: ["English"],
  ...extra,
});
const peer = (i: number) => ({
  name: "Peer " + i,
  domain: "peer" + i + ".com",
  task: "Code editing",
  rationale: "A different workflow for the same editing task.",
});
const draft: Draft = { ...p("own"), peers: [peer(1), peer(2), peer(3)] };
test("normal submission accepts three to five peers, rejects aliases and six; screenshots not required", () => {
  assert.equal(validateSubmission(draft).peers.length, 3);
  assert.equal(
    validateSubmission({
      ...draft,
      peers: Array.from({ length: 5 }, (_, i) => peer(i)),
    }).peers.length,
    5,
  );
  assert.throws(() =>
    draftSchema.parse({
      ...draft,
      peers: Array.from({ length: 6 }, (_, i) => peer(i)),
    }),
  );
  assert.throws(
    () => validateSubmission({ ...draft, peers: [peer(1), peer(2)] }),
    /three to five/,
  );
  assert.throws(
    () =>
      validatePeers(
        [peer(1), { ...peer(1), domain: "docs.peer1.com" }],
        "own.com",
        false,
      ),
    /Duplicate/,
  );
});
test("niche exception requires both meaningful reason and related methods", () => {
  const short = { ...draft, peers: [peer(1)] };
  assert.throws(() =>
    validateSubmission({
      ...short,
      peer_exception_reason: "short",
      supplementary_alternatives: "Manual process",
    }),
  );
  assert.equal(
    validateSubmission({
      ...short,
      peer_exception_reason:
        "This niche workflow has only one known independent site after focused research.",
      supplementary_alternatives:
        "A spreadsheet and manual review provide the remaining comparable process.",
    }).peers.length,
    1,
  );
  assert.throws(() => validateSubmission({ ...draft, task: "" }), /task/);
});
test("sustained free excludes trial and unknown; open source never implies free hosting", () => {
  assert.equal(
    sustainedFree(
      p("a", {
        price_type: "trial",
        price_verified: true,
        conditions: "14 days",
      }),
    ),
    false,
  );
  assert.equal(
    sustainedFree(
      p("b", {
        price_type: "free",
        price_verified: false,
        conditions: "Unknown",
      }),
    ),
    false,
  );
  assert.equal(
    sustainedFree(
      p("c", {
        price_type: "paid",
        price_verified: true,
        is_open_source: true,
        conditions: "Paid hosting",
      }),
    ),
    false,
  );
  assert.equal(
    sustainedFree(
      p("d", {
        price_type: "freemium",
        price_verified: true,
        conditions: "100 tasks monthly",
      }),
    ),
    true,
  );
  assert.equal(
    priceLabel(p("e", { price_type: "free", price_verified: false })),
    "Unconfirmed",
  );
});
test("one reviewed task candidate can publish alternatives; private or cross-dataset relations cannot", () => {
  const target = p("target"),
    candidate = p("candidate");
  const relation = {
    id: "r",
    project_id: candidate.id,
    peer_domain: target.domain,
    task: "Code editing",
    rationale: "Terminal compared to an editor.",
    status: "approved",
  } as Relation;
  assert.equal(
    indexableAlternative(target, [target, candidate], [relation]),
    true,
  );
  assert.equal(
    alternatives(target, [target, candidate], [{ ...relation, public: false }])
      .length,
    0,
  );
  assert.equal(
    alternatives(target, [target, { ...candidate, demo: true }], [relation])
      .length,
    0,
  );
  assert.equal(
    alternatives(
      target,
      [target, candidate],
      [{ ...relation, status: "pending" }],
    ).length,
    0,
  );
  assert.equal(
    alternatives(target, [target, candidate], [relation], "Other task").length,
    0,
  );
  assert.equal(
    indexableAlternative(
      { ...target, demo: true },
      [target, candidate],
      [relation],
    ),
    false,
  );
});
test("filter first, stable low-exposure rotation, six positions, special-slot fallback and controller dedupe", () => {
  const projects = Array.from({ length: 9 }, (_, i) => p("p" + i));
  const pool = projects.map((p, i) => ({
    id: p.id,
    group: i === 0 || i === 1 ? "same-owner" : p.id,
    exposure: i === 8 ? 20 : i,
    fresh: i === 0,
    contributor: i === 2,
    tie: p.id,
  }));
  const a = discover(projects, pool);
  assert.equal(a.length, 6);
  assert.equal(a[0].reason, "newly_listed");
  assert.equal(a[1].reason, "adopted_contribution");
  assert.ok(!a.some((x) => x.project.id === "p1"));
  assert.deepEqual(discover([...projects].reverse(), pool), a);
  const only = discover(
    projects.filter((p) => p.id === "p8"),
    pool,
  );
  assert.equal(only[0].project.id, "p8");
  assert.equal(only[0].reason, "rotation");
  assert.equal(profileReady(p("bad", { task: "" })), false);
});

test("empty and incomplete search landing pages are ineligible for production indexing", () => {
  assert.equal(discoveryPageEligible(["free"], [p("a")], []), false);
  assert.equal(
    discoveryPageEligible(["categories", "missing"], [p("a")], [], false),
    false,
  );
  assert.equal(
    discoveryPageEligible(["alternatives", "a"], [p("a")], []),
    false,
  );
  assert.equal(
    discoveryPageEligible(["projects", "a"], [p("a", { task: "" })], []),
    false,
  );
  assert.equal(discoveryPageEligible(["dashboard"], [p("a")], []), false);
  assert.equal(discoveryPageEligible(["projects", "a"], [p("a")], []), true);
});

test("AI crawlers, ordinary crawlers, self and tests are separate from human discovery", () => {
  assert.equal(eventExclusion("GPTBot/1.0"), "ai_crawler");
  assert.equal(eventExclusion("Googlebot"), "crawler");
  assert.equal(eventExclusion("Chrome", true), "test_automation");
  assert.equal(eventExclusion("Chrome", false, true), "self_or_internal");
  assert.equal(eventExclusion("Chrome"), null);
});
