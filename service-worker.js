const CACHE_NAME = "sci-calc-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./converter.html",
  "./css/style.css",
  "./js/app.js"
];

// Install SW and cache assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()) // Activate SW immediately
  );
});

// Activate SW and clear old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // Take control of pages
  );
});

// Fetch requests: Cache-first strategy with fallback to network
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return; // Only cache GET requests
  e.respondWith(
    caches.match(e.request).then((cachedRes) => {
      if (cachedRes) return cachedRes;
      return fetch(e.request)
        .then((networkRes) => {
          // Optionally cache new requests dynamically
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => {
          // Fallback if offline and resource not cached
          if (e.request.destination === "document") return caches.match("./index.html");
        });
    })
  );
});

// Optional: Periodic Background Sync placeholder
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "update-cache") {
    event.waitUntil(updateCache());
  }
});

// Function to update cache dynamically
async function updateCache() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(ASSETS);
}
