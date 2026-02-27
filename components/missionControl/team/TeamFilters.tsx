"use client";

import { motion } from "framer-motion";

type Filter = { key: string; label: string };

type TeamFiltersProps = {
  activeFilter: string;
  onFilterChange: (key: string) => void;
  filters: Filter[];
};

export default function TeamFilters({ activeFilter, onFilterChange, filters }: TeamFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <motion.button
          key={filter.key}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onFilterChange(filter.key)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeFilter === filter.key
              ? "bg-[#ff9c4b] text-[#080313]"
              : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          }`}
        >
          {filter.label}
        </motion.button>
      ))}
    </div>
  );
}
