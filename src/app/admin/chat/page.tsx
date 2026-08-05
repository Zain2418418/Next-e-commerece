"use client";

import React, { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, push } from "firebase/database";
import { MessageSquare, Send, User, Search, Clock } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "admin";
  text: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  userName?: string;
  lastMessage?: string;
  updatedAt?: number;
}

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch All Active Chat Sessions from Firebase
  useEffect(() => {
    const chatsRef = ref(db, "chats");
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedSessions: ChatSession[] = Object.keys(data).map((key) => {
          const info = data[key]?.info;
          let lastMsg = "";
          let lastTime = 0;
          let uName = "Guest User";

          if (info) {
            const infoKeys = Object.keys(info);
            const latestInfo = info[infoKeys[infoKeys.length - 1]];
            lastMsg = latestInfo.lastMessage || "";
            lastTime = latestInfo.updatedAt || 0;
            uName = latestInfo.userName || "Guest User";
          }

          return {
            id: key,
            userName: uName,
            lastMessage: lastMsg,
            updatedAt: lastTime,
          };
        });

        // Sort by most recent message
        loadedSessions.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setSessions(loadedSessions);

        // Auto select first session if none selected
        if (!selectedSessionId && loadedSessions.length > 0) {
          setSelectedSessionId(loadedSessions[0].id);
        }
      } else {
        setSessions([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Messages for Selected Session
  useEffect(() => {
    if (!selectedSessionId) return;

    const messagesRef = ref(db, `chats/${selectedSessionId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedMessages: ChatMessage[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setMessages(loadedMessages);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [selectedSessionId]);

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Admin Send Reply Handler
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSessionId) return;

    const textToSend = replyText.trim();
    setReplyText("");

    const messagesRef = ref(db, `chats/${selectedSessionId}/messages`);
    await push(messagesRef, {
      sender: "admin",
      text: textToSend,
      timestamp: Date.now(),
    });
  };

  const filteredSessions = sessions.filter((s) =>
    s.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-indigo-600" />
          Live Customer Support Chat
        </h1>
        <p className="text-sm text-slate-500">
          Respond to customer queries in real-time.
        </p>
      </div>

      {/* Main Chat Interface Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 h-[650px] overflow-hidden">
        {/* Left Sidebar: Session List */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active conversations found.
              </div>
            ) : (
              filteredSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${
                    selectedSessionId === session.id
                      ? "bg-indigo-50/80 border-l-4 border-indigo-600"
                      : "hover:bg-slate-100/60"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-semibold text-slate-800 truncate">
                        {session.userName}
                      </h4>
                      {session.updatedAt && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(session.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {session.lastMessage || "Started a chat"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Active Conversation */}
        <div className="md:col-span-8 flex flex-col h-full bg-white">
          {selectedSessionId ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {sessions.find((s) => s.id === selectedSessionId)?.userName || "Customer"}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Session: {selectedSessionId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                {messages.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 text-xs">
                    No messages in this conversation yet.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "admin" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
                          msg.sender === "admin"
                            ? "bg-indigo-600 text-white rounded-br-none shadow-sm"
                            : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Reply Form */}
              <form
                onSubmit={handleSendReply}
                className="p-4 border-t border-slate-200 bg-white flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="Type your reply as Admin..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  Reply
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
              <MessageSquare className="w-12 h-12 mb-3 stroke-1 opacity-40" />
              Select a conversation from the left to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}