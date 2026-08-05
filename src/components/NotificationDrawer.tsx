'use client';

import React from 'react';
import { X, Bell, ShoppingBag, Info, AlertTriangle } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: 'order' | 'info' | 'system';
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead?: () => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  const renderIcon = (type?: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-indigo-600" />;
      case 'system':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-gray-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-slate-50 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
              <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {notifications.filter((n) => !n.read).length} New
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body / Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Bell className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
                <p className="text-sm font-medium">No new notifications</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    item.read
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75'
                      : 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {renderIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                        <span className="text-[10px] text-gray-400">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{item.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 flex justify-between items-center">
              <button
                onClick={onMarkAllAsRead}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline transition-all"
              >
                Mark all as read
              </button>
              <button
                onClick={onClose}
                className="text-xs font-semibold px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}