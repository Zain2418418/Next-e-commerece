// 📁 src/app/deals/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2, ShoppingBag, Flame } from 'lucide-react';

export default function DealsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeals() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        
        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`);
        }

        const data = await res.json();
        const allProducts = Array.isArray(data) 
          ? data 
          : Array.isArray(data?.products) 
          ? data.products 
          : Array.isArray(data?.data) 
          ? data.data 
          : [];

        // Safe filter with full null checks
        const dealItems = allProducts.filter((p: any) => {
          if (!p || typeof p !== 'object') return false;
          const hasIsDeal = Boolean(p.isDeal);
          const hasDiscount = Boolean(p.discount && Number(p.discount) > 0);
          const hasSalePrice = Boolean(p.salePrice && Number(p.salePrice) < Number(p.price));
          return hasIsDeal || hasDiscount || hasSalePrice;
        });

        // Agar deal items milein toh wo dikhayein, warna direct allProducts dikhayein
        setProducts(dealItems.length > 0 ? dealItems : allProducts);
      } catch (err) {
        console.error('Error fetching deals:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-extrabold uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-rose-500" />
            <span>Limited Time Offers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Hot Deals & Offers 🔥
          </h1>

          <p className="text-base font-semibold text-slate-600">
            Save big on top products with our exclusive discounts!
          </p>
        </div>

        {/* Special Express Banner */}
        <div className="bg-gradient-to-r from-rose-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Special Promo
            </span>
            <h2 className="text-2xl font-black">Free Express Shipping!</h2>
            <p className="text-rose-100 text-sm">
              Enjoy Free Express Shipping on all orders above $50. No coupon code needed!
            </p>
          </div>
          <Link
            href="/shop"
            className="px-6 py-3 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition shadow-md text-sm whitespace-nowrap"
          >
            Shop Now
          </Link>
        </div>

        {/* Dynamic Deals Products Grid */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Featured Deal Products</span>
          </h2>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : !Array.isArray(products) || products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No deals found right now</h3>
              <p className="text-xs text-slate-500 mt-1">Check back soon for new special discounts!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, idx) => {
                if (!product || typeof product !== 'object') return null;

                const rawOriginal = Number(product.price) || 0;
                const discount = Number(product.discount) || 15;
                const rawDiscounted = product.salePrice 
                  ? Number(product.salePrice) 
                  : (rawOriginal * (1 - discount / 100));

                const originalPrice = isNaN(rawOriginal) ? 0 : rawOriginal;
                const discountedPrice = isNaN(rawDiscounted) ? 0 : rawDiscounted;
                const productImage = product.image || (Array.isArray(product.images) && product.images[0]) || '';
                const productId = product._id || product.id || `product-${idx}`;

                return (
                  <div
                    key={productId}
                    className="group bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-indigo-600 transition duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image Container */}
                      <div className="relative w-full h-48 bg-slate-100 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={product.name || 'Product Image'}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <ShoppingBag className="w-10 h-10 text-slate-400" />
                        )}

                        <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                          {discount}% OFF
                        </span>
                      </div>

                      {/* Title & Category */}
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                        {product.category || 'Deal'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">
                        {product.name || 'Untitled Product'}
                      </h3>
                    </div>

                    {/* Price & Action */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {originalPrice > 0 && (
                          <span className="text-xs text-slate-400 line-through mr-2">
                            ${originalPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-lg font-black text-rose-600">
                          ${discountedPrice.toFixed(2)}
                        </span>
                      </div>

                      {product._id || product.id ? (
                        <Link
                          href={`/shop/${product._id || product.id}`}
                          className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition"
                        >
                          View
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}