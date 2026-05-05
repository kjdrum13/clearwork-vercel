const CACHE = 'clearwork-v34';
const ASSETS = [
  '/app.html',
  '/clearwork-manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Never cache Netlify function calls — always go to network
  if (url.pathname.startsWith('/.netlify/functions/')) {
    return;
  }

  // Never cache the app HTML — always fetch fresh
  if (url.pathname === '/app' || url.pathname === '/app.html') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/app.html'))
    );
    return;
  }

  // Cache-first for static assets (fonts, manifest, SW itself)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
