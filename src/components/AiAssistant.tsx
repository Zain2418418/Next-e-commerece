"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export default function AiAssistant() {
  const router = useRouter();
  const pathname = usePathname();

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
      if (auth.currentUser) {
        setIsLoggedIn(true);
        setAuthLoading(false);
        return;
      }

      const storedUser = localStorage.getItem("user") || localStorage.getItem("authUser") || localStorage.getItem("firebaseUser");
      if (storedUser) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setAuthLoading(false);
    };

    checkAuthStatus();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setIsLoggedIn(true);
      } else {
        const storedUser = localStorage.getItem("user") || localStorage.getItem("authUser");
        setIsLoggedIn(!!storedUser);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🚨 Guest Redirect Handler when launcher is clicked
  const handleOpenClick = () => {
    if (!isLoggedIn && !authLoading) {
      router.push("/login");
      return;
    }
    setIsOpen(true);
  };

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

  // 🚫 Admin routes ya Admin Login page par AI Assistant show nahi hoga
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* 🔘 Compact Launcher Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={handleOpenClick}
          className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 sm:px-5 sm:py-3.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
            </span>
          </div>
          <span className="font-semibold text-xs tracking-wide hidden sm:inline">
            AI Assistant
          </span>
        </button>
      )}

      {/* 💬 Compact Chat Box Drawer */}
      {isOpen && isLoggedIn && (
        <div className="w-[calc(100vw-32px)] sm:w-[380px] h-[480px] max-h-[75vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3.5 sm:p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                  AI Shopping Guide
                </h3>
                <p className="text-[10px] text-indigo-100 font-medium">Powered by Gemini AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset Chat"
                className="p-1.5 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-gray-50/50 dark:bg-gray-950/40 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-indigo-100 dark:bg-indigo-950/80 rounded-xl flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
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
              <div className="flex gap-2 items-center text-gray-400">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-indigo-100 dark:bg-indigo-950/80 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="bg-white dark:bg-gray-800 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span className="text-[11px]">Searching catalog...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2.5 sm:p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for recommendations, specs..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}