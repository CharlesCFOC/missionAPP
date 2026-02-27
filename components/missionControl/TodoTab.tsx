"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TodoList from "./todo/ToDoList";
import NotesWall from "./todo/NotesWall";
import { motion } from "framer-motion";
import { readStoredTodoLists } from "./storage";

type TodoListItem = {
  id: string;
  title: string;
  type: "project" | "mission";
  location?: string;
  progress: number;
};

const BASE_LISTS: TodoListItem[] = [
  {
    id: "project-zambia-water",
    title: "Clean Water Initiative - Zambia",
    location: "Zambia",
    progress: 85,
    type: "project",
  },
  {
    id: "project-haiti-youth",
    title: "Youth Empowerment Hub - Haiti",
    location: "Haiti",
    progress: 40,
    type: "project",
  },
  {
    id: "project-kenya-medical",
    title: "Kenya Medical Outreach Center",
    location: "Kenya",
    progress: 65,
    type: "project",
  },
];

const listKey = (list: Pick<TodoListItem, "id" | "type">) => `${list.type}:${list.id}`;

export default function TodoTab() {
  const router = useRouter();
  const [lists, setLists] = useState<TodoListItem[]>(BASE_LISTS);

  const [selectedListKey, setSelectedListKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"todo" | "notes">("todo");
  const [tasksByList, setTasksByList] = useState<Record<string, any[]>>({});
  const [notesByList, setNotesByList] = useState<Record<string, any[]>>({});
  const [archivedListKeys, setArchivedListKeys] = useState<string[]>([]);

  useEffect(() => {
    const stored = readStoredTodoLists();
    if (stored.length === 0) return;
    setLists((prev) => {
      const existingKeys = new Set(prev.map((item) => listKey(item)));
      const additions = stored
        .map((item) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          location: item.location,
          progress: typeof item.progress === "number" ? item.progress : 0,
        }))
        .filter((item) => !existingKeys.has(listKey(item)));
      return additions.length > 0 ? [...prev, ...additions] : prev;
    });
  }, []);

  useEffect(() => {
    if (!selectedListKey) return;
    if (!lists.some((list) => listKey(list) === selectedListKey)) {
      setSelectedListKey(null);
    }
  }, [selectedListKey, lists]);

  const activeLists = useMemo(() => {
    return lists.filter((list) => !archivedListKeys.includes(listKey(list)));
  }, [lists, archivedListKeys]);

  const archivedLists = useMemo(() => {
    return lists.filter((list) => archivedListKeys.includes(listKey(list)));
  }, [lists, archivedListKeys]);

  const selectedList = useMemo(
    () => lists.find((list) => listKey(list) === selectedListKey) || null,
    [lists, selectedListKey]
  );

  const selectedTasks = selectedListKey ? tasksByList[selectedListKey] ?? [] : [];
  const selectedNotes = selectedListKey ? notesByList[selectedListKey] ?? [] : [];

  const handleAddProject = () => {
    const newId = `project-${Date.now()}`;
    router.push(`/projectDetails/${newId}?edit=true`);
  };

  const handleDragStart = (e: any, list: TodoListItem) => {
    e?.dataTransfer?.setData("listKey", listKey(list));
  };

  const handleDropToArchive = (e: React.DragEvent<HTMLDivElement>) => {
    const key = e.dataTransfer.getData("listKey");
    if (!key) return;
    setArchivedListKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleTasksChange = (nextTasks: any[]) => {
    if (!selectedListKey) return;
    setTasksByList((prev) => ({ ...prev, [selectedListKey]: nextTasks }));
  };

  const handleNotesChange = (nextNotes: any[]) => {
    if (!selectedListKey) return;
    setNotesByList((prev) => ({ ...prev, [selectedListKey]: nextNotes }));
  };

  return (
    <div className="p-6 text-white">
      {!selectedList ? (
        <>
          <div className="flex justify-end mb-4 gap-3">
            <button
              onClick={handleAddProject}
              className="px-4 py-2 bg-gradient-to-r from-[#ff9c4b] to-[#4cff4b] text-black font-semibold rounded hover:opacity-90 transition-all"
            >
              + New Project List
            </button>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            onDrop={handleDropToArchive}
            onDragOver={handleDragOver}
          >
            {activeLists.length === 0 ? (
              <p className="text-white/60 italic text-center col-span-full">
                No to-do lists yet.
              </p>
            ) : (
              activeLists.map((list) => {
                const key = listKey(list);
                const listTasks = tasksByList[key] ?? [];
                const completed = listTasks.filter((task) => task.completed).length;
                const total = listTasks.length;
                const progressValue = total > 0 ? Math.round((completed / total) * 100) : list.progress;

                return (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white/10 backdrop-blur-lg p-5 rounded-lg shadow-lg cursor-pointer hover:bg-white/20 transition-all"
                    onClick={() => setSelectedListKey(key)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, list)}
                  >
                    <h3
                      className="text-xl font-semibold text-white mb-2 cursor-pointer hover:text-[#ff9c4b]"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (list.type === "project") {
                          router.push(`/projectDetails/${list.id}?edit=true`);
                        }
                      }}
                    >
                      {list.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                      <span>{list.location || (list.type === "mission" ? "Mission" : "Location not set")}</span>
                      <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
                        {list.type}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2.5 mb-3">
                      <div
                        className="h-2.5 rounded-full transition-all bg-gradient-to-r from-[#ff9c4b] to-[#4cff4b]"
                        style={{ width: `${progressValue}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-white/60">
                      {total > 0 ? `${completed}/${total} tasks completed` : "No tasks yet"}
                    </p>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="mt-10 bg-white/5 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-4 text-white/80">Archived To-Do Lists</h3>
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50 blur-sm hover:opacity-80 hover:blur-none transition-all"
              onDrop={handleDropToArchive}
              onDragOver={handleDragOver}
            >
              {archivedLists.length === 0 ? (
                <p className="text-white/60 italic">Drag a list here to archive it</p>
              ) : (
                archivedLists.map((archived) => (
                  <div
                    key={listKey(archived)}
                    className="bg-white/10 p-4 rounded-lg"
                    draggable
                    onDragStart={(e) => handleDragStart(e, archived)}
                  >
                    <p className="text-white/60">{archived.title}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
          <button
            onClick={() => setSelectedListKey(null)}
            className="mb-4 px-4 py-2 bg-[#4fa5ff] hover:bg-[#8cc4ff] text-black font-semibold rounded"
          >
            ← Back to Lists
          </button>
          <h2 className="text-2xl font-bold mb-6 text-white">
            {selectedList.title}
          </h2>

          <div className="flex gap-3 mb-6">
            <button
              className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${
                activeTab === "todo"
                  ? "bg-[#4fa5ff] text-black"
                  : "bg-white/10 text-white"
              }`}
              onClick={() => setActiveTab("todo")}
            >
              To-Do
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${
                activeTab === "notes"
                  ? "bg-[#4fa5ff] text-black"
                  : "bg-white/10 text-white"
              }`}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </button>
          </div>

          {activeTab === "todo" ? (
            <TodoList
              tasks={selectedTasks}
              setTasks={handleTasksChange}
            />
          ) : (
            <NotesWall
              notes={selectedNotes}
              setNotes={handleNotesChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
