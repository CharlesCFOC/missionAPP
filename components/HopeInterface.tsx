"use client";

import { useState } from "react";
import Image from "next/image";
import logo from "/public/LogoApp.png";
import HopeAvatar from "./HopeAvatar";

export default function HopeInterface() {
  const [emotion, setEmotion] = useState("idle");
  const [reply, setReply] = useState("Bonjour 👋 Je suis Hope, ton guide CFOC.");

  const handleUserMessage = (msg: string) => {
    setEmotion("listening");
    setReply("...");
    setTimeout(() => {
      let answer = "";
      if (msg.toLowerCase().includes("projet")) {
        answer = "Nous avons plusieurs projets actifs 🌍. Souhaites-tu les voir ?";
      } else if (msg.toLowerCase().includes("don")) {
        answer = "Merci pour ton cœur généreux 💛. Tu peux contribuer via la page Boutique ou Missions.";
      } else {
        answer = "Je suis là pour t’aider à découvrir les missions CFOC ✨.";
      }
      setEmotion("happy");
      setReply(answer);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent text-white">
      <div className="flex flex-col items-center mb-6">
        <Image
          src={logo}
          alt="CFOC Impact Logo"
          width={220}
          height={220}
          className="mb-4"
        />
      </div>

      <div className="mb-8">
        <HopeAvatar emotion={emotion} />
      </div>

      <div className="text-lg text-white/90 italic mb-6 text-center max-w-xl">
        {reply}
      </div>

      <div className="flex items-center w-[90%] sm:w-[700px] bg-[#1a1a1a]/70 border border-white/10 rounded-lg px-4 py-3">
        <input
          type="text"
          placeholder="Écris à Hope..."
          className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
        />
        <button className="ml-3 text-gray-300 hover:text-white">🎤</button>
        <button className="ml-2 text-gray-300 hover:text-white">📤</button>
      </div>
    </div>
  );
}