'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, AlertCircle } from 'lucide-react';

interface Review {
  _id?: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 🔄 Fetch Reviews directly for Product Page
  const fetchReviews = async () => {
    try {
      setFetching(true);
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.success) {
        const list = data.reviews || data.data || [];
        setReviews(list);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  // 📝 Submit Review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setMessage({ text: 'Please write a review comment.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      // Read Logged-In User Details from Local Storage
      const storedUser = localStorage.getItem('user') || localStorage.getItem('authUser');
      let parsedUser: any = null;
      
      try {
        if (storedUser) parsedUser = JSON.parse(storedUser);
      } catch (e) {
        console.error(e);
      }

      const userName = parsedUser?.name || parsedUser?.displayName || 'Zain';
      const userEmail = parsedUser?.email || 'zainulabedeen2418@gmail.com';
      const userId = parsedUser?.id || parsedUser?._id || 'user_123';

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userId,
          userName,
          userEmail,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({
          text: 'Thank you! Your review has been published.',
          type: 'success',
        });
        setComment('');
        setRating(5);
        fetchReviews(); // Instantly update review list on UI
      } else {
        setMessage({
          text: data.message || 'Failed to submit review.',
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setMessage({ text: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-8 mt-12">
      {/* Header Summary */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Customer Reviews</h2>
          <p className="text-sm text-gray-400">Read real feedback from verified customers</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-white">{avgRating}</div>
          <div className="text-xs text-gray-400">{reviews.length} verified reviews</div>
        </div>
      </div>

      {/* Write a Review Box */}
      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-sm border border-gray-800 space-y-4">
        <h3 className="text-lg font-semibold">Write a Review</h3>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950/60 text-rose-300 border border-rose-800'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    size={22}
                    className={(hoverRating || rating) >= star ? 'fill-amber-400' : 'text-gray-600'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Your Review
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about quality, fitting, or delivery..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-95"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {fetching ? (
          <p className="text-sm text-gray-500">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} className="p-4 rounded-xl border border-gray-800 space-y-2 bg-gray-900/40">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-white">{rev.userName}</span>
                <span className="text-xs text-gray-400">
                  {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>
              <div className="flex gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < rev.rating ? 'fill-amber-400' : 'text-gray-700'}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-300">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}