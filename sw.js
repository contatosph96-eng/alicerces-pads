const CACHE_NAME = 'alicerces-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './admin.js',
  './pad/C.mp3', './pad/Db.mp3', './pad/D.mp3', './pad/Eb.mp3',
  './pad/E.mp3', './pad/F.mp3', './pad/Gb.mp3', './pad/G.mp3',
  './pad/Ab.mp3', './pad/A.mp3', './pad/Bb.mp3', './pad/B.mp3'
];

// Instala e guarda os arquivos no cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Responde com o cache quando estiver offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
