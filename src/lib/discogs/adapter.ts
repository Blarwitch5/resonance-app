import type { MediaFormat, RecordSide, RecordTrack, ReleaseDraft } from "@/lib/collection/types";
import { pressingCreditLine } from "@/lib/discogs/credits";
import type {
  DiscogsBasicInformation,
  DiscogsCollectionEntry,
  DiscogsRelease,
  DiscogsSearchHit,
  DiscogsTrack,
} from "@/lib/discogs/types";

function mapDiscogsFormat(name: string | undefined): MediaFormat {
  const normalized = name?.toLowerCase() ?? "";

  if (normalized.includes("cass")) {
    return "cassette";
  }

  if (normalized.includes("cd")) {
    return "cd";
  }

  return "vinyl";
}

function splitSearchTitle(title: string): { artist: string; title: string } {
  const separator = " - ";
  const index = title.indexOf(separator);

  if (index <= 0) {
    return { artist: "Unknown artist", title: title.trim() };
  }

  return {
    artist: title.slice(0, index).trim() || "Unknown artist",
    title: title.slice(index + separator.length).trim() || title.trim(),
  };
}

function parseYear(value: string | number | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const year = Number.parseInt(value, 10);
    return Number.isFinite(year) ? year : null;
  }

  return null;
}

function usableCoverUrl(url: string | undefined): string | null {
  if (!url || url.includes("spacer.gif")) {
    return null;
  }

  return url;
}

export function toReleaseDraftFromSearch(hit: DiscogsSearchHit): ReleaseDraft {
  const split = splitSearchTitle(hit.title);
  const cover = usableCoverUrl(hit.cover_image) ?? usableCoverUrl(hit.thumb);

  return {
    discogsId: hit.id,
    format: mapDiscogsFormat(hit.format?.[0]),
    title: split.title,
    artist: split.artist,
    year: parseYear(hit.year),
    label: hit.label?.[0] ?? null,
    genres: hit.genre ?? [],
    coverUrl: cover,
    barcode: hit.barcode?.[0] ?? null,
  };
}

export function toReleaseDraft(release: DiscogsRelease): ReleaseDraft {
  const primaryCover =
    release.images?.find((image) => image.type === "primary") ?? release.images?.[0];
  const barcode = release.identifiers?.find((entry) =>
    entry.type.toLowerCase().includes("barcode"),
  );

  const artist =
    release.artists
      ?.map((entry) => entry.name)
      .filter((name) => name.length > 0)
      .join(", ") || "Unknown artist";

  return {
    discogsId: release.id,
    format: mapDiscogsFormat(release.formats?.[0]?.name),
    title: release.title.trim(),
    artist,
    year: release.year ?? null,
    label: release.labels?.[0]?.name ?? null,
    genres: [...(release.genres ?? []), ...(release.styles ?? [])],
    coverUrl: usableCoverUrl(primaryCover?.uri),
    barcode: barcode?.value ?? null,
  };
}

export interface ReleasePreview extends ReleaseDraft {
  country: string | null;
  catalogNumber: string | null;
  formatNames: string[];
  creditLine: string | null;
}

export function toReleasePreview(release: DiscogsRelease): ReleasePreview {
  const formatNames = (release.formats ?? [])
    .map((entry) => entry.name.trim())
    .filter((name) => name.length > 0);

  return {
    ...toReleaseDraft(release),
    country: release.country?.trim() || null,
    catalogNumber: catalogNumberFromRelease(release),
    formatNames,
    creditLine: pressingCreditLine(release.extraartists ?? []),
  };
}

const MAX_CATALOG_NUMBER = 40;

function catalogNumberFromRelease(release: DiscogsRelease): string | null {
  const fromIdentifier = release.identifiers?.find(
    (entry) => entry.type.trim().toLowerCase() === "catalog number",
  );

  return clipCatalogNumber(release.labels?.[0]?.catno) ?? clipCatalogNumber(fromIdentifier?.value);
}

function clipCatalogNumber(value: string | undefined): string | null {
  const catalog = value?.trim() ?? "";

  if (catalog.length === 0) {
    return null;
  }

  if (catalog.length <= MAX_CATALOG_NUMBER) {
    return catalog;
  }

  return catalog.slice(0, MAX_CATALOG_NUMBER).trimEnd();
}

function draftFromBasicInformation(info: DiscogsBasicInformation): ReleaseDraft | null {
  const title = info.title.trim();
  const artist =
    info.artists
      ?.map((entry) => entry.name?.trim() ?? "")
      .filter((name) => name.length > 0)
      .join(", ") || "Unknown artist";

  if (title.length === 0 || !Number.isInteger(info.id) || info.id <= 0) {
    return null;
  }

  return {
    discogsId: info.id,
    format: mapDiscogsFormat(info.formats?.[0]?.name),
    title,
    artist,
    year: info.year ?? null,
    label: info.labels?.[0]?.name?.trim() || null,
    genres: [...(info.genres ?? []), ...(info.styles ?? [])],
    coverUrl: usableCoverUrl(info.cover_image) ?? usableCoverUrl(info.thumb),
    barcode: null,
  };
}

export function toReleaseDraftFromCollection(entry: DiscogsCollectionEntry): ReleaseDraft | null {
  if (!entry.basic_information) {
    return null;
  }

  return draftFromBasicInformation(entry.basic_information);
}

export function toRecordSides(release: DiscogsRelease): RecordSide[] {
  const sides: RecordSide[] = [];
  let current: RecordSide = { heading: null, tracks: [] };

  for (const entry of release.tracklist ?? []) {
    const type = entry.type_ ?? "track";

    if (type === "heading") {
      if (current.heading !== null || current.tracks.length > 0) {
        sides.push(current);
      }

      current = { heading: entry.title?.trim() || null, tracks: [] };
      continue;
    }

    appendTracks(current.tracks, entry);
  }

  if (current.heading !== null || current.tracks.length > 0) {
    sides.push(current);
  }

  return sides.filter((side) => side.tracks.length > 0);
}

function appendTracks(tracks: RecordTrack[], entry: DiscogsTrack) {
  const track = toRecordTrack(entry);

  if (track) {
    tracks.push(track);
  }

  for (const nested of entry.sub_tracks ?? []) {
    const child = toRecordTrack(nested);

    if (child) {
      tracks.push(child);
    }
  }
}

function toRecordTrack(entry: DiscogsTrack): RecordTrack | null {
  const title = entry.title?.trim() ?? "";

  if (title.length === 0) {
    return null;
  }

  return {
    position: entry.position?.trim() ?? "",
    title,
    duration: entry.duration?.trim() || null,
    previewUrl: null,
  };
}
