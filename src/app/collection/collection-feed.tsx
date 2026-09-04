"use client";

import { useCallback } from "react";

import { loadMoreCollectionAction } from "@/app/collection/actions";
import { KeptCloseSlot } from "@/app/collection/[id]/kept-close-form";
import { ReleaseSlot } from "@/app/collection/[id]/release-record-form";
import { InfiniteSentinel } from "@/components/ui/infinite-sentinel";
import { RecordMenu } from "@/components/ui/record-menu";
import { RecordRow } from "@/components/ui/record-row";
import { RecordTile } from "@/components/ui/record-tile";
import { useInfiniteFeed } from "@/components/ui/use-infinite-feed";
import { collectionHref, journalFromHref } from "@/lib/collection/href";
import { shelfArriveProps, shelfResultsClass } from "@/lib/collection/layout";
import { memoryExcerpt } from "@/lib/collection/memory";
import { recordMenuElsewhereHref } from "@/lib/collection/record-menu";
import { shelfCardThreads } from "@/lib/collection/shelf-threads";
import {
  collectionSearchFromListen,
  foundDateLabel,
  MAX_COLLECTION_PAGE,
  type CollectionQuery,
  type CollectionSort,
  type ShelfCard,
} from "@/lib/collection/types";
import { discogsReleaseHref } from "@/lib/discogs/href";
import { t } from "@/lib/i18n/translate";
import type { Locale, ViewMode } from "@/lib/settings/types";

function shelfCardKey(item: ShelfCard) {
  return item.id;
}

export function CollectionFeed({
  viewMode,
  items,
  page,
  pages,
  listen,
  sort,
  arrived,
  locale,
}: {
  viewMode: ViewMode;
  items: ShelfCard[];
  page: number;
  pages: number;
  listen: CollectionQuery;
  sort: CollectionSort;
  arrived: number | undefined;
  locale: Locale;
}) {
  const loadPage = useCallback(
    (nextPage: number) => loadMoreCollectionAction(collectionSearchFromListen(listen, nextPage)),
    [listen],
  );
  const feed = useInfiniteFeed({
    initialItems: items,
    initialPage: page,
    pages,
    maxPage: MAX_COLLECTION_PAGE,
    loadPage,
    keyOf: shelfCardKey,
  });

  return (
    <>
      <ShelfRecordList
        className={shelfResultsClass(viewMode)}
        layout={viewMode}
        items={feed.items}
        listen={listen}
        sort={sort}
        arrived={arrived}
        locale={locale}
      />
      {pages > 1 || page > 1 ? (
        <InfiniteSentinel
          label={t(locale, "collection.moreRecords")}
          hasFurther={feed.hasFurther}
          isPending={feed.isPending}
          error={feed.error}
          further={t(locale, "collection.moreOnShelf")}
          end={t(locale, "collection.endOfShelf")}
          listening={t(locale, "common.listening")}
          onVisible={feed.loadMore}
          earlierHref={page > 1 ? collectionHref({ ...listen, page: page - 1 }) : undefined}
          earlierLabel={page > 1 ? t(locale, "common.onesBefore") : undefined}
        />
      ) : null}
    </>
  );
}

function ShelfRecordList({
  className,
  layout,
  items,
  listen,
  sort,
  arrived,
  locale,
}: {
  className: string;
  layout: "list" | "grid";
  items: ShelfCard[];
  listen: CollectionQuery;
  sort: CollectionSort;
  arrived: number | undefined;
  locale: Locale;
}) {
  return (
    <ul className={className}>
      {items.map((item, index) => {
        const foundOn =
          sort === "found"
            ? foundDateLabel(item.purchaseDate)
            : arrived !== undefined
              ? foundDateLabel(item.createdAt)
              : undefined;
        const from = collectionHref(listen);
        const href = journalFromHref(item.id, from);
        const threads = shelfCardThreads(
          {
            artist: item.artist,
            year: sort === "found" || arrived !== undefined ? null : item.year,
            label: item.label,
            genres: item.genres,
            format: item.format,
            condition: item.condition,
            found: item.purchaseLocation,
            foundWhen: item.purchaseDate,
          },
          listen,
          locale,
        );

        return (
          <li key={item.id} {...shelfArriveProps(index)}>
            <RecordMenu
              href={href}
              title={item.title}
              artist={item.artist}
              elsewhereHref={recordMenuElsewhereHref(item.artist, item.title, item.format)}
              shareHref={item.discogsId ? discogsReleaseHref(item.discogsId) : null}
              barcode={item.barcode}
              catalogNumber={item.catalogNumber}
              canKeepClose
              canRelease={true}
              isFavorite={item.isFavorite}
              canSwipe={layout === "list"}
              layout={layout}
            >
              <ReleaseSlot id={item.id}>
                <KeptCloseSlot id={item.id} isFavorite={item.isFavorite} layout={layout === "list" ? "row" : "cover"}>
                  {layout === "list" ? (
                    <RecordRow
                      href={href}
                      coverUrl={item.coverUrl}
                      title={item.title}
                      artist={item.artist}
                      year={sort === "found" || arrived !== undefined ? null : item.year}
                      foundOn={foundOn}
                      format={item.format}
                      memory={memoryExcerpt(item.notes)}
                      threads={threads}
                      locale={locale}
                      priority={index < 8}
                    />
                  ) : (
                    <RecordTile
                      href={href}
                      coverUrl={item.coverUrl}
                      title={item.title}
                      artist={item.artist}
                      year={sort === "found" || arrived !== undefined ? (foundOn ?? null) : item.year}
                      format={item.format}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      threads={threads}
                      locale={locale}
                      priority={index < 8}
                    />
                  )}
                </KeptCloseSlot>
              </ReleaseSlot>
            </RecordMenu>
          </li>
        );
      })}
    </ul>
  );
}
