// components/homepage/videos/MissionVideo.tsx
"use client";
import React from "react";

export default function MissionVideo() {
  return (
    <div className="relative w-80 h-80 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform">
      <video
        src="/videos/mission.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="object-cover w-full h-full"
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <h2 className="text-white text-xl font-bold">Mission Overview</h2>
      </div>
    </div>
  );
}