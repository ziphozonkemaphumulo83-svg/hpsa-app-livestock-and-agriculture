// service-worker.js
import { precacheAndRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js';
import { registerRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-routing.prod.js';
import { NetworkFirst, StaleWhileRevalidate } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-strategies.prod.js';
import { ExpirationPlugin } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-expiration.prod.js';
import { CacheableResponsePlugin } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-cacheable-response.prod.js';

// -----------------------------
// Precache essential assets
// -----------------------------
precacheAndRoute([
  { url: 'offline.html', revision: '1' },
  { url: 'index.html', revision: '1' },
  { url: 'census.html', revision: '1' },
  { url: 'census2.html', revision: '1' },
  { url: 'styles.css', revision: '1' },
  { url: 'script.js', revision: '1' },
  { url: 'icons/icon-192.png', revision: '1' },
  { url: 'icons/icon-512.png', revision: '1' }
]);

// -----------------------------
// Cache navigation (pages)
// -----------------------------
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  })
);

// -----------------------------
// Cache assets (CSS, JS, images)
// -----------------------------
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 }), // 7 days
      new CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  })
);

// -----------------------------
// Offline fallback for navigation
// -----------------------------
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('offline.html'))
    );
  }
});

// -----------------------------
// Background Sync: offline form submissions
// -----------------------------
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncFormsToServer());
  }
});

async function syncFormsToServer() {
  try {
    console.log('[SW] Syncing forms to server...');
    // TODO: Implement IndexedDB retrieval & submission logic
  } catch (err) {
    console.error('[SW] Form sync failed:', err);
  }
}

// -----------------------------
// Periodic Background Sync (optional)
// -----------------------------
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-data') {
    event.waitUntil(fetchLatestData());
  }
});

async function fetchLatestData() {
  try {
    console.log('[SW] Fetching latest data...');
    // TODO: Implement latest data caching
  } catch (err) {
    console.error('[SW] Periodic fetch failed:', err);
  }
}

// -----------------------------
// Skip waiting for new SW
// -----------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
