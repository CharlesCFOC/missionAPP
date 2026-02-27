"use client";

export default function JoinMovement() {
  return (
    <section className="py-20 text-center">
      <h2 className="text-4xl font-bold mb-6">Join the CFOC Impact Movement</h2>
      <p className="text-white/80 max-w-2xl mx-auto mb-10">
        Whether you donate, serve, or pray — your participation helps bring
        hope, faith, and tangible change to communities around the world.
      </p>
      <div className="flex justify-center gap-4">
        <button className="bg-[#ff9c4b] hover:bg-[#271c70] text-white px-6 py-3 rounded-lg font-semibold transition">
          Get Involved
        </button>
        <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition">
          Contact Us
        </button>
      </div>
    </section>
  );
}