import test from "node:test";
import { maintainedText } from "../../lib/charts/navigation";
import assert from "node:assert/strict";
import { parseOwnerProfile, ownerPrompt } from "../../lib/charts/owner-profile";
import { draftSchema } from "../../lib/charts/rules";
const packet = {
  schema_version: "123charts-owner-profile-v1",
  website_url: "https://example.com",
  profile: {
    description_en: "A document tool.",
    price_type: "unknown",
    supported_languages: [],
  },
  sources: [
    {
      field: "description_en",
      url: "https://example.com/docs",
      checked_at: "",
      note: "Official description",
    },
  ],
};
test("owner AI import keeps only typed draft fields and preserves source evidence", () => {
  const d = parseOwnerProfile(
    JSON.stringify(packet),
    "https://www.example.com/",
  );
  assert.equal(d.price_type, "unknown");
  assert.equal(d.owner_sources.length, 1);
  assert.deepEqual(d.supported_languages, []);
  assert.equal(d.owner_sources[0].checked_at, "");
  assert.ok(draftSchema.shape.owner_sources.safeParse(d.owner_sources).success);
  for (const field of [
    "publication",
    "controller_id",
    "owner_verified",
    "price_verified",
    "peers",
    "slug",
  ])
    assert.throws(() =>
      parseOwnerProfile(
        JSON.stringify({
          ...packet,
          profile: { ...packet.profile, [field]: true },
        }),
        packet.website_url,
      ),
    );
  assert.throws(
    () =>
      parseOwnerProfile(
        JSON.stringify({ ...packet, website_url: "https://elsewhere.com" }),
        packet.website_url,
      ),
    /domain/,
  );
  assert.throws(() =>
    parseOwnerProfile(
      JSON.stringify({
        ...packet,
        sources: [{ ...packet.sources[0], url: "javascript:alert(1)" }],
      }),
      packet.website_url,
    ),
  );
  assert.throws(
    () => parseOwnerProfile("x".repeat(65537), packet.website_url),
    /64 KB/,
  );
});
test("owner prompts distinguish evidence, identity and platform decisions in both languages", () => {
  for (const lang of ["zh", "en"] as const) {
    const prompt = ownerPrompt("Example", packet.website_url, lang);
    assert.ok(prompt.includes(packet.website_url));
    assert.ok(prompt.includes("123charts-owner-profile-v1"));
    assert.ok(prompt.includes("price_verified"));
    assert.ok(prompt.includes("unknown"));
  }
});

test("listing references omit placeholder copy but retain real limits and partial unknowns", () => {
  const unknown =
    "Detailed conditions have not been reviewed. Confirm pricing, hosting and usage limits with the official website. / 详细使用条件尚未核实，请向官网确认价格、托管及使用限制。";
  assert.equal(maintainedText(unknown, "zh"), "");
  assert.equal(maintainedText(unknown, "en"), "");
  assert.equal(maintainedText("待确认", "zh"), "");
  const fact = "Self-hosting is available; operating cost is unknown.";
  assert.equal(maintainedText(fact, "en"), fact);
});
