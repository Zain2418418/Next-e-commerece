'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';

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

  // 1. Fetch live orders from Backend API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Something went wrong fetching orders');
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
      } else {
        alert(data.error || 'Failed to update order status');
      }
    } catch (err) {
      alert('Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper function for status badges
  const getStatusBadge = (status: string) => {
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="text-indigo-600" /> Orders Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track customer orders and update shipping statuses in real-time.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
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
                          #{order._id.substring(order._id.length - 8)}
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
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-right">
                          <select
                            disabled={updatingId === order._id}
                            value={order.status}
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
    </div>
  );
}