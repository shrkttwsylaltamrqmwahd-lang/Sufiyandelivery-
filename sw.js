// اسم ذاكرة التخزين المؤقت (الكاش) للإصدار الأول
const CACHE_NAME = 'sufian-rest-v1';

// الملفات الأساسية التي نريد تخزينها ليفتح التطبيق بسرعة الصاروخ
const ASSETS_TO_CACHE = [
  './restaurant.html',
  './manifest_restaurant.json'
];

// 1. مرحلة التثبيت (زرع الجهاز العصبي)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] جاري تخزين الملفات الأساسية...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // تفعيل فوري للتحديثات
});

// 2. مرحلة التنشيط (تنظيف الذاكرة القديمة إن وجدت)
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// 3. مرحلة جلب البيانات (استراتيجية: جلب من الذاكرة أولاً ثم الإنترنت)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // إذا وجدنا الملف في الذاكرة، نعطيه فوراً (سرعة خيالية)، وإلا نجلبه من الإنترنت
      return response || fetch(event.request);
    }).catch(() => {
      // هنا يمكننا مستقبلاً وضع صفحة "لا يوجد اتصال بالإنترنت"
      console.log('لا يوجد اتصال بالإنترنت!');
    })
  );
});

