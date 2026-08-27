import { collectionHref } from "@/lib/collection/href";
import { decadeLabel } from "@/lib/collection/stats";
import {
  CONDITION_LABELS,
  FORMAT_LABELS,
  decadeFromYear,
  parseArtistFilter,
  parseFoundFilter,
  parseGenreFilter,
  parseLabelFilter,
  parseWhenFilter,
  whenFromDate,
  type CollectionQuery,
  type MediaCondition,
  type MediaFormat,
} from "@/lib/collection/types";

export interface ShelfCardThread {
  label: string;
  href: string | null;
  ariaLabel: string | null;
}

export interface ShelfCardThreadView {
  artist: ShelfCardThread | null;
  year: ShelfCardThread | null;
  label: ShelfCardThread | null;
  genre: { label: string; href: string; ariaLabel: string } | null;
  format: ShelfCardThread | null;
  decade: ShelfCardThread | null;
  condition: { label: string; href: string; ariaLabel: string } | null;
  found: ShelfCardThread | null;
  foundWhen: ShelfCardThread | null;
}

export function shelfCardThreads(
  item: {
    artist: string;
    year: number | null;
    label?: string | null;
    genres?: readonly string[];
    format?: MediaFormat | null;
    condition?: MediaCondition | null;
    found?: string | null;
    foundWhen?: Date | string | null;
  },
  listen: CollectionQuery,
): ShelfCardThreadView {
  const artist = parseArtistFilter(item.artist);
  const year = parseWhenFilter(item.year === null ? undefined : String(item.year));
  const label = parseLabelFilter(item.label ?? undefined);
  const genre = (item.genres ?? [])
    .map((name) => parseGenreFilter(name))
    .find((name) => name !== undefined && name !== listen.genre);
  const decade = year === undefined ? undefined : decadeFromYear(year);
  const decadeName = decade !== undefined ? decadeLabel(decade) : null;
  const isHearingArtist =
    artist !== undefined && (listen.artist?.trim().toLowerCase() ?? "") === artist.toLowerCase();
  const isHearingLabel =
    label !== undefined && (listen.label?.trim().toLowerCase() ?? "") === label.toLowerCase();
  const isHearingDecade = decade !== undefined && listen.decade === decade;
  const isHearingYear = year !== undefined && listen.year === year;
  const condition = item.condition ?? null;
  const isHearingCondition = condition !== null && listen.condition === condition;
  const found = parseFoundFilter(item.found ?? undefined);
  const isHearingFound =
    found !== undefined && (listen.found?.trim().toLowerCase() ?? "") === found.toLowerCase();
  const foundWhen = whenFromDate(item.foundWhen);
  const isHearingFoundWhen = foundWhen !== undefined && listen.when === foundWhen;

  return {
    artist: artist
      ? {
          label: artist,
          href: isHearingArtist ? null : collectionHref({ ...listen, artist, page: 1 }),
          ariaLabel: isHearingArtist ? null : `Hear ${artist} on your shelf`,
        }
      : null,
    year:
      year === undefined
        ? null
        : {
            label: String(year),
            href: isHearingYear ? null : collectionHref({ ...listen, year, decade: undefined, page: 1 }),
            ariaLabel: isHearingYear ? null : `Hear ${year} on your shelf`,
          },
    label: label
      ? {
          label,
          href: isHearingLabel ? null : collectionHref({ ...listen, label, page: 1 }),
          ariaLabel: isHearingLabel ? null : `Hear ${label} on your shelf`,
        }
      : null,
    genre: genre
      ? {
          label: genre,
          href: collectionHref({ ...listen, genre, page: 1 }),
          ariaLabel: `Hear ${genre} on your shelf`,
        }
      : null,
    format: item.format
      ? {
          label: FORMAT_LABELS[item.format],
          href:
            listen.format === item.format ? null : collectionHref({ ...listen, format: item.format, page: 1 }),
          ariaLabel: listen.format === item.format ? null : `Hear ${FORMAT_LABELS[item.format]} on your shelf`,
        }
      : null,
    decade:
      decade === undefined || decadeName === null
        ? null
        : {
            label: decadeName,
            href: isHearingDecade
              ? null
              : collectionHref({ ...listen, decade, year: undefined, page: 1 }),
            ariaLabel: isHearingDecade ? null : `Hear the ${decadeName} on your shelf`,
          },
    condition:
      condition === null || isHearingCondition
        ? null
        : {
            label: CONDITION_LABELS[condition],
            href: collectionHref({ ...listen, condition, page: 1 }),
            ariaLabel: `Hear ${CONDITION_LABELS[condition].toLowerCase()} pressings on your shelf`,
          },
    found: found
      ? {
          label: found,
          href: isHearingFound ? null : collectionHref({ ...listen, found, page: 1 }),
          ariaLabel: isHearingFound ? null : `Hear the records that found you in ${found}`,
        }
      : null,
    foundWhen:
      foundWhen === undefined
        ? null
        : {
            label: String(foundWhen),
            href: isHearingFoundWhen ? null : collectionHref({ ...listen, when: foundWhen, page: 1 }),
            ariaLabel: isHearingFoundWhen ? null : `Hear the records that found you in ${foundWhen}`,
          },
  };
}
