"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function NotesSection() {
  const [notes, setNotes] = useState([
    { id: 1, title: "Prepare team orientation", content: "Include medical forms and travel tips." },
    { id: 2, title: "Post-mission report", content: "Collect photos, testimonies, and feedback." },
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const addNote = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setNotes([...notes, { id: Date.now(), title: newTitle, content: newContent }]);
    setNewTitle("");
    setNewContent("");
  };

  const deleteNote = (id: number) => setNotes(notes.filter((n) => n.id !== id));

  return (
    <div className="p-6 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#4fa5ff]">Mission Notes</h2>

      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Note title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full p-2 rounded bg-white/20 text-white placeholder-white/50"
        />
        <textarea
          placeholder="Write your note..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="w-full p-2 rounded bg-white/20 text-white placeholder-white/50 h-24"
        />
        <button
          onClick={addNote}
          className="px-4 py-2 bg-[#4fa5ff] hover:bg-[#8cc4ff] text-black font-semibold rounded"
        >
          + Add Note
        </button>
      </div>

      <div className="space-y-3">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            className="p-4 bg-white/5 rounded-lg shadow-md hover:bg-white/10 transition"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg text-[#8cc4ff]">{note.title}</h3>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-500 hover:text-red-400 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-white/80">{note.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}