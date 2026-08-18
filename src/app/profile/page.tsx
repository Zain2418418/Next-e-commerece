"use client";

import React, { useState, useEffect } from "react";
import { User as UserIcon, Mail, Phone, MapPin, Lock, Save, Loader2, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setFormData((prev) => ({
          ...prev,
          userId: parsed._id || parsed.id || "",
          name: parsed.name || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          address: parsed.address || "",
        }));
      }
    } catch (e) {
      console.error("Failed to load user info:", e);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Front-end validation for password update
    if (formData.newPassword || formData.currentPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setStatus({ type: "error", msg: "Please enter your current password to make password changes." });
        setLoading(false);
        return;
      }

      if (formData.newPassword.length < 6) {
        setStatus({ type: "error", msg: "New password must be at least 6 characters long." });
        setLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setStatus({ type: "error", msg: "New password and Confirm password do not match." });
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({ type: "success", msg: data.message || "Profile updated successfully!" });
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("user-updated"));
        }
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setStatus({ type: "error", msg: data.message || "Failed to update profile." });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Manage your personal profile, contact information, and security settings.
          </p>
        </div>

        {/* Notification Status */}
        {status && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
              status.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Personal Information Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <UserIcon className="w-5 h-5 text-indigo-600" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="phone"
                    placeholder="+92 (300) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Default Shipping Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address, City, Postal Code"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security & Password Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Lock className="w-5 h-5 text-indigo-600" />
                Change Password
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-2">
                Leave these fields blank if you don't want to change your password.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="••••••••"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 px-8 rounded-2xl text-xs flex items-center gap-2 transition duration-200 active:scale-[0.99] disabled:opacity-70 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}