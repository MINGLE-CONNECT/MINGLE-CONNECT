
self.addEventListener('push', function (event) {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = { title: 'Mingle-Connect', body: 'You have a new message.' };
    }
  }

  const title = data.title || 'Mingle-Connect';

  const options = {
    body: data.body || 'You have received a new message.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: data.url || '/messages'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl =
    event.notification.data?.url || '/messages';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function (clientList) {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl);
    })
  );
});
