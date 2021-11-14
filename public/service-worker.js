// data is stored here when offline
const CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

// list of urls the PWA needs to cache
const urlsToCache = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.json",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// code fires when user chooses to install PWA 
self.addEventListener("install", function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// code fires when api call is being made
self.addEventListener("fetch", function(event) {
  // /api/ insures all fetch routes can be indentified is a fetch route fails
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {

        // A fetch request is made if internet connection is still available. Should work as expected
        return fetch(event.request)
          .then(response => {
            // If response is successful, information is stored in cache that was accessed, then the data is sent back.
            // If the same route is accessed later and connection failed data from previously stored cache is implimented 
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })

          // .catch is used when there is no internet connection. .catch will pull correct saved data and sends that back instead
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  // This code block handles all home page calls.
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          // returns cached data for all home page requests
          return caches.match("/");
        }
      });
    })
  );
});