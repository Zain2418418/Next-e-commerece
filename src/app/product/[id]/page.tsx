'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MOCK_PRODUCTS } from '@/lib/mockData';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  // Promise wrap-up for next.js dynamic parameters
  const resolvedParams = use(params);
  const product = MOCK_PRODUCTS.find((p) => p.id === resolvedParams.id);

  // Agar product nahi milta to 404 page trigger hoga
  if (!product) {
    notFound();
  }

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-8 text-sm text-gray-500 space-x-2">
        <Link href="/" className="hover:text-black transition-colors">Products</Link>
        <span>/</span>
        <span className="text-gray-400">{product.category}</span>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {/* Left Side: Product Image Display */}
        <div className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center max-h-[500px]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform hover:scale-105 duration-300"
          />
        </div>

        {/* Right Side: Detailed Configuration Info */}
        <div className="flex flex-col justify-between py-2 space-y-6">
          <div className="space-y-4">
            {/* Category Tag */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 uppercase tracking-wider">
              {product.category}
            </span>

            {/* Product Name */}
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              {product.name}
            </h1>

            {/* Star Rating Section */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-yellow-400 text-lg">
                {"★".repeat(Math.round(product.rating))}
                {"☆".repeat(5 - Math.round(product.rating))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.rating} / 5.0</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500 hover:underline cursor-pointer">{product.reviewsCount} customer reviews</span>
            </div>

            {/* Price block */}
            <div className="border-t border-b border-gray-100 py-4">
              <span className="text-3xl font-black text-gray-900">${product.price}</span>
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900">Overview</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* Checkout & Actions Card */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
            {/* Stock status */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Status</span>
              <span className={`font-semibold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity adjustment */}
            {product.stock > 0 && (
              <div className="flex justify-between items-center text-sm border-t border-gray-200/50 pt-4">
                <span className="text-gray-500">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 transition font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-bold w-12 text-center select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 transition font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="pt-2">
              {product.stock > 0 ? (
                <button
                  onClick={handleAddToCart}
                  className={`w-full flex items-center justify-center px-6 py-3.5 border border-transparent rounded-xl text-sm font-bold text-white shadow-sm transition-all duration-300 ${
                    addedToCart 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-black hover:bg-gray-900'
                  }`}
                >
                  {addedToCart ? '✓ Added Successfully!' : 'Add to Shopping Cart'}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  Temporarily Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}