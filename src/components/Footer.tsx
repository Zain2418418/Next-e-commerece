import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Headphones, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* 🚀 Feature Highlights Row */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 border-b border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
          <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Free Shipping</h4>
            <p className="text-xs text-slate-400">On orders over $50</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
          <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Secure Checkout</h4>
            <p className="text-xs text-slate-400">100% protected payments</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
          <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Easy Returns</h4>
            <p className="text-xs text-slate-400">10-day hassle-free returns</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
          <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">24/7 Support</h4>
            <p className="text-xs text-slate-400">Dedicated assistance</p>
          </div>
        </div>
      </div>

      {/* 📋 Main Footer Links & Copyright */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand Info */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-900/50">
              E
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              E-STORE<span className="text-indigo-400">.</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 text-center md:text-left max-w-xs">
            Your ultimate destination for quality shopping. Fast, secure, and reliable everyday.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Shop</Link>
          <Link href="/#categories" className="hover:text-white transition-colors">Categories</Link>
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-slate-500 text-center md:text-right">
          &copy; {new Date().getFullYear()} E-STORE. All rights reserved.
        </p>
      </div>
    </footer>
  );
}