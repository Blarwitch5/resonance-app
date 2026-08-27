import { whenFromDate, type MediaFormat } from "@/lib/collection/types";

export interface CollectionStatItem {
  format: MediaFormat;
  artist: string;
  year: number | null;
  label: string | null;
  purchaseLocation: string | null;
  purchaseDate: Date | null;
  createdAt: Date;
  genres: string[];
}

export interface CollectionInsight {
  total: number;
  artistCount: number;
  labelCount: number;
  formats: Array<{ format: MediaFormat; count: number }>;
  decades: Array<{ decade: number; count: number }>;
  topArtists: Array<{ name: string; count: number }>;
  topGenres: Array<{ name: string; count: number }>;
  topLabels: Array<{ name: string; count: number }>;
  topPlaces: Array<{ name: string; count: number }>;
  topWhen: Array<{ year: number; count: number }>;
  topArrived: Array<{ year: number; count: number }>;
  decadeSpan: number | null;
  oldestYear: number | null;
  newestYear: number | null;
  mostPresentArtist: { name: string; count: number } | null;
}

export function summarizeCollection(items: CollectionStatItem[]): CollectionInsight {
  const artists = new Set<string>();
  const labels = new Set<string>();
  const formatCounts: Record<MediaFormat, number> = { vinyl: 0, cassette: 0, cd: 0 };
  const artistCounts = new Map<string, number>();
  const genreCounts = new Map<string, number>();
  const labelCounts = new Map<string, number>();
  const placeCounts = new Map<string, number>();
  const whenCounts = new Map<number, number>();
  const arrivedCounts = new Map<number, number>();
  const years: number[] = [];
  const decadeCounts = new Map<number, number>();

  for (const item of items) {
    artists.add(item.artist);
    artistCounts.set(item.artist, (artistCounts.get(item.artist) ?? 0) + 1);
    formatCounts[item.format] += 1;

    if (item.label) {
      labels.add(item.label);
      labelCounts.set(item.label, (labelCounts.get(item.label) ?? 0) + 1);
    }

    const place = item.purchaseLocation?.trim() ?? "";

    if (place.length > 0) {
      placeCounts.set(place, (placeCounts.get(place) ?? 0) + 1);
    }

    const foundYear = whenFromDate(item.purchaseDate);

    if (foundYear !== undefined) {
      whenCounts.set(foundYear, (whenCounts.get(foundYear) ?? 0) + 1);
    }

    const arrivedYear = whenFromDate(item.createdAt);

    if (arrivedYear !== undefined) {
      arrivedCounts.set(arrivedYear, (arrivedCounts.get(arrivedYear) ?? 0) + 1);
    }

    for (const genre of item.genres) {
      const name = genre.trim();

      if (name.length === 0) {
        continue;
      }

      genreCounts.set(name, (genreCounts.get(name) ?? 0) + 1);
    }

    if (item.year !== null) {
      years.push(item.year);
      const decade = Math.floor(item.year / 10) * 10;
      decadeCounts.set(decade, (decadeCounts.get(decade) ?? 0) + 1);
    }
  }

  const oldestYear = years.length > 0 ? Math.min(...years) : null;
  const newestYear = years.length > 0 ? Math.max(...years) : null;
  const decadeSpan =
    oldestYear !== null && newestYear !== null
      ? Math.max(1, Math.floor(newestYear / 10) - Math.floor(oldestYear / 10) + 1)
      : null;

  let mostPresentArtist: CollectionInsight["mostPresentArtist"] = null;
  const topArtists = rankCounts(artistCounts, 5);
  const topGenres = rankCounts(genreCounts, 5);
  const topLabels = rankCounts(labelCounts, 5);
  const topPlaces = rankCounts(placeCounts, 5);
  const topWhen = [...whenCounts.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((left, right) => right.count - left.count || right.year - left.year)
    .slice(0, 5);
  const topArrived = [...arrivedCounts.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((left, right) => left.year - right.year);

  const firstArtist = topArtists[0];

  if (firstArtist) {
    mostPresentArtist = firstArtist;
  }

  const decades = [...decadeCounts.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([decade, count]) => ({ decade, count }));

  return {
    total: items.length,
    artistCount: artists.size,
    labelCount: labels.size,
    formats: (["vinyl", "cassette", "cd"] as const)
      .map((format) => ({ format, count: formatCounts[format] }))
      .filter((entry) => entry.count > 0),
    decades,
    topArtists,
    topGenres,
    topLabels,
    topPlaces,
    topWhen,
    topArrived,
    decadeSpan,
    oldestYear,
    newestYear,
    mostPresentArtist,
  };
}

function rankCounts(counts: Map<string, number>, limit: number) {
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, limit);
}

export function decadeLabel(decade: number): string {
  return `${decade}s`;
}

export function decadeStory(insight: CollectionInsight): string | null {
  if (insight.decadeSpan === null) {
    return null;
  }

  if (insight.decadeSpan === 1) {
    return "Your collection lives in one decade of sound.";
  }

  return `Your collection spans ${insight.decadeSpan} decades of sound.`;
}
