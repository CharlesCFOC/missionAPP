"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import WorldGlobe3D from "@/components/WorldGlobe3D";

const missions = [
  {
    id: 1,
    title: "French Guiana Mission 2025 — School Construction",
    location: "Cayenne, French Guiana",
    date: "August 5 to 20, 2025",
    cost: 1850,
    included: ["Lodging", "Meals", "Local transportation"],
    contact: "jean.mbala@cfoc.org",
    image:
      "https://plus.unsplash.com/premium_photo-1664123873245-bd178d77ca19?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
  },
  {
    id: 2,
    title: "Zambia Mission — Clean Water Project",
    location: "Lusaka, Zambia",
    date: "July 10 to 25, 2025",
    cost: 1600,
    included: ["Lodging", "Meals", "Local training"],
    contact: "grace.mutale@cfoc.org",
    image:
      "https://images.unsplash.com/photo-1553775927-a071d5a6a39a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1574",
  },
  {
    id: 3,
    title: "Haiti Mission — Humanitarian Aid and Children",
    location: "Port-au-Prince, Haiti",
    date: "September 3 to 17, 2025",
    cost: 1450,
    included: ["Local transportation", "Meals", "Insurance"],
    contact: "luc.dorval@cfoc.org",
    image:
      "https://images.unsplash.com/photo-1612229693210-30e16029c415?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
  },
];

export default function MissionPage() {
  const missionCountries = new Set(
    missions
      .map((mission) => mission.location.split(",").pop()?.trim())
      .filter(Boolean)
  );
  const missionCosts = missions.map((mission) => mission.cost);
  const minCost = missionCosts.length ? Math.min(...missionCosts) : 0;
  const maxCost = missionCosts.length ? Math.max(...missionCosts) : 0;
  const averageCost = missionCosts.length
    ? Math.round(
        missionCosts.reduce((sum, cost) => sum + cost, 0) /
          missionCosts.length
      )
    : 0;
  const missionFacts = [
    { label: "Open missions", value: `${missions.length}` },
    { label: "Countries served", value: `${missionCountries.size}` },
    {
      label: "Cost range",
      value: `$${minCost.toLocaleString("en-US")} - $${maxCost.toLocaleString("en-US")}`,
    },
    { label: "Average cost", value: `$${averageCost.toLocaleString("en-US")}` },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#080313] via-[#260d5c] to-[#5d3ab9] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-8 md:px-10 md:py-10 mb-8">
          <div className="absolute -right-24 -top-24 h-[260px] w-[260px] md:h-[360px] md:w-[360px] lg:h-[420px] lg:w-[420px] opacity-70 pointer-events-none">
            <WorldGlobe3D
              showControls={false}
              heightClassName="h-full"
              className="w-full h-full"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b041d]/85 via-[#1d0b49]/55 to-transparent" />
          <div className="relative z-10 flex flex-col gap-4 md:gap-5">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">
              Mission trips
            </p>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-semibold leading-tight"
            >
              Go on a mission and make a difference.
            </motion.h1>
            <p className="text-sm md:text-base text-white/80 max-w-2xl">
              Discover open missionary trips and join a team to serve on the field.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const section = document.getElementById("globe-section");
                  section?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-[#ff9c4b] via-[#ffb86b] to-[#ff9c4b] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-black/20 transition hover:from-[#ffb86b] hover:via-[#ffd08b] hover:to-[#ff9c4b]"
              >
                Voir le globe
              </button>
              <span className="text-xs text-white/60">
                Browse upcoming trips ready to join.
              </span>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-xl border border-white/10 bg-white/5 p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-white/60 mb-2">
                Keyword
              </label>
              <input
                type="text"
                placeholder="Search missions..."
                className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b]/60 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]/30"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-white/60 mb-2">
                Price range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-1/2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b]/60 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]/30"
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-1/2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b]/60 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-white/60 mb-2">
                Departure
              </label>
              <select className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#ff9c4b]/60 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]/30">
                <option value="">Select...</option>
                <option>Canada</option>
                <option>France</option>
                <option>Switzerland</option>
                <option>USA</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-white/60 mb-2">
                Mission country
              </label>
              <select className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#ff9c4b]/60 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]/30">
                <option value="">Select...</option>
                <option>Zambia</option>
                <option>Haiti</option>
                <option>French Guiana</option>
                <option>Kenya</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-white/60 mb-2">
                Month
              </label>
              <input
                type="month"
                className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#ff9c4b]/60 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]/30"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-white/60 mb-2">
                Duration
              </label>
              <select className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#ff9c4b]/60 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]/30">
                <option value="">Select...</option>
                <option>1-2 weeks</option>
                <option>3-4 weeks</option>
                <option>1-2 months</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-white/60 mb-2">
                Mission type
              </label>
              <select className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#ff9c4b]/60 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]/30">
                <option value="">Select...</option>
                <option>Humanitarian</option>
                <option>Evangelism</option>
                <option>Educational</option>
                <option>Medical</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.25em] text-white/60 mb-2">
                Language
              </label>
              <select className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#ff9c4b]/60 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]/30">
                <option value="">Select...</option>
                <option>French</option>
                <option>English</option>
                <option>Bilingual</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between mt-4 gap-3">
            <button className="rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 hover:border-[#ff9c4b]/70 hover:text-white transition">
              Apply filters
            </button>
            <button className="text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white transition">
              Reset
            </button>
          </div>
        </section>

        <section
          id="mission-list"
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {missions.map((m) => {
            const country = m.location.split(",").pop()?.trim() ?? m.location;
            return (
              <div
                key={m.id}
                className="group overflow-hidden rounded-xl border border-white/10 transition hover:border-white/20"
              >
                <div className="relative h-56 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-300 ease-out group-hover:blur-[3px]"
                    style={{ backgroundImage: `url(${m.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b041d]/70 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 ease-out group-hover:opacity-100 group-focus-within:opacity-100">
                    <Link
                      href={`/missionDetails/${m.id}`}
                      className="rounded-full border border-white/40 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/20"
                    >
                      View mission
                    </Link>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-white">{m.title}</h3>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/60">
                    {country}
                  </p>
                  <p className="mt-3 text-sm text-white/75">
                    Total cost:{" "}
                    <span className="text-white font-semibold">
                      ${m.cost.toLocaleString("en-US")}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        <section
          id="globe-section"
          className="scroll-mt-24 mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8"
        >
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div className="w-full">
              <WorldGlobe3D heightClassName="h-[420px] md:h-[520px]" />
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                Global snapshot
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Key mission facts
              </h2>
              <p className="text-sm text-white/75 max-w-md">
                A quick view of the missions available right now and the
                regions they serve.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {missionFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-xl border border-white/10 bg-white/10 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                      {fact.label}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-[#ff9c4b]">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
