'use client';

import React, { useState, useEffect } from 'react';
import { Search, Check, Trash2, Clock, Star, MessageSquare } from 'lucide-react';

interface Review {
  _id: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 1. Fetch Reviews from Database
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();

      if (data.success) {
        // Fallback checks for response payload
        const list = data.reviews || data.data || [];
        setReviews(list);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // 2. Approve Review Action
  const handleApprove = async (reviewId: string) => {
    try {
      setActionLoading(reviewId);
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status: 'approved' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, status: 'approved' } : r))
        );
      }
    } catch (err) {
      console.error('Failed to approve review:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // 3. Delete Review Action
  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      setActionLoading(reviewId);
      const res = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter(
    (r) =>
      r.userName?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="text-indigo-500" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Reviews Management</h1>
          <p className="text-xs text-gray-500">Monitor and moderate all customer reviews across your store.</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by customer name or review text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Reviews Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading reviews from database...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No customer reviews found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-950 text-xs uppercase text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Comment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredReviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{rev.userName}</div>
                      <div className="text-xs text-gray-500">{rev.userEmail || 'No email provided'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < rev.rating ? 'fill-amber-400' : 'text-gray-700'}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs text-gray-300 truncate">{rev.comment}</td>
                    <td className="px-6 py-4">
                      {rev.status === 'approved' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800 flex items-center gap-1 w-fit">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {rev.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(rev._id)}
                          disabled={actionLoading === rev._id}
                          className="p-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 rounded-lg transition-colors"
                          title="Approve Review"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(rev._id)}
                        disabled={actionLoading === rev._id}
                        className="p-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600/40 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}