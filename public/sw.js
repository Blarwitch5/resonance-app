"use strict";

// Keep path rules aligned with src/lib/offline/shelf-cache.ts
const SHELL_CACHE = "resonance-shell-v5";
const SHELF_CACHE = "resonance-shelf-v1";
const STATIC_CACHE = "resonance-static-v1";
const COVER_CACHE = "resonance-covers-v1";
const KNOWN_CACHES = new Set([SHELL_CACHE, SHELF_CACHE, STATIC_CACHE, COVER_CACHE]);

const PRECACHE_URLS = [
  "/offline.html",
  "/logo-resonance.svg",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
];

const JOURNAL_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COVER_HOSTS = new Set(["i.discogs.com", "st.discogs.com", "img.discogs.com"]);

self.addEventListener("install", (event) => {
  event.waitUntil(precacheShell());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(activateCaches());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  let url;

  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }

  const kind = offlineFetchKind(url, event.request.destination);

  if (kind === "bypass") {
    return;
  }

  if (kind === "cover") {
    event.respondWith(cacheFirst(COVER_CACHE, event.request));
    return;
  }

  if (kind === "static") {
    event.respondWith(staleWhileRevalidate(event, STATIC_CACHE, event.request));
    return;
  }

  if (kind === "shelf") {
    event.respondWith(networkFirst(SHELF_CACHE, event.request));
    return;
  }

  event.respondWith(networkOnlyWithOfflinePage(event.request));
});

function offlineFetchKind(url, destination) {
  if (destination === "audio" || destination === "video") {
    return "bypass";
  }

  if (url.hostname.endsWith(".dzcdn.net")) {
    return "bypass";
  }

  if (url.pathname.startsWith("/api/")) {
    return "bypass";
  }

  if (COVER_HOSTS.has(url.hostname)) {
    return "cover";
  }

  if (url.pathname.startsWith("/_next/static/")) {
    return "static";
  }

  if (isOfflineShelfPath(url.pathname)) {
    return "shelf";
  }

  return "network";
}

function isOfflineShelfPath(pathname) {
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

async function precacheShell() {
  const cache = await caches.open(SHELL_CACHE);

  for (const url of PRECACHE_URLS) {
    try {
      await cache.add(url);
    } catch {
      continue;
    }
  }

  await self.skipWaiting();
}

async function activateCaches() {
  const keys = await caches.keys();
  await Promise.all(
    keys.filter((key) => key.startsWith("resonance-") && !KNOWN_CACHES.has(key)).map((key) => caches.delete(key)),
  );
  await self.clients.claim();
}

async function networkFirst(cacheName, request) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);

    if (canRememberShelf(request, response)) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    return fallbackDocument(request, error);
  }
}

async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok || response.type === "opaque") {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const fallback = await cache.match(request);

    if (fallback) {
      return fallback;
    }

    throw error;
  }
}

async function staleWhileRevalidate(event, cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => undefined);

  event.waitUntil(network);

  if (cached) {
    return cached;
  }

  const response = await network;

  if (response) {
    return response;
  }

  throw new Error("This listen could not be opened.");
}

async function networkOnlyWithOfflinePage(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    return fallbackDocument(request, error);
  }
}

async function fallbackDocument(request, error) {
  if (!isDocumentRequest(request)) {
    throw error;
  }

  const offline = await caches.match("/offline.html");

  if (offline) {
    return offline;
  }

  throw error;
}

function canRememberShelf(request, response) {
  if (!response.ok) {
    return false;
  }

  if (!response.redirected) {
    return true;
  }

  try {
    return isOfflineShelfPath(new URL(response.url).pathname);
  } catch {
    return false;
  }
}

function isDocumentRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}
