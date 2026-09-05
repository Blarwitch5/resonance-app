import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

export type MainNavPath = "/collection" | "/explorer" | "/profile";

export function isReturnPath(pathname: string): pathname is MainNavPath {
  return pathname === "/collection" || pathname === "/explorer" || pathname === "/profile";
}

export function emptyStoredReturns(): Record<MainNavPath, string | null> {
  return { "/collection": null, "/explorer": null, "/profile": null };
}

export function readStoredReturns(): Record<MainNavPath, string | null> {
  try {
    return {
      "/collection": sessionStorage.getItem(returnStorageKey("/collection")),
      "/explorer": sessionStorage.getItem(returnStorageKey("/explorer")),
      "/profile": sessionStorage.getItem(returnStorageKey("/profile")),
    };
  } catch {
    return emptyStoredReturns();
  }
}

export function returnStorageKey(pathname: string): string {
  return `resonance-return:${pathname}`;
}

export function parseStoredReturn(pathname: string, stored: string | null): string | null {
  if (!stored || !isReturnPath(pathname)) {
    return null;
  }

  if (stored.includes("://") || stored.startsWith("//") || stored.includes("\\")) {
    return null;
  }

  if (stored === pathname) {
    return stored;
  }

  if (stored.startsWith(`${pathname}?`)) {
    return stored;
  }

  return null;
}

export function hrefPathname(href: string): string | null {
  if (!href.startsWith("/") || href.startsWith("//") || href.includes("://")) {
    return null;
  }

  const [pathname] = href.split("?");
  return pathname && pathname.length > 0 ? pathname : null;
}

export function listPathForDetail(pathname: string): string | null {
  if (pathname.startsWith("/collection/") && pathname !== "/collection") {
    return "/collection";
  }

  if (pathname === "/explorer/manual" || pathname.startsWith("/explorer/add/")) {
    return "/explorer";
  }

  return null;
}

export function restoredListHref(listPath: string): string {
  try {
    return parseStoredReturn(listPath, sessionStorage.getItem(returnStorageKey(listPath))) ?? listPath;
  } catch {
    return listPath;
  }
}

export function resolvedBackHref(href: string, stored: string | null): string {
  const pathname = hrefPathname(href);

  if (!pathname) {
    return href;
  }

  if (href !== pathname) {
    return parseStoredReturn(pathname, href) ?? href;
  }

  return parseStoredReturn(pathname, stored) ?? href;
}

export function viewModeReturnHref(raw: string | undefined): string {
  return parseListReturn(raw) ?? "/collection";
}

export function parseListReturn(from: string | null | undefined): string | null {
  if (!from) {
    return null;
  }

  return (
    parseStoredReturn("/explorer", from) ?? parseStoredReturn("/collection", from) ?? parseStoredReturn("/profile", from)
  );
}

export function withListReturn(href: string, from?: string | null): string {
  const listen = parseListReturn(from);

  if (!listen || listen === "/collection" || !href.startsWith("/") || href.startsWith("//") || href.includes("://")) {
    return href;
  }

  const [pathname = href, existing = ""] = href.split("?");
  const params = new URLSearchParams(existing);
  params.set("from", listen);
  return `${pathname}?${params.toString()}`;
}

export function listBackHref(from: string | undefined, fallback: string): string {
  return parseListReturn(from) ?? fallback;
}

export function listBackLabel(href: string, locale: Locale = "en"): string {
  const path = hrefPathname(href);

  if (path === "/explorer") {
    return t(locale, "back.explorer");
  }

  if (path === "/profile") {
    return t(locale, "back.profile");
  }

  return t(locale, "back.collection");
}

export function detailBackHref(pathname: string, search: string): string | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const from = parseListReturn(params.get("from"));

  if (from) {
    return from;
  }

  const listPath = listPathForDetail(pathname);
  return listPath ? restoredListHref(listPath) : null;
}

export function listReturnFromLocation(pathname: string, search: string): string | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  params.delete("from");
  params.delete("wave");

  if (pathname === "/profile") {
    params.delete("settings");
  }

  const query = params.toString();
  const href = query.length > 0 ? `${pathname}?${query}` : pathname;
  return parseListReturn(href);
}

export function mainNavHref(
  tab: string,
  location: { pathname: string; search: string },
  stored: string | null,
): string {
  if (!isReturnPath(tab)) {
    return tab;
  }

  if (location.pathname === tab) {
    if (tab === "/profile") {
      return parseStoredReturn(tab, listHref(location.pathname, location.search)) ?? tab;
    }

    return tab;
  }

  return parseStoredReturn(tab, stored) ?? tab;
}

function listHref(pathname: string, search: string): string {
  const query = search.startsWith("?") ? search.slice(1) : search;
  return query.length > 0 ? `${pathname}?${query}` : pathname;
}
