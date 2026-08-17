// 📁 src/app/categories/page.tsx
import React from "react";
import Link from "next/link";
import { Tv, Shirt, Footprints, Watch, ArrowRight, Layers } from "lucide-react";

const categories = [
  { name: "Electronics", slug: "electronics", icon: Tv, desc: "Gadgets, appliances & smart tech", count: "24+ Products" },
  { name: "Fashion", slug: "fashion", icon: Shirt, desc: "Trendy clothing & modern apparel", count: "50+ Products" },
  { name: "Footwear", slug: "footwear", icon: Footprints, desc: "Shoes, sneakers & formal boots", count: "30+ Products" },
  { name: "Accessories", slug: "accessories", icon: Watch, desc: "Watches, jewelry & luxury bags", count: "15+ Products" },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section - Sharp Dark Text for Maximum Contrast */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-extrabold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Browse Collections</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Shop By Category
          </h1>
          
          {/* FIXED: High contrast visible text */}
          <p className="text-base font-semibold text-slate-600">
            Explore our curated collections and find exactly what you're looking for.
          </p>
        </div>

        {/* Clean, Modern & High-Contrast Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group relative bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-600 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Subtle Hover Gradient Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600 opacity-0 group-hover:opacity-100 transition duration-300" />

                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {cat.count}
                    </span>
                  </div>

                  {/* Category Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {cat.name}
                  </h3>
                  
                  <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                {/* Bottom Action Link */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition duration-200" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}