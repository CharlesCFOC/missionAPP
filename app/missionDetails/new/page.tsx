"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { FaCalendarCheck, FaFolderOpen, FaPlus } from "react-icons/fa";
import { ensureMissionControlFolders } from "@/components/missionControl/storage";
import useActiveOrganization from "@/components/missionControl/useActiveOrganization";

interface MissionLeader {
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
}

interface MissionDocument {
  title: string;
  description: string;
  link: string;
  fileName?: string;
  fileData?: string;
}

interface MissionTimelineEntry {
  day: string;
  title: string;
  details: string;
}

interface MissionStat {
  label: string;
  value: string;
}

interface MissionPracticalInfo {
  icon: string;
  label: string;
  value: string;
}

interface MissionTestimonial {
  quote: string;
  author: string;
  role: string;
}

interface MissionGalleryItem {
  src: string;
  alt: string;
  fileName?: string;
  fileData?: string;
}

interface MissionDraft {
  name: string;
  country: string;
  countryFlag: string;
  city: string;
  coverImage: string;
  dateDisplay: string;
  startDate: string;
  endDate: string;
  pricePerPerson: string;
  totalSpots: string;
  spotsReserved: string;
  description: string;
  objectives: string[];
  stats: MissionStat[];
  practicalInfo: MissionPracticalInfo[];
  timeline: MissionTimelineEntry[];
  leaders: MissionLeader[];
  documents: MissionDocument[];
  testimonials: MissionTestimonial[];
  gallery: MissionGalleryItem[];
  status?: "active" | "draft" | "archived";
}

const formatDateRange = (start?: string, end?: string) => {
  if (!start || !end) return "";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "";
  }
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  });
  const yearFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
  });
  const sameMonth =
    startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();
  const startLabel = dateFormatter.format(startDate);
  const endLabel = sameMonth
    ? endDate.getDate().toString()
    : dateFormatter.format(endDate);
  const yearLabel = yearFormatter.format(endDate);
  return `${startLabel} to ${endLabel}, ${yearLabel}`;
};

const readFileAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const LOCAL_STORAGE_KEY = "cfoc-missions";

