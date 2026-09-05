import "server-only";

import type { MediaFormat, RecordSide, ReleaseDraft } from "@/lib/collection/types";
import { toRecordSides, toReleaseDraftFromCollection, toReleasePreview } from "@/lib/discogs/adapter";
import { isBarcodeQuery, normalizeBarcode } from "@/lib/discogs/barcode";
import { discogsYearParam } from "@/lib/discogs/href";
import { parseMarketplaceStats, type MarketplaceAsk } from "@/lib/discogs/market";
import type { DiscogsCollectionEntry, DiscogsRelease, DiscogsSearchHit } from "@/lib/discogs/types";
import { getEnv } from "@/lib/env";
import { DiscogsError } from "@/lib/errors";

const DISCOGS_API = "https://api.discogs.com";
const USER_AGENT = "Resonance/0.1 +https://github.com/blarwitch5/resonance";
const IMPORT_PER_PAGE = 50;
const IMPORT_MAX_PAGES = 4;
const SEARCH_PER_PAGE = 20;

const DISCOGS_FORMAT: Record<MediaFormat, string> = {
  vinyl: "Vinyl",
  cassette: "Cassette",
  cd: "CD",
};

export interface DiscogsSearchPage {
  hits: DiscogsSearchHit[];
  page: number;
  pages: number;
}

interface DiscogsSearchResponse {
  results?: DiscogsSearchHit[];
  pagination?: { page?: number; pages?: number };
}

interface DiscogsPagedResponse {
  pagination?: { pages?: number };
  releases?: DiscogsCollectionEntry[];
  wants?: DiscogsCollectionEntry[];
}

async function discogsFetch(path: string, cache: "revalidate" | "none" = "revalidate"): Promise<Response> {
  const env = getEnv();
  const url = new URL(path, DISCOGS_API);

  try {
    return await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
        Authorization: `Discogs key=${env.DISCOGS_CONSUMER_KEY}, secret=${env.DISCOGS_CONSUMER_SECRET}`,
      },
      ...(cache === "none" ? { cache: "no-store" as const } : { next: { revalidate: 60 * 60 } }),
    });
  } catch (error) {
    throw new DiscogsError("Discogs could not be reached.", { cause: error });
  }
}

async function readJson<T>(response: Response): Promise<T> {
  if (response.status === 429) {
    throw new DiscogsError("Discogs asked us to slow down. Try again in a moment.");
  }

  if (response.status === 404) {
    throw new DiscogsError("That release is no longer on Discogs.");
  }

  if (!response.ok) {
    throw new DiscogsError(`Discogs request failed (${response.status}).`);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new DiscogsError("Discogs returned an unreadable response.", { cause: error });
  }
}

export async function searchDiscogs(listen: {
  query?: string;
  page?: number;
  format?: MediaFormat;
  genre?: string;
  label?: string;
  decade?: number;
  year?: number;
}): Promise<DiscogsSearchPage> {
  const trimmed = listen.query?.trim() ?? "";
  const safePage = Number.isInteger(listen.page) && (listen.page ?? 0) > 0 ? (listen.page ?? 1) : 1;
  const hasThread = Boolean(
    listen.genre || listen.label || listen.decade !== undefined || listen.year !== undefined,
  );

  if (trimmed.length === 0 && !hasThread) {
    return { hits: [], page: 1, pages: 1 };
  }

  if (trimmed.length > 0 && isBarcodeQuery(trimmed)) {
    const barcodePage = await searchDiscogsPath(
      searchPath({ barcode: normalizeBarcode(trimmed), page: safePage }),
    );

    if (barcodePage.hits.length > 0 || safePage > 1) {
      return barcodePage;
    }
  }

  return searchDiscogsPath(
    searchPath({
      query: trimmed.length > 0 ? trimmed : undefined,
      page: safePage,
      format: listen.format,
      genre: listen.genre,
      label: listen.label,
      decade: listen.decade,
      year: listen.year,
    }),
  );
}

function searchPath(input: {
  query?: string;
  barcode?: string;
  page: number;
  format?: MediaFormat;
  genre?: string;
  label?: string;
  decade?: number;
  year?: number;
}): string {
  const params = new URLSearchParams({
    type: "release",
    per_page: String(SEARCH_PER_PAGE),
    page: String(input.page),
  });

  if (input.barcode) {
    params.set("barcode", input.barcode);
  } else if (input.query) {
    params.set("q", input.query);
  }

  if (input.format) {
    params.set("format", DISCOGS_FORMAT[input.format]);
  }

  if (input.genre) {
    params.set("genre", input.genre);
  }

  if (input.label) {
    params.set("label", input.label);
  }

  const year = discogsYearParam({ year: input.year, decade: input.decade });

  if (year) {
    params.set("year", year);
  }

  return `/database/search?${params.toString()}`;
}

