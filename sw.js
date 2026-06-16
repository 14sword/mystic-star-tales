/**
 * Service Worker for Mystic Star Tales.
 * Uses scope-relative URLs so the app works from root, subdirectories, or local static servers.
 */

const CACHE_NAME = 'mystic-star-tales-ai-intros-v6';
const RUNTIME_IMAGE_CACHE = 'mystic-star-tales-runtime-media-v6';
const SCOPE_URL = self.registration.scope;

const ASSETS_TO_CACHE = [
    '.',
    'index.html',
    'offline.html',
    'manifest.json',
    'css/styles.min.css',
    'js/page-loader.js',
    'js/app-config.js',
    'js/app-event-bus.js',
    'js/storage-migration.js',
    'js/cards-data.js',
    'js/asset-service.js',
    'js/cards-render-optimized.js',
    'js/modal-optimized.js',
    'js/image-loader.js',
    'js/starfield-optimized.js',
    'js/cursor-light.js',
    'js/effects.js',
    'js/main-optimized.js',
    'js/deferred-loader.js',
    'js/audio.js',
    'js/ambient-music.js',
    'js/story-filter.js',
    'js/reading-progress.js',
    'js/keyboard-hints.js',
    'js/achievement-system.js',
    'js/story-favorites.js',
    'js/story-rating.js',
    'js/story-notes.js',
    'js/story-search.js',
    'assets/images/tiger.jpg',
    'assets/images/sagittarius.jpg',
    'assets/images/aurora.jpg',
    'assets/images/kalpavriksha.jpg',
    'assets/images/anubis.jpg',
    'assets/images/amaterasu.jpg',
    'assets/images/sidhe.jpg',
    'assets/images/quetzalcoatl.jpg',
    'assets/images/firebird.jpg',
    'assets/images/genie.jpg',
    'assets/images/og-image.jpg',
    'assets/icons/icon-192.png',
    'assets/icons/icon-512.png',
    'assets/generated/asset-manifest.json',
    'assets/generated/asset-manifest.js',
    'assets/generated/story-intros/index.json'
];

function scopedUrl(path) {
    return new URL(path, SCOPE_URL).toString();
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                // Cache core static shell assets first
                await cache.addAll(ASSETS_TO_CACHE.map(scopedUrl));

                // Dynamically fetch manifest and cache intros that actually exist
                try {
                    const manifestUrl = scopedUrl('assets/generated/asset-manifest.json');
                    const response = await fetch(manifestUrl);
                    if (response.ok) {
                        const manifest = await response.json();
                        const dynamicUrls = [];
                        if (Array.isArray(manifest.intros)) {
                            for (const intro of manifest.intros) {
                                if (intro.poster) dynamicUrls.push(scopedUrl(intro.poster));
                                if (intro.thumb) dynamicUrls.push(scopedUrl(intro.thumb));
                                if (Array.isArray(intro.frames)) {
                                    for (const frame of intro.frames) {
                                        dynamicUrls.push(scopedUrl(frame));
                                    }
                                }
                            }
                        }
                        // Cache each dynamic asset individually and catch errors so a single 404 doesn't abort installation
                        for (const url of dynamicUrls) {
                            try {
                                await cache.add(url);
                            } catch (err) {
                                console.warn(`[SW] Skip caching missing optional asset: ${url}`);
                            }
                        }
                    }
                } catch (err) {
                    console.error('[SW] Failed to fetch or parse asset manifest during install', err);
                }
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== RUNTIME_IMAGE_CACHE)
                    .map((cacheName) => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    const requestUrl = new URL(request.url);
    if (requestUrl.origin !== self.location.origin) return;

    if (request.destination === 'image' || request.destination === 'video' || requestUrl.pathname.includes('/assets/generated/')) {
        event.respondWith(cacheFirst(request, RUNTIME_IMAGE_CACHE));
        return;
    }

    if (request.destination === 'script' || request.destination === 'style') {
        event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => caches.match(request, { ignoreSearch: true })
                .then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    if (request.mode === 'navigate') {
                        return caches.match(scopedUrl('index.html'))
                            .then((shell) => shell || caches.match(scopedUrl('offline.html')));
                    }
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                    });
                }))
    );
});

function staleWhileRevalidate(request, cacheName) {
    return caches.open(cacheName).then((cache) => (
        cache.match(request, { ignoreSearch: true }).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.ok) {
                    cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            }).catch(() => {});
            return cachedResponse || fetchPromise;
        })
    ));
}

function cacheFirst(request, cacheName) {
    return caches.open(cacheName).then((cache) => (
        cache.match(request, { ignoreSearch: true }).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(request).then((response) => {
                if (response && response.ok) {
                    cache.put(request, response.clone());
                }
                return response;
            }).catch(() => caches.match(request));
        })
    ));
}

self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
