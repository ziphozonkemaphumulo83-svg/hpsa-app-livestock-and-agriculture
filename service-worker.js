// service-worker.js
// PWA Offline Service Worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "hpsa-cache-v1";
const offlineFallbackPage = "offline.html";

// Listen for skip waiting messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Install event – cache offline fallback + key pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll([
        "/",                       // root
        "/index.html",
        "/sales-summary.html",
        "/sensus.html",
        "/sensus-household.html",
        "/offline.html",
        "/manifest.json",
        "/images/icon-192.png",
        "/images/icon-512.png"
      ]);
    })
  );
});

// Enable navigation preload if supported
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Fetch event – try network, fall back to cache, then offline page
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Use preload response if available
          const preloadResp = await event.preloadResponse;
          if (preloadResp) return preloadResp;

          // Try network request
          const networkResp = await fetch(event.request);
          return networkResp;
        } catch (error) {
          // Fallback to cache or offline page
          const cache = await caches.open(CACHE);
          const cachedResp = await cache.match(event.request);
          return cachedResp || cache.match(offlineFallbackPage);
        }
      })()
    );
  }
});
