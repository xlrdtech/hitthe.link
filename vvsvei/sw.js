// VVSVEI service worker (wf 2026-05-31) — cache-first shell so reopen is instant.
// Scope: /vvsvei/ ONLY. Never caches /events SSE, /api/*, or cross-origin xen.xlrd.org.
// qi: "having to reload vvsvei is a bottleneck. it should open and work instantly."
const VVSVEI_CACHE = 'vvsvei-shell-v14';  // v14 2026-07-22 — background-lane routing: XEN-STEP/xen-step/lane:steps + raw egress:cmd/egress:netconn (Xen's own bash/tool command egress) route to the Operator·Firehose rail (#er-list) ONLY, out of the main conversation feed; rail auto-reveals+auto-opens on first background event (visible, not behind a click). Main feed = xen-out + xen-dictate-in + real inbound only. Bump busts the installed PWA shell. // v13 (interim) // v12 2026-06-21 — step-lane: route XEN-STEP/xen-step/lane:steps events to the separate Operator·Firehose rail (#er-list), out of the conversation transcript; un-hide the rail + toggle. Bump busts the installed PWA shell. // v11 2026-06-11 — PWA install fix: own /vvsvei/manifest.json (was linking /vei manifest). v10 2026-06-11 — strip double-timestamp body prefix ("HH:MM:SS PM, in:" + mangled ":::") at render chokepoint; Ava->voice on all visible labels (pill tooltips + arm overlay). v8 2026-06-09 — multi-host TTS retry + stall-aware drain watchdog + park-on-unarmed + arm-resume hint + arm-safe SW auto-update/convergence. v7 — SSE __reload__ self-update hook.  // v5 2026-06-09 — bust cache, fix crossOrigin audio-err (was cache-first, which trapped qi on a broken cached shell during a P0). Fresh-always beats instant-but-stale.
const SHELL = ['./', './index.html'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(VVSVEI_CACHE).then((c) => c.addAll(SHELL)).catch(() => {})
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VVSVEI_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim()).then(() =>
      // PRE-v7 CONVERGENCE (H5), arm-safe: a force-reload re-locks iOS audio and
      // re-arm is a manual tap (no full persistence yet), so we MUST NOT blindly
      // reload a healthy armed tab. We postMessage every client (the page ignores
      // the nudge while armed/live) and only navigate clients that are NOT focused —
      // the stuck stale tab is the backgrounded/never-touched one; the live armed
      // tab qi is listening through stays put.
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cls) =>
        Promise.all(cls.map((c) => {
          try { c.postMessage && c.postMessage({ type: 'vvsvei-reload', cache: VVSVEI_CACHE }); } catch (_) {}
          try {
            if (c.focused) return null;            // never yank the tab qi is using
            return c.navigate ? c.navigate(c.url) : null;
          } catch (_) { return null; }
        }))
      ).catch(() => {})
    )
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Only handle same-origin GET navigations/shell. Everything else (SSE, API,
  // cross-origin TTS/events) goes straight to network untouched.
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Never intercept the SSE stream or any API path.
  if (url.pathname.includes('/events') || url.pathname.includes('/api/')) return;

  const isShell =
    req.mode === 'navigate' ||
    url.pathname.endsWith('/vvsvei/') ||
    url.pathname.endsWith('/vvsvei/index.html');

  if (isShell) {
    // NETWORK-FIRST (qi 2026-06-09): always fetch the fresh shell; cache it; fall back to
    // cache ONLY when offline. Was cache-first, which served a stale broken shell and
    // trapped qi on a pre-fix page during a personal-P0. A broken-but-instant page is
    // worse than a fresh page that waits a beat.
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) { const copy = res.clone(); caches.open(VVSVEI_CACHE).then((c) => c.put('./index.html', copy)); }
          return res;
        })
        .catch(() => caches.open(VVSVEI_CACHE).then((c) => c.match('./index.html')))
    );
  }
});
