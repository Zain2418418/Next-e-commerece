"use client";

import React, { useState, useEffect } from "react";
import { Star, Edit2, Trash2, CheckCircle, AlertCircle } from "lucide-react";

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Current logged in user (from localStorage/Auth)
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    // Get user details
    const stored = localStorage.getItem("user") || localStorage.getItem("authUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      setCurrentUser({ id: parsed._id || parsed.id || "guest_1", name: parsed.name || "Customer" });
    }
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        setAvgRating(data.avgRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setMessage({ type: "error", text: "Please log in to leave a review." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const endpoint = "/api/reviews";
      const method = editingReviewId ? "PUT" : "POST";
      const body = editingReviewId
        ? { reviewId: editingReviewId, userId: currentUser.id, rating, comment }
        : { productId, userId: currentUser.id, userName: currentUser.name, rating, comment };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: "success", text: data.message });
        setComment("");
        setRating(5);
        setEditingReviewId(null);
        fetchReviews();
      } else {
        setMessage({ type: "error", text: data.message || "Something went wrong" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to submit review." });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete your review?")) return;

    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error("Delete review error:", err);
    }
  };

  return (
    <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-8">
      {/* Overview & Rating Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customer Reviews</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Read real feedback from verified customers</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{avgRating}</div>
          <div>
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(avgRating) ? "fill-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{totalReviews} total reviews</span>
          </div>
        </div>
      </div>

      {/* Review Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200/60 dark:border-gray-700">
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
          {editingReviewId ? "Edit Your Review" : "Write a Review"}
        </h4>

        {message && (
          <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        {/* Star Rating Picker */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="p-1 focus:outline-none transition-transform active:scale-110"
              >
                <Star className={`w-6 h-6 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Comment Box */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Your Review</label>
          <textarea
            required
            rows={3}
            placeholder="Share details about quality, fitting, or delivery..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-600 font-medium resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:bg-gray-400"
          >
            {loading ? "Submitting..." : editingReviewId ? "Update Review" : "Submit Review"}
          </button>
          {editingReviewId && (
            <button
              type="button"
              onClick={() => { setEditingReviewId(null); setComment(""); }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Reviews List */}
      <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-700">
        {reviews.length === 0 ? (
          <p className="text-center py-6 text-xs text-gray-400">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} className="pt-4 flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{rev.userName}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? "fill-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 pt-1 font-medium">{rev.comment}</p>
              </div>

              {/* Allow Owner to Edit / Delete */}
              {currentUser && currentUser.id === rev.userId && (
                <div className="flex items-center gap-2 text-gray-400">
                  <button onClick={() => handleEdit(rev)} className="hover:text-indigo-600 p-1">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(rev._id)} className="hover:text-rose-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}