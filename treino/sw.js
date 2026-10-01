const CACHE = 'treino-v1';
const FILES = [
  '/treino/',
  '/treino/index.html',
  '/treino/manifest.webmanifest',
  '/treino/jspdf.umd.min.js',
  '/treino/jspdf.plugin.autotable.min.js',
  '/treino/icons/icon-192.png',
  '/treino/icons/icon-512.png',
  '/treino/fonts/barlow-latin-400-normal.woff2',
  '/treino/fonts/barlow-latin-500-normal.woff2',
  '/treino/fonts/barlow-latin-600-normal.woff2',
  '/treino/fonts/barlow-condensed-latin-500-normal.woff2',
  '/treino/fonts/barlow-condensed-latin-600-normal.woff2',
  '/treino/fonts/barlow-condensed-latin-700-normal.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Página: tenta a rede primeiro (para receber atualizações) e cai no cache offline.
// Demais arquivos: cache primeiro.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || !url.pathname.startsWith('/treino')) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put('/treino/index.html', copy));
      return r;
    }).catch(() => caches.match('/treino/index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
