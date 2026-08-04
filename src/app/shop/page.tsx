'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: any; // Can be populated object or string ID
  image?: string;
  stock?: number;
  rating?: number;
  reviewsCount?: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  const fetchShopProducts = async () => {
    try {
      setLoading(true);
      
      // Local DNS issue bypass karne ke liye environment handle:
      const res = await fetch('/api/products');
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error loading shop products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  fetchShopProducts();
}, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          All Shop Products
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Browse through our full catalog synchronized directly from MongoDB.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500 font-medium">Loading products...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500 text-lg">No products found in database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => {
            // Safe category name extraction (handles both string and populated object)
            const categoryName =
              typeof product.category === 'object' && product.category !== null
                ? product.category.name
                : 'General';

            return (
              <div
                key={product._id}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image Container */}
                  <div className="aspect-w-4 aspect-h-3 bg-gray-100 group-hover:opacity-95 transition-all duration-300 relative h-56">
                    <img
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-black px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                      {categoryName}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      <Link href={`/product/${product._id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                      </Link>
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Footer / Price */}
                <div className="p-5 pt-0 flex justify-between items-center">
                  <span className="text-lg font-black text-gray-900">
                    ${product.price}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    In Stock ({product.stock ?? 10})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}