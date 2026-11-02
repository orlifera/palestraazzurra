/*
 * Palestra Azzurra's service worker: keeps the site usable with a weak
 * signal in the gym. Pages go to the network first and fall back to the
 * last copy; built assets and images come from the cache first. Admin and
 * API requests are never cached.
 */
const CACHE = "azzurra-v1"

self.addEventListener("install", () => self.skipWaiting())

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== "GET" || url.origin !== self.location.origin) return
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/admin")) return

  const stash = (response) => {
    if (response.ok) {
      const copy = response.clone()
      caches.open(CACHE).then((cache) => cache.put(request, copy))
    }
    return response
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(stash).catch(() => caches.match(request).then((r) => r || caches.match("/"))))
    return
  }

  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/_next/image") || /\.(png|jpe?g|webp|avif|svg|woff2?)$/.test(url.pathname)) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then(stash)))
  }
})
