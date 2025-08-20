import { precacheAndRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js';
import { registerRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-routing.prod.js';
import { NetworkFirst, StaleWhileRevalidate } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-strategies.prod.js';

// Precache offline page and essential assets
precacheAndRoute([
  { url: 'offline.html', revision: '1' },
  { url: 'index.html', revision: '1' },
  { url: 'styles.css', revision: '1' },
  { url: 'icons/icon-192.png', revision: '1' },
  { url: 'icons/icon-512.png', revision: '1' },
  // Add more pages you want to be cached offline
  { url: 'census.html', revision: '1' },
  { url: 'census2.html', revision: '1' }
]);

// Cache navigation requests with NetworkFirst
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({ cacheName: 'pages-cache' })
);

// Cache CSS, JS, images with StaleWhileRevalidate
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image',
  new StaleWhileRevalidate({ cacheName: 'assets-cache' })
);

// Offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('offline.html'))
    );
  }
});

// Background Sync for offline form submissions
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncFormsToServer());
  }
});

async function syncFormsToServer() {
  // Example: get unsynced form data from IndexedDB
  // and send to server
  console.log('Syncing forms in background...');
  // Add your actual form sync logic here
}

// Periodic Background Sync (optional, supported in Chrome)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-data') {
    event.waitUntil(fetchLatestData());
  }
});

async function fetchLatestData() {
  console.log('Fetching latest data for offline use...');
  // Fetch and cache latest data
}

// Skip waiting on new SW
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
