export const MEDIA_FORMATS = ["vinyl", "cassette", "cd"] as const;

export type MediaFormat = (typeof MEDIA_FORMATS)[number];

export const FORMAT_LABELS: Record<MediaFormat, string> = {
  vinyl: "Vinyl",
  cassette: "Cassette",
  cd: "CD",
};

export const MEDIA_CONDITIONS = [
  "mint",
  "near_mint",
  "very_good_plus",
  "very_good",
  "good_plus",
  "good",
  "fair",
  "poor",
] as const;

export type MediaCondition = (typeof MEDIA_CONDITIONS)[number];

export const CONDITION_LABELS: Record<MediaCondition, string> = {
  mint: "Mint",
  near_mint: "Near mint",
  very_good_plus: "Very good +",
  very_good: "Very good",
  good_plus: "Good +",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

export function parseMediaCondition(value: string | undefined): MediaCondition | undefined {
  return MEDIA_CONDITIONS.find((condition) => condition === value);
}

export type CollectionKind = "owned" | "wishlist" | "favorite";

export const COLLECTION_SORTS = ["recent", "artist", "year", "found"] as const;

export type CollectionSort = (typeof COLLECTION_SORTS)[number];

export function parseCollectionSort(value: string | undefined): CollectionSort {
  if (value === "artist" || value === "year" || value === "found") {
    return value;
  }

  return "recent";
}

export const MAX_COLLECTION_PAGE = 50;

export function parseCollectionPage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return Math.min(parsed, MAX_COLLECTION_PAGE);
}

export function parseKeptClose(value: string | undefined): boolean {
  return value === "1";
}

export interface CollectionQuery {
  format?: MediaFormat;
  query?: string;
  sort?: CollectionSort;
  page?: number;
  keptClose?: boolean;
  artist?: string;
  genre?: string;
  decade?: number;
  label?: string;
  found?: string;
  condition?: MediaCondition;
  when?: number;
  arrived?: number;
  year?: number;
}

export const MAX_ARTIST_FILTER = 120;
export const MAX_GENRE_FILTER = 80;
export const MAX_LABEL_FILTER = 120;
export const MAX_FOUND_FILTER = 120;

export function parseArtistFilter(value: string | undefined): string | undefined {
  const artist = value?.trim() ?? "";

  if (artist.length === 0 || artist.length > MAX_ARTIST_FILTER) {
    return undefined;
  }

  return artist;
}

export function parseGenreFilter(value: string | undefined): string | undefined {
  const genre = value?.trim() ?? "";

  if (genre.length === 0 || genre.length > MAX_GENRE_FILTER) {
    return undefined;
  }

  return genre;
}

export function parseLabelFilter(value: string | undefined): string | undefined {
  const label = value?.trim() ?? "";

  if (label.length === 0 || label.length > MAX_LABEL_FILTER) {
    return undefined;
  }

  return label;
}

export function parseFoundFilter(value: string | undefined): string | undefined {
  const found = value?.trim() ?? "";

  if (found.length === 0 || found.length > MAX_FOUND_FILTER) {
    return undefined;
  }

  return found;
}

export function parseWhenFilter(value: string | undefined): number | undefined {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2030) {
    return undefined;
  }

  return parsed;
}

export function parseWhenThread(value: string | undefined): { year?: number; decade?: number } {
  const trimmed = value?.trim() ?? "";

  if (/^\d{4}s$/i.test(trimmed)) {
    const decade = parseDecadeFilter(trimmed.slice(0, 4));
    return decade !== undefined ? { decade } : {};
  }

  const year = parseWhenFilter(trimmed);
  return year !== undefined ? { year } : {};
}

export function whenFromDate(value: Date | string | null | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const iso = value instanceof Date ? value.toISOString().slice(0, 10) : value.trim().slice(0, 10);
  return parseWhenFilter(iso.slice(0, 4));
}

export function foundDateLabel(value: Date | string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const iso = value instanceof Date ? value.toISOString().slice(0, 10) : value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : undefined;
}

export function parseDecadeFilter(value: string | undefined): number | undefined {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2020 || parsed % 10 !== 0) {
    return undefined;
  }

  return parsed;
}

export function decadeFromYear(year: number | null): number | undefined {
  if (year === null) {
    return undefined;
  }

  return parseDecadeFilter(String(Math.floor(year / 10) * 10));
}

export function resolveWhenListen(
  year: number | undefined,
  decade: number | undefined,
): { year?: number; decade?: number } {
  if (year !== undefined) {
    return { year };
  }

  if (decade !== undefined) {
    return { decade };
  }

  return {};
}

export function whenListenFromParams(
  year: string | undefined,
  decade: string | undefined,
): { year?: number; decade?: number } {
  const fromWhen = parseWhenThread(year);
  return resolveWhenListen(fromWhen.year, fromWhen.decade ?? parseDecadeFilter(decade));
}

export function isCanonicalWhenParams(year: string | undefined, decade: string | undefined): boolean {
  const when = whenListenFromParams(year, decade);
  const yearParam = year?.trim() || undefined;
  const decadeParam = decade?.trim() || undefined;
  const expectedYear = when.year !== undefined ? String(when.year) : undefined;
  const expectedDecade = when.decade !== undefined ? String(when.decade) : undefined;

  return yearParam === expectedYear && decadeParam === expectedDecade;
}

export type ShelfPresence =
  | { status: "absent" }
  | { status: "owned"; itemId: string }
  | { status: "wishlist"; itemId: string };

export function parseMediaFormat(value: string | undefined): MediaFormat | undefined {
  if (value === "vinyl" || value === "cassette" || value === "cd") {
    return value;
  }

  return undefined;
}

export interface ReleaseDraft {
  discogsId: number | null;
  format: MediaFormat;
  title: string;
  artist: string;
  year: number | null;
  label: string | null;
  genres: string[];
  coverUrl: string | null;
  barcode: string | null;
  catalogNumber: string | null;
}

export interface RecordTrack {
  position: string;
  title: string;
  duration: string | null;
  previewUrl: string | null;
}

export interface RecordSide {
  heading: string | null;
  tracks: RecordTrack[];
}

export interface ShelfNeighbor {
  id: string;
  title: string;
}
