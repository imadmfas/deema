// عامل خدمة: يخزّن اللعبة محليًّا لتعمل بلا اتصال بعد أول زيارة.
const V = 'deema-v2-1';
const CORE = ['./', 'index.html', 'css/style.css', 'manifest.webmanifest', 'data/index.json', 'data/ui.json', 'data/stickers.json', 'vendor/three.module.min.js', 'vendor/three.core.min.js',
  'js/main.js', 'js/state.js', 'js/audio.js', 'js/ui.js', 'js/engine.js', 'js/avatar.js', 'js/hub3d.js', 'js/screens.js', 'js/parent.js',
  'js/games/common.js', 'js/games/choice.js', 'js/games/trace.js', 'js/games/tap.js', 'js/games/drag.js', 'js/games/story.js',
  'fonts/baloo-bhaijaan-2-arabic-400-normal.woff2', 'fonts/baloo-bhaijaan-2-arabic-700-normal.woff2', 'fonts/baloo-bhaijaan-2-arabic-800-normal.woff2', 'fonts/baloo-bhaijaan-2-latin-700-normal.woff2', 'fonts/baloo-bhaijaan-2-latin-800-normal.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => {
    if (res.ok && new URL(r.url).origin === location.origin) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => hit)));
});
