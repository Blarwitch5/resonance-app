import { collectionHref } from "@/lib/collection/href";
import type { CollectionQuery } from "@/lib/collection/types";

export function collectionListenCount(listen: CollectionQuery): number {
  if (listen.sort && listen.sort !== "recent") {
    return 1;
  }

  return 0;
}

export function collectionShelfHref(listen: CollectionQuery): string {
  return collectionHref({
    format: listen.format,
    query: listen.query,
  });
}

/** Drop format + year / artist / style / label / thread facets; keep search, sort, kept close. */
export function collectionFiltersClearHref(listen: CollectionQuery): string {
  return collectionHref({
    query: listen.query,
    sort: listen.sort,
    keptClose: listen.keptClose,
  });
}

/** Reset sort only — used by the Sort sheet clear action. */
export function collectionSortClearHref(listen: CollectionQuery): string {
  return collectionHref({
    ...listen,
    sort: undefined,
  });
}
