const CACHE_NAME = 'hpsa-cache-v1';
const urlsToCache = [
  '/index.html',
  '/sensus.html',
  '/sensus-household.html',
  '/sales-summary.html',
  '/styles.css',
  '/manifest.prod.json',
  '/icon-192.png',
  '/icon-512.png',
  '/screenshot1.png',
  '/screenshot2.png',
  '/offline.html' // optional fallback page
];

// Install event - cache all required assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event - respond with cache first, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then(response => {
          // Optional: cache new requests dynamically
          return caches.open(CACHE_NAME).then(cache => {
            // Only cache GET requests and avoid caching external domains
            if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
        .catch(() => {
          // Fallback for offline pages (HTML only)
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});

// Optional: listen for messages to skip waiting and update
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
