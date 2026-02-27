"use client";

import { motion } from "framer-motion";

type TwoFactorToggleProps = {
  twoFA: boolean;
  toggleTwoFA: () => void;
};

export default function TwoFactorToggle({ twoFA, toggleTwoFA }: TwoFactorToggleProps) {
  return (
    <motion.div
      className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">Protection</p>
          <h3 className="text-xl font-semibold text-[#ff9c4b]">Two-Factor Authentication</h3>
          <p className="mt-1 text-sm text-white/70">
            Add a second verification step to keep your account safe. Recommended for all admins.
          </p>
        </div>
        <button
          type="button"
          aria-pressed={twoFA}
          onClick={toggleTwoFA}
          className={`relative h-10 w-[72px] min-w-[72px] rounded-full border transition ${
            twoFA ? "border-[#ff9c4b]/70 bg-[#ff9c4b]" : "border-white/20 bg-white/10"
          }`}
        >
          <motion.span
            className={`absolute top-1 left-1 inline-block h-8 w-8 rounded-full bg-white shadow ${
              twoFA ? "translate-x-[36px]" : "translate-x-0"
            }`}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            twoFA ? "bg-green-400/20 text-green-100" : "bg-red-400/20 text-red-100"
          }`}
        >
          {twoFA ? "Enabled" : "Disabled"}
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
          SMS + Authenticator app support
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
          Recovery codes protected
        </span>
      </div>
      <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
        We recommend keeping 2FA ON. Disabling reduces your account security and may require re-verification on next
        login.
      </div>
    </motion.div>
  );
}
