// Minimal, non-invasive Service Worker to enable installability without caching app shell
self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of uncontrolled clients
  event.waitUntil(self.clients.claim());
});

// Intentionally no 'fetch' or complex 'message' handlers to avoid
// interfering with Next.js routing, data fetching, or client storage.
