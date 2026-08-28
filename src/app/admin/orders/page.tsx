'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Loader2, Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface OrderItem {
  product?: {
    _id: string;
    name: string;
    price: number;
  };
  name?: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user?: {
    _id?: string;
    name: string;
    email: string;
  };
  customerEmail?: string;
  shippingAddress?: {
    fullName?: string;
    address?: string;
    city?: string;
    phone?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // 1. Fetch live orders from Backend API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/orders');
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Update Order Status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as any } : o))
        );
        if (selectedInvoice && selectedInvoice._id === orderId) {
          setSelectedInvoice((prev) => prev ? { ...prev, status: newStatus as any } : null);
        }
      } else {
        alert(data.error || 'Failed to update order status');
      }
    } catch (err) {
      alert('Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper function for status badges
  const getStatusBadge = (status: string = 'Pending') => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'shipped':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'processing':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header (Hidden on Print) */}
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="text-indigo-600" /> Orders Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track customer orders, manage invoices, and update shipping statuses in real-time.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16 print:hidden">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-900 print:hidden">
          {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden print:hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Invoice</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const customerName =
                      order.user?.name || order.shippingAddress?.fullName || 'Guest User';
                    const customerEmail =
                      order.user?.email || order.customerEmail || 'N/A';

                    return (
                      <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                        <td className="p-4 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                          #{order._id ? order._id.substring(order._id.length - 8) : 'N/A'}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {customerName}
                          </div>
                          <div className="text-xs text-gray-500">{customerEmail}</div>
                        </td>
                        <td className="p-4 font-semibold text-gray-900 dark:text-white">
                          ${order.totalAmount}
                        </td>
                        <td className="p-4">
                          <span
                            className={`capitalize px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedInvoice(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 rounded-lg transition"
                          >
                            <FileText size={14} /> View Invoice
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <select
                            disabled={updatingId === order._id}
                            value={order.status || 'Pending'}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white font-medium"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🧾 Professional Invoice View / Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:static print:p-0 print:bg-white print:backdrop-none">
          <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:w-full print:rounded-none p-6 md:p-10 border border-gray-200 dark:border-gray-800 print:border-none">
            
            {/* Modal Actions Bar (Hidden on Print) */}
            <div className="flex justify-between items-center pb-6 border-b border-gray-200 dark:border-gray-800 mb-6 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Official Store Receipt
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition"
                >
                  <Printer size={16} /> Print Receipt
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Invoice Container */}
            <div id="printable-invoice" className="space-y-8">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">INVOICE</h2>
                  <p className="text-xs text-gray-500 mt-1">Order #{selectedInvoice._id}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Store Commerce Inc.</h3>
                  <p className="text-xs text-gray-500">Support: support@store.com</p>
                  <p className="text-xs text-gray-500">Website: www.store.com</p>
                </div>
              </div>

              {/* Order Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs print:bg-gray-100 print:text-black">
                <div>
                  <p className="text-gray-500 font-medium">Invoice Date</p>
                  <p className="font-bold text-gray-900 dark:text-white print:text-black mt-0.5">
                    {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Payment Status</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 print:text-emerald-700 mt-0.5">Paid</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Fulfillment</p>
                  <p className="font-bold text-gray-900 dark:text-white print:text-black mt-0.5 capitalize">
                    {selectedInvoice.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Order Reference</p>
                  <p className="font-mono font-bold text-gray-900 dark:text-white print:text-black mt-0.5">
                    #{selectedInvoice._id.substring(selectedInvoice._id.length - 8)}
                  </p>
                </div>
              </div>

              {/* Billed To / Shipping Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <p className="font-bold uppercase tracking-wider text-gray-400 mb-2">Customer Info</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white print:text-black">
                    {selectedInvoice.user?.name || selectedInvoice.shippingAddress?.fullName || 'Valued Customer'}
                  </p>
                  <p className="text-gray-500 mt-0.5">
                    {selectedInvoice.user?.email || selectedInvoice.customerEmail || 'No email registered'}
                  </p>
                  {selectedInvoice.shippingAddress?.phone && (
                    <p className="text-gray-500 mt-0.5">Phone: {selectedInvoice.shippingAddress.phone}</p>
                  )}
                </div>
                <div>
                  <p className="font-bold uppercase tracking-wider text-gray-400 mb-2">Shipping Destination</p>
                  <p className="text-gray-700 dark:text-gray-300 print:text-black leading-relaxed">
                    {selectedInvoice.shippingAddress?.address || 'Standard Address Delivery'}<br />
                    {selectedInvoice.shippingAddress?.city || ''}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden print:border-gray-300">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 print:bg-gray-200 print:text-black font-semibold">
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 print:divide-gray-300">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item, idx) => {
                        const itemName = item.name || item.product?.name || 'Item';
                        const itemPrice = item.price || item.product?.price || 0;
                        const total = itemPrice * item.quantity;
                        return (
                          <tr key={idx}>
                            <td className="p-3 font-medium text-gray-900 dark:text-white print:text-black">
                              {itemName}
                            </td>
                            <td className="p-3 text-center font-mono">{item.quantity}</td>
                            <td className="p-3 text-right font-mono">${itemPrice.toFixed(2)}</td>
                            <td className="p-3 text-right font-mono font-semibold">${total.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          Order details break-up unavailable.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations */}
              <div className="flex justify-end text-xs">
                <div className="w-full sm:w-64 space-y-2">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-mono text-gray-900 dark:text-white print:text-black font-semibold">
                      ${selectedInvoice.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping Charges</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Estimated Tax</span>
                    <span className="font-mono text-gray-900 dark:text-white print:text-black font-semibold">$0.00</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-2 flex justify-between items-center text-base font-bold">
                    <span className="text-gray-900 dark:text-white print:text-black">Grand Total</span>
                    <span className="text-indigo-600 dark:text-indigo-400 print:text-black font-mono">
                      ${selectedInvoice.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400 print:text-gray-600">
                <p>Thank you for shopping with us!</p>
                <p className="mt-0.5">If you have any questions regarding this invoice, please contact support.</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}