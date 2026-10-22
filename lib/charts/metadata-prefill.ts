import { z } from "zod";
import type { Draft } from "./types";

const fields = [
  "name",
  "description_en",
  "description_zh",
  "category",
] as const;
type Field = (typeof fields)[number];
type Patch = Partial<Pick<Draft, Field>>;
const automaticField = (max: number) =>
  z
    .object({ value: z.string().max(max), previous: z.string().max(max) })
    .strict();
export const metadataPrefillSchema = z
  .object({
    version: z.literal(1),
    target: z.string().max(253),
    automatic: z
      .object({
        name: automaticField(200).optional(),
        description_en: automaticField(2000).optional(),
        description_zh: automaticField(2000).optional(),
        category: automaticField(80).optional(),
      })
      .strict(),
    edited: z.array(z.enum(fields)).max(fields.length),
  })
  .strict();
export type MetadataPrefillState = z.infer<typeof metadataPrefillSchema>;
export interface PrefillRequest {
  sequence: number;
  target: string;
  edits: Record<Field, number>;
}

// Only a UI identity key: destination safety is still checked by the server.
// The metadata endpoint extracts the root website, ignoring www and paths.
export function metadataTarget(value: string) {
  const raw = value.trim();
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.host
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/\.$/, "");
  } catch {
    return raw;
  }
}

/** Private draft provenance, not a source verification or publication credential. */
export class MetadataPrefill {
  private target: string;
  private sequence = 0;
  private edits = {
    name: 0,
    description_en: 0,
    description_zh: 0,
    category: 0,
  };
  private automatic: Partial<
    Record<Field, { value: string; previous: string }>
  > = {};

  constructor(url: string, existing = false, restored?: MetadataPrefillState) {
    this.target = metadataTarget(url);
    const parsed = metadataPrefillSchema.safeParse(restored);
    if (parsed.success && parsed.data.target === this.target) {
      this.automatic = { ...parsed.data.automatic };
      for (const field of parsed.data.edited) this.edits[field] = 1;
    } else if (existing) this.edits.category = 1;
  }

  snapshot(): MetadataPrefillState {
    return {
      version: 1,
      target: this.target,
      automatic: { ...this.automatic },
      edited: fields.filter((field) => this.edits[field] > 0),
    };
  }

  edit(key: keyof Draft) {
    if (!fields.includes(key as Field)) return;
    const field = key as Field;
    this.edits[field]++;
    delete this.automatic[field];
  }

  changeURL(url: string, draft: Draft): Patch | null {
    const target = metadataTarget(url);
    if (target === this.target) return null;
    this.target = target;
    this.sequence++;
    const patch: Patch = {};
    for (const field of fields) {
      const auto = this.automatic[field];
      if (auto && draft[field] === auto.value) patch[field] = auto.previous;
    }
    this.automatic = {};
    return patch;
  }

  begin(): PrefillRequest {
    return {
      sequence: ++this.sequence,
      target: this.target,
      edits: { ...this.edits },
    };
  }

  accepts(request: PrefillRequest, url: string) {
    return (
      request.sequence === this.sequence &&
      request.target === metadataTarget(url)
    );
  }

  apply(
    request: PrefillRequest,
    result: Record<string, unknown>,
    draft: Draft,
  ): Patch {
    if (!this.accepts(request, draft.website_url)) return {};
    const values = {
      name: String(result.name || ""),
      description_en: String(result.description || ""),
      description_zh: "",
      category: String(result.suggested_category || ""),
    };
    const patch: Patch = {};
    for (const field of fields) {
      const auto = this.automatic[field];
      const canFill = auto
        ? draft[field] === auto.value
        : this.edits[field] === 0 && (!draft[field] || field === "category");
      if (
        !values[field] ||
        !canFill ||
        request.edits[field] !== this.edits[field]
      )
        continue;
      patch[field] = values[field];
      this.automatic[field] = {
        value: values[field],
        previous: auto?.previous ?? draft[field],
      };
    }
    return patch;
  }
}

// Preserve the existing language fallback, but track generated copies as auto
// fields and never resurrect a field explicitly cleared by its author.
export function completeDraftDescriptions(draft: Draft): Draft {
  const d = { ...draft };
  const parsed = metadataPrefillSchema.safeParse(d.metadata_prefill);
  const state =
    parsed.success && parsed.data.target === metadataTarget(d.website_url)
      ? parsed.data
      : undefined;
  for (const [field, source] of [
    ["description_en", "description_zh"],
    ["description_zh", "description_en"],
  ] as const) {
    if (!d[field] && d[source] && !state?.edited.includes(field)) {
      d[field] = d[source];
      if (state) state.automatic[field] = { value: d[field], previous: "" };
    }
  }
  if (state) d.metadata_prefill = state;
  else delete d.metadata_prefill;
  return d;
}
