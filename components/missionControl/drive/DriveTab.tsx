"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowLeft, FaFolderPlus, FaPen, FaTrash } from "react-icons/fa";
import FileUpload from "./FileUpload";
import FileCard from "./FileCard";
import FolderCard from "./FolderCard";
import { DriveFile, DriveFileType, DriveFolder } from "./types";
import {
  readStoredDriveFolders,
  removeStoredDriveFolder,
  updateStoredDriveFolderName,
} from "../storage";

const formatFileSize = (sizeInBytes: number) => {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = sizeInBytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const formatted = value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted} ${units[unitIndex]}`;
};

const resolveFileType = (file: File): DriveFileType => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (
    file.type === "application/pdf" ||
    file.type.startsWith("text/") ||
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "application/vnd.ms-excel" ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "document";
  }
  return "other";
};

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const cloneFolder = (folder: DriveFolder): DriveFolder => ({
  ...folder,
  subfolders: folder.subfolders.map(cloneFolder),
  files: folder.files.map((file) => ({ ...file })),
});

const findFolderById = (nodes: DriveFolder[], id: string): DriveFolder | null => {
  for (const folder of nodes) {
    if (folder.id === id) return folder;
    const nested = findFolderById(folder.subfolders, id);
    if (nested) return nested;
  }
  return null;
};

const findParentFolder = (nodes: DriveFolder[], targetId: string): DriveFolder | null => {
  for (const folder of nodes) {
    if (folder.subfolders.some((sub) => sub.id === targetId)) {
      return folder;
    }
    const nested = findParentFolder(folder.subfolders, targetId);
    if (nested) return nested;
  }
  return null;
};

const findFolderContainingFile = (nodes: DriveFolder[], fileId: string): DriveFolder | null => {
  for (const folder of nodes) {
    if (folder.files.some((file) => file.id === fileId)) {
      return folder;
    }
    const nested = findFolderContainingFile(folder.subfolders, fileId);
    if (nested) return nested;
  }
  return null;
};

const collectFilesWithinFolder = (folder: DriveFolder): DriveFile[] => {
  const collected: DriveFile[] = [...folder.files];
  folder.subfolders.forEach((sub) => {
    collected.push(...collectFilesWithinFolder(sub));
  });
  return collected;
};

const initialFolders: DriveFolder[] = [
  {
    id: "root",
    name: "Root",
    parentId: null,
    subfolders: [
      {
        id: "mission-reports",
        name: "Mission Reports",
        parentId: "root",
        subfolders: [
          {
            id: "reports-2025",
            name: "2025 Reports",
            parentId: "mission-reports",
            subfolders: [],
            files: [
              {
                id: "kenya-medical-report",
                name: "KenyaMedicalMission.pdf",
                parentId: "reports-2025",
                type: "document",
                size: "3.8 MB",
                date: "2025-10-12T08:00:00.000Z",
                previewUrl: "https://example.com/KenyaMedicalMission.pdf",
              },
              {
                id: "zambia-community-report",
                name: "ZambiaCommunity.docx",
                parentId: "reports-2025",
                type: "document",
                size: "1.2 MB",
                date: "2025-10-15T09:30:00.000Z",
                previewUrl: "https://example.com/ZambiaCommunity.docx",
              },
            ],
          },
        ],
        files: [
          {
            id: "mission-overview",
            name: "MissionOverview2024.pdf",
            parentId: "mission-reports",
            type: "document",
            size: "2.6 MB",
            date: "2025-01-05T12:00:00.000Z",
            previewUrl: "https://example.com/MissionOverview2024.pdf",
          },
        ],
      },
      {
        id: "photos-folder",
        name: "Photos",
        parentId: "root",
        subfolders: [],
        files: [
          {
            id: "team-photo",
            name: "team_photo.jpg",
            parentId: "photos-folder",
            type: "image",
            size: "4.0 MB",
            date: "2025-11-02T10:00:00.000Z",
            previewUrl: "/LogoApp.png",
          },
          {
            id: "kenya-video-preview",
            name: "kenya_update.mp4",
            parentId: "photos-folder",
            type: "video",
            size: "45 MB",
            date: "2025-11-04T17:10:00.000Z",
            previewUrl: "/videos/mission.mp4",
          },
        ],
      },
    ],
    files: [
      {
        id: "mission-guide",
        name: "mission_guide.pdf",
        parentId: "root",
        type: "document",
        size: "2.3 MB",
        date: "2025-11-05T08:30:00.000Z",
        previewUrl: "https://example.com/mission_guide.pdf",
      },
      {
        id: "project-budget",
        name: "project_budget.xlsx",
        parentId: "root",
        type: "document",
        size: "1.8 MB",
        date: "2025-10-28T11:45:00.000Z",
        previewUrl: "https://example.com/project_budget.xlsx",
      },
    ],
  },
];

export default function DriveTab() {
  const [folders, setFolders] = useState<DriveFolder[]>(initialFolders);
  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const objectUrlMap = useRef<Map<string, string>>(new Map());
  const newFolderInputRef = useRef<HTMLInputElement | null>(null);
  // For renaming state
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState<string>("");
  const renamingInputRef = useRef<HTMLInputElement | null>(null);
  // Drag-and-drop states
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [isDragOverFolder, setIsDragOverFolder] = useState<string | null>(null);
  // Handle file drop into folder
  const handleFileDrop = (targetFolderId: string) => {
    if (!draggedFileId || targetFolderId === currentFolderId) return;
    setFolders((prev) => {
      const cloned = prev.map(cloneFolder);
      const sourceFolder = findFolderContainingFile(cloned, draggedFileId);
      const targetFolder = findFolderById(cloned, targetFolderId);
      if (!sourceFolder || !targetFolder) return prev;
      const file = sourceFolder.files.find((f) => f.id === draggedFileId);
      if (!file) return prev;
      sourceFolder.files = sourceFolder.files.filter((f) => f.id !== draggedFileId);
      file.parentId = targetFolderId;
      targetFolder.files.push(file);
      return cloned;
    });
    setDraggedFileId(null);
  };

  const currentFolder = useMemo(() => {
    const located = findFolderById(folders, currentFolderId);
    if (located) return located;
    return folders[0] ?? null;
  }, [folders, currentFolderId]);

  useEffect(() => {
    if (!currentFolder && folders[0]) {
      setCurrentFolderId(folders[0].id);
    }
  }, [currentFolder, folders]);

  useEffect(() => {
    if (isCreatingFolder) {
      const timeout = setTimeout(() => newFolderInputRef.current?.focus(), 10);
      return () => clearTimeout(timeout);
    }
  }, [isCreatingFolder]);

  useEffect(() => {
    return () => {
      objectUrlMap.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlMap.current.clear();
    };
  }, []);

  useEffect(() => {
    const stored = readStoredDriveFolders();
    if (stored.length === 0) return;
    setFolders((prev) => {
      const cloned = prev.map(cloneFolder);
      const rootFolder = findFolderById(cloned, "root");
      if (!rootFolder) return prev;
      const existingIds = new Set(rootFolder.subfolders.map((folder) => folder.id));
      stored.forEach((folder) => {
        if (existingIds.has(folder.id)) return;
        rootFolder.subfolders.push({
          id: folder.id,
          name: folder.name,
          parentId: "root",
          subfolders: [],
          files: [],
        });
      });
      return cloned;
    });
  }, []);

  const handleBack = () => {
    if (currentFolder?.parentId) {
      setCurrentFolderId(currentFolder.parentId);
      setSearchTerm("");
    }
  };

  const handleFolderOpen = (folder: DriveFolder) => {
    setCurrentFolderId(folder.id);
    setSearchTerm("");
  };

  const handleFolderRename = (folderId: string, name: string) => {
    setFolders((prev) => {
      const cloned = prev.map(cloneFolder);
      const target = findFolderById(cloned, folderId);
      if (!target) return prev;
      target.name = name;
      return cloned;
    });
    updateStoredDriveFolderName(folderId, name);
  };

  const handleFileRename = (fileId: string, name: string) => {
    setFolders((prev) => {
      const cloned = prev.map(cloneFolder);
      // Find the folder containing the file
      const containingFolder = findFolderContainingFile(cloned, fileId);
      if (!containingFolder) return prev;
      const file = containingFolder.files.find((f) => f.id === fileId);
      if (!file) return prev;
      file.name = name;
      return cloned;
    });
  };

  const releaseObjectUrlsForFolder = (folder: DriveFolder) => {
    collectFilesWithinFolder(folder).forEach((file) => {
      const url = objectUrlMap.current.get(file.id);
      if (url) {
        URL.revokeObjectURL(url);
        objectUrlMap.current.delete(file.id);
      }
    });
  };

  const handleFolderDelete = (folderId: string) => {
    if (folderId === "root") return;
    const folderToDelete = findFolderById(folders, folderId);
    if (!folderToDelete) return;
    releaseObjectUrlsForFolder(folderToDelete);
    setFolders((prev) => {
      const cloned = prev.map(cloneFolder);
      const parent = findParentFolder(cloned, folderId);
      if (!parent) return prev;
      parent.subfolders = parent.subfolders.filter((sub) => sub.id !== folderId);
      return cloned;
    });
    if (currentFolderId === folderId) {
      setCurrentFolderId(folderToDelete.parentId ?? "root");
    }
    removeStoredDriveFolder(folderId);
  };

  const handleFolderCreation = () => {
    const trimmed = newFolderName.trim();
    if (!trimmed || !currentFolder) {
      setIsCreatingFolder(false);
      setNewFolderName("");
      return;
    }
    const newFolder: DriveFolder = {
      id: generateId(),
      name: trimmed,
      parentId: currentFolder.id,
      subfolders: [],
      files: [],
    };
    setFolders((prev) => {
      const cloned = prev.map(cloneFolder);
      const target = findFolderById(cloned, currentFolder.id);
      if (!target) return prev;
      target.subfolders = [newFolder, ...target.subfolders];
      return cloned;
    });
    setIsCreatingFolder(false);
    setNewFolderName("");
  };

  const handleFilesSelected = (selected: File[]) => {
    if (!currentFolder || selected.length === 0) return;
    const newFiles: DriveFile[] = selected.map((file) => {
      const id = generateId();
      const previewUrl = URL.createObjectURL(file);
      objectUrlMap.current.set(id, previewUrl);
      return {
        id,
        name: file.name,
        parentId: currentFolder.id,
        type: resolveFileType(file),
        size: formatFileSize(file.size),
        date: new Date().toISOString(),
        previewUrl,
        isObjectUrl: true,
      };
    });

    setFolders((prev) => {
      const cloned = prev.map(cloneFolder);
      const target = findFolderById(cloned, currentFolder.id);
      if (!target) return prev;
      target.files = [...newFiles, ...target.files];
      return cloned;
    });
  };

  const handleFileDelete = (fileId: string) => {
    const containingFolder = findFolderContainingFile(folders, fileId);
    if (!containingFolder) return;

    const url = objectUrlMap.current.get(fileId);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrlMap.current.delete(fileId);
    }

    setFolders((prev) => {
      const cloned = prev.map(cloneFolder);
      const target = findFolderById(cloned, containingFolder.id);
      if (!target) return prev;
      target.files = target.files.filter((file) => file.id !== fileId);
      return cloned;
    });
  };

  // Removed handlePreview and preview logic

  const visibleSubfolders = useMemo(() => {
    if (!currentFolder) return [];
    const normalized = searchTerm.trim().toLowerCase();
    const filtered = normalized
      ? currentFolder.subfolders.filter((folder) =>
          folder.name.toLowerCase().includes(normalized)
        )
      : currentFolder.subfolders;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [currentFolder, searchTerm]);

  const visibleFiles = useMemo(() => {
    if (!currentFolder) return [];
    const normalized = searchTerm.trim().toLowerCase();
    const filtered = normalized
      ? currentFolder.files.filter((file) =>
          file.name.toLowerCase().includes(normalized)
        )
      : currentFolder.files;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [currentFolder, searchTerm]);

  if (!currentFolder) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-white/70">
        Drive content is not available.
      </div>
    );
  }

  const noResults = visibleSubfolders.length === 0 && visibleFiles.length === 0;

  // Focus renaming input when renaming
  useEffect(() => {
    if (renamingFolderId || renamingFileId) {
      const timeout = setTimeout(() => renamingInputRef.current?.focus(), 10);
      return () => clearTimeout(timeout);
    }
  }, [renamingFolderId, renamingFileId]);

  // Handle rename commit for both folder and file
  const commitRename = () => {
    const trimmed = renamingName.trim();
    if (renamingFolderId) {
      if (trimmed) handleFolderRename(renamingFolderId, trimmed);
      setRenamingFolderId(null);
      setRenamingName("");
    } else if (renamingFileId) {
      if (trimmed) handleFileRename(renamingFileId, trimmed);
      setRenamingFileId(null);
      setRenamingName("");
    }
  };

  const cancelRename = () => {
    setRenamingFolderId(null);
    setRenamingFileId(null);
    setRenamingName("");
  };

  // Breadcrumb utility
  const getFolderPath = (folderId: string, allFolders: DriveFolder[]): DriveFolder[] => {
    const folder = findFolderById(allFolders, folderId);
    if (!folder) return [];
    const path: DriveFolder[] = [folder];
    let parent = findParentFolder(allFolders, folder.id);
    while (parent) {
      path.unshift(parent);
      parent = findParentFolder(allFolders, parent.id);
    }
    return path;
  };

  return (
    <div className="space-y-6 text-white">
      <header className="sticky top-0 z-20">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:flex-1">
              {currentFolder.parentId && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#271c70] text-white font-semibold hover:bg-[#ff9c4b] hover:text-black transition w-full sm:w-auto"
                >
                  <FaArrowLeft />
                  Back
                </button>
              )}
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search files or folders..."
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b] text-white placeholder:text-white/60"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => {
                  setIsCreatingFolder(true);
                  setNewFolderName("");
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#271c70] text-white font-semibold hover:bg-[#ff9c4b] hover:text-black transition"
              >
                <FaFolderPlus />
                New Folder
              </button>
              <FileUpload onFilesSelected={handleFilesSelected} />
            </div>
          </div>
          {isCreatingFolder && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                ref={newFolderInputRef}
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
                onBlur={handleFolderCreation}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleFolderCreation();
                  } else if (event.key === "Escape") {
                    setIsCreatingFolder(false);
                    setNewFolderName("");
                  }
                }}
                placeholder="Folder name..."
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b] text-white placeholder:text-white/60"
              />
              <p className="text-sm text-white/60">
                Press Enter to create or Escape to cancel.
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Breadcrumb navigation */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-white/80 mt-2 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2">
        {getFolderPath(currentFolderId, folders).map((folder, index, array) => (
          <div
            key={folder.id}
            onClick={() => setCurrentFolderId(folder.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleFileDrop(folder.id)}
            className={`cursor-pointer transition ${
              isDragOverFolder === folder.id
                ? "text-[#ff9c4b]"
                : "hover:text-[#ff9c4b] text-white"
            }`}
          >
            {folder.name}
            {index < array.length - 1 && (
              <span className="mx-1 text-white/40">/</span>
            )}
          </div>
        ))}
      </div>

      <section>
        {noResults ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center text-white/70">
            No items found here. Create a folder or upload a file to get started.
          </div>
        ) : (
          <div>
            <AnimatePresence>
              {/* Folders First */}
              {visibleSubfolders.map((folder) => (
                <motion.div
                  key={`folder-${folder.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mb-2"
                >
                  <div
                    className={`flex items-center bg-white/10 rounded-lg p-4 transition ${isDragOverFolder === folder.id ? 'bg-[#ff9c4b]/30' : 'hover:bg-white/20'}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverFolder(folder.id);
                    }}
                    onDragLeave={() => setIsDragOverFolder(null)}
                    onDrop={() => { handleFileDrop(folder.id); setIsDragOverFolder(null); }}
                  >
                    {/* Folder Icon */}
                    <span className="mr-4 text-2xl">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path
                          d="M2 7.75A2.75 2.75 0 014.75 5h3.19a2.75 2.75 0 012.4 1.36l.44.74a.75.75 0 00.64.36h7.83A2.75 2.75 0 0122 10.25v6A2.75 2.75 0 0119.25 19H4.75A2.75 2.75 0 012 16.25v-8.5z"
                          fill="#ff9c4b"
                        />
                      </svg>
                    </span>
                    {/* Name or Rename Input */}
                    {renamingFolderId === folder.id ? (
                      <input
                        ref={renamingInputRef}
                        value={renamingName}
                        onChange={(e) => setRenamingName(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          else if (e.key === "Escape") cancelRename();
                        }}
                        className="flex-1 px-2 py-1 rounded bg-white/20 border border-white/30 text-white mr-2"
                        style={{ minWidth: 0, maxWidth: 240 }}
                      />
                    ) : (
                      <button
                        className="flex-1 text-left font-semibold truncate text-white"
                        title={folder.name}
                        onClick={() => handleFolderOpen(folder)}
                      >
                        {folder.name}
                      </button>
                    )}
                    <div className="flex items-center gap-2 ml-2">
                      {/* Edit Button */}
                      <button
                        className="p-1 rounded hover:bg-white/20"
                        title="Rename"
                        onClick={() => {
                          setRenamingFolderId(folder.id);
                          setRenamingFileId(null);
                          setRenamingName(folder.name);
                        }}
                      >
                        <FaPen size={14} />
                      </button>
                      {/* Delete Button */}
                      <button
                        className="p-1 rounded hover:bg-white/20"
                        title="Delete"
                        onClick={() => handleFolderDelete(folder.id)}
                        disabled={folder.id === "root"}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {/* Files */}
              {visibleFiles.map((file) => (
                <motion.div
                  key={`file-${file.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mb-2"
                >
                  <div
                    className="flex items-center bg-white/10 rounded-lg p-4 hover:bg-white/20 transition"
                    draggable
                    onDragStart={() => setDraggedFileId(file.id)}
                    onDragEnd={() => setDraggedFileId(null)}
                  >
                    {/* File Icon */}
                    <span className="mr-4 text-2xl">
                      {file.type === "image" ? (
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <rect width="24" height="24" rx="4" fill="#5ad1e6" />
                          <circle cx="8" cy="8" r="2" fill="#fff" />
                          <path d="M5 19l4.5-6 4 5 3.5-4L19 19H5z" fill="#fff" />
                        </svg>
                      ) : file.type === "video" ? (
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <rect width="24" height="24" rx="4" fill="#ff4b77" />
                          <polygon points="9,7 17,12 9,17" fill="#fff" />
                        </svg>
                      ) : file.type === "document" ? (
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <rect width="24" height="24" rx="4" fill="#4b8bff" />
                          <rect x="7" y="7" width="10" height="2" rx="1" fill="#fff" />
                          <rect x="7" y="11" width="10" height="2" rx="1" fill="#fff" />
                          <rect x="7" y="15" width="6" height="2" rx="1" fill="#fff" />
                        </svg>
                      ) : (
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <rect width="24" height="24" rx="4" fill="#aaa" />
                          <rect x="7" y="7" width="10" height="10" rx="2" fill="#fff" />
                        </svg>
                      )}
                    </span>
                    {/* Name or Rename Input */}
                    {renamingFileId === file.id ? (
                      <input
                        ref={renamingInputRef}
                        value={renamingName}
                        onChange={(e) => setRenamingName(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          else if (e.key === "Escape") cancelRename();
                        }}
                        className="flex-1 px-2 py-1 rounded bg-white/20 border border-white/30 text-white mr-2"
                        style={{ minWidth: 0, maxWidth: 240 }}
                      />
                    ) : (
                      <span className="flex-1 truncate" title={file.name}>
                        {file.name}
                      </span>
                    )}
                    <span className="ml-4 text-xs text-white/70 min-w-[64px]">
                      {file.size}
                    </span>
                    <div className="flex items-center gap-2 ml-2">
                      {/* Edit Button */}
                      <button
                        className="p-1 rounded hover:bg-white/20"
                        title="Rename"
                        onClick={() => {
                          setRenamingFileId(file.id);
                          setRenamingFolderId(null);
                          setRenamingName(file.name);
                        }}
                      >
                        <FaPen size={14} />
                      </button>
                      {/* Delete Button */}
                      <button
                        className="p-1 rounded hover:bg-white/20"
                        title="Delete"
                        onClick={() => handleFileDelete(file.id)}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
