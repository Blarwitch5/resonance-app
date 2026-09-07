import type { MediaCondition, MediaFormat } from "@/lib/collection/types";

/** Named counts for shelf filter pickers (artist / style / label). */
export interface FacetNameCount {
  name: string;
  count: number;
}

export interface FacetYearCount {
  year: number;
  count: number;
}

export interface CollectionFacets {
  artists: FacetNameCount[];
  genres: FacetNameCount[];
  labels: FacetNameCount[];
  years: FacetYearCount[];
}

/** Scope for facet lists — excludes artist / genre / label / year / decade so pickers stay switchable. */
export interface FacetScope {
  format?: MediaFormat;
  keptClose?: boolean;
  query?: string;
  found?: string;
  when?: number;
  arrived?: number;
  condition?: MediaCondition;
}

export const FACET_PICK_LIMIT = 24;

export function emptyCollectionFacets(): CollectionFacets {
  return {
    artists: [],
    genres: [],
    labels: [],
    years: [],
  };
}

export function hasCollectionFacets(facets: CollectionFacets): boolean {
  return (
    facets.artists.length > 0 ||
    facets.genres.length > 0 ||
    facets.labels.length > 0 ||
    facets.years.length > 0
  );
}

/** Active facet filters shown in the Filters sheet (includes format). */
export function collectionFilterCount(listen: {
  format?: string;
  artist?: string;
  genre?: string;
  label?: string;
  year?: number;
  decade?: number;
  found?: string;
  when?: number;
  arrived?: number;
  condition?: string;
}): number {
  let count = 0;

  if (listen.format) {
    count += 1;
  }

  if (listen.artist) {
    count += 1;
  }

  if (listen.genre) {
    count += 1;
  }

  if (listen.label) {
    count += 1;
  }

  if (listen.found) {
    count += 1;
  }

  if (listen.when !== undefined) {
    count += 1;
  }

  if (listen.arrived !== undefined) {
    count += 1;
  }

  if (listen.condition) {
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

export function ensureNamedFacet(
  options: readonly FacetNameCount[],
  active: string | undefined,
): FacetNameCount[] {
  if (!active || options.some((entry) => entry.name === active)) {
    return [...options];
  }

  return [{ name: active, count: 0 }, ...options];
}

export function ensureYearFacet(
  options: readonly FacetYearCount[],
  active: number | undefined,
): FacetYearCount[] {
  if (active === undefined || options.some((entry) => entry.year === active)) {
    return [...options];
  }

  return [{ year: active, count: 0 }, ...options];
}
