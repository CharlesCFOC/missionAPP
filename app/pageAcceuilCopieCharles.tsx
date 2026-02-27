"use client";

import HopeAssistant from "@/components/HopeAssistant";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-[#000000] via-[#301835] to-[#b491e6] text-white">
      <HopeAssistant />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 mb-16 w-[90%] max-w-6xl">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg hover:bg-white/20 transition text-center">
          <h3 className="text-2xl font-semibold mb-4">Mission Trip</h3>
          <p className="text-sm mb-4">Discover our mission trips and join a team on the ground.</p>
          <Link href="/missions">
            <button className="bg-[#271c70] hover:bg-[#ff9c4b] text-white px-5 py-2 rounded-lg transition">
              Discover
            </button>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg hover:bg-white/20 transition text-center">
          <h3 className="text-2xl font-semibold mb-4">Shop</h3>
          <p className="text-sm mb-4">Purchase solidarity items to support local and international missions.</p>
          <Link href="/boutique">
            <button className="bg-[#271c70] hover:bg-[#ff9c4b] text-white px-5 py-2 rounded-lg transition">
              Explore
            </button>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg hover:bg-white/20 transition text-center">
          <h3 className="text-2xl font-semibold mb-4">Project</h3>
          <p className="text-sm mb-4">Support tangible projects led by our missionaries in the field.</p>
          <Link href="/projects">
            <button className="bg-[#271c70] hover:bg-[#ff9c4b] text-white px-5 py-2 rounded-lg transition">
              See more
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
