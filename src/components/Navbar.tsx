"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ShoppingBag,
  User,
  Sparkles,
  Heart,
  LogOut,
  ChevronDown,
  Bell,
  UserCheck,
  Package,
} from "lucide-react";
import NotificationDrawer, { NotificationItem } from "./NotificationDrawer";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<{ _id?: string; name?: string; email?: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Announcement Banner State
  const [showBanner, setShowBanner] = useState(true);

  // Dynamic Notifications State & Tracking
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastUnreadCount, setLastUnreadCount] = useState<number>(0);

  // Real-time notification fetch with instant toast trigger
  const fetchNotifications = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser)._id : null;

      const res = await fetch(`/api/notifications?userId=${userId || ""}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.notifications)) {
        const formattedNotifications: NotificationItem[] = data.notifications.map((n: any) => ({
          id: n._id,
          title: n.title,
          message: n.message,
          type: n.type || "info",
          read: n.read || false,
          timestamp: n.createdAt
            ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Just now",
        }));

        const currentUnread = formattedNotifications.filter((n) => !n.read).length;

        // Trigger real-time browser push popup on new unread item
        if (currentUnread > lastUnreadCount && lastUnreadCount !== 0) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(formattedNotifications[0]?.title || "New Notification", {
              body: formattedNotifications[0]?.message || "",
              icon: "/favicon.ico",
            });
          }
        }

        setLastUnreadCount(currentUnread);
        setNotifications(formattedNotifications);
      }
    } catch (e) {
      console.error("Failed to fetch real-time notifications:", e);
    }
  }, [lastUnreadCount]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 4000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setLastUnreadCount(0);

    try {
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser)._id : null;

      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch (e) {
      console.error("Failed to mark notifications as read on server:", e);
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
    };

    const updateCartCount = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const totalItems = savedCart.reduce(
          (sum: number, item: any) => sum + (item.quantity || 1),
          0
        );
        setCartCount(totalItems);
      } catch (e) {
        setCartCount(0);
      }
    };

    const updateWishlistCount = () => {
      try {
        const savedWishlist = JSON.parse(
          localStorage.getItem("wishlist") || "[]"
        );
        setWishlistCount(savedWishlist.length);
      } catch (e) {
        setWishlistCount(0);
      }
    };

    checkUser();
    updateCartCount();
    updateWishlistCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    window.addEventListener("storage", updateWishlistCount);
    window.addEventListener("wishlist-updated", updateWishlistCount);
    window.addEventListener("wishlistUpdated", updateWishlistCount);

    window.addEventListener("user-updated", checkUser);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);

      window.removeEventListener("storage", updateWishlistCount);
      window.removeEventListener("wishlist-updated", updateWishlistCount);
      window.removeEventListener("wishlistUpdated", updateWishlistCount);

      window.removeEventListener("user-updated", checkUser);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      setUser(null);
      setShowDropdown(false);

      window.dispatchEvent(new Event("user-updated"));
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {showBanner && (
        <div className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 py-1.5 px-8 sm:px-10 text-center text-[10px] xs:text-xs font-semibold text-white shadow-inner flex items-center justify-center gap-1.5 sm:gap-2">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse text-yellow-300 shrink-0" />
          <span className="truncate max-w-[300px] xs:max-w-none">
            Special Offer: Enjoy Free Express Shipping on all orders above $50!
          </span>

          <button
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss Offer"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <nav className="w-full border-b border-slate-100 bg-white/80 backdrop-blur-md transition-all duration-300 shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
                  E
                </div>
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                  E-STORE<span className="text-indigo-600">.</span>
                </span>
              </Link>
            </div>

            <div className="hidden md:flex space-x-6 lg:space-x-8">
              {["Shop", "Categories", "Deals", "Contact"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="relative text-sm font-semibold text-slate-600 transition-colors duration-200 hover:text-indigo-600 group py-2"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300 group-hover:w-full rounded-full" />
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2 sm:p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-all duration-200 active:scale-95"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-indigo-600 text-[9px] sm:text-[11px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              <Link
                href="/wishlist"
                className="relative p-2 sm:p-2.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50/70 rounded-xl transition-all duration-200 active:scale-95"
                aria-label="Wishlist"
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] sm:text-[11px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in-50 duration-200">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="relative p-2 sm:p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-all duration-200 active:scale-95"
                aria-label="Cart"
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] sm:text-[11px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in-50 duration-200">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-1.5 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-all"
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {user.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </div>
                    <span className="hidden sm:inline max-w-[80px] lg:max-w-[120px] truncate">
                      {user.name || "Account"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <UserCheck className="w-4 h-4 text-indigo-600" /> My Profile
                      </Link>

                      <Link
                        href="/orders"
                        onClick={() => setShowDropdown(false)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <Package className="w-4 h-4 text-indigo-600" /> My Orders
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 text-left transition-colors border-t border-slate-50"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 sm:p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-all duration-200 active:scale-95"
                  aria-label="User Account"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl md:hidden focus:outline-none transition-colors"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-b border-slate-100 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-1.5 shadow-xl transition-all duration-300">
            {["Shop", "Categories", "Deals", "Contact"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
              >
                {item}
              </Link>
            ))}

            <Link
              href="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2.5 bg-indigo-50/70 hover:bg-indigo-100/80 rounded-xl transition-all"
                  >
                    <p className="text-sm font-bold text-indigo-950 truncate flex items-center justify-between">
                      <span>{user.name}</span>
                      <span className="text-xs font-semibold text-indigo-600">View Profile →</span>
                    </p>
                    <p className="text-xs text-indigo-600/80 truncate">{user.email}</p>
                  </Link>

                  <Link
                    href="/orders"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                  >
                    <Package className="w-5 h-5 text-indigo-600" /> My Orders
                  </Link>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md shadow-indigo-200 hover:from-indigo-500 hover:to-violet-500 transition-all"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllRead}
      />
    </header>
  );
}