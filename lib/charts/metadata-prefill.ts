import type { Draft } from "./types";

const fields = ["name", "description_en", "category"] as const;
type Field = (typeof fields)[number];
type Patch = Partial<Pick<Draft, Field>>;
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

/** Per-form provenance; saved drafts and owner imports always remain user input. */
export class MetadataPrefill {
  private target: string;
  private sequence = 0;
  private edits = { name: 0, description_en: 0, category: 0 };
  private automatic: Partial<
    Record<Field, { value: string; previous: string }>
  > = {};

  constructor(
    url: string,
    private readonly existing = false,
  ) {
    this.target = metadataTarget(url);
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
      category: String(result.suggested_category || ""),
    };
    const patch: Patch = {};
    for (const field of fields) {
      const auto = this.automatic[field];
      const canFill = auto
        ? draft[field] === auto.value
        : this.edits[field] === 0 &&
          (!draft[field] || (field === "category" && !this.existing));
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
