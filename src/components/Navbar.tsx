'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag, User, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* 🌟 Colorful Top Announcement Bar */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 py-1.5 px-4 text-center text-xs font-semibold text-white shadow-inner flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
        <span>Special Offer: Enjoy Free Express Shipping on all orders above $50!</span>
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

            {/* 📍 Desktop Nav Links (Upgraded Hover Underline & Vibrant Text) */}
            <div className="hidden md:flex space-x-8">
              {['Shop', 'Categories', 'Deals', 'Contact'].map((item) => (
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

            {/* 🛒 Icons Section (Enhanced Hover Effects & Styling) */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Cart Button */}
              <Link 
                href="/cart" 
                className="relative p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-all duration-200 active:scale-95"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
              </Link>

              {/* Login/User Button */}
              <Link 
                href="/login" 
                className="p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-all duration-200 active:scale-95"
                aria-label="User Account"
              >
                <User className="h-5 w-5" />
              </Link>

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
            {['Shop', 'Categories', 'Deals', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
              >
                {item}
              </Link>
            ))}
            
            {/* Quick Auth Link in Mobile Drawer */}
            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md shadow-indigo-200 hover:from-indigo-500 hover:to-violet-500 transition-all"
              >
                Sign In / Register
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}