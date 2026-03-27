// AlHut-Final-V11: نسخة التطهير الشامل وتفعيل المحرك V3
const CACHE_NAME = 'AlHut-Final-V11';

// قائمة الملفات التي سيتم حفظها في ذاكرة الهاتف للعمل بدون إنترنت
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

// 1. التثبيت: تحميل الملفات الجديدة فوراً
self.addEventListener('install', event => {
  self.skipWaiting(); // إجبار النسخة الجديدة على العمل فوراً
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[AlHut System] جاري تهيئة الذاكرة V11...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. التفعيل: مسح كل ما يتعلق بـ V10 وأي نسخ قديمة أخرى
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[AlHut System] تم حذف الذاكرة القديمة بنجاح:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. جلب البيانات: استراتيجية "الإنترنت أولاً" لضمان عدم حدوث تضارب
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // 🚫 استثناء كامل لطلبات جوجل شيت (يجب أن تذهب للإنترنت دائماً)
  if (requestUrl.hostname.includes('script.google.com')) {
    return; 
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // إذا كان الطلب ناجحاً، قم بتحديث الكاش بالنسخة الجديدة
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // في حال انقطاع الإنترنت تماماً، استخدم الملفات المخزنة
        return caches.match(event.request);
      })
  );
});
