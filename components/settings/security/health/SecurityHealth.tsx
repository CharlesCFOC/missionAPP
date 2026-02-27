"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export default function SecurityHealth() {
  const checklist = useMemo(
    () => [
      {
        label: "Password last updated 30 days ago",
        status: "good",
      },
      {
        label: "Two-factor authentication enabled",
        status: "good",
      },
      {
        label: "3 active devices secured",
        status: "good",
      },
    ],
    []
  );

  return (
    <motion.div
      className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">Security Checkup</p>
          <h3 className="text-xl font-semibold text-[#ff9c4b]">Your account health</h3>
          <p className="mt-1 text-sm text-white/70">
            Quick overview of your protection level. Resolve warnings immediately to stay safe.
          </p>
        </div>
        <div className="rounded-full bg-green-400/15 px-4 py-1 text-xs font-semibold text-green-100">
          Secure
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {checklist.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          >
            <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-400/20 text-green-100">
              ✓
            </span>
            <div>
              <p className="font-semibold">{item.label}</p>
              <p className="text-xs text-white/60">No action needed</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
