/**
 * European Industrial Manufacturer - PWA Service Worker
 * Precaching, Offline Fallback, Background Sync, and Push Notification Handling
 */

const CACHE_NAME = "europrecision-pwa-v3";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./images/One_Png1.png",
  "./images/logo_dark_mode.jpeg",
  "./images/darkModelLogoWithoutNameThehammer.jpeg",
  ".images/PSM-Electric-Pump.jpg",
  "./style.css",
  "./js/i18n.js",
  "./js/store.js",
  "./js/media-manager.js",
  "./js/app.js",
  "./manifest.json",
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Precaching core static assets");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("[SW] Clearing old cache:", key);
              return caches.delete(key);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch Event (Cache-First strategy for static assets, Network-First for APIs)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset, fetch fresh version in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {
            /* Offline mode */
          });
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => {
          // If offline and requesting an HTML page, serve cached index.html
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("./index.html");
          }
        });
    }),
  );
});

// Background Sync for offline quote requests
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-quote-requests") {
    console.log("[SW] Background Sync: Processing pending RFQs");
    event.waitUntil(Promise.resolve());
  }
});

// Push Notification Event Handler
self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : {
        title: "New Industrial RFQ",
        body: "A new quotation request has arrived.",
      };
  const options = {
    body: data.body,
    icon: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=192&h=192&q=80",
    badge:
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=192&h=192&q=80",
    data: { url: "./index.html" },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || "./index.html"),
  );
});
