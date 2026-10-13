'use strict';
const CACHE_PREFIX = 'pdf3000-shell-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const LEGACY_CACHES = new Set(['pagescan-shell-v1', 'pagescan-shell-v2']);
const APP_SHELL = ['./', './index.html', './app.js', './scanner-core.js', './manifest.webmanifest', './icon.svg'];
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((names) => Promise.all(names.filter((name) => (name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME) || LEGACY_CACHES.has(name)).map((name) => caches.delete(name)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (event) => {
  const request = event.request; if (request.method !== 'GET') return; const url = new URL(request.url); if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') { event.respondWith(fetch(request).then(async (response) => { const contentType = response.headers.get('content-type') || ''; if (response.ok && response.type === 'basic' && contentType.includes('text/html')) { const cache = await caches.open(CACHE_NAME); await cache.put('./index.html', response.clone()); } return response; }).catch(() => caches.match('./index.html'))); return; }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
