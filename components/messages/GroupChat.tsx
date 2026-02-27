"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import MessageComposer from "./MessageComposer";

interface GroupMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
}

export default function GroupChat() {
  const [messages, setMessages] = useState<GroupMessage[]>([
    { id: 1, sender: "Anna", text: "Hey team, when are we leaving?", time: "09:45" },
    { id: 2, sender: "David", text: "Meet at the church at 7AM!", time: "09:47" },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    const message: GroupMessage = {
      id: messages.length + 1,
      sender: "You",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, message]);
  };

  return (
    <div className="flex flex-col bg-white/10 backdrop-blur-lg rounded-lg shadow-md text-white p-4 h-[70vh]">
      <h2 className="text-xl font-semibold mb-4 text-[#4fa5ff]">Group Chat</h2>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                msg.sender === "You"
                  ? "bg-[#4fa5ff] text-white self-end ml-auto"
                  : "bg-white/20 text-gray-100 self-start"
              }`}
            >
              <p className="font-semibold text-sm">{msg.sender}</p>
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