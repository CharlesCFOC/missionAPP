"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (name: string) => void;
}

export default function NewChatModal({
  isOpen,
  onClose,
  onCreateChat,
}: NewChatModalProps) {
  const [chatName, setChatName] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!chatName.trim()) return;
    onCreateChat(chatName);
    setChatName("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-xl w-96 text-white"
          >
            <h3 className="text-lg font-semibold mb-4 text-[#4fa5ff]">
              New Chat
            </h3>
            <input
              type="text"
              placeholder="Enter chat name or contact"
              className="w-full bg-white/10 border border-white/20 rounded-md p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4fa5ff]"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
            />
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-600/50 hover:bg-gray-500/70"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-md bg-[#4fa5ff] hover:bg-[#3a85d6]"
              >
                Create
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}