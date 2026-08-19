"use client";

import React, { useState, useEffect } from "react";
import { Star, Trash2, Search, MessageSquare } from "lucide-react";

interface Review {
  _id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAdminReviews();
  }, []);

  const fetchAdminReviews = async () => {
    try {
      // Fetching sample product reviews (or build a dedicated fetch-all API)
      const res = await fetch("/api/reviews?productId=all");
      const data = await res.json();
      if (data.success) setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this review?")) return;
    try {
      const res = await fetch(`/api/reviews?reviewId=${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews(reviews.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = reviews.filter((r) =>
    r.comment.toLowerCase().includes(search.toLowerCase()) || r.userName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Product Reviews Management
          </h1>
          <p className="text-xs text-slate-500">Monitor and moderate all customer reviews across your store.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name or review text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="divide-y divide-slate-100 dark:divide-gray-700">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No customer reviews found.</div>
          ) : (
            filtered.map((rev) => (
              <div key={rev._id} className="py-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{rev.userName}</span>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? "fill-amber-400" : "text-slate-300"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>
                </div>

                <button
                  onClick={() => handleDelete(rev._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}