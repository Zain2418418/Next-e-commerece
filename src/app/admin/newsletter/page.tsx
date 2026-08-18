"use client";

import React, { useState, useEffect } from "react";
import { Mail, Send, Trash2, Users, CheckCircle, Search, AlertCircle } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch Newsletter Subscribers
  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch("/api/newsletter");
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (err) {
      console.error("Error fetching subscribers:", err);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;

    try {
      const res = await fetch(`/api/newsletter?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubscribers(subscribers.filter((sub) => sub.id !== id));
      }
    } catch (err) {
      console.error("Error deleting subscriber:", err);
    }
  };

  const handleSendPromotions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;

    setSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage({ type: "success", text: "Promotional email sent successfully to all subscribers!" });
        setSubject("");
        setContent("");
      } else {
        setStatusMessage({ type: "error", text: data.message || "Failed to send newsletter emails." });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "An error occurred while sending emails." });
    } finally {
      setSending(false);
    }
  };

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Mail className="w-7 h-7 text-indigo-600" />
          Newsletter & Email Marketing
        </h1>
        <p className="text-sm text-slate-500">
          Manage newsletter subscribers and broadcast promotional emails/offers.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {statusMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Broadcast Promotional Email */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-600" />
            Send Broadcast / Promotional Offer
          </h2>

          <form onSubmit={handleSendPromotions} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Special Offer! 20% OFF on all services 🎉"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs text-slate-900 bg-white placeholder:text-slate-400 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Message Body
              </label>
              <textarea
                required
                rows={8}
                placeholder="Write your promotional offer details here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-xs text-slate-900 bg-white placeholder:text-slate-400 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-indigo-600 font-medium resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending || subscribers.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending Email..." : `Send to ${subscribers.length} Subscribers`}
            </button>
          </form>
        </div>

        {/* Right Column: Subscribers List */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Subscribers ({subscribers.length})
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search subscribers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          {/* Subscriber Table / List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
            {filteredSubscribers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No subscribers found.
              </div>
            ) : (
              filteredSubscribers.map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{sub.email}</p>
                    <p className="text-[10px] text-slate-400">
                      Subscribed: {new Date(sub.subscribedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSubscriber(sub.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                    title="Remove Subscriber"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}