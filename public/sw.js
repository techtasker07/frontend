// Minimal, non-invasive Service Worker to enable installability without caching app shell
self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of uncontrolled clients
  event.waitUntil(self.clients.claim());
});

// Handle app launch to refresh if it's the first time today
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_FIRST_VISIT') {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem("lastVisitDate");

    if (lastVisit !== today) {
      localStorage.setItem("lastVisitDate", today);
      // Notify the client to refresh
      event.ports[0].postMessage({ refresh: true });
    } else {
      event.ports[0].postMessage({ refresh: false });
    }
  }
});

// Intentionally no 'fetch' handler to avoid interfering with Next.js routing and data fetching.
