"use client";

import { motion } from "framer-motion";

type TeamOverviewProps = {
  totalMembers: number;
  leaders: number;
  volunteers: number;
  medical: number;
  lastUpdated: string;
};

const stats = [
  { key: "totalMembers", label: "Total", icon: "👤" },
  { key: "leaders", label: "Leaders", icon: "⭐" },
  { key: "volunteers", label: "Volunteers", icon: "🤝" },
  { key: "medical", label: "Medical", icon: "🩺" },
] as const;

export default function TeamOverview({ totalMembers, leaders, volunteers, medical, lastUpdated }: TeamOverviewProps) {
  const values: Record<string, number | string> = {
    totalMembers,
    leaders,
    volunteers,
    medical,
    lastUpdated,
  };

  return (
    <motion.div
      className="grid gap-4 rounded-2xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:grid-cols-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {stats.map((item) => (
        <div key={item.key} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white shadow-inner">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span className="flex items-center gap-2">
              <span>{item.icon}</span>
              {item.label}
            </span>
            {item.key === "totalMembers" && (
              <span className="rounded-full bg-[#ff9c4b]/20 px-3 py-0.5 text-xs font-semibold text-[#ff9c4b]">
                Updated {lastUpdated}
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {values[item.key] as number}
          </p>
        </div>
      ))}
    </motion.div>
  );
}
