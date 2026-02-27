"use client";

import { useState } from "react";

export default function HopeChatBox({ onMessage }: { onMessage: (msg: string) => void }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onMessage(input);
    setInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex justify-center mt-4 bg-white shadow-md rounded-full w-[90%] sm:w-[500px] mx-auto"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Parle à Hope..."
        className="flex-1 px-4 py-3 text-gray-700 outline-none rounded-l-full"
      />
      <button
        type="submit"
        className="bg-[#271c70] hover:bg-[#ff9c4b] text-white px-5 rounded-r-full font-semibold"
      >
        Envoyer
      </button>
    </form>
  );
}