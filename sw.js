// Service worker: guarda la guía, las fuentes y MathJax para usarla sin conexión.
const CACHE = 'analogica-v1';
const CORE = ["./", "./index.html", "./empezar.html", "./tema-1-2.html", "./tema-3.html", "./tema-4.html", "./tema-5.html", "./tema-6.html", "./tema-7.html", "./tema-8.html", "./realimentacion.html", "./potencia.html", "./examen-2025-26.html", "./examenes.html", "./fuen.html", "./problemas.html", "./calculadoras.html", "./autoevaluacion.html", "./formulario.html", "./glosario.html", "./plan.html", "./guia-completa.html", "./style.css?v=1", "./app.js?v=1", "./buscar.json", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"].concat(['https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.js']);
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(new Request(u, {mode: u.startsWith('http') ? 'no-cors' : 'same-origin'})).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  if (isPage) {
    // Páginas: primero la red (siempre la última versión) y, sin conexión, la copia guardada.
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req, {ignoreSearch: true}).then(h => h || caches.match('./index.html'))));
    return;
  }
  // Resto: la copia guardada y, en segundo plano, se actualiza.
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
