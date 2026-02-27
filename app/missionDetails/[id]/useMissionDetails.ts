"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { missions } from "./missionData";
import { MissionData, MissionGalleryItem, MissionLeader, MissionStat } from "./types";
import { deriveDateRange, formatDateRange, readFileAsDataURL } from "./utils";

const LOCAL_STORAGE_KEY = "cfoc-missions";

export const useMissionDetails = (missionId?: string) => {
  const router = useRouter();
  const mission = useMemo(() => {
    if (missionId && missions[missionId]) {
      return missions[missionId];
    }
    return missions["1"];
  }, [missionId]);

  const missionClone = useMemo(
    () => JSON.parse(JSON.stringify(mission)) as MissionData,
    [mission]
  );

  const [missionState, setMissionState] = useState<MissionData>(missionClone);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>(() =>
    deriveDateRange(missionClone)
  );
  const [isLocalMission, setIsLocalMission] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const clone = JSON.parse(JSON.stringify(mission)) as MissionData;
    const range = deriveDateRange(clone);
    setMissionState({
      ...clone,
      startDate: range.startDate || clone.startDate,
      endDate: range.endDate || clone.endDate,
      dateDisplay:
        clone.dateDisplay || formatDateRange(range.startDate, range.endDate) || clone.dateDisplay,
    });
    setDateRange(range);
    setIsLocalMission(false);
  }, [mission]);

  useEffect(() => {
    if (typeof window === "undefined" || !missionId) return;
    const storedRaw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedRaw) return;
    try {
      const storedMissions = JSON.parse(storedRaw) as MissionData[];
      const found = storedMissions.find((item) => item.id === missionId);
      if (found) {
        const clone = JSON.parse(JSON.stringify(found)) as MissionData;
        const range = deriveDateRange(clone);
        setMissionState({
          ...clone,
          startDate: range.startDate || clone.startDate,
          endDate: range.endDate || clone.endDate,
          dateDisplay:
            clone.dateDisplay || formatDateRange(range.startDate, range.endDate) || clone.dateDisplay,
        });
        setDateRange(range);
        setIsLocalMission(true);
      }
    } catch (error) {
      console.error("Failed to load mission from localStorage", error);
    }
  }, [missionId]);

  const updateField = <K extends keyof MissionData>(field: K, value: MissionData[K]) => {
    setMissionState((prev) => ({ ...prev, [field]: value }));
  };

  const updateNumberField = (field: keyof MissionData, value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    updateField(field, parsed as MissionData[typeof field]);
  };

  const handleDateChange = (key: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => {
      const next = { ...prev, [key]: value };
      const formatted = formatDateRange(next.startDate, next.endDate);
      setMissionState((prevMission) => ({
        ...prevMission,
        startDate: next.startDate || undefined,
        endDate: next.endDate || undefined,
        dateDisplay: formatted || prevMission.dateDisplay,
      }));
      return next;
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
      handleGalleryChange(index, "src", dataUrl);
      handleGalleryChange(index, "fileName", file.name);
      handleGalleryChange(index, "fileData", dataUrl);
      if (!missionState.gallery[index]?.alt) {
        handleGalleryChange(index, "alt", file.name);
      }
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
      updateField(
        "documents",
        missionState.documents.map((item, i) =>
          i === index
            ? {
                ...item,
                title: item.title || file.name,
                link: dataUrl,
                fileName: file.name,
                fileData: dataUrl,
              }
            : item
        )
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleObjectiveChange = (index: number, value: string) => {
    updateField(
      "objectives",
      missionState.objectives.map((item, i) => (i === index ? value : item))
    );
  };

  const handleStatChange = (index: number, key: keyof MissionStat, value: string) => {
    updateField(
      "stats",
      missionState.stats.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handlePracticalChange = (
    index: number,
    key: "icon" | "label" | "value",
    value: string
  ) => {
    updateField(
      "practicalInfo",
      missionState.practicalInfo.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleTimelineChange = (
    index: number,
    key: keyof MissionData["timeline"][number],
    value: string
  ) => {
    updateField(
      "timeline",
      missionState.timeline.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleLeaderChange = (index: number, key: keyof MissionLeader, value: string) => {
    updateField(
      "leaders",
      missionState.leaders.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleDocumentChange = (
    index: number,
    key: keyof MissionData["documents"][number],
    value: string
  ) => {
    updateField(
      "documents",
      missionState.documents.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleTestimonialChange = (
    index: number,
    key: keyof MissionData["testimonials"][number],
    value: string
  ) => {
    updateField(
      "testimonials",
      missionState.testimonials.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleGalleryChange = (index: number, key: keyof MissionGalleryItem, value: string) => {
    updateField(
      "gallery",
      missionState.gallery.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const addObjective = () => updateField("objectives", [...missionState.objectives, ""]);
  const addStat = () => updateField("stats", [...missionState.stats, { label: "", value: "" }]);
  const addPractical = () =>
    updateField("practicalInfo", [...missionState.practicalInfo, { icon: "", label: "", value: "" }]);
  const addTimelineEntry = () =>
    updateField("timeline", [...missionState.timeline, { day: "", title: "", details: "" }]);
  const addLeader = () =>
    updateField("leaders", [
      ...missionState.leaders,
      { name: "", role: "", email: "", phone: "", avatar: "" },
    ]);
  const removeLeader = (index: number) =>
    updateField(
      "leaders",
      missionState.leaders.filter((_, i) => i !== index)
    );
  const addDocument = () =>
    updateField("documents", [
      ...missionState.documents,
      { title: "", description: "", link: "" },
    ]);
  const addTestimonial = () =>
    updateField("testimonials", [...missionState.testimonials, { quote: "", author: "", role: "" }]);
  const addGalleryItem = () => updateField("gallery", [...missionState.gallery, { src: "", alt: "" }]);

  const handleCancel = () => {
    if (!missionId) return;
    router.replace(`/missionDetails/${missionId}`);
  };

  const handleSave = () => {
    if (!missionId) return;
    console.log("Mission updated:", missionState);
    if (typeof window === "undefined" || !isLocalMission) {
      return;
    }
    const storedRaw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedRaw) return;
    try {
      const storedMissions = JSON.parse(storedRaw) as MissionData[];
      const index = storedMissions.findIndex((item) => item.id === missionId);
      if (index === -1) return;

      const cleanedMission: MissionData = {
        ...missionState,
        dateDisplay: formatDateRange(dateRange.startDate, dateRange.endDate) || missionState.dateDisplay,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        objectives: missionState.objectives.filter((item) => item.trim().length > 0),
        stats: missionState.stats.filter(
          (item) => item.label.trim().length > 0 || item.value.trim().length > 0
        ),
        practicalInfo: missionState.practicalInfo.filter(
          (item) =>
            item.label.trim().length > 0 || item.value.trim().length > 0 || item.icon.trim().length > 0
        ),
        timeline: missionState.timeline.filter(
          (item) =>
            item.title.trim().length > 0 || item.details.trim().length > 0 || item.day.trim().length > 0
        ),
        leaders: missionState.leaders.filter(
          (item) =>
            item.name.trim().length > 0 ||
            item.role.trim().length > 0 ||
            item.email.trim().length > 0 ||
            item.phone.trim().length > 0
        ),
        documents: missionState.documents.filter(
          (item) => item.title.trim().length > 0 || item.link.trim().length > 0 || item.fileData
        ),
        testimonials: missionState.testimonials.filter((item) => item.quote.trim().length > 0),
        gallery: missionState.gallery.filter((item) => item.src.trim().length > 0),
      };

      storedMissions[index] = cleanedMission;
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedMissions));
    } catch (error) {
      console.error("Failed to update mission in localStorage", error);
    }
  };

  const handlePreview = () => {
    if (!missionId) return;
    router.push(`/missionDetails/${missionId}`);
  };

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  const spotsRemaining = missionState.totalSpots - missionState.spotsReserved;
  const progressPercentage = Math.min(
    (missionState.spotsReserved / Math.max(missionState.totalSpots, 1)) * 100,
    100
  );

  return {
    missionState,
    dateRange,
    isLocalMission,
    coverFileInputRef,
    updateField,
    updateNumberField,
    handleDateChange,
    handleCoverFileChange,
    handleGalleryFileChange,
    handleDocumentFileChange,
    handleObjectiveChange,
    handleStatChange,
    handlePracticalChange,
    handleTimelineChange,
    handleLeaderChange,
    handleDocumentChange,
    handleTestimonialChange,
    handleGalleryChange,
    addObjective,
    addStat,
    addPractical,
    addTimelineEntry,
    addLeader,
    removeLeader,
    addDocument,
    addTestimonial,
    addGalleryItem,
    handleCancel,
    handleSave,
    handlePreview,
    priceFormatter,
    spotsRemaining,
    progressPercentage,
  };
};
