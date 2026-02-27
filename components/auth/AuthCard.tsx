"use client";

import type { ReactNode } from "react";

type AuthCardProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthCard({
  eyebrow = "CFOC",
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          {description}
        </p>
      )}

      <div className="mt-6">{children}</div>

      {footer && (
        <div className="mt-6 border-t border-white/10 pt-4 text-sm text-white/70">
          {footer}
        </div>
      )}
    </div>
  );
}

