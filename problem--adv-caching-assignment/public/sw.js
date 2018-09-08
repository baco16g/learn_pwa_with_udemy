
var CACHE_STATIC_NAME = 'static-v2';
var CACHE_DYNAMIC_NAME = 'dynamic-v1';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/src/css/app.css',
  '/src/css/main.css',
  '/src/js/main.js',
  '/src/js/material.min.js',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        cache.addAll(STATIC_FILES);
      })
  )
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME) {
            return caches.delete(key);
          }
        }));
      })
  );
});

// 1) Identify the strategy we currently use in the Service Worker (for caching)
// Cache, fallback to network (with dynamic caching)
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 });
//             })
//             .catch(function(err) {

//             });
//         }
//       })
//   );
// });

// 2) Replace it with a "Network only" strategy => Clear Storage (in Dev Tools), reload & try using your app offline
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });

// 3) Replace it with a "Cache only" strategy => Clear Storage (in Dev Tools), reload & try using your app offline
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// 4) Replace it with "Network, cache fallback" strategy =>  => Clear Storage (in Dev Tools), reload & try using your app offline
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res) {
//         caches.open(CACHE_DYNAMIC_NAME)
//           .then(function(cache) {
//             cache.put(event.request.url, res.clone())
//             return res
//           })
//       })
//       .catch(function(err) {
//         return caches.match(event.request)
//       })
//   );
// });

// 5) Replace it with a "Cache, then network" strategy => Clear Storage (in Dev Tools), reload & try using your app offline
// 6) Add "Routing"/ URL Parsing to pick the right strategies: Try to implement "Cache, then network", "Cache with network fallback" and "Cache only" (all of these, with appropriate URL selection)
function isInArray(string, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === string) {
      return true
    }
    return false
  }
}

self.addEventListener('fetch', function(event) {
  if (event.request.url.indexOf('https://httpbin.org/ip') > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then(function(cache) {
          return fetch(event.request)
            .then(function(res) {
              cache.put(event.request.url, res.clone())
              return res
            })
        })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(
      caches.match(event.request)
    )
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function(res) {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function(cache) {
                    cache.put(event.request.url, res.clone());
                    return res;
                  });
              })
              .catch(function(err) {

              });
          }
        })
    );
  }
});