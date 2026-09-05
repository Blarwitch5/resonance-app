"use client";

import { useCallback } from "react";

import { KeptCloseSlot } from "@/app/collection/[id]/kept-close-form";
import { ReleaseSlot } from "@/app/collection/[id]/release-record-form";
import { loadMoreProfileAction } from "@/app/profile/actions";
import { InfiniteSentinel } from "@/components/ui/infinite-sentinel";
import { RecordMenu } from "@/components/ui/record-menu";
import { RecordRow } from "@/components/ui/record-row";
import { RecordTile } from "@/components/ui/record-tile";
import { useInfiniteFeed } from "@/components/ui/use-infinite-feed";
import { journalFromHref } from "@/lib/collection/href";
import { shelfArriveProps, shelfListHitClass, shelfResultsClass } from "@/lib/collection/layout";
import { recordMenuElsewhereHref } from "@/lib/collection/record-menu";
import { shelfCardThreads } from "@/lib/collection/shelf-threads";
import { MAX_COLLECTION_PAGE } from "@/lib/collection/types";
import { discogsReleaseHref } from "@/lib/discogs/href";
import { t } from "@/lib/i18n/translate";
import type { ProfileShelfItem } from "@/lib/profile/types";
import type { Locale, ViewMode } from "@/lib/settings/types";

function profileShelfKey(item: ProfileShelfItem) {
  return item.id;
}

export function ProfileFeed({
  items,
  page,
  pages,
  kind,
  query,
  from,
  canKeepClose = false,
  further,
  end,
  label,
  earlierHref,
  locale,
  layout,
}: {
  items: ProfileShelfItem[];
  page: number;
  pages: number;
  kind: "favorite" | "wishlist";
  query?: string;
  from: string;
  canKeepClose?: boolean;
  further: string;
  end: string;
  label: string;
  earlierHref?: string;
  locale: Locale;
  layout: ViewMode;
}) {
  const loadPage = useCallback(
    (nextPage: number) =>
      loadMoreProfileAction({
        kind,
        page: String(nextPage),
        q: query,
      }),
    [kind, query],
  );
  const feed = useInfiniteFeed({
    initialItems: items,
    initialPage: page,
    pages,
    maxPage: MAX_COLLECTION_PAGE,
    loadPage,
    keyOf: profileShelfKey,
  });

  return (
    <>
      <ul className={shelfResultsClass(layout)}>
        {feed.items.map((item, index) => {
          const href = journalFromHref(item.id, from);
          const threads = shelfCardThreads(
            {
              artist: item.artist,
              year: item.year,
              label: item.label,
              genres: item.genres,
              format: item.format,
              condition: item.condition,
              found: item.purchaseLocation,
              foundWhen: item.purchaseDate,
            },
            {},
            locale,
          );
          const record =
            layout === "list" ? (
              <RecordRow
                href={href}
                coverUrl={item.coverUrl}
                compactUrl={item.coverThumbUrl}
                title={item.title}
                artist={item.artist}
                year={item.year}
                format={item.format}
                threads={threads}
                locale={locale}
                priority={index < 4}
              />
            ) : (
              <RecordTile
                href={href}
                coverUrl={item.coverUrl}
                compactUrl={item.coverThumbUrl}
                title={item.title}
                artist={item.artist}
                year={item.year}
                format={item.format}
                locale={locale}
                threads={threads}
                priority={index < 4}
              />
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
                canKeepClose={canKeepClose}
                canRelease={true}
                isFavorite={item.isFavorite}
                canSwipe={layout === "list"}
                layout={layout}
              >
                <ReleaseSlot id={item.id}>
                  {canKeepClose ? (
                    <KeptCloseSlot id={item.id} isFavorite={item.isFavorite} layout={layout === "list" ? "row" : "cover"}>
                      {record}
                    </KeptCloseSlot>
                  ) : layout === "list" ? (
                    <div className={shelfListHitClass}>{record}</div>
                  ) : (
                    record
                  )}
                </ReleaseSlot>
              </RecordMenu>
            </li>
          );
        })}
      </ul>
      {pages > 1 || page > 1 ? (
        <InfiniteSentinel
          label={label}
          hasFurther={feed.hasFurther}
          isPending={feed.isPending}
          error={feed.error}
          further={further}
          end={end}
          listening={t(locale, "common.listening")}
          onVisible={feed.loadMore}
          earlierHref={page > 1 ? earlierHref : undefined}
          earlierLabel={page > 1 ? t(locale, "common.onesBefore") : undefined}
        />
      ) : null}
    </>
  );
}
