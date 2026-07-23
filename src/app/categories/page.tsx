// 📁 src/app/categories/page.tsx
import React from "react";

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen text-slate-800 dark:text-slate-100">
      <h1 className="text-3xl font-bold mb-4">Categories</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Explore products by your favorite category.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Electronics", "Fashion", "Footwear", "Accessories"].map((cat) => (
          <div key={cat} className="p-6 border rounded-xl shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-xl font-semibold mb-2">{cat}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Discover all items in {cat}</p>
          </div>
        ))}
      </div>
    </div>
  );
}