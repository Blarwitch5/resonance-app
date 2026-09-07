import { z } from "zod";

import { MEDIA_FORMATS, type CollectionKind, type MediaFormat } from "@/lib/collection/types";

export type AddReleaseInput = {
  discogsId: number;
  format: MediaFormat;
  kind: Exclude<CollectionKind, "favorite">;
  notes: string;
};

export const addReleaseInputSchema = z.object({
  discogsId: z.number().int().positive(),
  format: z.enum(MEDIA_FORMATS),
  kind: z.enum(["owned", "wishlist"]),
  notes: z.string().max(4000),
});

const nullableText = (max: number) => z.string().min(1).max(max).nullable();

export const collectionWriteSchema = z.object({
  discogsId: z.number().int().positive().nullable(),
  format: z.enum(MEDIA_FORMATS),
  title: z.string().min(1).max(500),
  artist: z.string().min(1).max(500),
  year: z.number().int().min(1000).max(2100).nullable(),
  label: nullableText(300),
  genres: z.array(z.string().min(1).max(80)).max(24),
  coverUrl: nullableText(2000),
  coverThumbUrl: nullableText(2000),
  barcode: nullableText(80),
  catalogNumber: nullableText(80),
  notes: nullableText(4000),
  isFavorite: z.boolean(),
  isWishlist: z.boolean(),
});

export type CollectionWrite = z.infer<typeof collectionWriteSchema>;

function clippedText(value: unknown, max: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const next = value.trim();
  return next.length === 0 ? null : next.slice(0, max);
}

function normalizeYear(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }

  if (value < 1000 || value > 2100) {
    return null;
  }

  return value;
}

function normalizeGenres(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new Error("genres");
  }

  return value
    .filter((genre): genre is string => typeof genre === "string")
    .map((genre) => genre.trim())
    .filter((genre) => genre.length > 0)
    .map((genre) => genre.slice(0, 80))
    .slice(0, 24);
}

function normalizeDiscogsId(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

export function normalizeCollectionWrite(input: Record<string, unknown>): CollectionWrite {
  return collectionWriteSchema.parse({
    discogsId: normalizeDiscogsId(input.discogsId),
    format: input.format,
    title: typeof input.title === "string" ? input.title.trim().slice(0, 500) : input.title,
    artist: typeof input.artist === "string" ? input.artist.trim().slice(0, 500) : input.artist,
    year: normalizeYear(input.year),
    label: clippedText(input.label, 300),
    genres: normalizeGenres(input.genres),
    coverUrl: clippedText(input.coverUrl, 2000),
    coverThumbUrl: clippedText(input.coverThumbUrl, 2000),
    barcode: clippedText(input.barcode, 80),
    catalogNumber: clippedText(input.catalogNumber, 80),
    notes: clippedText(input.notes, 4000),
    isFavorite: input.isFavorite,
    isWishlist: input.isWishlist,
  });
}

export function parseCollectionWrite(input: unknown): CollectionWrite | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  try {
    return normalizeCollectionWrite(input as Record<string, unknown>);
  } catch {
    return null;
  }
}

function readDiscogsId(value: unknown): unknown {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }

  return value;
}

export function parseAddReleaseInput(input: unknown): AddReleaseInput | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const row = input as Record<string, unknown>;
  const parsed = addReleaseInputSchema.safeParse({
    discogsId: readDiscogsId(row.discogsId),
    format: row.format,
    kind: row.kind,
    notes: row.notes ?? "",
  });

  return parsed.success ? parsed.data : null;
}
