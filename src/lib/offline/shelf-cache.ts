export type OfflineFetchKind = "shelf" | "static" | "cover" | "network" | "bypass";

export interface OfflineFetchPlan {
  kind: OfflineFetchKind;
}

const JOURNAL_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const COVER_HOSTS = new Set(["i.discogs.com", "st.discogs.com", "img.discogs.com"]);

export function offlineFetchPlan(href: string, destination = ""): OfflineFetchPlan {
  if (destination === "audio" || destination === "video") {
    return { kind: "bypass" };
  }

  const url = new URL(href);

  if (url.hostname.endsWith(".dzcdn.net")) {
    return { kind: "bypass" };
  }

  if (url.pathname.startsWith("/api/")) {
    return { kind: "bypass" };
  }

  if (url.searchParams.has("_rsc")) {
    return { kind: "bypass" };
  }

  if (COVER_HOSTS.has(url.hostname)) {
    return { kind: "cover" };
  }

  if (url.pathname.startsWith("/_next/static/")) {
    return { kind: "static" };
  }

  if (isOfflineShelfPath(url.pathname)) {
    return { kind: "shelf" };
  }

  return { kind: "network" };
}

export function isOfflineShelfPath(pathname: string): boolean {
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  if (path === "/collection" || path === "/collection/tonight") {
    return true;
  }

  const segments = path.split("/");

  if (segments.length !== 3 || segments[1] !== "collection" || !segments[2]) {
    return false;
  }

  return JOURNAL_ID.test(segments[2]);
}

export function isQuietShelfVisible(pathname: string, isOnline: boolean): boolean {
  return !isOnline && isOfflineShelfPath(pathname);
}
