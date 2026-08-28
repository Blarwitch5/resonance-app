import type { CollectionKind, ReleaseDraft } from "@/lib/collection/types";
import { ValidationError } from "@/lib/errors";

interface NormalizedItem {
  discogsId: number | null;
  format: ReleaseDraft["format"];
  title: string;
  artist: string;
  year: number | null;
  label: string | null;
  genres: string[];
  coverUrl: string | null;
  barcode: string | null;
  catalogNumber: string | null;
  isFavorite: boolean;
  isWishlist: boolean;
  notes: string | null;
}

export function createCollectionItem(input: {
  draft: ReleaseDraft;
  kind: CollectionKind;
  notes?: string | null;
}): NormalizedItem {
  const title = input.draft.title.trim();
  const artist = input.draft.artist.trim();

  if (title.length === 0 || artist.length === 0) {
    throw new ValidationError("A record needs both an artist and a title.");
  }

  return {
    ...input.draft,
    title,
    artist,
    label: input.draft.label?.trim() || null,
    catalogNumber: input.draft.catalogNumber?.trim() || null,
    notes: input.notes?.trim() || null,
    isFavorite: input.kind === "favorite",
    isWishlist: input.kind === "wishlist",
  };
}

export function catalogToRemember(kept: string | null, heard: string | null): string | null {
  if (kept?.trim()) {
    return null;
  }

  return heard?.trim() || null;
}
