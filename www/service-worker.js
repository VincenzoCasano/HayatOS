const CACHE = "hayatos-cache-v16";

// Everything the app needs to boot completely offline. As of v8 this is
// ENTIRELY same-origin/local -- app.jsx (React/Firebase/Capacitor/etc.) is
// now pre-bundled by `npm run build` into app.bundle.js, and pdf.js is
// vendored locally too. There is no more CDN_SHELL: the app never depends
// on esm.sh/unpkg/cdnjs being reachable to boot, which is what caused the
// "stuck on loading screen" offline failure.
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.bundle.js",
  "./hayat.css",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./img/bg-light.jpg",
  "./img/bg-dark.jpg",
  "./img/bg-walnut.jpg",
  "./img/bg-crimson.jpg",
  "./img/bg-azure.jpg",
  "./img/bg-jade.jpg",
  "./vendor/pdfjs/pdf.min.js",
  "./vendor/pdfjs/pdf.worker.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (c) => {
      // Cache each file individually so one missing/renamed asset doesn't
      // abort precaching of everything else (c.addAll is all-or-nothing).
      await Promise.all(
        APP_SHELL.map((url) => fetch(url).then((res) => res.ok && c.put(url, res)).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Stale-while-revalidate: serve from cache instantly if we have it (this is
// what makes offline launch work), and refresh the cache in the background
// whenever the network is available.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() => cached || (req.mode === "navigate" ? caches.match("./index.html") : undefined));
      return cached || network;
    })
  );
});
