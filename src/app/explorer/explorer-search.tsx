"use client";

import { Search } from "lucide-react";
import { useCallback } from "react";

import { BarcodeScanner } from "@/app/explorer/barcode-scanner";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/ui/search-field";
import { useInstantSearch } from "@/components/ui/use-instant-search";
import { useT } from "@/components/locale-provider";
import {
  EXPLORER_SEARCH_DEBOUNCE_MS,
  explorerSearchHref,
  listenFromExplorerSearchInput,
  type ExplorerQuery,
} from "@/lib/discogs/href";

interface ExplorerSearchProps {
  listen: ExplorerQuery;
  query: string;
}

export function ExplorerSearch({ listen, query }: ExplorerSearchProps) {
  const t = useT();
  const hrefFor = useCallback(
    (value: string) => explorerSearchHref(listenFromExplorerSearchInput(listen, value)),
    [listen],
  );
  const { value, setValue, isPending, onSubmit } = useInstantSearch(
    query,
    hrefFor,
    EXPLORER_SEARCH_DEBOUNCE_MS,
  );

  return (
    <form
      action="/explorer"
      method="get"
      className="flex gap-3"
      aria-busy={isPending}
      onSubmit={onSubmit}
    >
      {listen.format ? <input type="hidden" name="format" value={listen.format} /> : null}
      {listen.genre ? <input type="hidden" name="genre" value={listen.genre} /> : null}
      {listen.label ? <input type="hidden" name="label" value={listen.label} /> : null}
      {listen.decade !== undefined ? <input type="hidden" name="decade" value={String(listen.decade)} /> : null}
      {listen.year !== undefined ? <input type="hidden" name="year" value={String(listen.year)} /> : null}
      <SearchField
        id="explorer-q"
        name="q"
        value={value}
        onValueChange={setValue}
        isPending={isPending}
        placeholder={t("explorer.searchPlaceholder")}
        label={t("explorer.searchLabel")}
        clearLabel={t("common.clearSearch")}
      />
      <div className="flex shrink-0 gap-3">
        <BarcodeScanner />
        <Button type="submit" className="shrink-0 px-4 sm:px-6" aria-label={t("common.search")}>
          <Search className="size-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">{t("common.search")}</span>
        </Button>
      </div>
    </form>
  );
}
