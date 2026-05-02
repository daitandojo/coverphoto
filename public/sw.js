// CoverPhoto Service Worker - basic offline caching
const CACHE = "coverphoto-v1";
const ASSETS = [
  "/",
  "/logo.png",
  "/samples/s1_executive.png",
  "/samples/s1_founder.png",
  "/samples/s1_statesperson.png",
  "/samples/s1_outdoors.png",
];

// Install: cache assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
});

// Fetch: network-first, fallback to cache
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then((cached) => cached || fetch(e.request)))
  );
});
