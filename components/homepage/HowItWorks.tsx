"use client";
import { FaHandsHelping, FaDonate, FaGlobe } from "react-icons/fa";

const steps = [
  {
    icon: <FaHandsHelping size={40} />,
    title: "Join",
    desc: "Be part of a movement bringing hope through service and compassion.",
  },
  {
    icon: <FaDonate size={40} />,
    title: "Give",
    desc: "Your support fuels sustainable projects across the globe.",
  },
  {
    icon: <FaGlobe size={40} />,
    title: "Go",
    desc: "Travel with a team and make a tangible difference where it’s needed most.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white/5 text-center">
      <h2 className="text-4xl font-bold mb-12">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((s, i) => (
          <div
            key={i}
            className="bg-white/10 backdrop-blur-md p-8 rounded-xl hover:bg-white/20 transition"
          >
            <div className="text-[#ff9c4b] mb-4 flex justify-center">{s.icon}</div>
            <h3 className="text-2xl font-semibold mb-2">{s.title}</h3>
            <p className="text-white/70">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}