'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

export default function CheckoutSuccessPage() {
  useEffect(() => {
    // Payment Successful! Cart clear karein
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cart-updated'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Payment Successful!</h1>
          <p className="text-sm text-slate-600">
            Thank you for your purchase. Your payment has been processed successfully via Stripe.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}