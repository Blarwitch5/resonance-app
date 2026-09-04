"use client";

import { useCallback } from "react";

import { loadMoreExplorerAction } from "@/app/explorer/actions";
import { ExplorerReleaseCard } from "@/app/explorer/explorer-release-card";
import { InfiniteSentinel } from "@/components/ui/infinite-sentinel";
import { useInfiniteFeed } from "@/components/ui/use-infinite-feed";
import { shelfArriveProps, shelfResultsClass } from "@/lib/collection/layout";
import type { ExplorerFeedHit } from "@/lib/collection/types";
import {
  explorerSearchHref,
  MAX_SEARCH_PAGE,
  type ExplorerQuery,
} from "@/lib/discogs/href";
import { t } from "@/lib/i18n/translate";
import type { Locale, ViewMode } from "@/lib/settings/types";

function explorerHitKey(item: ExplorerFeedHit) {
  return item.draft.discogsId !== null
    ? String(item.draft.discogsId)
    : `${item.draft.artist}-${item.draft.title}`;
}

export function ExplorerFeed({
  items,
  listen,
  page,
  pages,
  searchQuery,
  canWishlist,
  locale,
  layout,
}: {
  items: ExplorerFeedHit[];
  listen: ExplorerQuery;
  page: number;
  pages: number;
  searchQuery: string;
  canWishlist: boolean;
  locale: Locale;
  layout: ViewMode;
}) {
  const loadPage = useCallback(
    (nextPage: number) =>
      loadMoreExplorerAction({
        q: listen.query,
        page: String(nextPage),
        format: listen.format,
        genre: listen.genre,
        label: listen.label,
        decade: listen.decade !== undefined ? String(listen.decade) : undefined,
        year: listen.year !== undefined ? String(listen.year) : undefined,
      }),
    [listen],
  );
  const feed = useInfiniteFeed({
    initialItems: items,
    initialPage: page,
    pages,
    maxPage: MAX_SEARCH_PAGE,
    loadPage,
    keyOf: explorerHitKey,
  });
  const from = explorerSearchHref(listen);

  return (
    <>
      <ul className={shelfResultsClass(layout)}>
        {feed.items.map((item, index) => (
          <li key={explorerHitKey(item)} {...shelfArriveProps(index)}>
            <ExplorerReleaseCard
              draft={item.draft}
              listen={listen}
              searchQuery={searchQuery}
              from={from}
              priority={index < 4}
              canWishlist={canWishlist}
              locale={locale}
              layout={layout}
              presence={item.presence}
            />
          </li>
        ))}
      </ul>
      {pages > 1 || page > 1 ? (
        <InfiniteSentinel
          label={t(locale, "explorer.morePressings")}
          hasFurther={feed.hasFurther}
          isPending={feed.isPending}
          error={feed.error}
          further={t(locale, "explorer.moreOfSearch")}
          end={t(locale, "explorer.endOfSearch")}
          listening={t(locale, "common.listening")}
          onVisible={feed.loadMore}
          earlierHref={page > 1 ? explorerSearchHref({ ...listen, page: page - 1 }) : undefined}
          earlierLabel={page > 1 ? t(locale, "common.onesBefore") : undefined}
        />
      ) : null}
    </>
  );
}
