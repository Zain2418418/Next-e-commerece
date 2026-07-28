'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, ArrowRight, FileText } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Payment Successful!</h1>
          <p className="text-sm text-slate-500">
            Thank you for your order. We’ve received your payment and are processing your order right now.
          </p>
        </div>

        {sessionId && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Stripe Reference ID</span>
            <p className="font-mono text-xs text-slate-700 truncate">{sessionId}</p>
          </div>
        )}

        <div className="pt-2 space-y-3">
          <Link
            href="/orders"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
          >
            <FileText className="w-4 h-4" /> View Orders & Invoices
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}