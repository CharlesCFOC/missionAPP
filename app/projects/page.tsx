"use client";
import { ReactNode, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const WorldGlobe3D = dynamic(() => import("@/components/WorldGlobe3D"), {
  ssr: false,
});

type ProjectMediaProps = {
  image: string;
  title: string;
  video?: string;
  href?: string;
  children?: ReactNode;
};

function ProjectCardMedia({ image, title, video, href, children }: ProjectMediaProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handlePlay = () => {
    const element = videoRef.current;
    if (!element) return;
    const playPromise = element.play();
    if (playPromise) {
      playPromise.catch(() => undefined);
    }
  };

  const handleStop = () => {
    const element = videoRef.current;
    if (!element) return;
    element.pause();
    element.currentTime = 0;
  };

  const content = (
    <>
      {video ? (
        <video
          ref={videoRef}
          src={video}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover transition duration-300 ease-out group-hover:blur-[3px]"
          aria-label={title}
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-300 ease-out group-hover:blur-[3px]"
          style={{ backgroundImage: `url(${image})` }}
          aria-label={title}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b041d]/70 via-transparent to-transparent" />
      {children}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="relative block h-56 overflow-hidden"
        onMouseEnter={handlePlay}
        onMouseLeave={handleStop}
        onFocus={handlePlay}
        onBlur={handleStop}
        aria-label={title}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className="relative h-56 overflow-hidden"
      onMouseEnter={handlePlay}
      onMouseLeave={handleStop}
      onFocus={handlePlay}
      onBlur={handleStop}
      aria-label={title}
    >
      {content}
    </div>
  );
}

export default function Projects() {
  const allProjects = [
    {
      id: 1,
      name: "Well construction in Zambia",
      country: "Zambia 🇿🇲",
      description: "Provide lasting access to safe drinking water for more than 200 families.",
      progress: 72,
      goal: 18000,
      raised: 12960,
      image: "https://images.unsplash.com/photo-1553775927-a071d5a6a39a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1574",
      video: "/videos/well-construction-zambia.mp4",
    },
    {
      id: 2,
      name: "Meal distribution in Ghana",
      country: "Ghana 🇬🇭",
      description: "Food relief program in the rural areas of Tamale.",
      progress: 45,
      goal: 8000,
      raised: 3600,
      image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80",
      video: "/videos/meal-distribution-ghana.mp4",
    },
    {
      id: 3,
      name: "Community school in DRC",
      country: "DRC 🇨🇩",
      description: "Support education by building a school for 120 children.",
      progress: 30,
      goal: 25000,
      raised: 7500,
      image: "https://images.unsplash.com/photo-1473649085228-583485e6e4d7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2064",
      video: "/videos/community-school-drc.mp4",
    },
  ];

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredProjects = allProjects
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc" ? a.progress - b.progress : b.progress - a.progress
    );

  const totalProjects = allProjects.length;
  const totalCountries = new Set(allProjects.map((project) => project.country)).size;
  const totalRaised = allProjects.reduce((sum, project) => sum + project.raised, 0);
  const totalGoal = allProjects.reduce((sum, project) => sum + project.goal, 0);
  const projectFacts = [
    { label: "Active projects", value: `${totalProjects}` },
    { label: "Countries represented", value: `${totalCountries}` },
    { label: "Funds raised", value: `$${totalRaised.toLocaleString("en-US")}` },
    { label: "Total funding goal", value: `$${totalGoal.toLocaleString("en-US")}` },
  ];

  return (
    <div className="bg-gradient-to-br from-[#080313] via-[#260d5c] to-[#5d3ab9] min-h-screen py-10 px-6 text-white">
      <div className="max-w-6xl mx-auto">
        <section className="mb-10">
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold leading-tight">
            Support real projects. Fund lasting impact.
          </h1>
          <p className="mt-3 text-sm md:text-base text-white/80 max-w-2xl">
            Every project is a concrete initiative with clear goals,
            transparent budgets, and measurable outcomes.
          </p>
        </section>

        <div id="project-list" className="scroll-mt-24"></div>
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div className="w-full md:w-1/2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2">
              Search
            </p>
            <input
              type="text"
              placeholder="Search for a project or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-white/20 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b]/60 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]/30"
            />
          </div>
          <div className="w-full md:w-56">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2">
              Sort by
            </p>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-md border border-white/20 bg-transparent px-4 py-2 text-sm text-white focus:border-[#ff9c4b]/60 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b]/30"
            >
              <option value="desc">Highest progress</option>
              <option value="asc">Lowest progress</option>
            </select>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-xl border border-white/10 transition hover:border-white/20"
            >
              <ProjectCardMedia
                image={p.image}
                title={p.name}
                video={p.video}
                href={`/projectDetails/${p.id}`}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 ease-out group-hover:opacity-100 group-focus-within:opacity-100">
                  <span className="rounded-full border border-white/40 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition group-hover:border-white/70 group-hover:bg-white/20">
                    View project
                  </span>
                </div>
              </ProjectCardMedia>
              <div className="p-4">
                <h3 className="text-base font-semibold text-white">
                  {p.name}
                </h3>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/60">
                  {p.country}
                </p>
              </div>
            </div>
          ))}
        </div>
        <section id="globe-section" className="scroll-mt-24 mt-12">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b041d]/70 p-6 md:p-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(79,165,255,0.35), transparent 55%), radial-gradient(circle at 80% 10%, rgba(255,156,75,0.25), transparent 50%)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />
            <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
              <div className="w-full">
                <WorldGlobe3D
                  showControls={false}
                  heightClassName="h-[420px] md:h-[520px]"
                />
              </div>
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/60">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                  Live globe
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  Global activity
                </h2>
                <p className="text-sm text-white/75 max-w-md">
                  A clean, realtime view of where projects are active and how
                  the network is growing.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {projectFacts.map((fact) => (
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
          </div>
        </section>
      </div>
    </div>
  );
}
