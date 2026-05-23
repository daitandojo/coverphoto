// CoverPhoto Service Worker
const CACHE = "coverphoto-v2";
const ASSETS = [
  "/",
  "/icon-192.png",
  "/icon-512.png",
  "/og-image.png",
  "/logo.png",
];

// Install
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

// Activate
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
});

// Network-first fetch
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then((cached) => cached || fetch(e.request)))
  );
});

// Push notifications
self.addEventListener("push", (e) => {
  let data = { title: "CoverPhoto", body: "Your portrait is ready!" };
  try {
    if (e.data) data = e.data.json();
  } catch {}
  const opts = {
    body: data.body || "Your portrait is ready!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    tag: "coverphoto-portrait",
    data: { url: data.url || "/" },
  };
  e.waitUntil(self.registration.showNotification(data.title || "CoverPhoto", opts));
});

// Notification click
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(clients.openWindow(url));
});
