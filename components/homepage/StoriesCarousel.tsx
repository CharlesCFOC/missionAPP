"use client";
import { useState } from "react";

const stories = [
  {
    name: "Sarah - Kenya",
    text: "This mission changed my life. I saw hope reborn in children’s eyes.",
  },
  {
    name: "Daniel - Haiti",
    text: "Serving with CFOC Impact showed me the power of love in action.",
  },
  {
    name: "Mila - Zambia",
    text: "Building wells brought clean water — and new beginnings — to our village.",
  },
];

export default function StoriesCarousel() {
  const [index, setIndex] = useState(0);
  const next = () => setIndex((index + 1) % stories.length);
  const prev = () => setIndex((index - 1 + stories.length) % stories.length);

  return (
    <section className="py-20 text-center bg-white/10">
      <h2 className="text-4xl font-bold mb-12">Stories of Impact</h2>
      <div className="max-w-3xl mx-auto bg-white/10 p-8 rounded-xl backdrop-blur-md">
        <p className="text-white/80 italic mb-4">“{stories[index].text}”</p>
        <p className="font-semibold text-[#ff9c4b]">{stories[index].name}</p>
        <div className="flex justify-center gap-6 mt-6">
          <button onClick={prev}>←</button>
          <button onClick={next}>→</button>
        </div>
      </div>
    </section>
  );
}