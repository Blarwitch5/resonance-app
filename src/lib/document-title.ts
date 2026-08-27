import { decadeLabel } from "@/lib/collection/stats";
import { CONDITION_LABELS, type MediaCondition, type MediaFormat } from "@/lib/collection/types";
import type { ProfileTab } from "@/lib/profile/types";

const MAX_LISTEN_TITLE = 48;

const FORMAT_TITLE: Record<MediaFormat, string> = {
  vinyl: "Vinyl",
  cassette: "Cassette",
  cd: "CD",
};

export function journalDocumentTitle(title: string, artist: string): string {
  const heading = title.trim();
  const who = artist.trim();

  if (heading.length === 0) {
    return who.length > 0 ? who : "Journal";
  }

  if (who.length === 0) {
    return heading;
  }

  return `${heading} — ${who}`;
}

export function collectionDocumentTitle(input: {
  query?: string;
  keptClose?: boolean;
  year?: number;
  artist?: string;
  decade?: number;
  label?: string;
  found?: string;
  when?: number;
  arrived?: number;
  genre?: string;
  condition?: MediaCondition;
  format?: MediaFormat;
}): string {
  const query = clipListenTitle(input.query);

  if (query) {
    return `${query} · Collection`;
  }

  if (input.year !== undefined) {
    return `${input.year} · Collection`;
  }

  const artist = clipListenTitle(input.artist);

  if (artist) {
    return `${artist} · Collection`;
  }

  if (input.decade !== undefined) {
    return `${decadeLabel(input.decade)} · Collection`;
  }

  const label = clipListenTitle(input.label);

  if (label) {
    return `${label} · Collection`;
  }

  const found = clipListenTitle(input.found);

  if (found) {
    return `${found} · Collection`;
  }

  if (input.when !== undefined) {
    return `Found in ${input.when} · Collection`;
  }

  if (input.arrived !== undefined) {
    return `Arrived ${input.arrived} · Collection`;
  }

  const genre = clipListenTitle(input.genre);

  if (genre) {
    return `${genre} · Collection`;
  }

  if (input.condition) {
    return `${CONDITION_LABELS[input.condition]} · Collection`;
  }

  if (input.format) {
    return `${FORMAT_TITLE[input.format]} · Collection`;
  }

  if (input.keptClose) {
    return "Kept close";
  }

  return "Collection";
}

export function explorerDocumentTitle(input: {
  query?: string;
  year?: number;
  decade?: number;
  genre?: string;
  label?: string;
}): string {
  const query = clipListenTitle(input.query);

  if (query) {
    return `${query} · Explorer`;
  }

  if (input.year !== undefined) {
    return `${input.year} · Explorer`;
  }

  if (input.decade !== undefined) {
    return `${decadeLabel(input.decade)} · Explorer`;
  }

  const genre = clipListenTitle(input.genre);

  if (genre) {
    return `${genre} · Explorer`;
  }

  const label = clipListenTitle(input.label);

  if (label) {
    return `${label} · Explorer`;
  }

  return "Explorer";
}

export function profileDocumentTitle(input: {
  tab: ProfileTab;
  settings?: boolean;
  query?: string;
}): string {
  if (input.settings) {
    return "Settings";
  }

  const place = input.tab === "close" ? "Kept close" : input.tab === "waiting" ? "Waiting" : "Profile";
  const listen = clipListenTitle(input.query);
  return listen ? `${listen} · ${place}` : place;
}

function clipListenTitle(value: string | undefined): string | undefined {
  const listen = value?.trim() ?? "";

  if (listen.length === 0) {
    return undefined;
  }

  if (listen.length <= MAX_LISTEN_TITLE) {
    return listen;
  }

  return `${listen.slice(0, MAX_LISTEN_TITLE).trimEnd()}…`;
}
