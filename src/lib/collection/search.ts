import type { CollectionQuery } from "@/lib/collection/types";

export const SHELF_SEARCH_DEBOUNCE_MS = 300;

export function isSearchListening(value: string, committedQuery: string, isPending: boolean): boolean {
  return isPending || value.trim() !== committedQuery.trim();
}

export function listenFromSearchInput(listen: CollectionQuery, value: string): CollectionQuery {
  const query = value.trim();

  return {
    ...listen,
    query: query.length > 0 ? query : undefined,
    page: undefined,
  };
}
