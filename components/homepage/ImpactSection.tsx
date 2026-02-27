"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
const WorldGlobe3D = dynamic(() => import("@/components/WorldGlobe3D"), { ssr: false });

export default function ImpactSection() {
  return (
    <section className="relative py-20 px-6 md:px-16 text-white">
      <div className="w-[95%] max-w-[2000px] mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-10 md:p-20 shadow-2xl border border-white/10 flex flex-col lg:flex-row items-stretch justify-between gap-24">
        
        {/* LEFT SIDE - STATS */}
        <div className="md:w-[45%] flex flex-col space-y-10 justify-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4b6bff] mb-2">
            Global Impact
          </h2>

          <div className="space-y-6">
            <div>
              <p className="text-4xl md:text-5xl font-extrabold text-white">42</p>
              <p className="text-gray-300 text-sm md:text-base tracking-wide">
                Countries reached
              </p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-extrabold text-white">128</p>
              <p className="text-gray-300 text-sm md:text-base tracking-wide">
                Wells built
              </p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-extrabold text-white">3100</p>
              <p className="text-gray-300 text-sm md:text-base tracking-wide">
                Children educated
              </p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-extrabold text-white">5800</p>
              <p className="text-gray-300 text-sm md:text-base tracking-wide">
                Lives impacted
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - MAP + PROGRESS */}
        <div className="md:w-[55%] flex flex-col items-center justify-center mx-auto text-center relative">
          <div className="w-[90%] h-[550px] lg:h-[650px] flex items-center justify-center mx-auto">
            <WorldGlobe3D />
          </div>

          {/* Donation Progress */}
          <div className="w-full mt-8">
            <p className="text-center text-sm text-gray-300 mb-2">
              This Month’s Donations
            </p>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[75%] bg-gradient-to-r from-[#4b6bff] via-[#b26df0] to-[#7b3fe4] transition-all duration-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}