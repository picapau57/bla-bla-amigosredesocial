// Bump this on every deploy that changes app behavior so the activate
// handler below clears the old cache and forces a clean slate.
const CACHE_NAME = 'bba-cache-v2';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/icon-512.jpg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[BBA Service Worker] Initial asset caching skipped, will cache dynamically:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[BBA Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (required for PWA install prompt)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and avoid extension scripts or internal chrome-extension/ APIs
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // NETWORK-FIRST for the HTML shell (navigations and index.html itself).
  // This is the fix: the HTML shell references the app's hashed JS/CSS
  // bundle filenames, which change on every deploy. If we serve a stale
  // cached HTML shell, the browser keeps loading an old, possibly
  // non-existent JS bundle forever — which is exactly what was happening.
  // Always try the network first here; only fall back to cache if offline.
  const url = new URL(event.request.url);
  const isHtmlShell = event.request.mode === 'navigate' || url.pathname === '/index.html' || url.pathname === '/';
  if (isHtmlShell) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // CACHE-FIRST (stale-while-revalidate) for everything else: hashed JS/CSS
  // bundles are immutable per build, so aggressive caching here is safe and
  // fast — a new deploy simply uses new filenames, it never reuses an old
  // hashed filename with different content.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh in background to update cache (stale-while-revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => { /* ignore offline network failures */ });
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache newly fetched assets dynamically
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback for index.html if network is unreachable
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
