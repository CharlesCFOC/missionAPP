"use client";

import { motion } from "framer-motion";

type LoginActivity = {
  id: string;
  date: string;
  device: string;
  ip: string;
};

type LoginHistoryProps = {
  logins: LoginActivity[];
};

export default function LoginHistory({ logins }: LoginHistoryProps) {
  return (
    <motion.div
      className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">Activity</p>
          <h3 className="text-xl font-semibold text-[#ff9c4b]">Login History</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {logins.length} sign-ins
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {logins.length === 0 ? (
          <p className="text-white/60">No login history available.</p>
        ) : (
          logins.map((login) => (
            <div
              key={login.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            >
              <div className="space-y-1">
                <p className="font-semibold">{login.device}</p>
                <p className="text-white/60">{login.date}</p>
              </div>
              <div className="text-right text-white/70">
                <p>{login.ip}</p>
                <p className="text-xs">New sign-ins are alerted instantly</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
