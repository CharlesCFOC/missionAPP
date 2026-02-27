"use client";

import React from "react";

export default function ProjectsTab() {
  // 👉 Placeholder en attendant Supabase
  const followedProjects: any[] = [];

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">My Projects</h2>
      <p className="text-white/70">
        Track the projects you follow and receive updates in real time.
      </p>

      {followedProjects.length === 0 ? (
        <div className="text-white/60 italic">
          Aucun projet suivi pour le moment.
        </div>
      ) : (
        <div className="grid gap-4">
          {followedProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-white"
            >
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <p className="text-white/70 text-sm mt-1">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
