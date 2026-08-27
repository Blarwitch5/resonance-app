"use strict";

const CACHE_NAME = "resonance-shell-v3";
const PRECACHE_URLS = [
  "/offline.html",
  "/logo-resonance.svg",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(precacheShell());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(activateShell());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(networkOnlyWithOfflinePage(event.request));
});

async function precacheShell() {
  const cache = await caches.open(CACHE_NAME);

  for (const url of PRECACHE_URLS) {
    try {
      await cache.add(url);
    } catch {
      continue;
    }
  }

  await self.skipWaiting();
}

async function activateShell() {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith("resonance-shell-") && key !== CACHE_NAME)
      .map((key) => caches.delete(key)),
  );
  await self.clients.claim();
}

async function networkOnlyWithOfflinePage(request) {
  try {
    return await fetch(request);
  } catch (error) {
    if (isDocumentRequest(request)) {
      const offline = await caches.match("/offline.html");

      if (offline) {
        return offline;
      }
    }

    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

function isDocumentRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}
