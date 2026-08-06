"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, Loader2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: "success", text: data.message });
        setEmail("");
      } else {
        setMessage({ type: "error", text: data.message || "Failed to subscribe." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-indigo-600 dark:bg-indigo-700 text-white rounded-3xl p-8 sm:p-12 my-12 shadow-xl relative overflow-hidden">
      <div className="max-w-3xl mx-auto text-center relative z-10 space-y-6">
        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto">
          <Mail className="w-6 h-6 text-white" />
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Stay Updated with Exclusive Deals
        </h2>

        <p className="text-indigo-100 text-sm sm:text-base max-w-xl mx-auto">
          Subscribe to our newsletter and be the first to receive special offers, new product alerts, and seasonal discounts.
        </p>

        <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 px-5 py-3.5 rounded-xl text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-white bg-white/95 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Subscribe <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {message && (
          <div
            className={`text-xs font-medium py-2 px-4 rounded-lg inline-flex items-center gap-2 ${
              message.type === "success" ? "bg-emerald-500/20 text-emerald-100" : "bg-red-500/20 text-red-100"
            }`}
          >
            {message.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
            {message.text}
          </div>
        )}
      </div>
    </section>
  );
}