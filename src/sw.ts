/// <reference lib="webworker" />

// Serwist service worker entry point
// Actual offline caching configuration deferred to Epic 7

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener("install", () => {
  sw.skipWaiting();
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(sw.clients.claim());
});