async function searchDiscogsPath(path: string): Promise<DiscogsSearchPage> {
  const response = await discogsFetch(path);
  const payload = await readJson<DiscogsSearchResponse>(response);
  const page = payload.pagination?.page ?? 1;
  const pages = payload.pagination?.pages ?? 1;

  return {
    hits: payload.results ?? [],
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pages: Number.isInteger(pages) && pages > 0 ? pages : 1,
  };
}

export async function getDiscogsRelease(discogsId: number): Promise<DiscogsRelease> {
  if (!Number.isInteger(discogsId) || discogsId <= 0) {
    throw new DiscogsError("That Discogs release could not be found.");
  }

  const response = await discogsFetch(`/releases/${discogsId}`);
  return readJson<DiscogsRelease>(response);
}

export async function getMarketplaceAsk(discogsId: number): Promise<MarketplaceAsk | null> {
  if (!Number.isInteger(discogsId) || discogsId <= 0) {
    return null;
  }

  try {
    const response = await discogsFetch(`/marketplace/stats/${discogsId}`);

    if (response.status === 404) {
      return null;
    }

    return parseMarketplaceStats(await readJson<unknown>(response));
  } catch (error) {
    if (error instanceof DiscogsError) {
      return null;
    }

    throw error;
  }
}

export interface ReleaseListen {
  sides: RecordSide[];
  country: string | null;
  catalogNumber: string | null;
  formatNames: string[];
  creditLine: string | null;
  coverThumbUrl: string | null;
}

export async function getReleaseListen(discogsId: number): Promise<ReleaseListen> {
  const release = await getDiscogsRelease(discogsId);
  const preview = toReleasePreview(release);

  return {
    sides: toRecordSides(release),
    country: preview.country,
    catalogNumber: preview.catalogNumber,
    formatNames: preview.formatNames,
    creditLine: preview.creditLine,
    coverThumbUrl: preview.coverThumbUrl ?? null,
  };
}

export interface DiscogsUserShelves {
  owned: ReleaseDraft[];
  wanted: ReleaseDraft[];
  truncated: boolean;
}

export async function listDiscogsUserShelves(username: string): Promise<DiscogsUserShelves> {
  const encoded = encodeURIComponent(username);
  const ownedPage = await listDiscogsPages(
    `/users/${encoded}/collection/folders/0/releases`,
    "releases",
    true,
  );
  const wantedPage = await listDiscogsPages(`/users/${encoded}/wants`, "wants", false);

  return {
    owned: uniqueDrafts(ownedPage.entries.flatMap(draftOrEmpty)),
    wanted: uniqueDrafts(wantedPage.entries.flatMap(draftOrEmpty)),
    truncated: ownedPage.truncated || wantedPage.truncated,
  };
}

function draftOrEmpty(entry: DiscogsCollectionEntry): ReleaseDraft[] {
  const draft = toReleaseDraftFromCollection(entry);
  return draft ? [draft] : [];
}

function uniqueDrafts(drafts: ReleaseDraft[]): ReleaseDraft[] {
  const seen = new Set<string>();
  const unique: ReleaseDraft[] = [];

  for (const draft of drafts) {
    if (draft.discogsId === null) {
      continue;
    }

    const key = `${draft.discogsId}:${draft.format}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(draft);
  }

  return unique;
}

async function listDiscogsPages(
  path: string,
  key: "releases" | "wants",
  required: boolean,
): Promise<{ entries: DiscogsCollectionEntry[]; truncated: boolean }> {
  const entries: DiscogsCollectionEntry[] = [];
  let truncated = false;

  for (let page = 1; page <= IMPORT_MAX_PAGES; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    const response = await discogsFetch(
      `${path}${separator}page=${page}&per_page=${IMPORT_PER_PAGE}`,
      "none",
    );

    if (response.status === 404 || response.status === 403) {
      if (required && page === 1) {
        throw new DiscogsError("That Discogs shelf could not be found, or it is private.");
      }

      return { entries, truncated };
    }

    const payload = await readJson<DiscogsPagedResponse>(response);
    const batch = payload[key] ?? [];
    entries.push(...batch);

    const totalPages = payload.pagination?.pages ?? 1;

    if (page >= totalPages) {
      return { entries, truncated };
    }

    if (page === IMPORT_MAX_PAGES) {
      truncated = true;
    }
  }

  return { entries, truncated };
}
