"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import animationData from "/public/hope-avatar.json";

export default function HopeAvatar({ emotion }: { emotion: string }) {
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (emotion === "happy") setSpeed(1.5);
    else if (emotion === "listening") setSpeed(0.8);
    else setSpeed(1);
  }, [emotion]);

  return (
    <div className="flex justify-center items-center h-64">
      <Lottie
        animationData={animationData}
        loop={true}
        style={{ width: 200, height: 200 }}
        speed={speed}
      />
    </div>
  );
}