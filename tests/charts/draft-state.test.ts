import test from "node:test";
import assert from "node:assert/strict";
import { draftFingerprint } from "../../lib/charts/draft-state";
test("draft fingerprints ignore JSONB key order without losing intentional empty fields", () => {
  assert.equal(
    draftFingerprint({ name: "A", profile: { en: "", languages: [] } }),
    draftFingerprint({ profile: { languages: [], en: "" }, name: "A" }),
  );
  assert.notEqual(draftFingerprint({ en: "" }), draftFingerprint({}));
  assert.notEqual(
    draftFingerprint({ languages: ["en", "zh"] }),
    draftFingerprint({ languages: ["zh", "en"] }),
  );
});
