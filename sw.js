/* Sidto service worker — network first, offline fallback.
 * Network-first means your GitHub edits show up on the next load
 * when online; the cached copy is only used when offline.
 * Bump VERSION if you ever need to force-clear old caches. */
const VERSION = "sidto-v2";
const SHELL = [
  "./", "index.html", "admin.html", "css/style.css", "css/fonts.css",
  "assets/fonts/Mukta-Regular.woff", "assets/fonts/Mukta-SemiBold.woff", "assets/fonts/Mukta-ExtraBold.woff", "assets/fonts/YatraOne-Regular.woff", "manifest.webmanifest",
  "js/config.js", "js/i18n.js", "js/dates.js", "js/store.js", "js/data.js", "js/prompt.js",
  "js/imageService.js", "js/poster.js", "js/video.js", "js/app.js", "js/admin.js",
  "data/festivals.json", "assets/icons/icon-192.png", "assets/icons/icon.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // fonts etc. go straight to network
  if (req.headers.get("range")) return;                 // let video range requests through
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok && res.type === "basic") {
        const copy = res.clone();
        const key = url.pathname.endsWith("festivals.json") ? new Request(url.origin + url.pathname) : req;
        caches.open(VERSION).then(c => c.put(key, copy));
      }
      return res;
    }).catch(() => caches.match(url.pathname.endsWith("festivals.json") ? new Request(url.origin + url.pathname) : req, { ignoreSearch: true }))
  );
});
