"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaPaperPlane, FaSmile, FaPaperclip } from "react-icons/fa";

export default function MessageComposer({ onSend }: { onSend?: (msg: string) => void }) {
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    onSend?.(message);
    setMessage("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      alert(`📎 You selected ${files.length} file(s): ${Array.from(files)
        .map((f) => f.name)
        .join(", ")}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      alert(`📎 You dropped ${files.length} file(s): ${Array.from(files)
        .map((f) => f.name)
        .join(", ")}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex items-center gap-3 p-3 mt-3 rounded-lg bg-white/10 backdrop-blur-md transition border ${
        isDragging ? "border-[#4fa5ff]" : "border-transparent"
      }`}
    >
      <button
        onClick={() => fileInputRef.current?.click()}
        className="text-[#4fa5ff] hover:text-[#8cc4ff] text-xl transition"
        title="Attach file"
      >
        <FaPaperclip />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 bg-white/20 text-white p-2 rounded-md placeholder-gray-300 outline-none"
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      <button
        className="text-[#4fa5ff] hover:text-[#8cc4ff] text-xl transition"
        title="Add emoji"
      >
        <FaSmile />
      </button>

      <button
        onClick={handleSend}
        className="bg-[#4fa5ff] hover:bg-[#8cc4ff] text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
      >
        <FaPaperPlane /> <span>Send</span>
      </button>
    </motion.div>
  );
}
