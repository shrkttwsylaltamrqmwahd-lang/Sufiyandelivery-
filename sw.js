// AlHut-Final-V10: نسخة كسر الذاكرة وإجبار التحول للنطاق الجديد
const CACHE_NAME = 'AlHut-Final-V10';

const ASSETS_TO_CACHE = [
  './Master.html',
  './restaurant.html',
  './driver.html',
  './manifest_master.json',
  './manifest_restaurant.json',
  './manifest_driver.json',
  './master-logo.png',
  './rest-logo.png',
  './driver-logo.png'
];

// 1. التثبيت: إجبار السيرفس وركر الجديد على الحلول مكان القديم فوراً
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] جاري تخزين الملفات الجديدة...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. التفعيل: مسح كافة الذكريات القديمة (v6 وغيرها) للأبد
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] تم نسف الذاكرة القديمة:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. جلب البيانات: استراتيجية (الإنترنت أولاً) لضمان عدم العلوق في نسخة قديمة
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // 🚫 منع الكاش من لمس طلبات سيرفر جوجل نهائياً
  if (requestUrl.hostname.includes('script.google.com')) {
    return; // اتركه يعبر للإنترنت مباشرة
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // تحديث الكاش بالنسخة الجديدة من الإنترنت
        if (event.request.method === 'GET') {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // إذا انقطع الإنترنت، استخدم آخر نسخة مخزنة
        return caches.match(event.request);
      })
  );
});
