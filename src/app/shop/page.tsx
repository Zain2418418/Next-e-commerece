'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchShopProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        
        if (res.ok) {
          setProducts(Array.isArray(data) ? data : data.products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchShopProducts();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white text-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Loading Shop Products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">All Shop Products</h1>
          <p className="text-slate-500 text-sm mt-1">Browse through our full catalog synchronized directly from MongoDB.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const productId = product._id || product.id;
            const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;

            return (
              <Link 
                key={productId} 
                href={`/product/${productId}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Fixed Aspect-Ratio Image Container */}
                  <div className="w-full h-52 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    {categoryName && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-slate-200 shadow-sm">
                        {categoryName}
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <h2 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {product.name}
                    </h2>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-lg font-black text-slate-900">${product.price}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    (product.stock ?? 1) > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {(product.stock ?? 1) > 0 ? `In Stock (${product.stock ?? 'Yes'})` : 'Out of Stock'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}