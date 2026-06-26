// Shahi Scoops service worker — cache-first for static assets,
// network-first for API, with offline fallback.

const CACHE_VERSION = 'shahi-v2-2026-06-07'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET, cross-origin (except our own CDN images)
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin && !url.hostname.includes('unsplash.com') && !url.hostname.includes('pexels.com')) {
    return
  }

  // API: network-first, fallback to cache
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/health')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone))
          }
          return res
        })
        .catch(() => caches.match(request).then((r) => r || new Response('Offline', { status: 503 })))
    )
    return
  }

  // Images: cache-first
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg|avif)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone))
          }
          return res
        }).catch(() => new Response('', { status: 503 }))
      })
    )
    return
  }

  // Navigation/HTML: network-first with offline fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone))
          }
          return res
        })
        .catch(() =>
          caches.match(request).then((r) => r || caches.match('/'))
        )
    )
    return
  }

  // Default: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((res) => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone))
        }
        return res
      }).catch(() => cached)
      return cached || fetchPromise
    })
  )
})
