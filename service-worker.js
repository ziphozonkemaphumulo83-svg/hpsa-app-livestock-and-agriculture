// service-worker.js
import { precacheAndRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js';
import { registerRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-routing.prod.js';
import { NetworkFirst, StaleWhileRevalidate } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-strategies.prod.js';
import { ExpirationPlugin } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-expiration.prod.js';
import { CacheableResponsePlugin } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-cacheable-response.prod.js';

// -----------------------------
// Precache essential pages & assets
// -----------------------------
precacheAndRoute([
  { url: 'offline.html', revision: '1' },
  { url: 'index.html', revision: '1' },
  { url: 'sales-summary.html', revision: '1' },
  { url: 'sales-report.html', revision: '1' },
  { url: 'census.html', revision: '1' },
  { url: 'sensus.html', revision: '1' },
  { url: 'sensus-household.html', revision: '1' },
  { url: 'sensus-report.html', revision: '1' },
  { url: 'styles.css', revision: '1' },
  { url: 'script.js', revision: '1' },
  { url: 'icons/icon-192.png', revision: '1' },
  { url: 'icons/icon-512.png', revision: '1' }
]);

// -----------------------------
// Navigation caching with proper fallback
// -----------------------------
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  })
);

// -----------------------------
// Cache assets (CSS, JS, Images)
// -----------------------------
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 }),
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
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) {
            throw new Error('Network response invalid');
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open('pages-cache');

          // Use the cached version of the requested URL
          const cachedResponse = await cache.match(event.request.url);
          if (cachedResponse) return cachedResponse;

          // Try matching by filename only (fallback for relative navigation)
          const urlParts = event.request.url.split('/');
          const filename = urlParts[urlParts.length - 1];
          const fallback = await cache.match(filename);
          return fallback || caches.match('offline.html');
        })
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
    // TODO: IndexedDB submission logic
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
    // TODO: implement caching logic
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
