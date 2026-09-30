/**
 * StepLedger - Service Worker (PWA v4)
 * Robust offline-first caching for mobile footwear khata
 */

const CACHE_NAME = 'stepledger-pwa-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/store.js',
  './js/ui.js',
  './js/pwa.js',
  './icons/icon.svg',
  './icons/icon-96.png',
  './icons/icon-192.png',
  './icons/icon-maskable-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/screenshot-mobile.png',
  './icons/screenshot-desktop.png'
];

// Install Event - Pre-cache essential offline assets resiliently
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Pre-caching offline assets for StepLedger');
      await Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Could not cache asset:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-while-revalidate for local assets, cache-first for fonts & static assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Only handle http and https requests (skip chrome-extension, data, etc.)
  if (!url.protocol.startsWith('http')) return;

  // HTML navigation requests: Network first with index.html offline fallback
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match('./index.html') || await caches.match('./');
          return fallback;
        })
    );
    return;
  }

  // Assets (CSS, JS, Fonts, Images)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (Stale While Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            /* Offline - rely on cached version */
          });
        return cachedResponse;
      }

      // Not in cache: fetch from network and cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          // Cache both basic and cors responses (e.g. Google Fonts)
          if (networkResponse.type === 'basic' || networkResponse.type === 'cors') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback for icons/images if not in cache
          if (event.request.destination === 'image') {
            return caches.match('./icons/icon-192.png');
          }
        });
    })
  );
});
