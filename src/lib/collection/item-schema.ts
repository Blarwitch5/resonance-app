import { z } from "zod";

import { MEDIA_FORMATS, parseMediaFormat, type CollectionKind, type MediaFormat } from "@/lib/collection/types";

export const addReleaseInputSchema = z.object({
  discogsId: z.coerce.number().int().positive(),
  format: z.enum(MEDIA_FORMATS),
  kind: z.enum(["owned", "wishlist"]).catch("owned"),
  notes: z.string().max(4000).catch(""),
});

export type AddReleaseInput = {
  discogsId: number;
  format: MediaFormat;
  kind: Exclude<CollectionKind, "favorite">;
  notes: string;
};

const optionalText = (max: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (typeof value !== "string") {
        return null;
      }

      const next = value.trim();
      return next.length === 0 ? null : next.slice(0, max);
    })
    .catch(null);

export const collectionWriteSchema = z.object({
  discogsId: z.number().int().positive().nullable().catch(null),
  format: z.enum(MEDIA_FORMATS),
  title: z.string().trim().min(1).max(500),
  artist: z.string().trim().min(1).max(500),
  year: z.number().int().min(1000).max(2100).nullable().catch(null),
  label: optionalText(300),
  genres: z.array(z.string()).catch([]).transform((genres) =>
    genres
      .filter((genre) => typeof genre === "string" && genre.trim().length > 0)
      .map((genre) => genre.trim().slice(0, 80))
      .slice(0, 24),
  ),
  coverUrl: optionalText(2000),
  coverThumbUrl: optionalText(2000),
  barcode: optionalText(80),
  catalogNumber: optionalText(80),
  notes: optionalText(4000),
  isFavorite: z.boolean().catch(false),
  isWishlist: z.boolean().catch(false),
});

export type CollectionWrite = z.infer<typeof collectionWriteSchema>;

export function parseAddReleaseInput(input: unknown): AddReleaseInput | null {
  const parsed = addReleaseInputSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}

export function parseCollectionWrite(input: unknown): CollectionWrite | null {
  const parsed = collectionWriteSchema.safeParse(input);

  if (parsed.success) {
    return parsed.data;
  }

  if (!input || typeof input !== "object") {
    return null;
  }

  const row = input as Record<string, unknown>;
  const title = typeof row.title === "string" ? row.title.trim().slice(0, 500) : "";
  const artist = typeof row.artist === "string" ? row.artist.trim().slice(0, 500) : "";
  const format = parseMediaFormat(typeof row.format === "string" ? row.format : undefined);

  if (!title || !artist || !format) {
    console.error("Resonance collection write rejected", {
      fields: parsed.error.issues.map((issue) => issue.path.join(".") || "root"),
    });
    return null;
  }

  return {
    discogsId: typeof row.discogsId === "number" && row.discogsId > 0 ? row.discogsId : null,
    format,
    title,
    artist,
    year: null,
    label: null,
    genres: [],
    coverUrl: null,
    coverThumbUrl: null,
    barcode: null,
    catalogNumber: null,
    notes: typeof row.notes === "string" && row.notes.trim() ? row.notes.trim().slice(0, 4000) : null,
    isFavorite: row.isFavorite === true,
    isWishlist: row.isWishlist === true,
  };
}
