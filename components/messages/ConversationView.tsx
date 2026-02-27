

"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageComposer from "./MessageComposer";
import MessageBadge from "./MessageBadge";
import { FaEllipsisV } from "react-icons/fa";

export default function ConversationView() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "You", text: "Hey, how’s everything going?", time: "10:02 AM" },
    { id: 2, sender: "Anna (Mission HQ)", text: "Pretty good! Just finalizing the team logistics for Zambia.", time: "10:04 AM" },
    { id: 3, sender: "You", text: "Perfect. I’ll send over the updated documents tonight.", time: "10:06 AM" },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const newMessage = {
      id: messages.length + 1,
      sender: "You",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#0f0f1a]/80 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1a1a2f]/80">
        <div>
          <h2 className="text-white font-semibold text-lg">Anna (Mission HQ)</h2>
          <p className="text-sm text-green-400">Online</p>
        </div>
        <div className="flex items-center gap-2">
          <MessageBadge count={3} />
          <button className="text-white/70 hover:text-white">
            <FaEllipsisV />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                  msg.sender === "You"
                    ? "bg-[#4fa5ff] text-white rounded-br-none"
                    : "bg-white/10 text-white/90 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[10px] opacity-70">{msg.time}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-white/10 bg-[#1a1a2f]/80 p-4">
        <MessageComposer onSend={handleSend} />
      </div>
    </div>
  );
}