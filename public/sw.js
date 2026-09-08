"use strict";

// Keep path rules aligned with src/lib/offline/shelf-cache.ts
const SHELL_CACHE = "resonance-shell-v10";
const SHELF_CACHE = "resonance-shelf-v4";
const STATIC_CACHE = "resonance-static-v2";
const COVER_CACHE = "resonance-covers-v1";
const KNOWN_CACHES = new Set([SHELL_CACHE, SHELF_CACHE, STATIC_CACHE, COVER_CACHE]);

/** Prefer network, but do not leave the splash white during a Vercel cold start. */
const SHELF_CACHE_WAIT_MS = 450;
const SHELF_BOOT_WAIT_MS = 1600;

const PRECACHE_URLS = [
  "/offline.html",
  "/boot.html",
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

  const kind = offlineFetchKind(url, event.request);

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
    // Network first with a short patience window — cache/boot beat a long white splash.
    event.respondWith(networkFirstShelf(event, event.request));
    return;
  }

  event.respondWith(networkOnlyWithOfflinePage(event.request));
});

function offlineFetchKind(url, request) {
  const destination = request.destination;

  if (destination === "audio" || destination === "video") {
    return "bypass";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "bypass";
  }

  if (url.hostname.endsWith(".dzcdn.net")) {
    return "bypass";
  }

  if (url.pathname.startsWith("/api/")) {
    return "bypass";
  }

  if (isFlightRequest(request, url)) {
    return "bypass";
  }

  if (COVER_HOSTS.has(url.hostname)) {
    return "cover";
  }

  if (url.pathname.startsWith("/_next/static/")) {
    return "static";
  }

  // Only full document navigations for shelf paths — let soft RSC / data fetches hit the network.
  if (isOfflineShelfPath(url.pathname) && isDocumentRequest(request)) {
    return "shelf";
  }

  if (isOfflineShelfPath(url.pathname)) {
    return "bypass";
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

async function networkFirstShelf(event, request) {
  const cache = await caches.open(SHELF_CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then(async (response) => {
      if (canRememberShelf(request, response)) {
        await cache.put(request, response.clone());
      }

      return response;
    })
    .catch((error) => {
      if (isAbortError(error)) {
        return canceledResponse();
      }

      return null;
    });

  event.waitUntil(networkPromise.then(() => undefined));

  if (cached) {
    const raced = await Promise.race([
      networkPromise.then((response) => (response && response.ok ? response : null)),
      delay(SHELF_CACHE_WAIT_MS).then(() => "cache"),
    ]);

    if (raced && raced !== "cache") {
      return raced;
    }

    return cached;
  }

  const raced = await Promise.race([
    networkPromise.then((response) => (response && response.ok ? response : null)),
    delay(SHELF_BOOT_WAIT_MS).then(() => null),
  ]);

  if (raced) {
    return raced;
  }

  return documentFallback();
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
    if (isAbortError(error)) {
      return canceledResponse();
    }

    const fallback = await cache.match(request);

    if (fallback) {
      return fallback;
    }

    // Never invent a 503 for scripts/images — let the browser treat it as a network failure.
    return Response.error();
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
    .catch((error) => {
      if (isAbortError(error)) {
        return canceledResponse();
      }

      return undefined;
    });

  event.waitUntil(network);

  if (cached) {
    return cached;
  }

  const response = await network;

  if (response) {
    return response;
  }

  return Response.error();
}

async function networkOnlyWithOfflinePage(request) {
  try {
    return await fetch(request);
  } catch (error) {
    if (isAbortError(error)) {
      return canceledResponse();
    }

    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    if (isDocumentRequest(request)) {
      return documentFallback();
    }

    return Response.error();
  }
}

async function documentFallback() {
  const boot = await caches.match("/boot.html");

  if (boot) {
    return boot;
  }

  const offline = await caches.match("/offline.html");

  if (offline) {
    return offline;
  }

  return Response.error();
}

function isFlightRequest(request, url) {
  if (url.searchParams.has("_rsc")) {
    return true;
  }

  if (request.headers.get("RSC") === "1") {
    return true;
  }

  if (request.headers.get("Next-Router-Prefetch")) {
    return true;
  }

  if (request.headers.get("Next-Router-Segment-Prefetch")) {
    return true;
  }

  const accept = request.headers.get("Accept") || "";

  if (accept.includes("text/x-component")) {
    return true;
  }

  return false;
}

function isAbortError(error) {
  return Boolean(error && error.name === "AbortError");
}

function canceledResponse() {
  return new Response(null, { status: 204, statusText: "canceled" });
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
