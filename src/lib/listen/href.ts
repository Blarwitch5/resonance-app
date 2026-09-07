import { explorerAddHref, explorerSearchHref } from "@/lib/discogs/href";
import type { ListenPressingView } from "@/lib/listen/types";

export function listenHref(token: string): string {
  return `/listen/${token}`;
}

export function listenShelfHref(token: string): string {
  return `/listen/shelf/${token}`;
}

export function listenDiscogsHref(discogsId: number): string | null {
  if (!Number.isInteger(discogsId) || discogsId < 1) {
    return null;
  }

  return `/listen/d/${discogsId}`;
}

export function listenAddHref(view: Pick<ListenPressingView, "discogsId" | "artist" | "title">): string {
  if (view.discogsId !== null) {
    const add = explorerAddHref(view.discogsId);
    if (add) {
      return add;
    }
  }

  const query = `${view.artist} ${view.title}`.trim();
  return explorerSearchHref(query.length > 0 ? { query } : {});
}

export function toAbsoluteShareUrl(href: string, origin: string): string {
  if (href.startsWith("https://") || href.startsWith("http://")) {
    return href;
  }

  try {
    return new URL(href, origin).href;
  } catch {
    return href;
  }
}
