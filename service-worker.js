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
  '/offline.html'
];

// Install SW & pre-cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate SW & clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

// Fetch event - cache first, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then(response => {
          if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-offline-census') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  const db = await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
    .then(mod => mod.getFirestore(mod.initializeApp({
      apiKey: "AIzaSyCaOrMKZXZtJKD646bARehuTOxCe4DzsLk",
      authDomain: "hpsa-app-6b2d2.firebaseapp.com",
      projectId: "hpsa-app-6b2d2"
    })));
  const offlineData = JSON.parse(localStorage.getItem('offlinesensusData') || '[]');
  if (!offlineData.length) return;

  for (let entry of offlineData) {
    try {
      await db.addDoc(db.collection(db, 'sensusData'), entry);
    } catch(err) {
      console.error('Offline sync failed:', err);
      return;
    }
  }
  localStorage.removeItem('offlinesensusData');
}

// Listen for messages to update SW immediately
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
