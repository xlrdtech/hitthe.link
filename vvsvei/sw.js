// VVSVEI service worker (wf 2026-05-31) — cache-first shell so reopen is instant.
// Scope: /vvsvei/ ONLY. Never caches /events SSE, /api/*, or cross-origin xen.xlrd.org.
// qi: "having to reload vvsvei is a bottleneck. it should open and work instantly."
const VVSVEI_CACHE = 'vvsvei-shell-v1';
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
    ).then(() => self.clients.claim())
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
    // Cache-first for the shell: paint instantly from cache, refresh in background.
    e.respondWith(
      caches.open(VVSVEI_CACHE).then((cache) =>
        cache.match('./index.html').then((cached) => {
          const network = fetch(req)
            .then((res) => {
              if (res && res.ok) cache.put('./index.html', res.clone());
              return res;
            })
            .catch(() => cached);
          return cached || network;
        })
      )
    );
  }
});
