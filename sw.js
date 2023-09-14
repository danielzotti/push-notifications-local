console.log('Hello from service worker')

self.addEventListener('notificationclick', (event) => {
    console.log(`[ServiceWorker] Notification CLICKED! ${event.notification.title}`);
    if (event.action) {
        console.log(`with action: ${event.action}`);
    }
    event.notification.close();

    event.waitUntil(
        // See https://web.dev/push-notifications-handling-messages/#wait-until
        clients
            .matchAll({
                includeUncontrolled: true, // See: https://stackoverflow.com/questions/35100759/serviceworkers-focus-tab-clients-is-empty-on-notificationclick
                type: "window",
            })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.visibilityState === "visible") {
                        console.log("[ServiceWorker] webpage already in focus!")
                        return;
                    }
                    if (client.visibilityState === "hidden" && "focus" in client) {
                        console.log("[ServiceWorker] webpage not in focus, setting focus on it...")
                        return client.focus();
                    }
                }
                console.log(clientList);
                debugger;
                if (clients.openWindow) {
                    console.log("[ServiceWorker] webpage is close, let's opening it...")
                    return clients.openWindow("/");
                }
            }),
    );
});

self.addEventListener('notificationclose', (event) => {
    console.log(`[ServiceWorker] Notification CLOSED! ${event.notification.title}`);
});

self.addEventListener('push', function (event) {
    if (event.data) {
        const promiseChain = self.registration.showNotification("Push Notification", {body: event.data.text()});
        event.waitUntil(promiseChain)
    } else {
        console.log('[ServiceWorker] Push event but no data to show')
    }
})
