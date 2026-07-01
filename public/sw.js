const CACHE_NAME = 'work-tracker-v1';
const APP_SHELL = ['/', '/manifest.webmanifest', '/favicon.svg', '/pwa-icon.svg', '/pwa-maskable.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          return networkResponse;
        })
        .catch(() => caches.match('/'));
    }),
  );
});

self.addEventListener('push', (event) => {
  let payload = {
    body: 'You have a scheduled work tracker reminder.',
    tag: 'work-tracker-push',
    title: 'Work tracker',
    url: '/',
  };

  if (event.data) {
    try {
      payload = {
        ...payload,
        ...event.data.json(),
      };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      badge: '/favicon.svg',
      body: payload.body,
      data: {
        url: payload.url,
      },
      icon: '/pwa-icon.svg',
      tag: payload.tag,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
      const focusedClient = clients.find((client) => client.url === targetUrl);

      if (focusedClient) {
        return focusedClient.focus();
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});
