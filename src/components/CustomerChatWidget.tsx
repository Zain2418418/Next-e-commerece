"use client";

import React, { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { ref, push, onValue } from "firebase/database";
import { MessageCircle, X, Send, User } from "lucide-react";
import { usePathname } from "next/navigation";

interface ChatMessage {
  id: string;
  sender: "user" | "admin";
  text: string;
  timestamp: number;
}

export default function CustomerChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatSessionId, setChatSessionId] = useState<string>("");
  const [userName, setUserName] = useState<string>("Guest User");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Unique Chat Session ID Manage Karein
  useEffect(() => {
    let sessionId = localStorage.getItem("chat_session_id");
    if (!sessionId) {
      sessionId = "chat_" + Math.random().toString(36).substring(2, 9);
      localStorage.getItem("chat_session_id") || localStorage.setItem("chat_session_id", sessionId);
    }
    setChatSessionId(sessionId);

    // Get User Name from localStorage if logged in
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setUserName(parsed.name);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 2. Realtime Database se Messages Listen Karein
  useEffect(() => {
    if (!chatSessionId) return;

    const messagesRef = ref(db, `chats/${chatSessionId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedMessages: ChatMessage[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setMessages(parsedMessages);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [chatSessionId]);

  // Auto Scroll to Bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // 3. Message Send Karein
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatSessionId) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    // Message append inside Firebase
    const messagesRef = ref(db, `chats/${chatSessionId}/messages`);
    await push(messagesRef, {
      sender: "user",
      text: messageText,
      timestamp: Date.now(),
    });

    // Update Session Metadata for Admin View
    const sessionInfoRef = ref(db, `chats/${chatSessionId}/info`);
    await push(sessionInfoRef, {
      lastMessage: messageText,
      updatedAt: Date.now(),
      userName: userName,
    });
  };

  // 🚫 Admin routes ya Admin Login page par Live Chat bubble show nahi hoga
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group active:scale-95"
          aria-label="Open Chat"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs sm:text-sm font-semibold">
            Chat with us
          </span>
        </button>
      )}

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 w-auto sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col h-[75vh] max-h-[480px] overflow-hidden transition-all duration-300 z-40">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-3.5 sm:p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center font-bold shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-sm truncate">Live Support</h3>
                <p className="text-[10px] sm:text-[11px] text-indigo-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  We're online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <MessageCircle className="w-9 h-9 sm:w-10 sm:h-10 mx-auto mb-2 opacity-30 stroke-1" />
                <p>Hello! How can we help you today?</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-2xl text-xs font-medium leading-relaxed break-words ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none shadow-sm"
                        : "bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 sm:p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600 transition-colors"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}