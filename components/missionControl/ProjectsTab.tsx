"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Eye, Lock, LockOpen, MoreVertical, Pencil, Share2 } from "lucide-react";
import { readPrivateMode, writePrivateMode, PrivateModeMap } from "./privateMode";

type ProjectStatus = "active" | "draft" | "archived";

type ProjectCard = {
  id: string;
  title: string;
  description: string;
  progress: number;
  image: string;
  status: ProjectStatus;
};

const PROJECTS: ProjectCard[] = [
  {
    id: "project-zambia-water",
    title: "Clean Water Initiative - Zambia",
    description:
      "Building sustainable wells to provide access to clean drinking water in rural communities.",
    progress: 85,
    image:
      "https://images.unsplash.com/photo-1636813834441-bf49f09d0bab?auto=format&fit=crop&q=80&w=800",
    status: "active",
  },
  {
    id: "project-haiti-youth",
    title: "Youth Empowerment Hub - Haiti",
    description:
      "Partnering with local leaders to build mentorship and entrepreneurship programs.",
    progress: 40,
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800",
    status: "draft",
  },
  {
    id: "project-kenya-medical",
    title: "Kenya Medical Outreach Center",
    description:
      "Supporting clinical infrastructure, training, and medicine distribution.",
    progress: 65,
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
    status: "active",
  },
  {
    id: "project-kenya-school",
    title: "School Construction - Kenya",
    description:
      "Helping build classrooms and learning centers for underprivileged children.",
    progress: 60,
    image:
      "https://images.unsplash.com/photo-1553775927-a071d5a6a39a?auto=format&fit=crop&q=80&w=800",
    status: "archived",
  },
];

