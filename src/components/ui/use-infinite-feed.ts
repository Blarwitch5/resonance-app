"use client";

import { useCallback, useRef, useState, useTransition } from "react";

import { useLocale } from "@/components/locale-provider";
import {
  feedHasFurther,
  isFeedLoadError,
  mergeFeedItems,
  nextFeedPage,
  type FeedLoadResult,
} from "@/lib/collection/feed";
import { t } from "@/lib/i18n/translate";

export function useInfiniteFeed<T>({
  initialItems,
  initialPage,
  pages: initialPages,
  maxPage,
  loadPage,
  keyOf,
}: {
  initialItems: T[];
  initialPage: number;
  pages: number;
  maxPage: number;
  loadPage: (page: number) => Promise<FeedLoadResult<T>>;
  keyOf: (item: T) => string;
}) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialPage);
  const [pages, setPages] = useState(initialPages);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const locale = useLocale();

  const hasFurther = feedHasFurther(page, pages, maxPage);

  const loadMore = useCallback(() => {
    const next = nextFeedPage(page, pages, maxPage);

    if (next === null || inFlight.current) {
      return;
    }

    inFlight.current = true;
    setError(null);

    startTransition(async () => {
      try {
        const outcome = await loadPage(next);

        if (isFeedLoadError(outcome)) {
          setError(outcome.error);
          return;
        }

        setItems((current) => mergeFeedItems(current, outcome.items, keyOf));
        setPage(next);
        setPages(outcome.pages);
      } catch {
        setError(t(locale, "error.generic"));
      } finally {
        inFlight.current = false;
      }
    });
  }, [keyOf, loadPage, locale, maxPage, page, pages]);

  return { items, page, pages, hasFurther, isPending, error, loadMore };
}
