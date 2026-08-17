'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Truck, Loader2, MapPin, Building } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [sameAsDelivery, setSameAsDelivery] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    // Delivery Address
    deliveryAddress: '',
    deliveryCity: '',
    deliveryPostalCode: '',
    // Billing Address
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    // Payment Method
    paymentMethod: 'card', // 'card' (Stripe) or 'cod' (Cash on Delivery)
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }

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
      // ignore
    }

    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);
  }, [router]);

  // Sync Billing address with Delivery address when checkbox is toggled
  useEffect(() => {
    if (sameAsDelivery) {
      setFormData((prev) => ({
        ...prev,
        billingAddress: prev.deliveryAddress,
        billingCity: prev.deliveryCity,
        billingPostalCode: prev.deliveryPostalCode,
      }));
    }
  }, [sameAsDelivery, formData.deliveryAddress, formData.deliveryCity, formData.deliveryPostalCode]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (cartItems.length === 0) {
      setError('Your cart is empty!');
      setLoading(false);
      return;
    }

    // Stripe Payment Route
    if (formData.paymentMethod === 'card') {
      try {
        const res = await fetch('/api/checkout/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems,
            customerEmail: formData.email,
            shippingAddress: {
              address: formData.deliveryAddress,
              city: formData.deliveryCity,
              postalCode: formData.deliveryPostalCode,
            },
            billingAddress: {
              address: formData.billingAddress,
              city: formData.billingCity,
              postalCode: formData.billingPostalCode,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create payment session');

        if (data.url) {
          localStorage.removeItem('cart');
          setCartItems([]);
          window.dispatchEvent(new Event('cart-updated'));
          window.dispatchEvent(new Event('storage'));
          
          window.location.href = data.url;
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong during checkout');
        setLoading(false);
      }
    } 
    // Cash on Delivery (COD) Route
    else {
      try {
        const res = await fetch('/api/checkout/cod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems,
            customerName: formData.fullName,
            customerEmail: formData.email,
            phone: formData.phone,
            shippingAddress: {
              address: formData.deliveryAddress,
              city: formData.deliveryCity,
              postalCode: formData.deliveryPostalCode,
            },
            billingAddress: {
              address: formData.billingAddress,
              city: formData.billingCity,
              postalCode: formData.billingPostalCode,
            },
            totalAmount: subtotal,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to place COD order');

        setCreatedOrder(data.order);
        setIsSubmitted(true);
        localStorage.removeItem('cart');
        setCartItems([]);
        window.dispatchEvent(new Event('cart-updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (err: any) {
        setError(err.message || 'Failed to place cash on delivery order');
      } finally {
        setLoading(false);
      }
    }
  };

  if (isSubmitted) {
    const codOrderId = createdOrder?._id 
      ? `#ORD-${createdOrder._id.toString().slice(-6).toUpperCase()}`
      : 'COD-CONFIRMED';

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900">
        <div className="max-w-md w-full bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h2>
            <p className="text-sm text-slate-500">
              Thank you for shopping with us. Your Cash on Delivery order has been confirmed.
            </p>
          </div>

          {/* COD Order ID Box */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-left">
            <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">Order ID Reference</span>
            <span className="font-mono text-lg font-black text-indigo-900">{codOrderId}</span>
          </div>

          {/* COD Delivery Summary */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left text-xs space-y-2">
            <span className="font-bold text-slate-700 block">Delivery Address:</span>
            <p className="text-slate-600 leading-relaxed">
              {formData.fullName} ({formData.phone})<br />
              {formData.deliveryAddress}, {formData.deliveryCity} {formData.deliveryPostalCode}
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link
              href="/orders"
              className="inline-block w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition text-sm"
            >
              View My Orders
            </Link>
            <Link
              href="/"
              className="inline-block w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/cart" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Contact Details */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Contact Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Delivery Address Form */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Delivery Address</h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="House / Flat No, Street, Locality"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.deliveryCity}
                    onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.deliveryPostalCode}
                    onChange={(e) => setFormData({ ...formData, deliveryPostalCode: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Billing Address Form */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900">Billing Address</h2>
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={sameAsDelivery}
                    onChange={(e) => setSameAsDelivery(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Same as delivery address
                </label>
              </div>

              {!sameAsDelivery && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Billing Street Address *</label>
                    <textarea
                      required={!sameAsDelivery}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={formData.billingAddress}
                      onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Billing City *</label>
                      <input
                        type="text"
                        required={!sameAsDelivery}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={formData.billingCity}
                        onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Billing Postal Code</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={formData.billingPostalCode}
                        onChange={(e) => setFormData({ ...formData, billingPostalCode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
              
              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${formData.paymentMethod === 'card' ? 'bg-white border-indigo-600 shadow-sm' : 'bg-white/50 border-slate-200'}`}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Credit / Debit Card (Stripe)</span>
                  <span className="text-xs text-slate-500">Pay securely via Stripe gateway</span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${formData.paymentMethod === 'cod' ? 'bg-white border-indigo-600 shadow-sm' : 'bg-white/50 border-slate-200'}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <Truck className="w-5 h-5 text-slate-600" />
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Cash on Delivery (COD)</span>
                  <span className="text-xs text-slate-500">Pay in cash when your order is delivered</span>
                </div>
              </label>
            </div>

          </div>

          {/* Order Summary Column */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 h-fit space-y-4 lg:sticky lg:top-6">
            <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item, index) => (
                <div key={item.id || item._id || index} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 truncate max-w-[180px]">
                    {item.name} (x{item.quantity})
                  </span>
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
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 transition shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> 
                  {formData.paymentMethod === 'card' ? 'Proceed to Stripe Payment' : 'Place Order (COD)'}
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}