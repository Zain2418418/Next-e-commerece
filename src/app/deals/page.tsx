// 📁 src/app/deals/page.tsx
import React from "react";

export default function DealsPage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen text-slate-800 dark:text-slate-100">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Hot Deals & Offers 🔥</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Save big on exclusive limited-time discounts!
      </p>
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Special Express Shipping Offer!</h2>
        <p className="text-gray-700 dark:text-gray-300">Enjoy Free Express Shipping on all orders above $50.</p>
      </div>
    </div>
  );
}