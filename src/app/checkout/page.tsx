'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cod',
  });

  useEffect(() => {
    // 🎯 FIX: 'token' ki bajaye 'user' key check karein
    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      // Agar 'user' key nahi milti tabhi login par bhejain
      router.push('/login?redirect=/checkout');
      return;
    }

    // Auto-fill user details if available in localStorage
    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser) {
        setFormData((prev) => ({
          ...prev,
          fullName: parsedUser.name || prev.fullName,
          email: parsedUser.email || prev.email,
        }));
      }
    } catch (e) {
      // ignore parse error
    }

    // Load Cart Items
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);
  }, [router]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cart-updated'));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-50 border border-slate-200 p-8 rounded-3xl text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h2>
          <p className="text-sm text-slate-600">Thank you for shopping with us. Your order details have been received.</p>
          <Link
            href="/"
            className="inline-block w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Shipping Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  defaultChecked
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-bold text-slate-800">Cash on Delivery (COD)</span>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 h-fit space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 truncate max-w-[180px]">{item.name} (x{item.quantity})</span>
                  <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">Free</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-base">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" /> Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}