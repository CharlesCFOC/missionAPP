"use client";
import { motion } from "framer-motion";

interface MessageBadgeProps {
  count?: number;
  size?: "sm" | "md";
}

export default function MessageBadge({ count, size = "md" }: MessageBadgeProps) {
  const baseSize = size === "sm" ? "h-2 w-2" : "h-3 w-3";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  if (count && count > 0) {
    return (
      <div
        className={`flex items-center justify-center bg-[#4fa5ff] text-white ${textSize} font-semibold rounded-full ${
          size === "sm" ? "h-4 w-4" : "h-5 w-5"
        }`}
      >
        {count > 9 ? "9+" : count}
      </div>
    );
  }

  return (
    <motion.div
      className={`relative ${baseSize}`}
      animate={{ scale: [1, 1.4, 1] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    >
      <span className="absolute inset-0 bg-[#4fa5ff] rounded-full opacity-75"></span>
      <span className="absolute inset-0 bg-[#4fa5ff] rounded-full blur-[2px] opacity-60"></span>
    </motion.div>
  );
}
