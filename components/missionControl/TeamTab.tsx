"use client";

import { useState } from "react";
import MissionTeamsTab from "./team/MissionTeamsTab";
import ProjectTeamsTab from "./team/ProjectTeamsTab";

type TeamTabKey = "mission" | "project";

export default function TeamTab() {
  const [activeTab, setActiveTab] = useState<TeamTabKey>("mission");

  return (
    <main className="min-h-screen bg-transparent px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap justify-center items-center gap-6">
          <button
            onClick={() => setActiveTab("mission")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "mission"
                ? "bg-[#4fa5ff] text-black"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            Mission Teams
          </button>

          <div className="h-8 w-px bg-white/60 rounded-full" />

          <button
            onClick={() => setActiveTab("project")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "project"
                ? "bg-[#4fa5ff] text-black"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            Project Teams
          </button>
        </div>

        {activeTab === "mission" ? <MissionTeamsTab /> : <ProjectTeamsTab />}
      </div>
    </main>
  );
}
