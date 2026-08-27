import { collectionHref } from "@/lib/collection/href";
import type { CollectionQuery } from "@/lib/collection/types";

export function collectionListenCount(listen: CollectionQuery): number {
  let count = 0;

  if (listen.sort && listen.sort !== "recent") {
    count += 1;
  }

  if (listen.keptClose) {
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

export function collectionShelfHref(listen: CollectionQuery): string {
  return collectionHref({
    format: listen.format,
    query: listen.query,
  });
}
