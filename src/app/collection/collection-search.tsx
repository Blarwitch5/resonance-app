"use client";

import { Search } from "lucide-react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/ui/search-field";
import { useInstantSearch } from "@/components/ui/use-instant-search";
import { collectionHref } from "@/lib/collection/href";
import { listenFromSearchInput } from "@/lib/collection/search";
import type { CollectionQuery } from "@/lib/collection/types";

interface CollectionSearchProps {
  listen: CollectionQuery;
  query: string;
}

export function CollectionSearch({ listen, query }: CollectionSearchProps) {
  const hrefFor = useCallback(
    (value: string) => collectionHref(listenFromSearchInput(listen, value)),
    [listen],
  );
  const { value, setValue, isPending, onSubmit } = useInstantSearch(query, hrefFor);

  return (
    <form
      action="/collection"
      method="get"
      className="flex flex-col gap-3 sm:flex-row"
      aria-busy={isPending}
      onSubmit={onSubmit}
    >
      {listen.format ? <input type="hidden" name="format" value={listen.format} /> : null}
      {listen.sort && listen.sort !== "recent" ? (
        <input type="hidden" name="sort" value={listen.sort} />
      ) : null}
      {listen.keptClose ? <input type="hidden" name="kept" value="1" /> : null}
      {listen.artist ? <input type="hidden" name="artist" value={listen.artist} /> : null}
      {listen.genre ? <input type="hidden" name="genre" value={listen.genre} /> : null}
      {listen.label ? <input type="hidden" name="label" value={listen.label} /> : null}
      {listen.found ? <input type="hidden" name="found" value={listen.found} /> : null}
      {listen.when !== undefined ? (
        <input type="hidden" name="when" value={String(listen.when)} />
      ) : null}
      {listen.arrived !== undefined ? (
        <input type="hidden" name="arrived" value={String(listen.arrived)} />
      ) : null}
      {listen.condition ? <input type="hidden" name="condition" value={listen.condition} /> : null}
      {listen.decade !== undefined ? (
        <input type="hidden" name="decade" value={String(listen.decade)} />
      ) : null}
      {listen.year !== undefined ? (
        <input type="hidden" name="year" value={String(listen.year)} />
      ) : null}
      <SearchField
        id="collection-q"
        name="q"
        value={value}
        onValueChange={setValue}
        isPending={isPending}
        placeholder="Title, artist, label, barcode, memory…"
        label="Search your shelf and memories"
      />
      <Button type="submit">
        <Search className="size-4 shrink-0" aria-hidden />
        Search
      </Button>
    </form>
  );
}
