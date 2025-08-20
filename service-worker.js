// service-worker.js
import { precacheAndRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js';
import { registerRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-routing.prod.js';
import { NetworkFirst, StaleWhileRevalidate } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-strategies.prod.js';
import { ExpirationPlugin } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-expiration.prod.js';
import { CacheableResponsePlugin } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-cacheable-response.prod.js';

// -----------------------------
// Precache essential pages & assets
// -----------------------------
console.log('[SW] Precaching essential assets...');
precacheAndRoute([
  { url: 'offline.html', revision: '1' },
  { url: 'index.html', revision: '1' },
  { url: 'sales-summary.html', revision: '1' },
  { url: 'sales-report.html', revision: '1' },
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
  ({ request }) => {
    const isNav = request.mode === 'navigate';
    if (isNav) console.log('[SW] Navigation request:', request.url);
    return isNav;
  },
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
    console.log('[SW][FETCH] Navigation attempt:', event.request.url);

    event.respondWith(
      fetch(event.request)
        .then((response) => {
          console.log('[SW][FETCH] Network success:', event.request.url);
          if (!response || response.status !== 200) {
            console.warn('[SW][FETCH] Invalid response:', response);
            throw new Error('Network response invalid');
          }
          return response;
        })
        .catch(async (err) => {
          console.warn('[SW][FETCH] Network failed, trying cache...', event.request.url, err);

          const cache = await caches.open('pages-cache');

          // Try full URL
          const cachedResponse = await cache.match(event.request.url);
          if (cachedResponse) {
            console.log('[SW][FETCH] Found cached version (full URL):', event.request.url);
            return cachedResponse;
          }

          // Try by filename only
          const urlParts = event.request.url.split('/');
          const filename = urlParts[urlParts.length - 1];
          const fallback = await cache.match(filename);
          if (fallback) {
            console.log('[SW][FETCH] Found cached version (filename match):', filename);
            return fallback;
          }

          console.warn('[SW][FETCH] Nothing cached, showing offline.html');
          return caches.match('offline.html');
        })
    );
  }
});

// -----------------------------
// Background Sync: offline form submissions
// -----------------------------
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event triggered:', event.tag);
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
  console.log('[SW] Periodic sync triggered:', event.tag);
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
    console.log('[SW] SKIP_WAITING received, activating new service worker...');
    self.skipWaiting();
  }
});
