"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { usePathname } from "next/navigation";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export default function AiAssistant() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "👋 Hi there! I'm your AI Shopping Assistant. How can I help you find products, check specs, or answer questions today?",
      timestamp: new Date(),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleOpenClick = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

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
          text: `⚠️ ${
            data.message || "Something went wrong. Please try again."
          }`,
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

  // Hide AI Assistant on admin panel, login, and register pages
  if (
    pathname?.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/auth")
  ) {
    return null;
  }

  return (
    <>
      {/* 🤖 AI ASSISTANT BUTTON */}
      {!isOpen && (
        <div
          className="
            fixed
            left-1/2
            bottom-8
            -translate-x-1/2
            z-[90]
          "
        >
          <button
            onClick={handleOpenClick}
            className="
              group
              relative
              flex
              h-[58px]
              w-[58px]
              hover:w-[160px]
              items-center
              justify-center
              gap-2
              overflow-hidden
              rounded-full
              bg-gradient-to-r
              from-indigo-600
              via-purple-600
              to-indigo-600
              text-white
              shadow-xl
              shadow-purple-900/40
              border
              border-purple-400/30
              transition-all
              duration-300
              ease-out
              hover:scale-105
              active:scale-95
              px-3
            "
            aria-label="Open AI Assistant"
          >
            {/* Bot Icon */}
            <div className="relative flex items-center justify-center shrink-0">
              <Bot className="w-7 h-7 sm:w-7 sm:h-7" />

              {/* Online Indicator */}
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>

                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            {/* Text - Only Visible On Hover */}
            <span
              className="
                max-w-0
                overflow-hidden
                whitespace-nowrap
                opacity-0
                group-hover:max-w-[105px]
                group-hover:opacity-100
                transition-all
                duration-300
                font-bold
                text-sm
                tracking-wide
              "
            >
              AI Assistant
            </span>

            {/* Sparkles - Only Visible On Hover */}
            <Sparkles
              className="
                w-4 h-4
                text-yellow-300
                shrink-0
                opacity-0
                group-hover:opacity-100
                transition-opacity
                duration-200
              "
            />
          </button>
        </div>
      )}

      {/* 💬 AI CHAT DRAWER */}
      {isOpen && (
        <div
          className="
            fixed
            left-1/2
            top-1/2
            -translate-x-1/2
            -translate-y-1/2
            z-[9999]

            w-[calc(100vw-24px)]
            sm:w-[380px]

            h-[480px]
            max-h-[80vh]

            bg-white
            dark:bg-gray-900

            rounded-3xl
            shadow-2xl

            border
            border-gray-100
            dark:border-gray-800

            flex
            flex-col
            overflow-hidden

            transition-all
            duration-300
            animate-in
            fade-in
            zoom-in-95
          "
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3.5 sm:p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
              </div>

              <div>
                <h3 className="font-bold text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                  AI Shopping Guide
                </h3>

                <p className="text-[10px] text-indigo-100 font-medium">
                  Powered by Gemini AI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Reset Chat */}
              <button
                onClick={handleResetChat}
                title="Reset Chat"
                className="
                  p-1.5
                  hover:bg-white/20
                  rounded-xl
                  text-white/80
                  hover:text-white
                  transition-colors
                "
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Close Chat */}
              <button
                onClick={() => setIsOpen(false)}
                className="
                  p-1.5
                  hover:bg-white/20
                  rounded-xl
                  text-white/80
                  hover:text-white
                  transition-colors
                "
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div
            className="
              flex-1
              p-3.5
              sm:p-4
              overflow-y-auto
              space-y-3
              bg-gray-50/50
              dark:bg-gray-950/40
              text-xs
            "
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {/* AI Icon */}
                {msg.sender === "ai" && (
                  <div
                    className="
                      w-6 h-6
                      sm:w-7 sm:h-7
                      bg-indigo-100
                      dark:bg-indigo-950/80
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      shrink-0
                      text-indigo-600
                      dark:text-indigo-400
                      mt-0.5
                    "
                  >
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}

                {/* Message */}
                <div
                  className={`
                    max-w-[82%]
                    p-3
                    rounded-2xl
                    leading-relaxed
                    whitespace-pre-wrap
                    ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none shadow-md"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/60 rounded-bl-none shadow-sm"
                    }
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex gap-2 items-center text-gray-400">
                <div
                  className="
                    w-6 h-6
                    sm:w-7 sm:h-7
                    bg-indigo-100
                    dark:bg-indigo-950/80
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    text-indigo-600
                    shrink-0
                  "
                >
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                <div
                  className="
                    bg-white
                    dark:bg-gray-800
                    p-2.5
                    rounded-2xl
                    border
                    border-gray-100
                    dark:border-gray-700/60
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />

                  <span className="text-[11px]">
                    Searching catalog...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="
              p-2.5
              sm:p-3
              bg-white
              dark:bg-gray-900
              border-t
              border-gray-100
              dark:border-gray-800
              flex
              gap-2
              shrink-0
            "
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for recommendations, specs..."
              className="
                flex-1
                bg-gray-100
                dark:bg-gray-800
                text-gray-900
                dark:text-white
                px-3.5
                py-2
                rounded-xl
                text-xs
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-600
                placeholder-gray-400
              "
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="
                bg-indigo-600
                hover:bg-indigo-700
                disabled:opacity-50
                text-white
                p-2.5
                rounded-xl
                transition-all
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}