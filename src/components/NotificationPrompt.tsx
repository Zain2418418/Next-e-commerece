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
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:top-5 z-50 bg-white dark:bg-gray-800 border-l-4 border-indigo-600 shadow-2xl rounded-2xl p-4 w-[calc(100%-2rem)] sm:w-auto sm:max-w-sm flex items-start justify-between gap-3 animate-bounce">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white break-words">{notification.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 break-words">{notification.body}</p>
          </div>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600 p-1 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 📣 Permission Request Banner */}
      {showPrompt && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-5 sm:bottom-5 z-50 bg-indigo-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl w-[calc(100%-2rem)] sm:w-auto sm:max-w-sm flex items-center justify-between gap-2.5 sm:gap-4 border border-indigo-700">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold truncate">Enable Notifications</p>
              <p className="text-[10px] sm:text-xs text-indigo-200 leading-tight line-clamp-2">Get instant updates on your orders and special deals.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleEnableNotifications}
              className="bg-white text-indigo-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              Allow
            </button>
            <button onClick={() => setShowPrompt(false)} className="text-indigo-300 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}