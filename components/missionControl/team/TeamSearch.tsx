"use client";

import { ChangeEvent } from "react";
import { motion } from "framer-motion";

type TeamSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function TeamSearch({ value, onChange }: TeamSearchProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">🔍</span>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search by name or email..."
        className="w-full rounded-xl border border-white/20 bg-white/10 px-10 py-3 text-sm text-white placeholder-white/50 outline-none transition focus:border-[#ff9c4b]"
      />
    </motion.div>
  );
}
