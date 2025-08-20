import { precacheAndRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js';
import { registerRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-routing.prod.js';
import { NetworkFirst, StaleWhileRevalidate } from 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-strategies.prod.js';

precacheAndRoute([
  { url: 'offline.html', revision: '1' },
  { url: 'index.html', revision: '1' },
  { url: 'styles.css', revision: '1' },
  { url: 'icons/icon-192.png', revision: '1' },
  { url: 'icons/icon-512.png', revision: '1' }
]);

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({ cacheName: 'pages-cache' })
);

registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image',
  new StaleWhileRevalidate({ cacheName: 'assets-cache' })
);

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('offline.html'))
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
