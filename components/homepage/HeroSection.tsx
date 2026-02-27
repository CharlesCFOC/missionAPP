"use client";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const WorldGlobe3D = dynamic(() => import("@/components/WorldGlobe3D"), {
  ssr: false,
});

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center min-h-[90vh] overflow-hidden">
      <WorldGlobe3D />
      <motion.div
        className="relative z-10 max-w-3xl mx-auto px-6 bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Bringing Hope. Building Impact.
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-8">
          Join our global movement empowering communities through missions,
          compassion, and faith.
        </p>
        <div className="flex justify-center gap-4">
          <button className="hover:bg-[#ff9c4b] px-6 py-3 rounded-lg font-semibold transition">
            Join a Mission
          </button>
          <button className="hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition">
            Learn More
          </button>
        </div>
      </motion.div>
    </section>
  );
}