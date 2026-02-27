"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Eye, Lock, LockOpen, MoreVertical, Pencil, Share2 } from "lucide-react";
import { readPrivateMode, writePrivateMode, PrivateModeMap } from "./privateMode";
import useActiveOrganization from "./useActiveOrganization";

type MissionStatus = "active" | "draft" | "archived";

type MissionCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  price: string;
  status: MissionStatus;
};

const FALLBACK_MISSIONS: MissionCard[] = [
  {
    id: "mission-kenya-medical",
    title: "Medical Outreach - Kenya",
    description:
      "Join a dedicated team providing medical care and support in rural Kenya.",
    image:
      "https://images.unsplash.com/photo-1612229693210-30e16029c415?auto=format&fit=crop&q=80&w=800",
    date: "June 10-20, 2025",
    price: "$1,200",
    status: "active",
  },
  {
    id: "mission-haiti-youth",
    title: "Youth Empowerment - Haiti",
    description:
      "Support local youth programs through mentorship, workshops, and community events.",
    image:
      "https://images.unsplash.com/photo-1553775927-a071d5a6a39a?auto=format&fit=crop&q=80&w=800",
    date: "August 5-15, 2025",
    price: "$1,000",
    status: "draft",
  },
  {
    id: "mission-zambia-well",
    title: "Well Construction - Zambia",
    description:
      "Help provide clean water access by participating in well construction efforts.",
    image:
      "https://images.unsplash.com/photo-1636813834441-bf49f09d0bab?auto=format&fit=crop&q=80&w=800",
    date: "October 1-12, 2025",
    price: "$1,400",
    status: "archived",
  },
];

const LOCAL_STORAGE_KEY = "cfoc-missions";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1612229693210-30e16029c415?auto=format&fit=crop&q=80&w=800";

