const CACHE_NAME = "hpsa-cache-v1";

// List of files to cache
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/sensus.html",
  "/sensus-household.html",
  "/sensus-report.html",
  "/sales.html",
  "/sales-report.html"
  "/script.js"
  "/zongo.png"
  // Add any extra JS/CSS/images your app needs offline
];

// Install SW and cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Serve from cache
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Update cache when new version is deployed
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});
