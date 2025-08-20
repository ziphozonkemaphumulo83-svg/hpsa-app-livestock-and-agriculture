// service-worker.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-cache-v1";
const offlineFallbackPage = "offline.html";

// -----------------------------
// Install: cache offline.html + core pages
// -----------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll([
        offlineFallbackPage,
        "index.html",
        "sales-summary.html",
        "sales-report.html",
        "sensus.html",
        "sensus-household.html",
        "sensus-report.html",
        "styles.css",
        "script.js",
        "icons/icon-192.png",
        "icons/icon-512.png"
      ]);
    })
  );
  self.skipWaiting();
});

// -----------------------------
// Activate: clean old caches
// -----------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// -----------------------------
// Fetch handler: Network first for pages, cache fallback
// -----------------------------
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResp = await event.preloadResponse;
          if (preloadResp) return preloadResp;

          const networkResp = await fetch(event.request);
          return networkResp;
        } catch (error) {
          const cache = await caches.open(CACHE);
          return cache.match(event.request) || cache.match(offlineFallbackPage);
        }
      })()
    );
  } else {
    // Cache-first for assets (CSS, JS, images)
    event.respondWith(
      caches.match(event.request).then((cachedResp) => {
        return (
          cachedResp ||
          fetch(event.request).then((networkResp) => {
            return caches.open(CACHE).then((cache) => {
              cache.put(event.request, networkResp.clone());
              return networkResp;
            });
          })
        );
      })
    );
  }
});

// -----------------------------
// Support skipWaiting
// -----------------------------
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
