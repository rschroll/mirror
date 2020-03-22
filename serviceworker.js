var CACHE = "mirror-cache-v1";
var cacheURLs = [
  "/mirror/",
];

// Set up cache for relevant URLs
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(
      (cache) => cache.addAll(cacheURLs)
    )
  );
});

// Serve fetch requests out of cache if possible
self.addEventListener("fetch", (event) => {
  let url = new URL(event.request.url);
  if (!cacheURLs.includes(url.pathname))
    return;

  event.respondWith(
    caches.match(event.request).then(
      (response) => {
        if (response) {
          // Download a new copy in the background, so we can update resources
          event.waitUntil(caches.open(CACHE).then(
            (cache) => fetch(event.request).then(
              (response) => cache.put(event.request, response)
            )
          ));
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Delete old caches as soon as practical
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(
      (cacheNames) => Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName != CACHE)
            return caches.delete(cacheName);
        })
      )
    )
  );
});
