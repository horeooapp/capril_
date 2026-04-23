self.addEventListener('push', function(event) {
    if (event.data) {
        const data = JSON.parse(event.data.text());
        const options = {
            body: data.body,
            icon: data.icon || '/icon-192x192.png',
            badge: '/badge-72x72.png',
            data: data.data || {},
            vibrate: [100, 50, 100],
            actions: [
                { action: 'open', title: 'Ouvrir QAPRIL' },
                { action: 'close', title: 'Fermer' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        const urlToOpen = event.notification.data.url || '/admin';
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(windowClients => {
                for (var i = 0; i < windowClients.length; i++) {
                    var client = windowClients[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
        );
    }
});