export default function ProjectsTab() {
  const [activeTab, setActiveTab] = useState<ProjectStatus>("active");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openShareId, setOpenShareId] = useState<string | null>(null);
  const [qrOpenId, setQrOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [privateMode, setPrivateMode] = useState<PrivateModeMap>({});
  const router = useRouter();

  const filteredProjects = PROJECTS.filter((p) => p.status === activeTab);
  const actionButtonClass =
    "group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white/40 hover:text-white";
  const tooltipClass =
    "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 shadow-md transition group-hover:opacity-100";

  useEffect(() => {
    setPrivateMode(readPrivateMode());
  }, []);

  const togglePrivateMode = (id: string) => {
    setPrivateMode((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      writePrivateMode(next);
      return next;
    });
  };

  const buildShareUrl = (path: string, isPrivate: boolean) => {
    const base =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";
    const params = new URLSearchParams();
    if (isPrivate) {
      params.set("private", "1");
    }
    const query = params.toString();
    return `${base}${path}${query ? `?${query}` : ""}`;
  };

  const handleCopyLink = async (url: string, id: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 1600);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <section className="p-6 text-white bg-transparent shadow-none backdrop-blur-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-3xl font-bold text-[#4fa5ff] text-center md:text-left">
          Your Projects
        </h2>
        <button
          type="button"
          onClick={() => {
            const newId = `project-${Date.now()}`;
            router.push(`/projectDetails/${newId}?edit=true`);
          }}
          className="self-center md:self-auto bg-transparent border border-[#4fa5ff] text-[#4fa5ff] px-4 py-2 rounded-lg hover:bg-[#4fa5ff]/10 transition font-medium"
        >
          + New Project
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-4 relative z-10">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === "active"
              ? "bg-[#4fa5ff] text-black font-semibold"
              : "bg-transparent text-gray-400 hover:bg-[#4fa5ff]/20"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab("draft")}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === "draft"
              ? "bg-[#4fa5ff] text-black font-semibold"
              : "text-gray-400 font-semibold bg-transparent hover:text-white"
          }`}
        >
          Draft
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === "archived"
              ? "bg-[#4fa5ff] text-black font-semibold"
              : "text-gray-400 font-semibold bg-transparent hover:text-white"
          }`}
        >
          Archived
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {filteredProjects.length === 0 && (
          <p className="text-center text-white/60 italic col-span-full">
            No projects in this status yet.
          </p>
        )}
        {filteredProjects.map((project) => {
          const isPrivate = Boolean(privateMode[project.id]);
          const shareUrl = buildShareUrl(`/projectDetails/${project.id}`, isPrivate);
          return (
            <motion.div
              key={project.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-md relative"
            >
              <div className="relative mb-4">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <h3 className="text-xl font-semibold text-[#4fa5ff] mb-2">
                {project.title}
              </h3>
              <p className="text-white/70 text-sm mb-4">{project.description}</p>
              <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                <div
                  className="bg-[#4fa5ff] h-2 rounded-full"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-white/60 mb-4">
                Progress: {project.progress}%
              </p>
              <div className="flex flex-wrap items-center gap-2 relative">
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (isPrivate) {
                      params.set("private", "1");
                    }
                    const query = params.toString();
                    router.push(
                      `/projectDetails/${project.id}${query ? `?${query}` : ""}`
                    );
                  }}
                  className={actionButtonClass}
                  aria-label="View project"
                >
                  <Eye size={18} />
                  <span className={tooltipClass}>Voir</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/projectDetails/${project.id}?edit=true`)}
                  className={actionButtonClass}
                  aria-label="Edit project"
                >
                  <Pencil size={18} />
                  <span className={tooltipClass}>Editer</span>
                </button>
                <button
                  type="button"
                  onClick={() => togglePrivateMode(project.id)}
                  className={
                    isPrivate
                      ? "group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ff9c4b] text-[#ff9c4b] transition hover:border-[#ffd08b] hover:text-[#ffd08b]"
                      : actionButtonClass
                  }
                  aria-pressed={isPrivate}
                  aria-label="Toggle Privat mode"
                >
                  {isPrivate ? <Lock size={16} /> : <LockOpen size={16} />}
                  <span className={tooltipClass}>
                    Allows you to share your project in white label.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenuId(null);
                    setQrOpenId(null);
                    setOpenShareId((prev) =>
                      prev === project.id ? null : project.id
                    );
                  }}
                  className={actionButtonClass}
                  aria-label="Share project"
                >
                  <Share2 size={18} />
                  <span className={tooltipClass}>Partager</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenShareId(null);
                    setQrOpenId(null);
                    setOpenMenuId(openMenuId === project.id ? null : project.id);
                  }}
                  className={actionButtonClass}
                  aria-label="Open menu"
                >
                  <MoreVertical size={18} />
                  <span className={tooltipClass}>Menu</span>
                </button>
                {openShareId === project.id && (
                  <div className="absolute bottom-14 right-0 md:right-12 w-52 rounded-lg bg-[#1e1e2f]/95 text-white shadow-lg p-3 z-10 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(shareUrl, project.id)}
                      className="w-full rounded-md bg-white/10 px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
                    >
                      {copiedId === project.id ? "Copié" : "Copier le lien"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setQrOpenId((prev) => (prev === project.id ? null : project.id))
                      }
                      className="w-full rounded-md bg-white/10 px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
                    >
                      QR code
                    </button>
                    {qrOpenId === project.id && (
                      <div className="rounded-md bg-white p-2">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                            shareUrl
                          )}`}
                          alt="Project QR code"
                          className="h-36 w-36"
                        />
                      </div>
                    )}
                  </div>
                )}
                {openMenuId === project.id && (
                  <div className="absolute bottom-14 right-0 bg-[#1e1e2f]/90 text-white rounded-lg shadow-lg p-2 z-10 w-40">
                    <button
                      type="button"
                      className="w-full text-left px-2 py-1 hover:bg-[#4fa5ff]/30 rounded"
                    >
                      Archive Project
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-2 py-1 hover:bg-[#4fa5ff]/30 rounded"
                    >
                      Delete Project
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
