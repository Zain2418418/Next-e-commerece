'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Layers, 
  ShoppingBag, 
  MessageSquare, // 👈 Added MessageSquare Icon
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import NotificationDrawer, { NotificationItem } from '@/components/NotificationDrawer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 🔴 If current route is /admin/login, bypass the Admin Layout (Sidebar & Header)
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // 📱 Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 👤 Admin User Dynamic State
  const [adminUser, setAdminUser] = useState<{ name?: string; email?: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // 🔔 Admin Notification Drawer States
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<NotificationItem[]>([]);

  // 🔄 Dynamic Notification Fetching Logic
  useEffect(() => {
    const fetchAdminNotifications = async () => {
      try {
        const res = await fetch('/api/admin/orders');
        const data = await res.json();

        if (data.success && data.orders) {
          const generatedNotifications: NotificationItem[] = [];

          // 1. Pending orders check
          const pendingOrders = data.orders.filter((o: any) => o.status === 'pending');
          if (pendingOrders.length > 0) {
            generatedNotifications.push({
              id: 'pending-orders-alert',
              title: 'Pending Orders Alert',
              message: `You have ${pendingOrders.length} pending orders waiting for review.`,
              timestamp: 'Just now',
              read: false,
              type: 'order',
            });
          }

          // 2. Latest Order Activity
          const latestOrder = data.orders[0];
          if (latestOrder) {
            generatedNotifications.push({
              id: `order-${latestOrder._id}`,
              title: 'Latest Store Activity',
              message: `Order #${latestOrder._id.substring(latestOrder._id.length - 6)} placed for $${latestOrder.totalAmount}.`,
              timestamp: latestOrder.createdAt 
                ? new Date(latestOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : 'Today',
              read: false,
              type: 'order',
            });
          }

          setAdminNotifications(generatedNotifications);
        }
      } catch (err) {
        console.error('Failed to load dynamic notifications:', err);
      }
    };

    fetchAdminNotifications();
    const interval = setInterval(fetchAdminNotifications, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setAdminUser(JSON.parse(storedUser));
        } else {
          setAdminUser(null);
        }
      } catch (e) {
        setAdminUser(null);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    window.addEventListener('user-updated', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('user-updated', checkUser);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setAdminUser(null);
      setShowDropdown(false);
      window.dispatchEvent(new Event('user-updated'));
      window.location.href = '/admin/login';
    }
  };

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
    { name: 'Live Support Chat', href: '/admin/chat', icon: MessageSquare }, // 👈 Live Chat Link Added
  ];

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      
      {/* 📱 Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 🟢 Responsive Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">E-STORE ADMIN</h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
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
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle Menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg md:text-xl font-semibold capitalize truncate">
              {pathname.split('/')[2] || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
            {/* 🔔 Notifications Trigger */}
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

            {/* 👤 Admin Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 md:gap-3 p-1.5 px-2 md:px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-left"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {adminUser?.name || 'Admin User'}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                    {adminUser?.email || 'admin@estore.com'}
                  </p>
                </div>
                
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-md flex-shrink-0">
                  {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 🔔 Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={adminNotifications}
        onMarkAllAsRead={handleMarkAllRead}
      />
    </div>
  );
}