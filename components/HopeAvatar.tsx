"use client";

import Lottie from "lottie-react";
import animationData from "@/public/hope-avatar.json";

export default function HopeAvatar({ emotion }: { emotion: string }) {
  return (
    <div className="flex justify-center items-center h-64">
      <Lottie
        animationData={animationData}
        loop={true}
        style={{ width: 200, height: 200 }}
      />
    </div>
  );
}
