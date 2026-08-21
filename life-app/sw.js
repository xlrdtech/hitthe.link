// XEN LIFE service worker.
//
// STRATEGY: network-first for EVERYTHING except the two icon files.
//
// WHY SO CONSERVATIVE — measured, 2026-08-10 20:26, on the XOS worker:
// that worker was cache-first-with-background-refresh for all of /xos/, app.jsx
// included, which is always exactly one load behind: load N serves the old file
// and refreshes in the background, so new code first appears on load N+1. The
// evidence was an in-page fetch returning 80,827 bytes WITHOUT a shipped fix
// while fetch('app.jsx?nocache=…') returned 82,272 WITH it, transferSize 0. The
// deploy had been correct the whole time; the worker was the bug.
//
// A surface that is live by default cannot serve its own code from cache. So the
// allowlist here is inverted: nothing is cache-first unless it is named below,
// and the only things named are immutable icons. Offline falls back to the last
// good copy, which is strictly better than nothing and never fresher-than-network.
const VERSION = "life-v1-2026-08-20";
const CACHE = "xen-life-" + VERSION;

// The ONLY cache-first entries. Immutable by nature; staleness is harmless.
const IMMUTABLE = ["icon.svg", "icon-circular.svg"];

// Per-asset add(), never addAll(): addAll is atomic, so ONE 404 rejects the whole
// batch and the offline cache silently never populates.
self.addEventListener("install", (ev) => {
  ev.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const u of IMMUTABLE) {
      try { await c.add(u); } catch (e) { /* one missing icon must not kill install */ }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET") return;                       // never touch writes
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // never proxy cross-origin
  if (url.pathname.startsWith("/api/")) return;           // live data, always network

  const isImmutable = IMMUTABLE.some((n) => url.pathname.endsWith("/" + n));

  if (isImmutable) {
    ev.respondWith((async () => (await caches.match(req)) || fetch(req))());
    return;
  }

  // Everything else: network first, cache only as the offline fallback.
  ev.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === "basic") {
        const c = await caches.open(CACHE);
        c.put(req, res.clone());
      }
      return res;
    } catch (e) {
      const hit = await caches.match(req);
      if (hit) return hit;
      throw e;
    }
  })());
});
