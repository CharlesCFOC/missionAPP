"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

type SessionInfo = {
  id: string;
  browser: string;
  os: string;
  location: string;
  lastActive: string;
};

export default function ActiveSessions() {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const sessions = useMemo<SessionInfo[]>(
    () => [
      { id: "sess-1", browser: "Chrome", os: "macOS", location: "Paris, FR", lastActive: "2 min ago" },
      { id: "sess-2", browser: "Safari", os: "iOS", location: "Lyon, FR", lastActive: "42 min ago" },
      { id: "sess-3", browser: "Edge", os: "Windows", location: "Remote", lastActive: "Yesterday" },
    ],
    []
  );

  const logoutOthers = async () => {
    setLoading(true);
    setFeedback(null);
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (error) {
      setFeedback(error.message);
    } else {
      setFeedback("Other devices have been logged out.");
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">Devices</p>
          <h3 className="text-xl font-semibold text-[#ff9c4b]">Active Sessions</h3>
          <p className="mt-1 text-sm text-white/70">Review signed-in devices. Log out anything you do not recognize.</p>
        </div>
        <button
          type="button"
          onClick={logoutOthers}
          disabled={loading}
          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Processing..." : "Logout other devices"}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          >
            <div>
              <p className="font-semibold">
                {session.browser} • {session.os}
              </p>
              <p className="text-white/60">{session.location}</p>
            </div>
            <p className="text-white/60">{session.lastActive}</p>
          </div>
        ))}
      </div>

      {feedback && (
        <div className="mt-4 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/80">
          {feedback}
        </div>
      )}
    </motion.div>
  );
}
