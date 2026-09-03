import type { MediaCondition, MediaFormat } from "@/lib/collection/types";
import { conditionLabel, decadeName, formatLabel } from "@/lib/i18n/labels";
import { t } from "@/lib/i18n/translate";
import type { ProfileTab } from "@/lib/profile/types";
import type { Locale } from "@/lib/settings/types";

const MAX_LISTEN_TITLE = 48;

export function journalDocumentTitle(title: string, artist: string, locale: Locale = "en"): string {
  const heading = title.trim();
  const who = artist.trim();

  if (heading.length === 0) {
    return who.length > 0 ? who : t(locale, "document.journal");
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
  locale?: Locale;
}): string {
  const locale = input.locale ?? "en";
  const query = clipListenTitle(input.query);

  if (query) {
    return `${query} · ${t(locale, "document.collection")}`;
  }

  if (input.year !== undefined) {
    return `${input.year} · ${t(locale, "document.collection")}`;
  }

  const artist = clipListenTitle(input.artist);

  if (artist) {
    return `${artist} · ${t(locale, "document.collection")}`;
  }

  if (input.decade !== undefined) {
    return `${decadeName(locale, input.decade)} · ${t(locale, "document.collection")}`;
  }

  const label = clipListenTitle(input.label);

  if (label) {
    return `${label} · ${t(locale, "document.collection")}`;
  }

  const found = clipListenTitle(input.found);

  if (found) {
    return `${found} · ${t(locale, "document.collection")}`;
  }

  if (input.when !== undefined) {
    return t(locale, "document.foundIn", { year: input.when });
  }

  if (input.arrived !== undefined) {
    return t(locale, "document.arrived", { year: input.arrived });
  }

  const genre = clipListenTitle(input.genre);

  if (genre) {
    return `${genre} · ${t(locale, "document.collection")}`;
  }

  if (input.condition) {
    return `${conditionLabel(locale, input.condition)} · ${t(locale, "document.collection")}`;
  }

  if (input.format) {
    return `${formatLabel(locale, input.format)} · ${t(locale, "document.collection")}`;
  }

  if (input.keptClose) {
    return t(locale, "document.keptClose");
  }

  return t(locale, "document.collection");
}

export function explorerDocumentTitle(input: {
  query?: string;
  year?: number;
  decade?: number;
  genre?: string;
  label?: string;
  locale?: Locale;
}): string {
  const locale = input.locale ?? "en";
  const query = clipListenTitle(input.query);

  if (query) {
    return `${query} · ${t(locale, "document.explorer")}`;
  }

  if (input.year !== undefined) {
    return `${input.year} · ${t(locale, "document.explorer")}`;
  }

  if (input.decade !== undefined) {
    return `${decadeName(locale, input.decade)} · ${t(locale, "document.explorer")}`;
  }

  const genre = clipListenTitle(input.genre);

  if (genre) {
    return `${genre} · ${t(locale, "document.explorer")}`;
  }

  const label = clipListenTitle(input.label);

  if (label) {
    return `${label} · ${t(locale, "document.explorer")}`;
  }

  return t(locale, "document.explorer");
}

export function profileDocumentTitle(input: {
  tab: ProfileTab;
  settings?: boolean;
  query?: string;
  locale?: Locale;
}): string {
  const locale = input.locale ?? "en";

  if (input.settings) {
    return t(locale, "document.settings");
  }

  const place =
    input.tab === "close"
      ? t(locale, "document.keptClose")
      : input.tab === "waiting"
        ? t(locale, "document.waiting")
        : t(locale, "document.profile");
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
