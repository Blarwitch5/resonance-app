import { withListReturn } from "@/components/return-path";
import {
  parseMediaFormat,
  resolveWhenListen,
  whenListenFromParams,
  type CollectionQuery,
  type MediaFormat,
} from "@/lib/collection/types";

export function collectionHref(input: CollectionQuery = {}): string {
  const params = new URLSearchParams();

  if (input.format) {
    params.set("format", input.format);
  }

  if (input.query) {
    params.set("q", input.query);
  }

  if (input.sort && input.sort !== "recent") {
    params.set("sort", input.sort);
  }

  if (input.keptClose) {
    params.set("kept", "1");
  }

  if (input.artist) {
    params.set("artist", input.artist);
  }

  if (input.genre) {
    params.set("genre", input.genre);
  }

  if (input.label) {
    params.set("label", input.label);
  }

  if (input.found) {
    params.set("found", input.found);
  }

  if (input.when !== undefined) {
    params.set("when", String(input.when));
  }

  if (input.arrived !== undefined) {
    params.set("arrived", String(input.arrived));
  }

  if (input.condition) {
    params.set("condition", input.condition);
  }

  const when = resolveWhenListen(input.year, input.decade);

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
  return search.length > 0 ? `/collection?${search}` : "/collection";
}

export function journalHref(id: string, wave = false): string {
  return wave ? `/collection/${id}?wave=1` : `/collection/${id}`;
}

export function journalFromHref(id: string, from?: string | null, wave = false): string {
  return withListReturn(journalHref(id, wave), from);
}

export function parseWaveFlag(value: string | undefined): boolean {
  return value === "1";
}

export function formatListenFromLocation(
  pathname: string,
  format?: string,
  enabled?: readonly MediaFormat[],
): MediaFormat | undefined {
  if (pathname !== "/collection") {
    return undefined;
  }

  const parsed = parseMediaFormat(format);

  if (!parsed) {
    return undefined;
  }

  if (enabled && !enabled.includes(parsed)) {
    return undefined;
  }

  return parsed;
}

export function collectionFormatHref(search: string, format?: MediaFormat): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);

  if (format) {
    params.set("format", format);
  } else {
    params.delete("format");
  }

  params.delete("page");
  writeWhenParams(params);
  const next = params.toString();
  return next.length > 0 ? `/collection?${next}` : "/collection";
}

function writeWhenParams(params: URLSearchParams): void {
  const when = whenListenFromParams(params.get("year") ?? undefined, params.get("decade") ?? undefined);
  params.delete("year");
  params.delete("decade");

  if (when.decade !== undefined) {
    params.set("decade", String(when.decade));
  }

  if (when.year !== undefined) {
    params.set("year", String(when.year));
  }
}

export function collectionFormatNavHref(
  pathname: string,
  search: string,
  format?: MediaFormat,
): string {
  if (pathname === "/collection") {
    return collectionFormatHref(search, format);
  }

  return collectionHref({ format });
}