const slugifyMissionName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function NewMissionPage() {
  const [mission, setMission] = useState<MissionDraft>({
    name: "",
    country: "",
    countryFlag: "",
    city: "",
    coverImage: "",
    dateDisplay: "",
    startDate: "",
    endDate: "",
    pricePerPerson: "",
    totalSpots: "",
    spotsReserved: "",
    description: "",
    objectives: [""],
    stats: [{ label: "", value: "" }],
    practicalInfo: [{ icon: "", label: "", value: "" }],
    timeline: [{ day: "", title: "", details: "" }],
    leaders: [{ name: "", role: "", email: "", phone: "", avatar: "" }],
    documents: [{ title: "", description: "", link: "" }],
    testimonials: [{ quote: "", author: "", role: "" }],
    gallery: [{ src: "", alt: "" }],
  });

  const router = useRouter();
  const supabase = useSupabaseClient();
  const {
    userId,
    membership,
    loading: membershipLoading,
    error: membershipError,
  } = useActiveOrganization();
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const updateField = <K extends keyof MissionDraft>(field: K, value: MissionDraft[K]) => {
    setMission((prev) => ({ ...prev, [field]: value }));
  };

  const updateArrayItem = <T,>(
    list: keyof MissionDraft,
    index: number,
    setter: (item: T) => T
  ) => {
    updateField(
      list,
      (mission[list] as T[]).map((item, i) => (i === index ? setter(item) : item)) as MissionDraft[typeof list]
    );
  };

  const addArrayItem = <T,>(list: keyof MissionDraft, item: T) => {
    updateField(list, [...(mission[list] as T[]), item] as MissionDraft[typeof list]);
  };

const renderInput = (
  value: string,
  onChange: (val: string) => void,
  placeholder: string,
  className = ""
  ) => (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b] ${className}`}
    />
  );

  const renderTextarea = (
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    className = ""
  ) => (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b] ${className}`}
    />
  );

  const renderDateInput = (
    value: string,
    onChange: (val: string) => void,
    className = ""
  ) => (
    <input
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#ff9c4b] [color-scheme:dark] ${className}`}
    />
  );

  const handleDateChange = (key: "startDate" | "endDate", value: string) => {
    setMission((prev) => {
      const next = { ...prev, [key]: value };
      const formatted = formatDateRange(next.startDate, next.endDate);
      return { ...next, dateDisplay: formatted };
    });
  };

  const handleCoverFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      updateField("coverImage", dataUrl);
    } finally {
      event.target.value = "";
    }
  };

  const handleGalleryFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      updateArrayItem<MissionGalleryItem>("gallery", index, (item) => ({
        ...item,
        src: dataUrl,
        alt: item.alt || file.name,
        fileName: file.name,
        fileData: dataUrl,
      }));
    } finally {
      event.target.value = "";
    }
  };

  const handleDocumentFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      updateArrayItem<MissionDocument>("documents", index, (item) => ({
        ...item,
        title: item.title || file.name,
        description: item.description,
        link: dataUrl,
        fileName: file.name,
        fileData: dataUrl,
      }));
    } finally {
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    if (typeof window === "undefined") return;
    if (isSaving) return;

    setSaveError(null);
    setSaveNotice(null);

    const id = Date.now().toString();
    const cleanedObjectives = mission.objectives.filter((item) => item.trim().length > 0);
    const cleanedStats = mission.stats.filter(
      (item) => item.label.trim().length > 0 || item.value.trim().length > 0
    );
    const cleanedPractical = mission.practicalInfo.filter(
      (item) =>
        item.label.trim().length > 0 ||
        item.value.trim().length > 0 ||
        item.icon.trim().length > 0
    );
    const cleanedTimeline = mission.timeline.filter(
      (item) =>
        item.title.trim().length > 0 ||
        item.details.trim().length > 0 ||
        item.day.trim().length > 0
    );
    const cleanedLeaders = mission.leaders.filter(
      (item) =>
        item.name.trim().length > 0 ||
        item.role.trim().length > 0 ||
        item.email.trim().length > 0 ||
        item.phone.trim().length > 0
    );
    const cleanedDocuments = mission.documents.filter(
      (item) => item.title.trim().length > 0 || item.link.trim().length > 0 || item.fileData
    );
    const cleanedTestimonials = mission.testimonials.filter(
      (item) => item.quote.trim().length > 0
    );
    const cleanedGallery = mission.gallery.filter(
      (item) => item.src.trim().length > 0
    );

    const formattedDate = formatDateRange(mission.startDate, mission.endDate);
    const pricePerPerson = Math.max(0, Number(mission.pricePerPerson || 0));
    const totalSpots = Math.max(0, Number(mission.totalSpots || 0));
    const spotsReserved = Math.max(0, Number(mission.spotsReserved || 0));

    if (spotsReserved > totalSpots) {
      setSaveError("Reserved spots cannot exceed total spots.");
      return;
    }

    const localDraftMission = {
      id,
      name: mission.name || "Untitled Mission",
      country: mission.country,
      countryFlag: mission.countryFlag,
      city: mission.city,
      coverImage: mission.coverImage,
      dateDisplay: formattedDate || mission.dateDisplay || "Dates to be announced",
      startDate: mission.startDate || undefined,
      endDate: mission.endDate || undefined,
      pricePerPerson,
      totalSpots,
      spotsReserved,
      description: mission.description,
      objectives: cleanedObjectives,
      stats: cleanedStats,
      practicalInfo: cleanedPractical,
      timeline: cleanedTimeline,
      leaders: cleanedLeaders,
      documents: cleanedDocuments,
      testimonials: cleanedTestimonials,
      gallery: cleanedGallery,
      status: "draft" as const,
      createdAt: new Date().toISOString(),
    };

    const saveLocalAndRedirect = (finalMissionId: string, notice?: string) => {
      const storedRaw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      const stored = storedRaw ? JSON.parse(storedRaw) : [];
      const localMission = {
        ...localDraftMission,
        id: finalMissionId,
      };
      stored.push(localMission);
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stored));
      const locationParts = [mission.city, mission.country].filter(
        (item) => item.trim().length > 0
      );
      const location = locationParts.length > 0 ? locationParts.join(", ") : undefined;
      ensureMissionControlFolders({
        type: "mission",
        id: finalMissionId,
        name: localMission.name,
        location,
      });
      if (notice) {
        window.localStorage.setItem("cfoc-mission-create-notice", notice);
      }
      router.push("/missionControl");
    };

    if (!membership?.organizationId || !userId) {
      saveLocalAndRedirect(id, "Mission saved locally (no active organization detected).");
      return;
    }

    setIsSaving(true);

    const slugBase = slugifyMissionName(mission.name || "");
    const insertPayload = {
      organization_id: membership.organizationId,
      legacy_client_id: id,
      slug: slugBase.length > 0 ? slugBase : null,
      name: localDraftMission.name,
      country: mission.country || null,
      country_flag: mission.countryFlag || null,
      city: mission.city || null,
      cover_image_url: mission.coverImage || null,
      date_display: formattedDate || mission.dateDisplay || "Dates to be announced",
      start_date: mission.startDate || null,
      end_date: mission.endDate || null,
      price_per_person: pricePerPerson,
      total_spots: totalSpots,
      spots_reserved: spotsReserved,
      description: mission.description || null,
      status: "draft" as const,
      created_by: userId,
      updated_by: userId,
    };

    const { data, error } = await supabase
      .from("missions")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      // If slug conflicts (same title), retry once without slug.
      if (
        insertPayload.slug &&
        (error.code === "23505" || error.message.toLowerCase().includes("missions_org_slug_uniq"))
      ) {
        const retry = await supabase
          .from("missions")
          .insert({ ...insertPayload, slug: null })
          .select("id")
          .single();

        if (retry.error || !retry.data?.id) {
          setSaveError(retry.error?.message ?? "Failed to save mission to Supabase.");
          setIsSaving(false);
          return;
        }

        saveLocalAndRedirect(retry.data.id);
        setIsSaving(false);
        return;
      }

      setSaveError(error.message);
      setIsSaving(false);
      return;
    }

    if (!data?.id || typeof data.id !== "string") {
      setSaveError("Mission created but no ID was returned.");
      setIsSaving(false);
      return;
    }

    saveLocalAndRedirect(data.id);
    setIsSaving(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#080313] via-[#260d5c] to-[#5d3ab9] text-white pb-20">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        <section className="relative overflow-hidden rounded-3xl shadow-2xl">
          <div
            className="relative h-[480px] flex flex-col justify-end"
            style={{
              backgroundImage: mission.coverImage
                ? `linear-gradient(120deg, rgba(8,3,19,0.75), rgba(38,13,92,0.7)), url(${mission.coverImage})`
                : "linear-gradient(120deg, rgba(8,3,19,0.75), rgba(38,13,92,0.7))",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute top-6 right-6 w-64 flex flex-col gap-2">
              {renderInput(
                mission.coverImage,
                (val) => updateField("coverImage", val),
                "🌄 Cover image URL..."
              )}
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverFileChange}
              />
              <button
                onClick={() => coverFileInputRef.current?.click()}
                type="button"
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
              >
                Upload from computer
              </button>
            </div>
            <div className="p-10 space-y-6 backdrop-blur-[2px]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-3 w-full">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/70">
                    Mission Trip
                  </p>
                  {renderInput(
                    mission.name,
                    (val) => updateField("name", val),
                    "Mission title...",
                    "text-4xl font-extrabold"
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-white/80">
                    <div className="inline-flex items-center gap-2 text-lg font-medium">
                      <FaFolderOpen className="text-[#ff9c4b]" />
                      {renderInput(
                        mission.city,
                        (val) => updateField("city", val),
                        "City...",
                        "w-40"
                      )}
                      {renderInput(
                        mission.country,
                        (val) => updateField("country", val),
                        "Country...",
                        "w-40"
                      )}
                      {renderInput(
                        mission.countryFlag,
                        (val) => updateField("countryFlag", val),
                        "Flag emoji...",
                        "w-24"
                      )}
                    </div>
                    <div className="flex flex-col gap-2 text-lg font-medium">
                      <div className="inline-flex items-center gap-3">
                        <FaCalendarCheck className="text-[#ff9c4b]" />
                        <div className="flex items-center gap-2">
                          {renderDateInput(
                            mission.startDate,
                            (val) => handleDateChange("startDate", val),
                            "w-40"
                          )}
                          <span className="text-sm text-white/70">to</span>
                          {renderDateInput(
                            mission.endDate,
                            (val) => handleDateChange("endDate", val),
                            "w-40"
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-white/60">
                        {mission.dateDisplay || "Select a start and end date"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-5 text-right space-y-2 shadow-lg w-full md:max-w-xs">
                  <p className="text-sm uppercase text-white/60 tracking-wide">
                    Price per person
                  </p>
                  {renderInput(
                    mission.pricePerPerson,
                    (val) => updateField("pricePerPerson", val),
                    "Price (USD)..."
                  )}
                  <p className="text-sm text-white/60">
                    Includes key details about what is covered.
                  </p>
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-white/80">
                  <label className="flex items-center gap-2">
                    Reserved
                    {renderInput(
                      mission.spotsReserved,
                      (val) => updateField("spotsReserved", val),
                      "Reserved spots...",
                      "w-24"
                    )}
                  </label>
                  <label className="flex items-center gap-2">
                    Total
                    {renderInput(
                      mission.totalSpots,
                      (val) => updateField("totalSpots", val),
                      "Total spots...",
                      "w-24"
                    )}
                  </label>
                </div>
                <div className="h-3 bg-white/15 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#ff9c4b] to-[#ffd08b]" style={{ width: "0%" }} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="flex-1 sm:flex-none sm:px-6 py-3 rounded-xl bg-[#271c70] hover:bg-[#ff9c4b] hover:text-black transition font-semibold shadow-lg">
                  ✈️ Invite participants
                </button>
                <button className="flex-1 sm:flex-none sm:px-6 py-3 rounded-xl border border-white/30 hover:border-[#ff9c4b] transition font-semibold shadow-lg">
                  💖 Activate donations
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-3xl font-bold">About the mission</h2>
            {renderTextarea(
              mission.description,
              (val) => updateField("description", val),
              "📝 Describe the goal and impact of your mission here…",
              "min-h-[180px]"
            )}
            <div className="space-y-4">
              {mission.objectives.map((objective, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
                >
                  <span className="text-[#ff9c4b] mt-1">✦</span>
                  {renderTextarea(
                    objective,
                    (val) =>
                      updateArrayItem<string>("objectives", index, () => val),
                    "Objective detail..."
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayItem<string>("objectives", "")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
              >
                <FaPlus /> Add objective
              </button>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div
              className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl p-6 space-y-4"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(39,28,112,0.35))",
              }}
            >
              <h3 className="text-xl font-semibold text-[#ff9c4b]">
                Key statistics
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {mission.stats.map((stat, index) => (
                  <div key={index} className="bg-white/5 rounded-2xl p-4 space-y-3">
                    {renderInput(
                      stat.label,
                      (val) =>
                        updateArrayItem<MissionStat>("stats", index, (item) => ({
                          ...item,
                          label: val,
                        })),
                      "Stat label..."
                    )}
                    {renderInput(
                      stat.value,
                      (val) =>
                        updateArrayItem<MissionStat>("stats", index, (item) => ({
                          ...item,
                          value: val,
                        })),
                      "Stat value..."
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => addArrayItem<MissionStat>("stats", { label: "", value: "" })}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
              >
                <FaPlus /> Add stat
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Practical information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mission.practicalInfo.map((item, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-lg space-y-3"
              >
                {renderInput(
                  item.icon,
                  (val) =>
                    updateArrayItem<MissionPracticalInfo>(
                      "practicalInfo",
                      index,
                      (info) => ({ ...info, icon: val })
                    ),
                  "Icon or emoji..."
                )}
                {renderInput(
                  item.label,
                  (val) =>
                    updateArrayItem<MissionPracticalInfo>(
                      "practicalInfo",
                      index,
                      (info) => ({ ...info, label: val })
                    ),
                  "Label..."
                )}
                {renderInput(
                  item.value,
                  (val) =>
                    updateArrayItem<MissionPracticalInfo>(
                      "practicalInfo",
                      index,
                      (info) => ({ ...info, value: val })
                    ),
                  "Value..."
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              addArrayItem<MissionPracticalInfo>("practicalInfo", { icon: "", label: "", value: "" })
            }
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
          >
            <FaPlus /> Add info item
          </button>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Program / Schedule</h2>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-xl">
            <div className="relative pl-6">
              <span className="absolute top-0 left-2 h-full w-[2px] bg-gradient-to-b from-[#ff9c4b] via-[#ffd08b] to-transparent" />
              <ul className="space-y-8">
                {mission.timeline.map((entry, index) => (
                  <li key={index} className="relative">
                    <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#ff9c4b] border-4 border-[#271c70]" />
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-md space-y-3">
                      {renderInput(
                        entry.day,
                        (val) =>
                          updateArrayItem<MissionTimelineEntry>(
                            "timeline",
                            index,
                            (item) => ({ ...item, day: val })
                          ),
                        "Day label..."
                      )}
                      {renderInput(
                        entry.title,
                        (val) =>
                          updateArrayItem<MissionTimelineEntry>(
                            "timeline",
                            index,
                            (item) => ({ ...item, title: val })
                          ),
                        "Title..."
                      )}
                      {renderTextarea(
                        entry.details,
                        (val) =>
                          updateArrayItem<MissionTimelineEntry>(
                            "timeline",
                            index,
                            (item) => ({ ...item, details: val })
                          ),
                        "🧭 Describe what will happen on this day...",
                        "min-h-[100px]"
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() =>
              addArrayItem<MissionTimelineEntry>("timeline", { day: "", title: "", details: "" })
            }
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
          >
            <FaPlus /> Add timeline entry
          </button>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Mission leaders</h2>
          <div className="space-y-6">
            {mission.leaders.map((leader, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center md:items-stretch gap-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl"
              >
                <div className="w-32 h-32 rounded-2xl border border-white/20 shadow-lg bg-white/10 flex items-center justify-center text-white/50 text-sm">
                  Upload Avatar
                </div>
                <div className="flex-1 grid sm:grid-cols-2 gap-4 w-full">
                  {renderInput(
                    leader.name,
                    (val) =>
                      updateArrayItem<MissionLeader>(
                        "leaders",
                        index,
                        (item) => ({ ...item, name: val })
                      ),
                    "Leader name..."
                  )}
                  {renderInput(
                    leader.role,
                    (val) =>
                      updateArrayItem<MissionLeader>(
                        "leaders",
                        index,
                        (item) => ({ ...item, role: val })
                      ),
                    "Role..."
                  )}
                  {renderInput(
                    leader.email,
                    (val) =>
                      updateArrayItem<MissionLeader>(
                        "leaders",
                        index,
                        (item) => ({ ...item, email: val })
                      ),
                    "Email..."
                  )}
                  {renderInput(
                    leader.phone,
                    (val) =>
                      updateArrayItem<MissionLeader>(
                        "leaders",
                        index,
                        (item) => ({ ...item, phone: val })
                      ),
                    "Phone..."
                  )}
                  {renderInput(
                    leader.avatar,
                    (val) =>
                      updateArrayItem<MissionLeader>(
                        "leaders",
                        index,
                        (item) => ({ ...item, avatar: val })
                      ),
                    "Avatar URL...",
                    "sm:col-span-2"
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              addArrayItem<MissionLeader>("leaders", {
                name: "",
                role: "",
                email: "",
                phone: "",
                avatar: "",
              })
            }
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
          >
            <FaPlus /> Add leader
          </button>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Documents to download</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mission.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl px-6 py-5 shadow-xl"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 text-[#ff9c4b]">
                    <FaFolderOpen className="text-2xl" />
                  </span>
                  <div className="flex-1 space-y-3">
                    {renderInput(
                      doc.title,
                      (val) =>
                        updateArrayItem<MissionDocument>(
                          "documents",
                          index,
                          (item) => ({ ...item, title: val })
                        ),
                      "Document title..."
                    )}
                    {renderInput(
                      doc.description,
                      (val) =>
                        updateArrayItem<MissionDocument>(
                          "documents",
                          index,
                          (item) => ({ ...item, description: val })
                        ),
                      "Describe what’s inside..."
                    )}
                    {doc.fileName && (
                      <p className="text-xs text-white/60">Uploaded: {doc.fileName}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <input
                        id={`document-upload-${index}`}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(event) => handleDocumentFileChange(event, index)}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById(`document-upload-${index}`)?.click()
                        }
                        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
                      >
                        Upload from computer
                      </button>
                    </div>
                  </div>
                </div>
                {renderInput(
                  doc.link,
                  (val) =>
                    updateArrayItem<MissionDocument>(
                      "documents",
                      index,
                      (item) => ({ ...item, link: val })
                    ),
                  "Link URL...",
                  "max-w-[200px]"
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              addArrayItem<MissionDocument>("documents", {
                title: "",
                description: "",
                link: "",
              })
            }
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
          >
            <FaPlus /> Add document
          </button>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Testimonials & Gallery</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {mission.testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl space-y-4"
                >
                  {renderTextarea(
                    testimonial.quote,
                    (val) =>
                      updateArrayItem<MissionTestimonial>(
                        "testimonials",
                        index,
                        (item) => ({ ...item, quote: val })
                      ),
                    "💬 Add a story from a participant or partner…",
                    "min-h-[120px]"
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    {renderInput(
                      testimonial.author,
                      (val) =>
                        updateArrayItem<MissionTestimonial>(
                          "testimonials",
                          index,
                          (item) => ({ ...item, author: val })
                        ),
                      "Author..."
                    )}
                    {renderInput(
                      testimonial.role,
                      (val) =>
                        updateArrayItem<MissionTestimonial>(
                          "testimonials",
                          index,
                          (item) => ({ ...item, role: val })
                        ),
                      "Role..."
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  addArrayItem<MissionTestimonial>("testimonials", {
                    quote: "",
                    author: "",
                    role: "",
                  })
                }
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
              >
                <FaPlus /> Add testimonial
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mission.gallery.map((item, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-white/20 shadow-lg bg-white/5 p-4 space-y-3"
                >
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-black/20 flex items-center justify-center">
                    {item.src ? (
                      <img
                        src={item.src}
                        alt={item.alt || `Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white/40 text-sm">Preview will appear here</span>
                    )}
                  </div>
                  {renderInput(
                    item.alt,
                    (val) =>
                      updateArrayItem<MissionGalleryItem>(
                        "gallery",
                        index,
                        (g) => ({ ...g, alt: val })
                      ),
                    "Alt text..."
                  )}
                  {renderInput(
                    item.src,
                    (val) =>
                      updateArrayItem<MissionGalleryItem>(
                        "gallery",
                        index,
                        (g) => ({ ...g, src: val })
                      ),
                    "Image URL..."
                  )}
                  {item.fileName && (
                    <p className="text-xs text-white/60">Uploaded: {item.fileName}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <input
                      id={`gallery-upload-${index}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleGalleryFileChange(event, index)}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById(`gallery-upload-${index}`)?.click()
                      }
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
                    >
                      Upload from computer
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  addArrayItem<MissionGalleryItem>("gallery", { src: "", alt: "" })
                }
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold min-h-[160px]"
              >
                <FaPlus /> Add gallery image
              </button>
            </div>
          </div>
        </section>

        <section className="text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold">
            Create a mission that transforms lives.
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Invite volunteers, coordinate logistics, and share powerful stories of impact.
          </p>
          {(membershipLoading || membershipError || saveError || saveNotice) && (
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm">
              {membershipLoading && (
                <p className="text-white/70">Loading organization access...</p>
              )}
              {!membershipLoading && membershipError && (
                <p className="text-[#ffd08b]">
                  Organization context warning: {membershipError}
                </p>
              )}
              {saveError && <p className="text-[#ffb48d]">Save failed: {saveError}</p>}
              {saveNotice && <p className="text-white/80">{saveNotice}</p>}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || membershipLoading}
            className="px-8 py-3 rounded-xl bg-[#271c70] hover:bg-[#ff9c4b] hover:text-black transition font-semibold shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "💾 Save New Mission"}
          </button>
        </section>
      </div>
    </main>
  );
}
