'use client';

import React from 'react';
import Link from 'next/link';
import { XCircle, RefreshCw, ShoppingCart } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Payment Canceled</h1>
          <p className="text-sm text-slate-600">
            Your payment process was canceled. Don't worry, no charges were made and your cart is still safe!
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <Link
            href="/checkout"
            className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Try Checkout Again
          </Link>
          <Link
            href="/cart"
            className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}