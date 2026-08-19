'use client';

import React, { useState, useEffect } from 'react';
import { Search, Trash2, Star, MessageSquare, CheckCircle2 } from 'lucide-react';

interface Review {
  _id: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();

      if (data.success) {
        setReviews(data.reviews || data.data || []);
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
      r.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="text-indigo-500" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white">Product Reviews Management</h1>
          <p className="text-xs text-gray-400">Monitor and manage all live customer reviews across your store.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by customer name, email or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0f172a] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No customer reviews found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#020617] text-xs uppercase text-gray-400 border-b border-gray-800">
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
                      <div className="text-xs text-gray-400">{rev.userEmail || 'zainulabedeen2418@gmail.com'}</div>
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
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1 w-fit">
                        <CheckCircle2 size={12} /> Published
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
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