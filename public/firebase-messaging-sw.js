importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyB1SToymM0QlYyMQbvsRmZP6lZZy4X1zW8",
  authDomain: "ts-productivity-tracker.firebaseapp.com",
  projectId: "ts-productivity-tracker",
  storageBucket: "ts-productivity-tracker.firebasestorage.app",
  messagingSenderId: "589934080438",
  appId: "1:589934080438:web:7926d8178698b29360d117"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'TechSuccession Update';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
