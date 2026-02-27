"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import MessageComposer from "./MessageComposer";

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isUser: boolean;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "Marie L.",
      text: "Hey Charles! Are we still on for the mission briefing tomorrow?",
      time: "10:12 AM",
      isUser: false,
    },
    {
      id: 2,
      sender: "You",
      text: "Yes! I’ll bring the updated logistics report.",
      time: "10:15 AM",
      isUser: true,
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    const message: Message = {
      id: messages.length + 1,
      sender: "You",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isUser: true,
    };
    setMessages((prev) => [...prev, message]);
  };

  return (
    <div className="flex flex-col bg-white/10 backdrop-blur-md rounded-lg shadow-md text-white p-4 h-[70vh]">
      <h2 className="text-xl font-semibold mb-4 text-[#4fa5ff]">Chat</h2>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                msg.isUser
                  ? "bg-[#4fa5ff] text-white self-end"
                  : "bg-white/20 text-gray-100 self-start"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs text-gray-300 mt-1 text-right">{msg.time}</p>
            </div>
          </motion.div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      <MessageComposer onSend={handleSend} />
    </div>
  );
}
