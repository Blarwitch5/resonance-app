import { parseStoredReturn } from "@/components/return-path";
import type { EchoSeed } from "@/lib/collection/echo";
import { journalFromHref } from "@/lib/collection/href";
import {
  parseMediaFormat,
  resolveWhenListen,
  whenListenFromParams,
  type CollectionQuery,
  type MediaFormat,
  type ShelfPresence,
} from "@/lib/collection/types";

export type ExplorerFormatParam = MediaFormat | "all";

export interface ExplorerQuery {
  query?: string;
  page?: number;
  format?: ExplorerFormatParam;
  genre?: string;
  label?: string;
  decade?: number;
  year?: number;
}

export const MAX_SEARCH_PAGE = 50;

export function parseSearchPage(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? "1", 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return Math.min(parsed, MAX_SEARCH_PAGE);
}

export function resolveExplorerFormat(
  requested: string | undefined,
  enabled: readonly MediaFormat[],
  preferred: MediaFormat,
): MediaFormat | undefined {
  if (requested === "all") {
    return undefined;
  }

  const parsed = parseMediaFormat(requested);

  if (parsed && enabled.includes(parsed)) {
    return parsed;
  }

  if (enabled.length === 1) {
    return enabled[0];
  }

  return preferred;
}

export function explorerSearchHref(input: ExplorerQuery = {}): string {
  const params = new URLSearchParams();
  const query = input.query?.trim() ?? "";

  if (query.length > 0) {
    params.set("q", query);
  }

  if (input.format) {
    params.set("format", input.format);
  }

  if (input.genre) {
    params.set("genre", input.genre);
  }

  if (input.label) {
    params.set("label", input.label);
  }

  const when = resolveExplorerWhen(input.year, input.decade);

  if (when.decade !== undefined) {
    params.set("decade", String(when.decade));
  }

  if (when.year !== undefined) {
    params.set("year", String(when.year));
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  const search = params.toString();
  return search.length > 0 ? `/explorer?${search}` : "/explorer";
}

export const EXPLORER_SEARCH_DEBOUNCE_MS = 800;

export function listenFromExplorerSearchInput(listen: ExplorerQuery, value: string): ExplorerQuery {
  const query = value.trim();

  return {
    ...listen,
    query: query.length > 0 ? query : undefined,
    page: undefined,
  };
}

export function hasExplorerListen(listen: ExplorerQuery): boolean {
  return Boolean(
    listen.query || listen.genre || listen.label || listen.decade !== undefined || listen.year !== undefined,
  );
}

export function explorerListenCount(listen: ExplorerQuery): number {
  let count = 0;

  if (listen.genre) {
    count += 1;
  }

  if (listen.label) {
    count += 1;
  }

  if (listen.decade !== undefined) {
    count += 1;
  }

  if (listen.year !== undefined) {
    count += 1;
  }

  return count;
}

export function explorerClearHref(listen: ExplorerQuery): string {
  return explorerSearchHref({
    query: listen.query,
    format: listen.format,
  });
}

export function explorerListenFromShelf(
  listen: Pick<CollectionQuery, "query" | "artist" | "label" | "genre" | "decade" | "year" | "format">,
): ExplorerQuery {
  const typed = listen.query?.trim() ?? "";

  if (typed.length > 0) {
    return { query: typed, format: listen.format };
  }

  return {
    query: listen.artist,
    format: listen.format,
    genre: listen.genre,
    label: listen.artist ? undefined : listen.label,
    decade: listen.year !== undefined ? undefined : listen.decade,
    ...(listen.year !== undefined ? { year: listen.year } : {}),
  };
}

export function explorerListenFromEcho(seed: EchoSeed, format?: MediaFormat): ExplorerQuery {
  if (seed.kind === "genre") {
    return { genre: seed.name, format };
  }

  return { query: seed.query, format };
}

export function explorerQueryFromPressing(artist: string, title: string): string {
  return [artist.trim(), title.trim()].filter((part) => part.length > 0).join(" ");
}

export function discogsYearRange(decade: number): string {
  return `${decade}-${decade + 9}`;
}

export function discogsYearParam(input: { year?: number; decade?: number }): string | undefined {
  if (input.year !== undefined) {
    return String(input.year);
  }

  if (input.decade !== undefined) {
    return discogsYearRange(input.decade);
  }

  return undefined;
}

export function resolveExplorerWhen(
  year: number | undefined,
  decade: number | undefined,
): { year?: number; decade?: number } {
  return resolveWhenListen(year, decade);
}

export function explorerWhenFromParams(
  year: string | undefined,
  decade: string | undefined,
): { year?: number; decade?: number } {
  return whenListenFromParams(year, decade);
}

export function discogsReleaseHref(discogsId: number): string | null {
  if (!Number.isInteger(discogsId) || discogsId <= 0) {
    return null;
  }

  return `https://www.discogs.com/release/${discogsId}`;
}

export function explorerAddHref(discogsId: number, from?: string | null): string | null {
  if (!Number.isInteger(discogsId) || discogsId <= 0) {
    return null;
  }

  const path = `/explorer/add/${discogsId}`;
  const listen = from ? parseStoredReturn("/explorer", from) : null;

  if (!listen || listen === "/explorer") {
    return path;
  }

  return `${path}?from=${encodeURIComponent(listen)}`;
}

export function explorerManualHref(from?: string | null): string {
  const path = "/explorer/manual";
  const listen = from ? parseStoredReturn("/explorer", from) : null;

  if (!listen || listen === "/explorer") {
    return path;
  }

  return `${path}?from=${encodeURIComponent(listen)}`;
}

export function explorerBackHref(from: string | undefined): string {
  return parseStoredReturn("/explorer", from ?? null) ?? "/explorer";
}

export function explorerCardHref(
  presence: ShelfPresence,
  discogsId: number | null,
  from?: string | null,
): string | null {
  if (presence.status === "owned" || presence.status === "wishlist") {
    return journalFromHref(presence.itemId, from);
  }

  if (discogsId === null) {
    return null;
  }

  return explorerAddHref(discogsId, from);
}
