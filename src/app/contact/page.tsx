// 📁 src/app/contact/page.tsx
import React from "react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen text-slate-800 dark:text-slate-100 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Have questions? Reach out to our support team.
      </p>
      <form className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input type="text" className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700" placeholder="Your Name" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700" placeholder="your@email.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea rows={4} className="w-full border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700" placeholder="How can we help?"></textarea>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Send Message
        </button>
      </form>
    </div>
  );
}