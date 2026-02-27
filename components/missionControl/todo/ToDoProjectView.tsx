"use client";
import React, { useState } from "react";
import ToDoList from "./ToDoList";
import NotesWall from "./NotesWall";
import { Task, Note } from "./types";

export default function ToDoProjectView() {
  const [activeTab, setActiveTab] = useState<"todo" | "notes">("todo");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  return (
    <div className="p-6 bg-white/5 rounded-lg backdrop-blur-md border border-white/10 text-white">
      <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("todo")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "todo"
              ? "bg-[#4fa5ff] text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          To-Do List
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "notes"
              ? "bg-[#4fa5ff] text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          Notes
        </button>
      </div>

      {activeTab === "todo" ? (
        <ToDoList tasks={tasks} setTasks={setTasks} />
      ) : (
        <NotesWall notes={notes} setNotes={setNotes} />
      )}
    </div>
  );
}