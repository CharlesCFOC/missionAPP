"use client";
import Image from "next/image";

const missions = [
  {
    title: "Water Wells in Zambia",
    desc: "Helping villages gain access to clean and safe drinking water.",
    img: "https://images.unsplash.com/photo-1612229693210-30e16029c415?q=80&w=870",
  },
  {
    title: "Orphanage in Ghana",
    desc: "Building hope and education for the next generation.",
    img: "https://images.unsplash.com/photo-1636813834441-bf49f09d0bab?q=80&w=774",
  },
  {
    title: "Community School in DRC",
    desc: "Empowering children through knowledge and support.",
    img: "https://images.unsplash.com/photo-1608452964553-9e7282b0b61b?q=80&w=870",
  },
];

export default function MissionsPreview() {
  return (
    <section className="py-20 text-center">
      <h2 className="text-4xl font-bold mb-12">Featured Missions</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        {missions.map((m, i) => (
          <div
            key={i}
            className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden hover:bg-white/20 transition"
          >
            <div className="relative h-56">
              <Image src={m.img} alt={m.title} fill className="object-cover" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{m.title}</h3>
              <p className="text-white/70 mb-4">{m.desc}</p>
              <button className="bg-[#271c70] hover:bg-[#ff9c4b] px-5 py-2 rounded-lg transition">
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}