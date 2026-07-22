"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, User, Sparkles, Heart, LogOut, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Check logged in user state and cart/wishlist counters
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

    // Initial check
    checkUser();
    updateCartCount();
    updateWishlistCount();

    // Event listeners
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
      // 1. Backend Cookie Clear
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      // 2. Clear Local Storage Data
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // 3. Reset Local State
      setUser(null);
      setShowDropdown(false);

      // 4. Notify other components
      window.dispatchEvent(new Event("user-updated"));

      // 5. Hard Redirect to Login Page
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* 🌟 Top Announcement Bar */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 py-1.5 px-4 text-center text-xs font-semibold text-white shadow-inner flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
        <span>
          Special Offer: Enjoy Free Express Shipping on all orders above $50!
        </span>
      </div>

      <nav className="w-full border-b border-slate-100 bg-white/80 backdrop-blur-md transition-all duration-300 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* 🚀 Brand Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
                  E
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  E-STORE<span className="text-indigo-600">.</span>
                </span>
              </Link>
            </div>

            {/* 📍 Desktop Nav Links */}
            <div className="hidden md:flex space-x-8">
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

            {/* 🛒 Icons & Profile Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* ❤️ Wishlist Button */}
              <Link
                href="/wishlist"
                className="relative p-2.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50/70 rounded-xl transition-all duration-200 active:scale-95"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in-50 duration-200">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* 🛒 Cart Button */}
              <Link
                href="/cart"
                className="relative p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-all duration-200 active:scale-95"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in-50 duration-200">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* 👤 User Profile or Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {user.name || "Account"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-all duration-200 active:scale-95"
                  aria-label="User Account"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl md:hidden focus:outline-none transition-colors"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* 📱 Mobile Menu Dropdown */}
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

            {/* Mobile Profile / Auth Button */}
            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 bg-slate-50 rounded-xl">
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
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
    </header>
  );
}