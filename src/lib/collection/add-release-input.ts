import { parseMediaFormat, type CollectionKind, type MediaFormat } from "@/lib/collection/types";

export interface AddReleaseInput {
  discogsId: number;
  format: MediaFormat;
  kind: CollectionKind;
  notes: string;
}

export function parseAddReleaseInput(input: {
  discogsId: unknown;
  format: unknown;
  kind: unknown;
  notes?: unknown;
}): AddReleaseInput | null {
  const discogsId = Number.parseInt(String(input.discogsId ?? ""), 10);
  const format = parseMediaFormat(typeof input.format === "string" ? input.format : undefined);
  const kind = parseKind(input.kind);

  if (!Number.isInteger(discogsId) || discogsId <= 0 || !format || !kind) {
    return null;
  }

  return {
    discogsId,
    format,
    kind,
    notes: typeof input.notes === "string" ? input.notes : "",
  };
}

function parseKind(value: unknown): CollectionKind | null {
  if (value === "wishlist") {
    return "wishlist";
  }

  if (value === "owned" || value === "" || value == null) {
    return "owned";
  }

  return null;
}
