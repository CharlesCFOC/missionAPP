"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";
import { Note } from "./types";
import { randomId } from "./utils";
import { marked } from "marked";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

const colors = ["#FFD966", "#A5E7FF", "#DDA0DD", "#98FB98", "#FFB6C1"];

interface Props {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
}

// Configure marked for advanced markdown rendering
marked.use({
  gfm: true,
  breaks: true,
  smartLists: true,
  smartypants: true,
  headerIds: false,
  mangle: false,
  renderer: {
    list(body, ordered) {
      return ordered
        ? `<ol style="margin-left: 20px; list-style-type: decimal;">${body}</ol>`
        : `<ul style="margin-left: 20px; list-style-type: disc;">${body}</ul>`;
    },
    strong(text) {
      return `<strong style="font-weight:700;">${text}</strong>`;
    },
    em(text) {
      return `<em style="font-style:italic;">${text}</em>`;
    },
  },
});

export default function NotesWall({ notes, setNotes }: Props) {
  const safeNotes = notes || [];
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const editorValueRef = useRef<string>("");

  const [placeholderText, setPlaceholderText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const fullPlaceholder = "Write your note here...";

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  useEffect(() => {
    if (isTyping) return;

    let isMounted = true;
    let index = 0;
    let forward = true;
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const type = () => {
      if (!isMounted) return;
      if (forward) {
        if (index <= fullPlaceholder.length) {
          setPlaceholderText(fullPlaceholder.slice(0, index));
          index++;
        } else {
          forward = false;
          clearInterval(intervalId);
          timeoutId = setTimeout(() => {
            intervalId = setInterval(type, 100);
          }, 1000);
        }
      } else {
        if (index >= 0) {
          setPlaceholderText(fullPlaceholder.slice(0, index));
          index--;
        } else {
          forward = true;
          clearInterval(intervalId);
          timeoutId = setTimeout(() => {
            intervalId = setInterval(type, 100);
          }, 500);
        }
      }
    };

    intervalId = setInterval(type, 100);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isTyping]);

  const handleEditorChange = useCallback((value: string) => {
    if (value.trim() !== "") setIsTyping(true);
    else setIsTyping(false);
    editorValueRef.current = value;
  }, []);

  const addNote = () => {
    const content = editorValueRef.current.trim();
    if (!content) return;

    if (editingNoteId) {
      setNotes(
        safeNotes.map((n) =>
          n.id === editingNoteId ? { ...n, content: content, color: selectedColor } : n
        )
      );
      setEditingNoteId(null);
      setSelectedNoteId(null);
      editorValueRef.current = "";
      if (editorRef.current && editorRef.current.value !== undefined) {
        editorRef.current.value = "";
      }
      setTimeout(() => {
        if (editorRef.current?.simpleMde) {
          editorRef.current.simpleMde.value("");
        }
      }, 0);
      return;
    }

    const note: Note = {
      id: randomId(),
      title: "Untitled",
      content: content,
      color: selectedColor,
      createdAt: new Date().toISOString(),
    };
    setNotes([...safeNotes, note]);
    editorValueRef.current = "";
    if (editorRef.current && editorRef.current.value !== undefined) {
      editorRef.current.value = "";
    }
    setTimeout(() => {
      if (editorRef.current?.simpleMde) {
        editorRef.current.simpleMde.value("");
      }
    }, 0);
  };

  const deleteNote = (id: string) => {
    setNotes(safeNotes.filter((n) => n.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setEditingNoteId(null);
      editorValueRef.current = "";
      if (editorRef.current && editorRef.current.value !== undefined) {
        editorRef.current.value = "";
      }
      setTimeout(() => {
        if (editorRef.current?.simpleMde) {
          editorRef.current.simpleMde.value("");
        }
      }, 0);
    }
  };

  const toggleSelectNote = (id: string) => {
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setEditingNoteId(null);
      editorValueRef.current = "";
      if (editorRef.current && editorRef.current.value !== undefined) {
        editorRef.current.value = "";
      }
      setTimeout(() => {
        if (editorRef.current?.simpleMde) {
          editorRef.current.simpleMde.value("");
        }
      }, 0);
    } else {
      setSelectedNoteId(id);
      setEditingNoteId(id);
      const note = safeNotes.find(n => n.id === id);
      if (note) {
        editorValueRef.current = note.content;
        setSelectedColor(note.color);
        if (editorRef.current?.simpleMde) {
          editorRef.current.simpleMde.value(note.content);
        }
      }
    }
  };

  return (
    <div className="w-full text-white relative">
      <div className="opacity-100 transition-opacity duration-500">
        <div className="flex flex-col gap-3 mb-6">
          <div className="rounded-lg backdrop-blur-lg bg-white/10 border border-white/20 p-2">
            <SimpleMDE
              ref={editorRef}
              value={editingNoteId ? safeNotes.find(n => n.id === editingNoteId)?.content || "" : ""}
              onChange={handleEditorChange}
              options={{
                spellChecker: false,
                placeholder: placeholderText,
                toolbar: [
                  "bold",
                  "italic",
                  "strikethrough",
                  "unordered-list",
                  "ordered-list",
                  "clean",
                ],
                autofocus: true,
                minHeight: "120px",
                status: false,
              }}
            />
            <div className="mt-4">
              <p className="text-white mb-2 font-semibold">Select Color:</p>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition ${
                      selectedColor === color
                        ? "border-white"
                        : "border-transparent"
                    }`}
                    style={{
                      backgroundColor: color,
                      borderWidth: selectedColor === color ? '3px' : undefined,
                    }}
                    aria-label={`Select color ${color}`}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 self-end">
            <button
              onClick={addNote}
              className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 hover:opacity-90 transition text-white px-4 py-2 rounded-md"
              type="button"
            >
              {editingNoteId ? "Save Changes" : "Add Note"}
            </button>
            {selectedNoteId && (
              <button
                onClick={() => deleteNote(selectedNoteId)}
                className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 hover:opacity-90 transition text-white px-4 py-2 rounded-md"
                type="button"
                aria-label="Delete Note"
              >
                Delete Note
              </button>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {safeNotes.map((note) => {
            const isSelected = selectedNoteId === note.id;
            return (
              <div
                key={note.id}
                className={`relative cursor-pointer group`}
                onClick={() => toggleSelectNote(note.id)}
              >
                <div
                  className={`relative p-4 rounded-md text-black shadow-lg backdrop-blur-md transition-all hover:translate-y-[-2px] hover:scale-[1.02] duration-300 border border-white/10 ${
                    isSelected ? "ring-4 ring-white" : ""
                  }`}
                  style={{ backgroundColor: note.color }}
                >
                  <div
                    className="prose prose-sm text-black"
                    dangerouslySetInnerHTML={{
  __html: marked.parse(note.content || "", { gfm: true, breaks: true }),
}}
                  />
                </div>
              </div>
            );
          })}
          {safeNotes.length === 0 && (
            <p className="text-white/70 text-center mt-4">
              No notes yet — start by adding one!
            </p>
          )}
        </div>
      </div>

      <style jsx global>{`
        .CodeMirror {
          background: transparent !important;
          color: white !important;
          border-radius: 8px;
        }

        .CodeMirror-cursor {
          border-left: 2px solid white !important;
        }

        .editor-toolbar {
          background: transparent !important;
          border-radius: 8px 8px 0 0;
          border: none !important;
        }

        .editor-toolbar button {
          color: white !important;
          opacity: 0.8;
        }

        .editor-toolbar button:hover {
          opacity: 1;
        }

        .editor-toolbar button.active {
          background-color: white !important;
          color: black !important;
          border-radius: 4px;
        }

        .CodeMirror .cm-strong,
        .CodeMirror .cm-em {
          color: white !important;
        }

        .prose strong {
          font-weight: 700;
          color: black;
        }

        .prose em {
          font-style: italic;
          color: black;
        }

        .prose ul, .prose ol {
          margin-left: 1.5rem;
          color: black;
        }

        .prose li {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}