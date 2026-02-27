"use client";

import { CSSProperties, ReactNode } from "react";

type MissionControlLayoutProps = {
  children: ReactNode;
};

export default function MissionControlLayout({
  children,
}: MissionControlLayoutProps) {
  const auroraStyle = {
    "--aurora-1": "rgba(166, 2, 255, 1)",
    "--aurora-2": "rgba(249, 180, 255, 0.99)",
    "--aurora-3": "rgba(151, 17, 161, 0.52)",
    "--aurora-4": "rgba(7, 244, 55, 1)",
  } as CSSProperties;

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-br from-[#080313] via-[#260d5c] to-[#5d3ab9]"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />
      <div
        className="mission-aurora pointer-events-none"
        style={{ ...auroraStyle, position: "fixed", inset: 0, zIndex: 1 }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-br from-[#080313]/80 via-[#260d5c]/70 to-[#080313]/80"
        style={{ zIndex: 2 }}
        aria-hidden="true"
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
