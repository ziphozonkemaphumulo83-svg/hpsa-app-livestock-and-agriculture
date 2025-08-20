// service-worker.js
import { precacheAndRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js';
import { registerRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-routing.prod.js';
import { NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-strategies.prod.js';
import { BackgroundSyncPlugin } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-background-sync.prod.js';
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
// Navigation caching + offline fallback
// -----------------------------
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    networkTimeoutSeconds: 5,
    plugins: [ new CacheableResponsePlugin({ statuses: [0, 200] }) ]
  })
);

// Extra safety: explicit offline fallback for navigations
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(event.request);
          if (!res || res.status !== 200) throw new Error('Bad response');
          return res;
        } catch (e) {
          const cache = await caches.open('pages-cache');
          const full = await cache.match(event.request.url);
          if (full) return full;
          const name = event.request.url.split('/').pop();
          const byName = await cache.match(name);
          return byName || caches.match('offline.html');
        }
      })()
    );
  }
});

// -----------------------------
// Runtime assets (CSS/JS/Images)
// -----------------------------
registerRoute(
  ({ request }) => ['style','script','image'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  })
);

// -----------------------------
// One-off Background Sync (queue POSTs when offline)
// -----------------------------
// Queue name shows in DevTools → Application → Background Sync
const bgSyncPlugin = new BackgroundSyncPlugin('form-queue', {
  maxRetentionTime: 24 * 60 // minutes
});

// Example: queue all same-origin POST requests (adapt to your endpoints)
registerRoute(
  ({ request, url }) => request.method === 'POST' && url.origin === self.location.origin,
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);

// Fallback: if you also use SyncManager manually
self.addEventListener('sync', (event) => {
  // If you ever call registration.sync.register('sync-forms') on the page
  if (event.tag === 'sync-forms') {
    event.waitUntil((async () => {
      // Your manual IndexedDB → server logic (optional if using Workbox plugin above)
      // Keep for PWABuilder completeness
      console.log('[SW] manual sync-forms triggered');
    })());
  }
});

// -----------------------------
// Periodic Background Sync (updates data quietly)
// -----------------------------
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-data') {
    event.waitUntil((async () => {
      // Fetch and cache fresh data here
      console.log('[SW] periodic update-data task');
      // Example: warm a JSON endpoint if you have one
      // const res = await fetch('/data.json', { cache: 'no-store' });
      // const cache = await caches.open('data-cache');
      // await cache.put('/data.json', res.clone());
    })());
  }
});

// -----------------------------
// Push Notifications (receive + click)
// -----------------------------
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {}
  const title = data.title || 'HPSA';
  const body = data.body || 'You have a new notification';
  const options = {
    body,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    data: data.data || {}
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) ||
              '/hpsa-app-livestock-and-agriculture/index.html';
  event.waitUntil(clients.openWindow(url));
});

// -----------------------------
// Fast SW updates
// -----------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
