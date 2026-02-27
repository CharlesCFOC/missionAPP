"use client";
import React from "react";
import { calculateProgress } from "./utils";
import { Project } from "./types";

interface Props {
  project: Project;
  onOpen: (id: string) => void;
}

export default function ProjectCard({ project, onOpen }: Props) {
  const progress = calculateProgress(project.tasks);
  return (
    <div
      onClick={() => onOpen(project.id)}
      className="cursor-pointer p-6 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
    >
      <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
      <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-3">
        <div
          className="h-full transition-all"
          style={{
            width: `${progress}%`,
            backgroundColor: `hsl(${30 + (progress / 100) * 90}, 100%, 50%)`,
          }}
        ></div>
      </div>
      <p className="text-sm text-white/70">
        {progress}% complete — {project.notes.length} notes
      </p>
    </div>
  );
}