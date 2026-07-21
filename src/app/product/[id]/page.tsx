'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heart } from 'lucide-react';
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
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Check if item is already in Wishlist on load
  useEffect(() => {
    try {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const exists = savedWishlist.some((item: any) => item.id === product.id);
      setIsInWishlist(exists);
    } catch (e) {
      console.error(e);
    }
  }, [product.id]);

  // ❤️ Wishlist Toggle Handler
  const handleToggleWishlist = () => {
    try {
      const existingWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const index = existingWishlist.findIndex((item: any) => item.id === product.id);

      let updatedWishlist;
      if (index > -1) {
        // Remove if already present
        updatedWishlist = existingWishlist.filter((item: any) => item.id !== product.id);
        setIsInWishlist(false);
      } else {
        // Add to Wishlist
        updatedWishlist = [
          ...existingWishlist,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
          },
        ];
        setIsInWishlist(true);
      }

      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));

      // Dispatch event to update Navbar counter
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    }
  };

  // 🛒 LocalStorage & Navbar Event Trigger for Cart Addition
  const handleAddToCart = () => {
    try {
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const itemIndex = existingCart.findIndex((item: any) => item.id === product.id);

      if (itemIndex > -1) {
        existingCart[itemIndex].quantity += quantity;
      } else {
        existingCart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
        });
      }

      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      // Dispatch custom event to notify Navbar immediately
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('storage'));

      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  return (
    <div className="w-full bg-white text-slate-900 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-8 text-sm text-slate-500 space-x-2">
          <Link href="/" className="hover:text-indigo-600 transition-colors font-medium">Products</Link>
          <span>/</span>
          <span className="text-slate-500 font-medium">{product.category}</span>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          
          {/* Left Side: Product Image Display */}
          <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/80 flex items-center justify-center max-h-[500px] shadow-sm relative group">
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 uppercase tracking-wider border border-indigo-100">
                {product.category}
              </span>

              {/* Product Name */}
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                {product.name}
              </h1>

              {/* Star Rating Section */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-amber-400 text-lg">
                  {"★".repeat(Math.round(product.rating))}
                  {"☆".repeat(5 - Math.round(product.rating))}
                </div>
                <span className="text-sm font-bold text-slate-800">{product.rating} / 5.0</span>
                <span className="text-slate-300">|</span>
                <span className="text-sm text-slate-500 hover:text-indigo-600 cursor-pointer">{product.reviewsCount} customer reviews</span>
              </div>

              {/* Price block */}
              <div className="border-t border-b border-slate-100 py-4">
                <span className="text-3xl font-black text-slate-900">${product.price}</span>
              </div>

              {/* Product Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Overview</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            </div>

            {/* Checkout & Actions Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/70 space-y-4 shadow-sm">
              
              {/* Stock status */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Status</span>
                <span className={`font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity adjustment */}
              {product.stock > 0 && (
                <div className="flex justify-between items-center text-sm border-t border-slate-200/60 pt-4">
                  <span className="text-slate-500 font-medium">Quantity</span>
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 transition font-bold text-slate-700"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-sm font-bold w-12 text-center text-slate-900 select-none">{quantity}</span>
                    <button
                      onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 transition font-bold text-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* CTA Buttons (Add to Cart + Wishlist) */}
              <div className="pt-2 flex items-center gap-3">
                {product.stock > 0 ? (
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 active:scale-[0.98] ${
                      addedToCart 
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                    }`}
                  >
                    {addedToCart ? '✓ Added Successfully!' : 'Add to Shopping Cart'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-200 text-slate-400 cursor-not-allowed"
                  >
                    Temporarily Out of Stock
                  </button>
                )}

                {/* ❤️ Wishlist Heart Button */}
                <button
                  onClick={handleToggleWishlist}
                  aria-label="Add to Wishlist"
                  className={`p-3.5 rounded-xl border transition-all duration-200 active:scale-95 ${
                    isInWishlist
                      ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}