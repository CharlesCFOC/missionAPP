"use client";
import React, { useState } from "react";

interface Props {
  onAdd: (name: string) => void;
}

export default function AddProjectModal({ onAdd }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name);
    setName("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex gap-2"
    >
      <input
        type="text"
        placeholder="Project name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 p-2 rounded-md bg-transparent border border-white/20 text-white placeholder-white/50"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-[#4fa5ff] text-white rounded-md hover:bg-[#ff9c4b] transition"
      >
        Add
      </button>
    </form>
  );
}