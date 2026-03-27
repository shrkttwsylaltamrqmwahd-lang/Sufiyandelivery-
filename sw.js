// ترقية الإصدار إلى v4 لتطبيق استراتيجية "الإنترنت أولاً"
const CACHE_NAME = 'sufian-system-v4';

// الثلاثي المكتمل: المطاعم، الكباتن، والإدارة
const ASSETS_TO_CACHE = [
  './restaurant.html',
  './manifest_restaurant.json',
  './driver.html',
  './manifest_driver.json',
  './Master.html',
  './manifest_master.json'
];

// 1. مرحلة التثبيت (تخزين ملفات المنظومة بالكامل)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] جاري تخزين النظام الثلاثي للإصدار الرابع...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // تفعيل فوري
});

// 2. مرحلة التنشيط (تنظيف صارم لأي ذاكرة قديمة)
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

// 3. مرحلة جلب البيانات (هنا السحر الجديد: Network First)
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // 🚫 استثناء تام لطلبات السيرفر (Google Apps Script) لمنع تجميد البيانات
  if (requestUrl.hostname === 'script.google.com') {
    return; // دع المتصفح يعالجه كطلب شبكة عادي بدون تدخل المحرك
  }

  // 🚀 استراتيجية: الإنترنت أولاً، ثم الكاش
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // إذا كان الإنترنت يعمل، خذ التحديث الجديد واحفظ نسخة منه في الكاش صامتاً
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // إذا انقطع الإنترنت في كركوك، افتح التطبيق من الكاش فوراً!
        return caches.match(event.request);
      })
  );
});
