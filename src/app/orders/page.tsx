'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle2, ArrowLeft, Loader2, Download } from 'lucide-react';
import { generateInvoice } from '@/lib/generateInvoice';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async (userEmail: string) => {
      try {
        const fetchUrl = userEmail
          ? `/api/orders?email=${encodeURIComponent(userEmail)}`
          : '/api/orders';

        const res = await fetch(fetchUrl, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();

        if (data.orders) {
          setOrders(data.orders);
        } else if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    // 1. First check Firebase auth status
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        fetchOrders(user.email);
      } else {
        // 2. Fallback to LocalStorage if Firebase state not synced yet
        let email = '';
        const savedUser =
          localStorage.getItem('user') ||
          localStorage.getItem('userInfo') ||
          localStorage.getItem('authUser');

        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            email = parsed.email || parsed.user?.email || '';
          } catch (e) {
            if (savedUser.includes('@')) email = savedUser;
          }
        }
        fetchOrders(email);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
            <Package className="w-16 h-16 text-slate-300 mx-auto" />
            <h3 className="text-xl font-bold text-slate-800">No Orders Found</h3>
            <p className="text-sm text-slate-500">You haven't placed any orders yet.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderId = order._id ? order._id.slice(-8) : 'N/A';
              const isPaid = order.paymentStatus === 'paid';
              const totalAmount = Number(order.totalAmount || order.total || 0);

              return (
                <div
                  key={order._id || Math.random()}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Order ID
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-800">
                        #{orderId}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Date
                      </span>
                      <span className="text-sm font-semibold text-slate-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Payment
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {(order.paymentStatus || 'pending').toUpperCase()} ({(order.paymentMethod || 'COD').toUpperCase()})
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Total
                      </span>
                      <span className="text-base font-black text-slate-900">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <button
                        onClick={() => generateInvoice && generateInvoice(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-xl text-xs font-bold transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Invoice
                      </button>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => {
                        const itemName = item.name || item.title || item.product?.name || 'Item';
                        const itemQuantity = item.quantity || item.qty || 1;
                        const itemPrice = Number(item.price || item.product?.price || 0);

                        return (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-slate-700 font-medium">
                              {itemName} <span className="text-slate-400">x{itemQuantity}</span>
                            </span>
                            <span className="font-bold text-slate-900">
                              ${(itemPrice * itemQuantity).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}