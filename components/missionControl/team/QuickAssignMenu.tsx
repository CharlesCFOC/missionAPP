"use client";

import { motion } from "framer-motion";

type QuickAssignMenuProps = {
  items: string[];
  selected: string[];
  onChange: (value: string) => void;
  onClose: () => void;
};

export default function QuickAssignMenu({ items, selected, onChange, onClose }: QuickAssignMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-[#110827] p-3 text-white shadow-xl z-50"
    >
      <p className="mb-2 text-sm text-white/60">Assign to:</p>
      <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-white/80 hover:bg-white/10 ${
              selected.includes(item) ? "bg-white/10 text-white" : ""
            }`}
          >
            {item}
            {selected.includes(item) && <i className="ri-check-line text-lg text-[#ff9c4b]" />}
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-3 w-full rounded-lg bg-white/10 py-2 text-sm text-white/60 hover:bg-white/20 hover:text-white"
      >
        Close
      </button>
    </motion.div>
  );
}
