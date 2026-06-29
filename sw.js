/* Aura OS — service worker (offline app shell).
   SAFE AT ROOT: only intercepts its OWN shell assets + the root document.
   Every other hitthe.link path (/aod, /999, /auth, /apps/*, ...) passes straight
   through to the network untouched — the SW never calls respondWith for them. */
const CACHE = 'htl-v4';
const SHELL = [
  './', 'index.html',
  'css/os.css', 'js/icons.js', 'js/apps.js', 'js/os.js', 'js/sites.js',
  'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Absolute pathnames of the shell, resolved against this SW's own location.
const SHELL_PATHS = new Set(SHELL.map(p => new URL(p, self.location).pathname));
const INDEX_URL = new URL('index.html', self.location).href;

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  let url;
  try { url = new URL(e.request.url); } catch { return; }
  if (url.origin !== self.location.origin) return; // external → untouched

  const isShell = SHELL_PATHS.has(url.pathname);
  const isRootNav = e.request.mode === 'navigate' &&
    (url.pathname === new URL('./', self.location).pathname || url.pathname === new URL('index.html', self.location).pathname);

  if (!isShell && !isRootNav) return; // ALL other paths pass through — zero impact on the rest of hitthe.link

  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(INDEX_URL)))
  );
});
