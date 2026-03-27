// الإصدار v6: نسف الذاكرة القديمة وإجبار التحديث
const CACHE_NAME = 'sufian-system-v6';

const ASSETS_TO_CACHE = [
  './restaurant.html',
  './manifest_restaurant.json',
  './driver.html',
  './manifest_driver.json',
  './Master.html',
  './manifest_master.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); 
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] مسح الذاكرة القديمة:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // 🚫 الجدار الفاصل: منع المحرك من التدخل في طلبات سيرفر جوجل نهائياً
  if (requestUrl.hostname.includes('script.google.com')) {
    return; // اتركه يعبر للإنترنت مباشرة
  }

  // استراتيجية: الإنترنت أولاً، ثم الذاكرة
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
