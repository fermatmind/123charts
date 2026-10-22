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
let untranslated = 0;
let directoryFeatures = 0;
let documentedFeatures = 0;
const researchedProjects = [];
const officialTypes = new Set([
  "official_documentation",
  "official_pricing",
  "official_integration",
  "official_license",
]);
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
      ["structured_candidate", "primary_source_researched"].includes(
        row.research_status,
      ),
    );
    const researched = row.research_status === "primary_source_researched";
    const documentedSource = (id) =>
      row.sources.find((s) => s.id === id && officialTypes.has(s.type));
    assert.ok(
      row.core_features.every(
        (f) =>
          sourceIds.has(f.source_ref) &&
          (researched
            ? f.status === "official_documentation_read" &&
              documentedSource(f.source_ref)
            : f.status === "directory_reported"),
      ),
    );
    assert.ok(
      !row.core_features.some((f) =>
        /per user per month|^Starts at|^Here.s a list/i.test(f.name_en),
      ),
    );
    featureCount += row.core_features.length;
    if (researched) documentedFeatures += row.core_features.length;
    else directoryFeatures += row.core_features.length;
    assert.ok(
      row.description_en.trim() && row.description_en.includes("\n\n"),
      `${row.name}: malformed candidate introduction (not a quality assessment)`,
    );
    assert.match(row.description_zh, /[\u4e00-\u9fff]/);
    assert.equal(row.primary_language, "en");
    assert.deepEqual(row.available_locales, ["en", "zh"]);
    if (researched) {
      researchedProjects.push(relative);
      assert.equal(row.official_check.status, "documentation_reviewed");
      assert.ok(Number.isFinite(Date.parse(row.official_check.checked_at)));
      assert.equal(row.pricing.officially_checked, true);
      assert.equal(
        documentedSource(row.pricing.source_ref)?.type,
        "official_pricing",
      );
      if (row.license.is_open_source !== null) {
        assert.equal(
          documentedSource(row.license.source_ref)?.type,
          "official_license",
        );
      }
      assert.ok(row.description_source_refs.length > 0);
      assert.ok(row.description_source_refs.every(documentedSource));
      assert.ok(row.profile.sections.length > 0);
      assert.equal(
        new Set(row.profile.sections.map((s) => s.id)).size,
        row.profile.sections.length,
      );
      for (const section of row.profile.sections) {
        assert.ok(
          section.en && section.zh && section.title_en && section.title_zh,
        );
        assert.ok(section.evidence_type && section.source_refs.length > 0);
        assert.ok(section.source_refs.every(documentedSource));
      }
      // Check references wherever they occur, including FAQs and evaluation steps.
      // These checks detect broken data; they cannot establish factual accuracy.
      const checkReferences = (value) => {
        if (!value || typeof value !== "object") return;
        for (const [key, child] of Object.entries(value)) {
          if (key === "source_ref")
            assert.ok(
              sourceIds.has(child),
              `${row.name}: unknown source ${child}`,
            );
          else if (key === "source_refs" || key === "description_source_refs") {
            assert.ok(
              Array.isArray(child) && child.every((id) => sourceIds.has(id)),
            );
          } else checkReferences(child);
        }
      };
      checkReferences(row);
      assert.ok(
        row.seo.title_en &&
          row.seo.title_zh &&
          row.seo.description_en &&
          row.seo.description_zh,
      );
      assert.ok(row.research_gaps.length > 0);
    } else {
      assert.equal(row.official_check.status, "not_checked");
      assert.equal(row.pricing.officially_checked, false);
      assert.equal(row.pricing.price_type, "unknown");
      assert.equal(row.license.is_open_source, null);
    }
    assert.equal(row.alternatives.status, "not_reviewed");
    assert.deepEqual(row.alternatives.items, []);
    assert.ok(row.sources.length >= 1 && sourceIds.size === row.sources.length);
    for (const source of row.sources) {
      if (officialTypes.has(source.type)) {
        assert.ok(researched);
        const sourceUrl = new URL(source.url);
        assert.equal(sourceUrl.protocol, "https:");
        assert.equal(
          getDomain(sourceUrl.hostname, { allowPrivateDomains: true }),
          identity,
        );
        assert.equal(source.verification, "official_documentation_read");
        assert.ok(source.research_notes_en && source.title);
      } else {
        assert.equal(source.type, "competitor_detail");
        assert.match(
          source.url,
          /^https:\/\/www\.saasworthy\.com\/product\/[\w-]+$/,
        );
        if (researched) assert.equal(source.use, "discovery_only_superseded");
      }
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
assert.equal(collection.feature_entries, featureCount);
assert.equal(
  collection.research_progress.primary_source_researched,
  researchedProjects.length,
);
assert.equal(
  collection.research_progress.remaining_structured_candidates,
  index.length - researchedProjects.length,
);
assert.deepEqual(
  collection.research_progress.projects,
  researchedProjects.sort(),
);
assert.equal(collection.content_review_status, "in_progress");
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
    feature_entries: featureCount,
    directory_reported_features: directoryFeatures,
    documentation_reported_features: documentedFeatures,
    primary_source_researched: researchedProjects.length,
    remaining_structured_candidates: index.length - researchedProjects.length,
    untranslated_feature_labels: untranslated,
    validation_scope:
      "Structure and references only; not factual, editorial, SEO or GEO acceptance.",
  }),
);
