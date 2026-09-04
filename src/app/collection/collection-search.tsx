"use client";

import { Search } from "lucide-react";
import { useCallback, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { BusyGlyph } from "@/components/ui/listening-wave";
import { SearchField } from "@/components/ui/search-field";
import { SearchListenRoot } from "@/components/ui/search-listen";
import { useInstantSearch } from "@/components/ui/use-instant-search";
import { useT } from "@/components/locale-provider";
import { collectionHref } from "@/lib/collection/href";
import { listenFromSearchInput } from "@/lib/collection/search";
import type { CollectionQuery } from "@/lib/collection/types";

interface CollectionSearchProps {
  listen: CollectionQuery;
  query: string;
  children: ReactNode;
}

export function CollectionSearch({ listen, query, children }: CollectionSearchProps) {
  const t = useT();
  const hrefFor = useCallback(
    (value: string) => collectionHref(listenFromSearchInput(listen, value)),
    [listen],
  );
  const { value, setValue, isListening, onSubmit } = useInstantSearch(query, hrefFor);

  return (
    <SearchListenRoot isListening={isListening} label={t("common.listening")}>
      <form
        action="/collection"
        method="get"
        className="flex gap-3"
        aria-busy={isListening}
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
          isPending={isListening}
          placeholder={t("collection.searchPlaceholder")}
          label={t("collection.searchLabel")}
          clearLabel={t("common.clearSearch")}
        />
        <Button
          type="submit"
          className="shrink-0 px-4 sm:px-6"
          aria-label={isListening ? t("common.listening") : t("common.search")}
        >
          <BusyGlyph isBusy={isListening}>
            <Search className="size-4 shrink-0" aria-hidden />
          </BusyGlyph>
          <span>{isListening ? t("common.listening") : t("common.search")}</span>
        </Button>
      </form>
      <div className="flex flex-col gap-3">{children}</div>
    </SearchListenRoot>
  );
}
