'use client';

import { useState } from 'react';
import { Search, Eye, ShoppingBag, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy Orders Data
  const dummyOrders = [
    {
      id: 'ORD-9821',
      customer: 'Zain Ul Abideen',
      email: 'zain@example.com',
      total: 289.98,
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      date: '2026-07-28',
    },
    {
      id: 'ORD-9822',
      customer: 'Ali Raza',
      email: 'ali.raza@example.com',
      total: 120.00,
      paymentStatus: 'Paid',
      orderStatus: 'Shipped',
      date: '2026-07-29',
    },
    {
      id: 'ORD-9823',
      customer: 'Sara Khan',
      email: 'sara.k@example.com',
      total: 450.50,
      paymentStatus: 'Pending',
      orderStatus: 'Processing',
      date: '2026-07-30',
    },
  ];

  // Helper badge render function for order status
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 size={13} /> Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Truck size={13} /> Shipped
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock size={13} /> Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle size={13} /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Order Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Customer ke tamam orders monitor aur track karein.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto">
          <option value="all">All Order Status</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {dummyOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {/* Order ID */}
                  <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {order.id}
                  </td>

                  {/* Customer */}
                  <td className="p-4">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{order.customer}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.email}</p>
                  </td>

                  {/* Total */}
                  <td className="p-4 font-bold text-gray-900 dark:text-gray-100">
                    ${order.total.toFixed(2)}
                  </td>

                  {/* Payment Status */}
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>

                  {/* Order Status */}
                  <td className="p-4">
                    {renderStatusBadge(order.orderStatus)}
                  </td>

                  {/* Date */}
                  <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                    {order.date}
                  </td>

                  {/* Action */}
                  <td className="p-4 text-right">
                    <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="View Order Details">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}