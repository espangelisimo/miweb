// Service worker mínimo: permite instalar la web como app (pantalla completa). No guarda caché.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
