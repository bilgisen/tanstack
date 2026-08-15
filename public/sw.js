// N3: KAP bildirimleri için Service Worker — push event + tıklama yönlendirme.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: event.data ? event.data.text() : 'KAP Bildirimi' };
  }
  const title = data.title || 'KAP Bildirimi';
  const options = {
    body: data.body || '',
    icon: '/favicon.svg',
    badge: '/favicon.ico',
    data: { url: data.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        if ('focus' in client) {
          await client.focus();
          try { await client.navigate(url); } catch { /* same-origin dışı yoksay */ }
          return;
        }
      }
      await clients.openWindow(url);
    })()
  );
});