"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Lock } from "lucide-react";

type PasswordState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePassword() {
  const supabase = useSupabaseClient();
  const [fields, setFields] = useState<PasswordState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");


  const handleChange = (key: keyof PasswordState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setStatus("idle");

    if (fields.newPassword !== fields.confirmPassword) {
      setStatus("error");
      setFeedback("New password and confirmation do not match.");
      return;
    }

    if (fields.newPassword.length < 8) {
      setStatus("error");
      setFeedback("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: fields.newPassword,
    });

    if (error) {
      setStatus("error");
      setFeedback(error.message);
    } else {
      setStatus("success");
      setFeedback("Password updated successfully.");
      setFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-2xl md:p-6"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Lock className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
            Change password
          </div>
          <p className="mt-1 text-xs text-white/60">Minimum 8 characters.</p>
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-xs text-white/70">
            <span className="font-semibold text-white/80">Current password</span>
            <input
              type="password"
              value={fields.currentPassword}
              onChange={handleChange("currentPassword")}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-[#ff9c4b] focus:outline-none"
              autoComplete="current-password"
            />
          </label>
          <label className="space-y-1 text-xs text-white/70">
            <span className="font-semibold text-white/80">New password</span>
            <input
              type="password"
              value={fields.newPassword}
              onChange={handleChange("newPassword")}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-[#ff9c4b] focus:outline-none"
              autoComplete="new-password"
            />
          </label>
          <label className="space-y-1 text-xs text-white/70">
            <span className="font-semibold text-white/80">Confirm password</span>
            <input
              type="password"
              value={fields.confirmPassword}
              onChange={handleChange("confirmPassword")}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-[#ff9c4b] focus:outline-none"
              autoComplete="new-password"
            />
          </label>
        </div>

        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 text-xs ${
              status === "success"
                ? "border-green-400/50 bg-green-400/10 text-green-100"
                : "border-red-400/50 bg-red-400/10 text-red-100"
            }`}
          >
            {feedback}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#ff9c4b] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#080313] transition hover:bg-[#ffb877] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
