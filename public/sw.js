// ALAYA INSIDER — Service Worker
// Cache strategies: stale-while-revalidate for static assets, network-first for API, cache-first for images

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `alaya-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `alaya-images-${CACHE_VERSION}`;
const API_CACHE = `alaya-api-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// Install — precache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith('alaya-') && key !== STATIC_CACHE && key !== IMAGE_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch — routing strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, non-http(s)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // API requests — network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Images — cache first, network fallback
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Navigation — network first, fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, STATIC_CACHE).catch(() => {
        return caches.match('/offline.html');
      })
    );
    return;
  }

  // Static assets — stale while revalidate
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

// Cache strategies
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    return new Response('', { status: 200, statusText: 'OK' });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: { url: data.url || '/' },
      vibrate: [200, 100, 200],
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'Alaya Insider', options)
    );
  } catch (err) {
    // Not JSON — show raw text
    event.waitUntil(
      self.registration.showNotification(event.data.text(), {
        icon: '/icons/icon-192x192.png',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      const focused = windowClients.find((c) => c.url === url && 'focus' in c);
      if (focused) return focused.focus();
      return clients.openWindow(url);
    })
  );
});

// Background sync — for offline affiliate clicks
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-affiliate-clicks') {
    event.waitUntil(syncAffiliateClicks());
  }
});

async function syncAffiliateClicks() {
  try {
    const db = await openIndexedDB();
    const clicks = await db.getAll('offline-clicks');
    for (const click of clicks) {
      try {
        await fetch('/api/v1/affiliate/offline-clicks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(click),
        });
        await db.delete('offline-clicks', click.id);
      } catch (err) {
        console.error('Failed to sync click:', err);
      }
    }
  } catch (err) {
    console.error('Sync failed:', err);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AlayaOfflineDB', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offline-clicks')) {
        db.createObjectStore('offline-clicks', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
