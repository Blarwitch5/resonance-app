import { decadeLabel, type CollectionInsight } from "@/lib/collection/stats";
import {
  FORMAT_LABELS,
  decadeFromYear,
  parseArtistFilter,
  parseGenreFilter,
  parseLabelFilter,
  parseWhenFilter,
  parseWhenThread,
  type ReleaseDraft,
} from "@/lib/collection/types";
import { explorerSearchHref, type ExplorerQuery } from "@/lib/discogs/href";

const SUGGESTION_MAX = 8;
const GENRE_SUGGESTION_MAX = 3;
const LABEL_SUGGESTION_MAX = 3;
const DECADE_SUGGESTION_MAX = 4;
const YEAR_SUGGESTION_MAX = 4;

export type ExplorerThreadKind = "genre" | "label" | "decade" | "year";

export interface ExplorerThreadChip {
  key: string;
  label: string;
  kind: ExplorerThreadKind;
  source: "shelf" | "results";
  listen: Pick<ExplorerQuery, "genre" | "label" | "decade" | "year">;
}

export function explorerThreadFromFields(input: {
  genre?: string;
  label?: string;
  year?: string;
}): Pick<ExplorerQuery, "genre" | "label" | "year" | "decade"> {
  const genre = parseGenreFilter(input.genre);
  const label = parseLabelFilter(input.label);
  const when = parseWhenThread(input.year);
  const thread: Pick<ExplorerQuery, "genre" | "label" | "year" | "decade"> = {};

  if (genre) {
    thread.genre = genre;
  }

  if (label) {
    thread.label = label;
  }

  if (when.year !== undefined) {
    thread.year = when.year;
  }

  if (when.decade !== undefined) {
    thread.decade = when.decade;
  }

  return thread;
}

export interface ExplorerCardThreadView {
  artist: { label: string; href: string | null; ariaLabel: string | null } | null;
  year: { label: string; href: string | null; ariaLabel: string | null } | null;
  label: { label: string; href: string | null; ariaLabel: string | null } | null;
  genre: { label: string; href: string; ariaLabel: string } | null;
  format: { label: string; href: string | null; ariaLabel: string | null };
  decade: { label: string; href: string | null; ariaLabel: string | null } | null;
}

export function explorerCardThreads(
  draft: Pick<ReleaseDraft, "artist" | "year" | "label" | "genres" | "format">,
  listen: ExplorerQuery,
): ExplorerCardThreadView {
  const artist = parseArtistFilter(draft.artist);
  const year = parseWhenFilter(draft.year === null ? undefined : String(draft.year));
  const label = parseLabelFilter(draft.label ?? undefined);
  const genre = draft.genres
    .map((name) => parseGenreFilter(name))
    .find((name) => name !== undefined && name !== listen.genre);
  const isHearingArtist =
    artist !== undefined && (listen.query?.trim().toLowerCase() ?? "") === artist.toLowerCase();
  const isHearingLabel =
    label !== undefined && (listen.label?.trim().toLowerCase() ?? "") === label.toLowerCase();
  const isHearingFormat = listen.format === draft.format;
  const formatLabel = FORMAT_LABELS[draft.format];
  const decade = year === undefined ? undefined : decadeFromYear(year);
  const decadeName = decade !== undefined ? decadeLabel(decade) : null;
  const isHearingDecade = decade !== undefined && listen.decade === decade;

  return {
    artist: artist
      ? {
          label: artist,
          href: isHearingArtist ? null : explorerSearchHref({ ...listen, query: artist, page: 1 }),
          ariaLabel: isHearingArtist ? null : `Hear ${artist}`,
        }
      : null,
    year:
      year === undefined
        ? null
        : {
            label: String(year),
            href:
              listen.year === year
                ? null
                : explorerSearchHref({ ...listen, year, decade: undefined, page: 1 }),
            ariaLabel: listen.year === year ? null : `Hear ${year}`,
          },
    label: label
      ? {
          label,
          href: isHearingLabel ? null : explorerSearchHref({ ...listen, label, page: 1 }),
          ariaLabel: isHearingLabel ? null : `Hear ${label}`,
        }
      : null,
    genre: genre
      ? {
          label: genre,
          href: explorerSearchHref({ ...listen, genre, page: 1 }),
          ariaLabel: `Hear ${genre}`,
        }
      : null,
    format: {
      label: formatLabel,
      href: isHearingFormat ? null : explorerSearchHref({ ...listen, format: draft.format, page: 1 }),
      ariaLabel: isHearingFormat ? null : `Hear ${formatLabel}`,
    },
    decade:
      decade === undefined || decadeName === null
        ? null
        : {
            label: decadeName,
            href: isHearingDecade
              ? null
              : explorerSearchHref({ ...listen, decade, year: undefined, page: 1 }),
            ariaLabel: isHearingDecade ? null : `Hear the ${decadeName}`,
          },
  };
}

