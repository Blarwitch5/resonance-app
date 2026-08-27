import type { CollectionQuery } from "@/lib/collection/types";

export const SHELF_SEARCH_DEBOUNCE_MS = 300;

export function listenFromSearchInput(listen: CollectionQuery, value: string): CollectionQuery {
  const query = value.trim();

  return {
    ...listen,
    query: query.length > 0 ? query : undefined,
    page: undefined,
  };
}
