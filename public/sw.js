// TalentFlow PWA Service Worker
const CACHE_NAME = "talentflow-v1";
const STATIC_ASSETS = [
  "/",
  "/admin",
  "/favicon.ico",
  "/site.webmanifest",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png"
];

// Install: Cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("PWA pre-cache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up older caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network first with cache fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Do not intercept external APIs or Firestore auth requests
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        // Fallback to offline root
        return caches.match("/");
      })
  );
});