export function explorerThreadSuggestions(input: {
  listen: ExplorerQuery;
  insight?: CollectionInsight | null;
  drafts?: readonly ReleaseDraft[];
}): ExplorerThreadChip[] {
  const chips: ExplorerThreadChip[] = [];
  const seen = new Set<string>();

  if (input.insight) {
    pushShelfSuggestions(chips, seen, input.insight, input.listen);
  }

  if (input.drafts && input.drafts.length > 0) {
    pushResultSuggestions(chips, seen, input.drafts, input.listen);
  }

  return chips.slice(0, SUGGESTION_MAX);
}

export function explorerThreadGroups(input: {
  listen: ExplorerQuery;
  insight?: CollectionInsight | null;
  drafts?: readonly ReleaseDraft[];
}): { shelf: ExplorerThreadChip[]; results: ExplorerThreadChip[] } {
  const chips = explorerThreadSuggestions(input);

  return {
    shelf: chips.filter((chip) => chip.source === "shelf"),
    results: chips.filter((chip) => chip.source === "results"),
  };
}

function pushShelfSuggestions(
  chips: ExplorerThreadChip[],
  seen: Set<string>,
  insight: CollectionInsight,
  listen: ExplorerQuery,
): void {
  if (!listen.genre) {
    for (const genre of insight.topGenres.slice(0, GENRE_SUGGESTION_MAX)) {
      pushChip(chips, seen, {
        key: `genre:${genre.name}`,
        label: genre.name,
        kind: "genre",
        source: "shelf",
        listen: { genre: genre.name },
      });
    }
  }

  if (!listen.label) {
    for (const entry of insight.topLabels.filter((label) => label.count >= 2).slice(0, LABEL_SUGGESTION_MAX)) {
      pushChip(chips, seen, {
        key: `label:${entry.name}`,
        label: entry.name,
        kind: "label",
        source: "shelf",
        listen: { label: entry.name },
      });
    }
  }

  if (listen.decade === undefined && listen.year === undefined) {
    for (const entry of insight.decades.slice(0, DECADE_SUGGESTION_MAX)) {
      pushChip(chips, seen, {
        key: `decade:${entry.decade}`,
        label: decadeLabel(entry.decade),
        kind: "decade",
        source: "shelf",
        listen: { decade: entry.decade },
      });
    }
  }
}

function pushResultSuggestions(
  chips: ExplorerThreadChip[],
  seen: Set<string>,
  drafts: readonly ReleaseDraft[],
  listen: ExplorerQuery,
): void {
  if (!listen.genre) {
    for (const genre of uniqueNames(drafts.flatMap((draft) => draft.genres), GENRE_SUGGESTION_MAX)) {
      pushChip(chips, seen, {
        key: `genre:${genre}`,
        label: genre,
        kind: "genre",
        source: "results",
        listen: { genre },
      });
    }
  }

  if (!listen.label) {
    for (const label of uniqueNames(
      drafts.flatMap((draft) => (draft.label ? [draft.label] : [])),
      LABEL_SUGGESTION_MAX,
    )) {
      pushChip(chips, seen, {
        key: `label:${label}`,
        label,
        kind: "label",
        source: "results",
        listen: { label },
      });
    }
  }

  if (listen.year === undefined && listen.decade === undefined) {
    const years = [...new Set(drafts.flatMap((draft) => (draft.year ? [draft.year] : [])))]
      .sort((left, right) => right - left)
      .slice(0, YEAR_SUGGESTION_MAX);

    for (const year of years) {
      pushChip(chips, seen, {
        key: `year:${year}`,
        label: String(year),
        kind: "year",
        source: "results",
        listen: { year },
      });
    }
  }
}

function uniqueNames(values: readonly string[], limit: number): string[] {
  const names: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const name = value.trim();

    if (name.length === 0 || seen.has(name)) {
      continue;
    }

    seen.add(name);
    names.push(name);

    if (names.length >= limit) {
      break;
    }
  }

  return names;
}

function pushChip(chips: ExplorerThreadChip[], seen: Set<string>, chip: ExplorerThreadChip): void {
  if (seen.has(chip.key) || chips.length >= SUGGESTION_MAX) {
    return;
  }

  seen.add(chip.key);
  chips.push(chip);
}
