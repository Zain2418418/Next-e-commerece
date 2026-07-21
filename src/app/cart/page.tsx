'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load items from localStorage on mount (No Login Required)
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(savedCart);
      } catch (error) {
        console.error("Failed to load cart", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Update item quantity
  const updateQuantity = (id: string, delta: number) => {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  // Remove item
  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  // Subtotal Calculation
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">
              Your cart is empty
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-white border"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {item.name}
                    </h3>
                    <p className="text-indigo-600 font-black text-sm mt-1">
                      ${item.price}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 h-fit space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
              
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">Free</span>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-between text-base font-black text-slate-900">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {/* Proceed to Checkout Button */}
<Link
  href="/login?redirect=/checkout"
  className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
>
  Proceed to Checkout <ArrowRight className="w-4 h-4" />
</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}