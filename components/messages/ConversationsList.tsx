"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

export default function ConversationsList() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  const conversations: Conversation[] = [
    {
      id: 1,
      name: "Marie L.",
      lastMessage: "See you tomorrow for the mission prep!",
      time: "10:24 AM",
      unread: 2,
      avatar:
        "https://images.unsplash.com/photo-1603415526960-f7e0328b1a2c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      name: "David K.",
      lastMessage: "Just finished the budget report.",
      time: "Yesterday",
      unread: 0,
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      name: "Team Zambia",
      lastMessage: "Meeting confirmed at 6PM.",
      time: "Mon",
      unread: 4,
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="p-4 bg-gradient-to-b from-[#0f172a] to-[#1e293b] rounded-lg shadow-md text-white">
      <h2 className="text-xl font-semibold mb-6 text-[#4fa5ff]">Conversations</h2>

      <div className="space-y-4 overflow-y-auto max-h-[60vh]">
        {conversations.map((conv, idx) => (
          <div key={conv.id} className="relative">
            <motion.div
              onClick={() => setSelectedConversation(conv.id)}
              className={`flex items-center gap-4 p-3 rounded-md cursor-pointer transition-colors duration-300 ${
                selectedConversation === conv.id
                  ? "bg-[#4fa5ff]/30"
                  : "bg-white/5 hover:bg-white/20"
              }`}
            >
              <div className="relative">
                <img
                  src={conv.avatar}
                  alt={conv.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/30"
                />
                {selectedConversation === conv.id && (
                  <motion.div
                    layoutId="highlight"
                    className="absolute -inset-1 rounded-full border-2 border-[#4fa5ff]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>

              <div className="flex-1">
                <p className="font-bold text-white">{conv.name}</p>
                <p className="text-xs text-gray-300 truncate w-44">{conv.lastMessage}</p>
              </div>

              <div className="text-right text-xs text-gray-400">
                <p>{conv.time}</p>
                {conv.unread > 0 && (
                  <span className="bg-[#4fa5ff] text-white text-[10px] font-semibold rounded-full px-2 py-0.5">
                    {conv.unread}
                  </span>
                )}
              </div>
            </motion.div>
            {idx < conversations.length - 1 && (
              <hr className="border-t border-white/10 mt-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
