import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { getDomain } from "tldts";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/catalog",
);
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const collection = read("collection.json");
const taxonomy = read("categories.json").categories;
assert.equal(taxonomy.length, 50);
assert.equal(new Set(taxonomy.map((c) => c.slug)).size, 50);
const identities = new Set();
const slugs = new Set();
const counts = {};
let featureCount = 0;
let minimumWords = Infinity;
let untranslated = 0;
const index = [];
for (const category of taxonomy) {
  assert.match(category.slug, /^[a-z0-9-]+$/);
  assert.ok(category.name_en && category.name_zh);
  const dir = path.join(root, "projects", category.slug);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  counts[category.slug] = files.length;
  assert.ok(files.length >= 5, `${category.slug}: fewer than 5 records`);
  for (const file of files) {
    const relative = `projects/${category.slug}/${file}`;
    const row = read(relative);
    assert.equal(row.schema_version, "123charts-software-research-v1");
    assert.equal(row.status, "draft");
    assert.equal(row.category, category.slug);
    assert.equal(file, `${row.slug}.json`);
    assert.ok(
      row.name.length > 0 && row.name.length <= 200 && !row.name.includes("\n"),
    );
    assert.ok(!slugs.has(row.slug));
    slugs.add(row.slug);
    const url = new URL(row.website_url);
    assert.ok(["https:", "http:"].includes(url.protocol));
    assert.ok(!url.username && !url.password && !url.port);
    assert.equal(url.hostname, row.domain);
    const identity = getDomain(url.hostname, { allowPrivateDomains: true });
    assert.equal(identity, row.identity_domain);
    assert.ok(!identities.has(identity), `Duplicate identity: ${identity}`);
    identities.add(identity);
    assert.ok(
      row.core_features.length >= 2,
      `${row.name}: missing actual features`,
    );
    const sourceIds = new Set(row.sources.map((s) => s.id));
    assert.ok(
      row.core_features.every(
        (f) => f.status === "directory_reported" && sourceIds.has(f.source_ref),
      ),
    );
    assert.ok(
      !row.core_features.some((f) =>
        /per user per month|^Starts at|^Here.s a list/i.test(f.name_en),
      ),
    );
    featureCount += row.core_features.length;
    const words = row.description_en.split(/\s+/).filter(Boolean).length;
    minimumWords = Math.min(minimumWords, words);
    assert.ok(
      words >= 45 && row.description_en.includes("\n\n"),
      `${row.name}: thin introduction`,
    );
    assert.match(row.description_zh, /[\u4e00-\u9fff]/);
    assert.equal(row.primary_language, "en");
    assert.deepEqual(row.available_locales, ["en", "zh"]);
    assert.equal(row.official_check.status, "not_checked");
    assert.equal(row.pricing.officially_checked, false);
    assert.equal(row.pricing.price_type, "unknown");
    assert.equal(row.license.is_open_source, null);
    assert.equal(row.alternatives.status, "not_reviewed");
    assert.deepEqual(row.alternatives.items, []);
    assert.ok(row.sources.length >= 1 && sourceIds.size === row.sources.length);
    for (const source of row.sources) {
      assert.match(
        source.url,
        /^https:\/\/www\.saasworthy\.com\/product\/[\w-]+$/,
      );
      assert.ok(Number.isFinite(Date.parse(source.read_at)));
      assert.match(
        source.excerpt_sha256 ?? source.body_sha256,
        /^[a-f0-9]{64}$/,
      );
    }
    untranslated += row.localization.zh.untranslated_feature_labels.length;
    index.push({
      slug: row.slug,
      name: row.name,
      category: row.category,
      website_url: row.website_url,
      path: relative,
    });
  }
}
assert.equal(index.length, 1000);
assert.equal(collection.project_count, 1000);
assert.equal(collection.target_count, 1000);
assert.equal(collection.collection_complete, true);
assert.deepEqual(counts, collection.counts_by_category);
assert.equal(untranslated, 0, `${untranslated} untranslated feature labels`);
index.sort((a, b) => a.slug.localeCompare(b.slug));
fs.writeFileSync(
  path.join(root, "index.json"),
  `${JSON.stringify({ schema_version: "123charts-catalog-index-v1", projects: index }, null, 2)}\n`,
);
console.log(
  JSON.stringify({
    projects: index.length,
    categories: taxonomy.length,
    minimum_per_category: Math.min(...Object.values(counts)),
    feature_facts: featureCount,
    minimum_english_words: minimumWords,
    untranslated_feature_labels: untranslated,
  }),
);
