import { z } from "zod";

import { MEDIA_FORMATS, type CollectionKind, type MediaFormat } from "@/lib/collection/types";

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
    .union([z.string(), z.null()])
    .transform((value) => {
      if (value == null) {
        return null;
      }

      const next = value.trim();
      return next.length === 0 ? null : next.slice(0, max);
    });

export const collectionWriteSchema = z.object({
  discogsId: z.number().int().positive().nullable().catch(null),
  format: z.enum(MEDIA_FORMATS),
  title: z.string().trim().min(1).max(500),
  artist: z.string().trim().min(1).max(500),
  year: z.number().int().min(1000).max(2100).nullable().catch(null),
  label: optionalText(300),
  genres: z
    .array(z.string().trim().min(1).max(80))
    .max(24)
    .catch([]),
  coverUrl: optionalText(2000),
  coverThumbUrl: optionalText(2000),
  barcode: optionalText(80),
  catalogNumber: optionalText(80),
  notes: optionalText(4000),
  isFavorite: z.boolean(),
  isWishlist: z.boolean(),
});

export type CollectionWrite = z.infer<typeof collectionWriteSchema>;

export function parseAddReleaseInput(input: unknown): AddReleaseInput | null {
  const parsed = addReleaseInputSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}

export function parseCollectionWrite(input: unknown): CollectionWrite | null {
  const parsed = collectionWriteSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}
