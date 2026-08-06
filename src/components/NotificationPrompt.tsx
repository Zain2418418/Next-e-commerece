"use client";

import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { requestForToken, onMessageListener } from "@/lib/fcm";

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [notification, setNotification] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    // Check if permission is default (not granted or denied yet)
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        setShowPrompt(true);
      }
    }

    // Foreground notification listener
    onMessageListener()
      .then((payload: any) => {
        if (payload?.notification) {
          setNotification({
            title: payload.notification.title,
            body: payload.notification.body,
          });
        }
      })
      .catch((err) => console.log("Failed to receive foreground message: ", err));
  }, []);

  const handleEnableNotifications = async () => {
    setShowPrompt(false);
    const token = await requestForToken();

    if (token) {
      // Send token to backend
      let userId = null;
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          userId = JSON.parse(storedUser)._id;
        }
      } catch (e) {}

      await fetch("/api/notifications/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, userId }),
      });
    }
  };

  return (
    <>
      {/* 🔔 Foreground Notification Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-white dark:bg-gray-800 border-l-4 border-indigo-600 shadow-2xl rounded-2xl p-4 max-w-sm flex items-start justify-between gap-3 animate-bounce">
          <div>
            <h4 className="font-bold text-xs text-gray-900 dark:text-white">{notification.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">{notification.body}</p>
          </div>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 📣 Permission Request Banner */}
      {showPrompt && (
        <div className="fixed bottom-5 left-5 z-50 bg-indigo-900 text-white p-4 rounded-2xl shadow-2xl max-w-sm flex items-center justify-between gap-4 border border-indigo-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold">Enable Notifications</p>
              <p className="text-[11px] text-indigo-200">Get instant updates on your orders and special deals.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEnableNotifications}
              className="bg-white text-indigo-900 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Allow
            </button>
            <button onClick={() => setShowPrompt(false)} className="text-indigo-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}