const formatMissionPrice = (value: unknown) => {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatMissionDate = (
  dateDisplay: unknown,
  startDate: unknown,
  endDate: unknown
) => {
  if (typeof dateDisplay === "string" && dateDisplay.trim().length > 0) {
    return dateDisplay;
  }
  if (typeof startDate === "string" && typeof endDate === "string" && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      const formatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${formatter.format(start)} - ${formatter.format(end)}`;
    }
  }
  return "Dates to be announced";
};

const toMissionStatus = (value: unknown): MissionStatus => {
  if (value === "active" || value === "draft" || value === "archived") {
    return value;
  }
  return "draft";
};

const readLocalMissionCards = (): MissionCard[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
    return parsed
      .filter((item) => typeof item.id === "string")
      .map((item) => ({
        id: item.id as string,
        title:
          typeof item.name === "string" && item.name.trim().length > 0
            ? item.name
            : "Untitled Mission",
        description:
          typeof item.description === "string" && item.description.trim().length > 0
            ? item.description
            : "No description yet.",
        image:
          typeof item.coverImage === "string" && item.coverImage.trim().length > 0
            ? item.coverImage
            : FALLBACK_IMAGE,
        date: formatMissionDate(item.dateDisplay, item.startDate, item.endDate),
        price: formatMissionPrice(item.pricePerPerson),
        status: toMissionStatus(item.status),
      }));
  } catch {
    return [];
  }
};

export default function MissionsTab() {
  const [filter, setFilter] = useState<MissionStatus>("active");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openShareId, setOpenShareId] = useState<string | null>(null);
  const [qrOpenId, setQrOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [privateMode, setPrivateMode] = useState<PrivateModeMap>({});
  const [missions, setMissions] = useState<MissionCard[]>(FALLBACK_MISSIONS);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [missionsError, setMissionsError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useSupabaseClient();
  const {
    membership,
    loading: membershipLoading,
    error: membershipError,
  } = useActiveOrganization();

  const filteredMissions = missions.filter((mission) => mission.status === filter);
  const actionButtonClass =
    "group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white/40 hover:text-white";
  const tooltipClass =
    "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 shadow-md transition group-hover:opacity-100";

  useEffect(() => {
    setPrivateMode(readPrivateMode());
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadMissions = async () => {
      if (membershipLoading) return;

      if (!membership?.organizationId) {
        const localCards = readLocalMissionCards();
        if (!cancelled) {
          setMissions(localCards.length > 0 ? localCards : FALLBACK_MISSIONS);
          setMissionsError(membershipError ?? null);
          setMissionsLoading(false);
        }
        return;
      }

      setMissionsLoading(true);
      setMissionsError(null);

      const { data, error } = await supabase
        .from("missions")
        .select(
          "id, name, description, cover_image_url, date_display, start_date, end_date, price_per_person, status, created_at"
        )
        .eq("organization_id", membership.organizationId)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        const localCards = readLocalMissionCards();
        setMissions(localCards.length > 0 ? localCards : FALLBACK_MISSIONS);
        setMissionsError(error.message);
        setMissionsLoading(false);
        return;
      }

      const dbCards = ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
        id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
        title:
          typeof row.name === "string" && row.name.trim().length > 0
            ? row.name
            : "Untitled Mission",
        description:
          typeof row.description === "string" && row.description.trim().length > 0
            ? row.description
            : "No description yet.",
        image:
          typeof row.cover_image_url === "string" && row.cover_image_url.trim().length > 0
            ? row.cover_image_url
            : FALLBACK_IMAGE,
        date: formatMissionDate(row.date_display, row.start_date, row.end_date),
        price: formatMissionPrice(row.price_per_person),
        status: toMissionStatus(row.status),
      }));

      const localCards = readLocalMissionCards();
      const seen = new Set(dbCards.map((mission) => mission.id));
      const mergedCards = [
        ...dbCards,
        ...localCards.filter((mission) => !seen.has(mission.id)),
      ];

      setMissions(mergedCards);
      setMissionsLoading(false);
    };

    void loadMissions();

    return () => {
      cancelled = true;
    };
  }, [membership?.organizationId, membershipError, membershipLoading, supabase]);

  const togglePrivateMode = (id: string) => {
    setPrivateMode((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      writePrivateMode(next);
      return next;
    });
  };

  const handleSeeMission = (mission: MissionCard) => {
    setOpenMenuId(null);
    setOpenShareId(null);
    const params = new URLSearchParams();
    if (privateMode[mission.id]) {
      params.set("private", "1");
    }
    const query = params.toString();
    router.push(`/missionDetails/${mission.id}${query ? `?${query}` : ""}`);
  };

  const handleEditMission = (mission: MissionCard) => {
    router.push(`/missionDetails/${mission.id}?edit=true`);
    setOpenMenuId(null);
    setOpenShareId(null);
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
    <section className="p-6 bg-transparent shadow-none text-white">
      <div className="w-full flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-3xl font-bold text-[#4fa5ff] text-center md:text-left">
          Your Missions
        </h2>
        <button
          onClick={() => router.push("/missionDetails/new")}
          className="self-center md:self-auto border border-[#4fa5ff] text-[#4fa5ff] px-4 py-2 rounded-lg hover:bg-[#4fa5ff] hover:text-black transition"
        >
          + New Mission
        </button>
      </div>

      {(missionsLoading || missionsError) && (
        <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          {missionsLoading && <p className="text-white/70">Loading missions...</p>}
          {!missionsLoading && missionsError && (
            <p className="text-[#ffb48d]">
              Mission list fallback mode: {missionsError}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap justify-center mb-6 gap-3">
        {(["active", "draft", "archived"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === status
                ? "bg-[#4fa5ff] text-black"
                : "bg-transparent text-white/40 hover:text-white"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredMissions.length === 0 ? (
          <p className="text-center text-white/60 italic col-span-full">
            No missions in this status yet.
          </p>
        ) : (
          filteredMissions.map((mission) => {
            const isPrivate = Boolean(privateMode[mission.id]);
            const shareUrl = buildShareUrl(`/missionDetails/${mission.id}`, isPrivate);
            return (
              <motion.div
                key={mission.id}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-xl p-4 rounded-xl shadow-md relative border border-white/5"
              >
                <div className="relative mb-4">
                  <img
                    src={mission.image}
                    alt={mission.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#4fa5ff] mb-2">
                  {mission.title}
                </h3>
                <p className="text-white/70 text-sm mb-4">{mission.description}</p>
                <p className="text-white/60 text-xs mb-2">
                  📅 {mission.date} • 💰 {mission.price}
                </p>
                <div className="flex flex-wrap items-center gap-2 relative">
                  <button
                    type="button"
                    onClick={() => handleSeeMission(mission)}
                    className={actionButtonClass}
                    aria-label="View mission"
                  >
                    <Eye size={18} />
                    <span className={tooltipClass}>Voir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditMission(mission)}
                    className={actionButtonClass}
                    aria-label="Edit mission"
                  >
                    <Pencil size={18} />
                    <span className={tooltipClass}>Editer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePrivateMode(mission.id)}
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
                      Allows you to share your mission in white label.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuId(null);
                      setQrOpenId(null);
                      setOpenShareId((prev) =>
                        prev === mission.id ? null : mission.id
                      );
                    }}
                    className={actionButtonClass}
                    aria-label="Share mission"
                  >
                    <Share2 size={18} />
                    <span className={tooltipClass}>Partager</span>
                  </button>
                  <button
                    onClick={() => {
                      setOpenShareId(null);
                      setQrOpenId(null);
                      setOpenMenuId(openMenuId === mission.id ? null : mission.id);
                    }}
                    className={actionButtonClass}
                    aria-label="Open menu"
                  >
                    <MoreVertical size={18} />
                    <span className={tooltipClass}>Menu</span>
                  </button>
                  {openShareId === mission.id && (
                    <div className="absolute bottom-14 right-0 md:right-12 w-52 rounded-lg bg-[#1e1e2f]/95 text-white shadow-lg p-3 z-10 space-y-2">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(shareUrl, mission.id)}
                        className="w-full rounded-md bg-white/10 px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
                      >
                        {copiedId === mission.id ? "Copié" : "Copier le lien"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setQrOpenId((prev) => (prev === mission.id ? null : mission.id))
                        }
                        className="w-full rounded-md bg-white/10 px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
                      >
                        QR code
                      </button>
                      {qrOpenId === mission.id && (
                        <div className="rounded-md bg-white p-2">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                              shareUrl
                            )}`}
                            alt="Mission QR code"
                            className="h-36 w-36"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {openMenuId === mission.id && (
                    <div className="absolute bottom-14 right-0 bg-[#1e1e2f]/90 text-white rounded-lg shadow-lg p-2 z-10">
                      <button className="block w-full text-left px-3 py-1 rounded hover:bg-[#4fa5ff]/20">
                        Archive Mission
                      </button>
                      <button className="block w-full text-left px-3 py-1 rounded hover:bg-[#4fa5ff]/20">
                        Delete Mission
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
}
