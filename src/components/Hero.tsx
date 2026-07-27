'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  TrendingUp, 
  Star 
} from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-slate-100 py-16 lg:py-28">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-[400px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copywriting & Actions */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>New Season Drop • Up to 40% OFF</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]">
              Next-Gen <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Shopping Experience.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Discover verified premium products across tech, streetwear, and everyday essentials with instant checkout and global priority delivery.
            </p>

            {/* Category Quick Tags */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="text-xs text-slate-500 font-semibold mr-1">Trending:</span>
              {['Audio', 'Smart Devices', 'Apparel', 'Accessories'].map((category) => (
                <Link
                  key={category}
                  href={`/categories?name=${category.toLowerCase()}`}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500 hover:text-white transition-all"
                >
                  {category}
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Explore Shop</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/categories"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-2xl border border-slate-800 transition-all flex items-center justify-center"
              >
                All Categories
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-950/60 border border-indigo-800/50 rounded-xl text-indigo-400 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Express Delivery</p>
                  <p className="text-[11px] text-slate-500 hidden sm:block">2-3 business days</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/50 rounded-xl text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Encrypted Payments</p>
                  <p className="text-[11px] text-slate-500 hidden sm:block">100% Protected</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-950/60 border border-amber-800/50 rounded-xl text-amber-400 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Easy Returns</p>
                  <p className="text-[11px] text-slate-500 hidden sm:block">30 Days Return Policy</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Glass Product Card */}
              <div className="relative z-10 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl backdrop-blur-xl shadow-2xl shadow-indigo-950/50 space-y-4">
                
                {/* Product Image Holder */}
                <div className="relative aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden bg-slate-950 group">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"
                    alt="Featured Product"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-indigo-600/90 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                      Featured
                    </span>
                    <span className="bg-slate-950/80 text-emerald-400 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-md">
                      <TrendingUp className="w-3 h-3" /> In Stock
                    </span>
                  </div>
                </div>

                {/* Info & Price */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-lg">Wireless ANC Headphones</h3>
                    <p className="text-xs text-slate-400">High-Fidelity Audio Series</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-indigo-400">$199.00</p>
                    <p className="text-xs text-slate-500 line-through">$249.00</p>
                  </div>
                </div>

                {/* Quick Add CTA */}
                <Link
                  href="/shop"
                  className="block text-center w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition shadow-md shadow-indigo-600/20"
                >
                  View Product Details
                </Link>
              </div>

              {/* Floating Social Proof Card */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-slate-900/95 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md hidden sm:flex items-center gap-4">
                <div className="flex -space-x-2">
                  <img className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User" />
                  <img className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="User" />
                  <img className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="User" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>4.9 / 5.0 Rating</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Trusted by 10k+ shoppers worldwide</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}