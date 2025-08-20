const CACHE_NAME = 'hpsa-cache-v1';
const urlsToCache = [
  '/index.html',
  '/sales-summary.html',
  '/sensus.html',
  '/sensus-household.html',
  '/styles.css',
  '/manifest.prod.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Precache assets
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urlsToCache);
  })());
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Fetch from cache first, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(event.request);
    return cachedResponse || fetch(event.request);
  })());
});
