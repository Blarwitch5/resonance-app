export const FEED_ROOT_MARGIN = "240px 0px";

export function nextFeedPage(page: number, pages: number, maxPage: number): number | null {
  if (!Number.isInteger(page) || !Number.isInteger(pages) || !Number.isInteger(maxPage)) {
    return null;
  }

  if (page < 1 || pages < 1 || maxPage < 1) {
    return null;
  }

  const next = page + 1;

  if (next > pages || next > maxPage) {
    return null;
  }

  return next;
}

export function feedHasFurther(page: number, pages: number, maxPage: number): boolean {
  return nextFeedPage(page, pages, maxPage) !== null;
}

export function feedPageCount(total: number, pageSize: number, maxPage: number): number {
  if (!Number.isInteger(pageSize) || !Number.isInteger(maxPage) || pageSize < 1 || maxPage < 1) {
    return 1;
  }

  const count = Number.isFinite(total) ? Math.max(0, total) : 0;
  return Math.max(1, Math.min(maxPage, Math.ceil(count / pageSize)));
}

export function mergeFeedItems<T>(current: T[], incoming: T[], keyOf: (item: T) => string): T[] {
  if (incoming.length === 0) {
    return current;
  }

  const seen = new Set(current.map(keyOf));
  const extra: T[] = [];

  for (const item of incoming) {
    const key = keyOf(item);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    extra.push(item);
  }

  return extra.length === 0 ? current : [...current, ...extra];
}

export type FeedLoadResult<T> =
  | { items: T[]; pages: number }
  | { error: string };

export function isFeedLoadError<T>(outcome: FeedLoadResult<T>): outcome is { error: string } {
  return "error" in outcome;
}

export function feedObserverRoot(element: Element): Element | null {
  const pane = element.closest("[data-scroll-root]");

  if (typeof HTMLElement === "undefined" || !(pane instanceof HTMLElement)) {
    return null;
  }

  if (pane.scrollHeight > pane.clientHeight + 1) {
    return pane;
  }

  return null;
}
