'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, FileText, Loader2, Printer, Copy, Check } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [savingOrder, setSavingOrder] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setSavingOrder(false);
      return;
    }

    fetch('/api/checkout/success', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to save order');
        }
        setOrderDetails(data.order);
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cart-updated'));
        window.dispatchEvent(new Event('storage'));
      })
      .catch((err) => {
        console.error('Order saving error:', err);
      })
      .finally(() => {
        setSavingOrder(false);
      });
  }, [sessionId]);

  const displayOrderId = orderDetails?._id 
    ? `#ORD-${orderDetails._id.toString().slice(-6).toUpperCase()}`
    : 'ORD-PENDING';

  const handleCopyOrderId = () => {
    if (orderDetails?._id) {
      navigator.clipboard.writeText(orderDetails._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-900 print:bg-white print:py-0">
      <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 print:border-none print:shadow-none">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Payment Successful!</h1>
          <p className="text-sm text-slate-500">
            {savingOrder
              ? 'Confirming your order and generating invoice...'
              : 'Thank you for your purchase. We’ve received your order and payment.'}
          </p>
        </div>

        {savingOrder ? (
          <div className="flex items-center justify-center gap-2 text-indigo-600 text-sm font-semibold py-8">
            <Loader2 className="w-5 h-5 animate-spin" /> Finalizing order details...
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Order ID Banner (Prominent Order ID) */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">Official Order ID</span>
                <span className="font-mono text-lg font-black text-indigo-900">{displayOrderId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyOrderId}
                className="p-2 text-indigo-600 hover:bg-indigo-100/60 rounded-xl transition text-xs font-semibold flex items-center gap-1.5"
                title="Copy Full Order ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Enhanced Receipt / Invoice Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Summary</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Paid
                </span>
              </div>

              {/* Items Table */}
              {orderDetails?.items && orderDetails.items.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Purchased Items</span>
                  <div className="divide-y divide-slate-200/60 text-xs">
                    {orderDetails.items.map((item: any, idx: number) => (
                      <div key={idx} className="py-2 flex justify-between items-center">
                        <span className="font-medium text-slate-700 truncate max-w-[220px]">
                          {item.name} <span className="text-slate-400 font-normal">x{item.quantity}</span>
                        </span>
                        <span className="font-bold text-slate-900">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Breakdown */}
              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">${(orderDetails?.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Amount Paid</span>
                  <span>${(orderDetails?.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Small Secondary Reference for Stripe (Stripe ID secondary level par) */}
              {sessionId && (
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Stripe Payment Receipt Ref</span>
                  <p className="font-mono text-[11px] text-slate-500 truncate">{sessionId}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2 print:hidden">
              <button
                onClick={handlePrint}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition text-sm"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Link
                  href="/orders"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition text-sm text-center"
                >
                  <FileText className="w-4 h-4" /> View All Orders
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition text-sm text-center"
                >
                  <ShoppingBag className="w-4 h-4" /> Continue
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}