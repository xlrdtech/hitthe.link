// xos service worker — offline cache + asset shell + version bust
// Per canon_xos_canon_xenphone_dead_2026-05-22 + canon_xen_pwa_gh_pages_failover_2026-05-16
// SSE + REST calls always go to network (never cached) so live data isn't stale.

const VERSION = "xos-v1-2026-05-22";
const SHELL = [
  "/xos/",
  "/xos/index.html",
  "/xos/app.jsx",
  "/xos/ios-frame.jsx",
  "/xos/tweaks-panel.jsx",
  "/xos/styles.css",
  "/xos/icon.svg",
  "/xos/icon-circular.svg",
  "/xos/manifest.json"
];

self.addEventListener("install", (ev) => {
  ev.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  const url = new URL(req.url);

  // Never cache live data — SSE + API endpoints must hit network
  if (url.host === "xen.xlrd.org" || url.pathname.startsWith("/api/") || url.pathname === "/events" || url.pathname === "/mirror/reply") {
    return; // default network behavior
  }

  // Cache-first for /xos/ shell
  if (url.pathname.startsWith("/xos/") || url.pathname === "/xos") {
    ev.respondWith(
      caches.match(req).then((hit) => {
        if (hit) {
          // Background refresh
          fetch(req).then((fresh) => {
            if (fresh && fresh.ok) caches.open(VERSION).then((c) => c.put(req, fresh.clone())).catch(() => {});
          }).catch(() => {});
          return hit;
        }
        return fetch(req).then((fresh) => {
          if (fresh && fresh.ok && req.method === "GET") {
            caches.open(VERSION).then((c) => c.put(req, fresh.clone())).catch(() => {});
          }
          return fresh;
        }).catch(() => caches.match("/xos/index.html"));
      })
    );
  }
});
