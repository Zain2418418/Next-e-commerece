'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Layers, 
  ShoppingBag, 
  LogOut,
  Bell
} from 'lucide-react';
import NotificationDrawer, { NotificationItem } from '@/components/NotificationDrawer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 🔔 Admin Notification Drawer States
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'New Order Received',
      message: 'Order #1024 has been placed by Zain.',
      timestamp: '5m ago',
      read: false,
    },
    {
      id: '2',
      title: 'Low Stock Alert',
      message: 'Product "Wireless Keyboard" has less than 5 items left.',
      timestamp: '45m ago',
      read: false,
    },
    {
      id: '3',
      title: 'New User Registered',
      message: 'A new user registered on E-Store.',
      timestamp: '2h ago',
      read: true,
    },
  ]);

  const handleMarkAllRead = () => {
    setAdminNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = adminNotifications.filter((n) => !n.read).length;

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Product Management', href: '/admin/products', icon: Package },
    { name: 'Category Management', href: '/admin/categories', icon: Layers },
    { name: 'Order Management', href: '/admin/orders', icon: ShoppingBag },
  ];

  return (
    // fixed inset-0 z-50 add karne se yeh store ke navbar ko overlay karke poori screen le lega
    <div className="fixed inset-0 z-50 flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">E-STORE ADMIN</h2>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold capitalize">
            {pathname.split('/')[2] || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            
            {/* 🔔 Admin Notifications Trigger Button */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Admin Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <span className="text-sm font-medium">Admin User</span>
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 🔔 Notification Drawer Component Render */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={adminNotifications}
        onMarkAllAsRead={handleMarkAllRead}
      />
    </div>
  );
}