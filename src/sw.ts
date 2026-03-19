/// <reference lib="webworker" />

// Minimal service worker for PWA registration (no offline caching)

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener("install", () => {
  sw.skipWaiting();
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(sw.clients.claim());
});
