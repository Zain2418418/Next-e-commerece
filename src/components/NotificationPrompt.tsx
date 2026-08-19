"use client";

import { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default function NotificationPrompt() {
  const [tokenGenerated, setTokenGenerated] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<string>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    setPermissionState(Notification.permission);

    // Initialize Firebase App dynamically if not already initialized
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const messaging = getMessaging(app);

    const setupNotifications = async () => {
      try {
        const permission = await Notification.requestPermission();
        setPermissionState(permission);

        if (permission === "granted") {
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (currentToken) {
            console.log("FCM Token Generated:", currentToken);
            setTokenGenerated(true);

            const storedUser = localStorage.getItem("user");
            const userId = storedUser ? JSON.parse(storedUser)._id : null;

            // Save token to DB
            await fetch("/api/notifications/save-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: currentToken, userId }),
            });
          } else {
            console.warn("No registration token available. Request permission to generate one.");
          }
        } else {
          console.log("Notification permission denied by user.");
        }
      } catch (err) {
        console.error("An error occurred while retrieving token:", err);
      }
    };

    setupNotifications();

    // 🔔 REAL-TIME FOREGROUND LISTENER
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Live Message Received in Foreground: ", payload);

      if (payload.notification) {
        const { title, body } = payload.notification;
        
        // Instant Browser Alert Display
        new Notification(title || "New Notification", {
          body: body || "",
          icon: "/favicon.ico",
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="hidden">
      {/* Hidden debug state metadata for notification tracking */}
      <span data-permission={permissionState} data-token-ready={tokenGenerated} />
    </div>
  );
}