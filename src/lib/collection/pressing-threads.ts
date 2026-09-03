import { collectionHref } from "@/lib/collection/href";
import {
  decadeFromYear,
  parseArtistFilter,
  parseFoundFilter,
  parseGenreFilter,
  parseLabelFilter,
  parseWhenFilter,
  whenFromDate,
  type MediaCondition,
  type MediaFormat,
} from "@/lib/collection/types";
import { discogsReleaseHref, explorerQueryFromPressing, explorerSearchHref } from "@/lib/discogs/href";
import { conditionLabel, decadeName, hearDecadeOnShelf, hearOnShelf } from "@/lib/i18n/labels";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

export interface PressingThreadSource {
  format: MediaFormat;
  title: string;
  artist: string;
  year: number | null;
  label: string | null;
  genres: string[];
  barcode: string | null;
  discogsId?: number | null;
  country?: string | null;
  catalogNumber?: string | null;
  formatNames?: string[];
  creditLine?: string | null;
  condition?: MediaCondition | null;
  purchaseLocation?: string | null;
  purchaseDate?: Date | string | null;
}

export interface PressingThreadView {
  format: MediaFormat;
  formatHref: string;
  title: string;
  artist: string;
  artistHref: string | null;
  year: number | null;
  yearHref: string | null;
  yearAria: string | null;
  decade: { label: string; href: string; ariaLabel: string } | null;
  label: string | null;
  labelHref: string | null;
  country: string | null;
  catalogNumber: string | null;
  formatLine: string | null;
  creditLine: string | null;
  genres: Array<{ name: string; href: string }>;
  condition: { label: string; href: string; ariaLabel: string } | null;
  barcode: string | null;
  found: { where: string; when: string | null; href: string | null; whenHref: string | null } | null;
  discogs: { href: string; title: string; artist: string; id: number } | null;
  elsewhereHref: string;
}

export function toPressingThreads(source: PressingThreadSource, locale: Locale = "en"): PressingThreadView {
  const artist = parseArtistFilter(source.artist);
  const label = parseLabelFilter(source.label ?? undefined);
  const pressedYear = parseWhenFilter(source.year === null ? undefined : String(source.year));
  const decade = decadeFromYear(pressedYear ?? null);
  const decadeTitle = decade !== undefined ? decadeName(locale, decade) : null;
  const foundPlace = parseFoundFilter(source.purchaseLocation ?? undefined);
  const foundWhen = toFoundWhen(source.purchaseDate);
  const foundYear = whenFromDate(source.purchaseDate);
  const foundWhere = source.purchaseLocation?.trim() || null;
  const condition = source.condition ?? null;
  const discogsId = source.discogsId ?? null;
  const formatNames = source.formatNames ?? [];
  const formatLine = formatNames.slice(0, 3).join(" · ");

  const discogsHref = discogsId ? discogsReleaseHref(discogsId) : null;

  return {
    format: source.format,
    formatHref: collectionHref({ format: source.format }),
    title: source.title,
    artist: source.artist,
    artistHref: artist ? collectionHref({ artist }) : null,
    year: source.year,
    yearHref: pressedYear !== undefined ? collectionHref({ year: pressedYear }) : null,
    yearAria: pressedYear !== undefined ? hearOnShelf(locale, String(pressedYear)) : null,
    decade:
      decade === undefined || decadeTitle === null
        ? null
        : {
            label: decadeTitle,
            href: collectionHref({ decade }),
            ariaLabel: hearDecadeOnShelf(locale, decadeTitle),
          },
    label: source.label,
    labelHref: label ? collectionHref({ label }) : null,
    country: source.country?.trim() || null,
    catalogNumber: source.catalogNumber?.trim() || null,
    formatLine: formatLine.length > 0 ? formatLine : null,
    creditLine: source.creditLine?.trim() || null,
    genres: source.genres.slice(0, 4).flatMap((name) => {
      const genre = parseGenreFilter(name);
      return genre ? [{ name: genre, href: collectionHref({ genre }) }] : [];
    }),
    condition: condition
      ? {
          label: conditionLabel(locale, condition),
          href: collectionHref({ condition }),
          ariaLabel: t(locale, "thread.hearCondition", {
            condition: conditionLabel(locale, condition).toLowerCase(),
          }),
        }
      : null,
    barcode: source.barcode,
    found:
      foundWhere || foundWhen
        ? {
            where: foundWhere ?? t(locale, "journal.somewhere"),
            when: foundWhen,
            href: foundPlace ? collectionHref({ found: foundPlace }) : null,
            whenHref: foundYear !== undefined ? collectionHref({ when: foundYear }) : null,
          }
        : null,
    discogs: discogsHref && discogsId
      ? {
          href: discogsHref,
          title: source.title,
          artist: source.artist,
          id: discogsId,
        }
      : null,
    elsewhereHref: explorerSearchHref({
      query: explorerQueryFromPressing(source.artist, source.title),
      format: source.format,
    }),
  };
}

function toFoundWhen(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const when = value.trim();
  return when.length > 0 ? when.slice(0, 10) : null;
}
