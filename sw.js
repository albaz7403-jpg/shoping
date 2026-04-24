// ============================================
// Service Worker للتطبيق التقدمي
// ============================================

const CACHE_NAME = 'bakery-store-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/config.js',
    '/js/data.js',
    '/js/ui.js',
    '/js/cart.js',
    '/js/admin.js',
    '/js/main.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});