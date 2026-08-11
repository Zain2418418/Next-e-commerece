"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Loader2, RefreshCw, Lock, LogIn } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 Auth States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "👋 Hi there! I'm your AI Shopping Assistant. How can I help you find products, check specs, or answer questions today?",
      timestamp: new Date(),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // 🔄 Sync auth state with Firebase AND Local Storage/Session
  useEffect(() => {
    const checkAuthStatus = () => {
      // 1. Check direct Firebase Auth
      if (auth.currentUser) {
        setIsLoggedIn(true);
        setAuthLoading(false);
        return;
      }

      // 2. Check LocalStorage / Session fallback (which Navbar uses)
      const storedUser = localStorage.getItem("user") || localStorage.getItem("authUser") || localStorage.getItem("firebaseUser");
      if (storedUser) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setAuthLoading(false);
    };

    checkAuthStatus();

    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setIsLoggedIn(true);
      } else {
        // Fallback check if navbar logged in state exists in storage
        const storedUser = localStorage.getItem("user") || localStorage.getItem("authUser");
        setIsLoggedIn(!!storedUser);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen && isLoggedIn) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading, isLoggedIn]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading || !isLoggedIn) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input.trim();
    setInput("");
    setLoading(true);

    try {
      const chatHistory = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          chatHistory,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: `⚠️ ${data.message || "Something went wrong. Please try again."}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "⚠️ Network error. Please check your connection.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "👋 Chat reset! How can I assist you with your shopping?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* 🔘 Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <span className="font-semibold text-xs tracking-wide pr-1 hidden sm:inline">
            AI Assistant
          </span>
        </button>
      )}

      {/* 💬 Chat Box Drawer */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[400px] h-[540px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                  AI Shopping Guide
                </h3>
                <p className="text-[10px] text-indigo-100 font-medium">Powered by Gemini AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isLoggedIn && (
                <button
                  onClick={handleResetChat}
                  title="Reset Chat"
                  className="p-1.5 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 🛑 AUTHENTICATION LOGIC */}
          {authLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-500 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
              <span>Verifying account status...</span>
            </div>
          ) : !isLoggedIn ? (
            /* 🔒 LOGGED OUT SCREEN */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50/50 dark:bg-gray-950/40">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-950/80 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
                <Lock className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                Authentication Required
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-[260px] leading-relaxed">
                Please log in to your account to chat with our AI Shopping Assistant and get personalized recommendations.
              </p>
              <Link
                href="/login"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition-all shadow-md hover:shadow-indigo-500/20 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Continue</span>
              </Link>
            </div>
          ) : (
            /* ✅ LOGGED IN SCREEN (NORMAL CHAT UI) */
            <>
              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50/50 dark:bg-gray-950/40 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "ai" && (
                      <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-950/80 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-indigo-600 text-white rounded-br-none shadow-md"
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/60 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Loading State */}
                {loading && (
                  <div className="flex gap-2.5 items-center text-gray-400">
                    <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-950/80 rounded-xl flex items-center justify-center text-indigo-600">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span className="text-[11px]">Searching catalog...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for recommendations, specs..."
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all flex items-center justify-center flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}