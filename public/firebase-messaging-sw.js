importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDODINlCdfqg8Xc69jS60knbotf5FyekdM",
  authDomain: "e-store-realtime.firebaseapp.com",
  projectId: "e-store-realtime",
  storageBucket: "e-store-realtime.firebasestorage.app",
  messagingSenderId: "227720340592",
  appId: "1:227720340592:web:add3c62680e385dd49c0b5",
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload.notification?.title || "E-Store Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new update!",
    icon: "/icon.png", // Optional store icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});