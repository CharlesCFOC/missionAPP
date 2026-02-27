import { CSSProperties } from "react";
import Link from "next/link";
import LoopingVideo from "@/components/home/LoopingVideo";

export default function HomePage() {
  const heroTitle = "CFOC Impact";
  const cardActionClass =
    "rounded-full border border-[#ff9a3d] bg-[#ff9a3d]/40 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-[#38bdf8] hover:bg-[#38bdf8]/40";
  const auroraStyle = {
    "--aurora-1": "rgba(166, 2, 255, 1)",
    "--aurora-2": "rgba(249, 180, 255, 0.99)",
    "--aurora-3": "rgba(151, 17, 161, 0.52)",
    "--aurora-4": "rgba(7, 244, 55, 1)",
  } as CSSProperties;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#080313] via-[#260d5c] to-[#5d3ab9] text-white overflow-hidden">
      <div
        className="absolute inset-0 mission-aurora pointer-events-none"
        style={auroraStyle}
        aria-hidden="true"
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#080313]/80 via-[#260d5c]/70 to-[#080313]/80" />
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {heroTitle}
          </h1>
          <p className="mt-4 text-sm text-white/70 sm:text-base">
            Volunteer coordination, missions, and projects — in one place.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="group relative">
            <div className="relative flex min-h-[240px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/25 hover:bg-white/10">
              <div className="pointer-events-none absolute inset-0 opacity-100 transition duration-500 ease-out">
                <LoopingVideo
                  src="/videos/sora-enfant-en-asie.mp4"
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  playbackRate={0.7}
                  className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03] group-hover:saturate-125"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#080313]/70 via-[#0a102b]/35 to-[#080313]/70"
                  aria-hidden="true"
                />
              </div>
              <div className="relative z-10 flex flex-1 flex-col">
                <h2 className="text-lg font-semibold text-white">
                  For Volunteers & Students
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  Find volunteer opportunities, manage your shifts, and gain experience at
                  your own pace.
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  <Link
                    href="/volunteerHub"
                    className={cardActionClass}
                  >
                    Open hub
                  </Link>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-2xl border border-white/10 bg-white/10 p-4 opacity-0 translate-y-1 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
                How to get active
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-white/90">
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  <span>Create an account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  <span>Fill your profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  <span>Search and apply for volunteer opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  <span>Meet with the organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  <span>Your journey begins</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="group relative">
            <div className="relative flex min-h-[240px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/25 hover:bg-white/10">
              <div className="pointer-events-none absolute inset-0 opacity-100 transition duration-500 ease-out">
                <video
                  src="/videos/support-project.mp4"
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03] group-hover:saturate-125"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#080313]/70 via-[#0a102b]/35 to-[#080313]/70"
                  aria-hidden="true"
                />
              </div>
              <div className="relative z-10 flex flex-1 flex-col">
                <h2 className="text-lg font-semibold text-white">Missions & Projects</h2>
                <p className="mt-2 text-sm text-white/70">
                  Find a mission trip to join or a project to support.
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  <Link
                    href="/missions"
                    className={cardActionClass}
                  >
                    Mission trips
                  </Link>
                  <Link
                    href="/projects"
                    className={cardActionClass}
                  >
                    Projects
                  </Link>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-2xl border border-white/10 bg-white/10 p-4 opacity-0 translate-y-1 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
                Key steps
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-white/90">
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  <span>Explore mission trips and active projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  <span>Review goals, timeline, and expected impact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  <span>Pick the mission or project that fits you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  <span>Join the team and contribute</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="group relative">
            <div className="relative flex min-h-[240px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/25 hover:bg-white/10">
              <div className="pointer-events-none absolute inset-0 opacity-100 transition duration-500 ease-out">
                <video
                  src="/videos/mission-manager.mp4"
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03] group-hover:saturate-125"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#080313]/70 via-[#0a102b]/35 to-[#080313]/70"
                  aria-hidden="true"
                />
              </div>
              <div className="relative z-10 flex flex-1 flex-col">
                <h2 className="text-lg font-semibold text-white">For Organizations</h2>
                <p className="mt-2 text-sm text-white/70">
                  Post roles, plan shifts, and approve timesheets with clarity.
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  <Link
                    href="/volunteerManager"
                    className={cardActionClass}
                  >
                    Volunteer manager
                  </Link>
                  <Link
                    href="/missionManager"
                    className={cardActionClass}
                  >
                    Mission manager
                  </Link>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-2xl border border-white/10 bg-white/10 p-4 opacity-0 translate-y-1 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
                Key steps
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-white/90">
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  <span>Create your organization account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  <span>Fill your profile and publish opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  <span>Review applicants and plan shifts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  <span>Approve timesheets and track impact</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
