import { useEffect, useRef, useState } from "react";
import { FaFolder, FaPen, FaTrash } from "react-icons/fa";
import { DriveFolder } from "./types";

interface FolderCardProps {
  folder: DriveFolder;
  onOpen: (folder: DriveFolder) => void;
  onRename: (folderId: string, newName: string) => void;
  onDelete: (folderId: string) => void;
  disableDeletion?: boolean;
}

export default function FolderCard({
  folder,
  onDelete,
  onOpen,
  onRename,
  disableDeletion = false,
}: FolderCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(folder.name);
  }, [folder.name]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleRenameSubmit = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== folder.name) {
      onRename(folder.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleRenameSubmit();
    } else if (event.key === "Escape") {
      setName(folder.name);
      setIsEditing(false);
    }
  };

  const handleOpen = () => {
    if (isEditing) return;
    onOpen(folder);
  };

  return (
    <div
      className="group bg-white/10 backdrop-blur-md rounded-xl p-5 shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-2xl flex flex-col gap-4 cursor-pointer"
      onClick={handleOpen}
      onDoubleClick={handleOpen}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 text-[#ff9c4b]">
          <FaFolder className="text-2xl" />
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              onClick={(event) => event.stopPropagation()}
              className="w-full bg-transparent border-b border-white/30 focus:outline-none text-white placeholder:text-white/60"
            />
          ) : (
            <p className="text-lg font-semibold text-white truncate">
              {folder.name}
            </p>
          )}
          <p className="text-sm text-white/60">Double-click to open</p>
        </div>
      </div>
      <div className="flex justify-end items-center gap-3">
        <button
          onClick={(event) => {
            event.stopPropagation();
            setIsEditing(true);
          }}
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white hover:bg-[#ff9c4b] hover:text-black transition"
          aria-label={`Rename ${folder.name}`}
        >
          <FaPen />
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation();
            if (!disableDeletion) {
              onDelete(folder.id);
            }
          }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-white transition ${
            disableDeletion
              ? "bg-white/5 cursor-not-allowed opacity-50"
              : "bg-white/10 hover:bg-red-500/90"
          }`}
          aria-label={`Delete ${folder.name}`}
          disabled={disableDeletion}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}
