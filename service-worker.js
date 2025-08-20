const CACHE_NAME = 'hpsa-app-cache-v2';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/census.html',
  '/sensus.html',
  '/sensus-household.html',
  '/sensus-report.html',
  '/sales-summary.html',
  '/sales-report.html',
  '/offline.html',
  '/styles.css',
  '/zogo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
];

// Install event: cache all necessary files
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching offline pages');
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event: clean old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event: respond with cache, then network, fallback to offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then(networkResponse => {
          // Cache new GET requests dynamically
          return caches.open(CACHE_NAME).then(cache => {
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
        .catch(() => {
          // If navigation request fails, show offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});

// Optional: listen for message to skip waiting (for updates)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
