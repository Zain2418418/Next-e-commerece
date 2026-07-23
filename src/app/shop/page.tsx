// 📁 src/app/shop/page.tsx
import React from "react";

export default function ShopPage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen text-slate-800 dark:text-slate-100">
      <h1 className="text-3xl font-bold mb-4">All Products</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Browse our full collection of premium essential products.
      </p>
      {/* Product list grid will load here */}
      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center text-gray-500">
        Shop collection coming soon!
      </div>
    </div>
  );
}