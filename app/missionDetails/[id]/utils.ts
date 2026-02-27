"use client";

import { MissionData } from "./types";

export const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const formatDateRange = (start?: string, end?: string) => {
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
  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();
  const startLabel = dateFormatter.format(startDate);
  const endLabel = sameMonth ? endDate.getDate().toString() : dateFormatter.format(endDate);
  const yearLabel = endDate.getFullYear();
  return `${startLabel} to ${endLabel}, ${yearLabel}`;
};

export const parseDateDisplay = (value: string) => {
  if (!value) {
    return { startDate: "", endDate: "" };
  }
  const normalized = value.replace(/–|—/g, " to ");
  const parts = normalized.split(" to ");
  if (parts.length >= 2) {
    const startPart = parts[0].trim();
    const endSection = parts.slice(1).join(" to ").trim();
    const [endPartRaw, yearRaw] = endSection.split(",").map((segment) => segment.trim());
    const year = yearRaw || startPart.split(",").pop() || `${new Date().getFullYear()}`;
    const startDateCandidate = new Date(`${startPart}, ${year}`);
    const endMonthProvided = /[A-Za-z]/.test(endPartRaw);
    const endPart = endMonthProvided ? endPartRaw : `${startPart.split(" ")[0]} ${endPartRaw}`;
    const endDateCandidate = new Date(`${endPart}, ${year}`);
    if (
      !Number.isNaN(startDateCandidate.getTime()) &&
      !Number.isNaN(endDateCandidate.getTime())
    ) {
      return {
        startDate: startDateCandidate.toISOString().substring(0, 10),
        endDate: endDateCandidate.toISOString().substring(0, 10),
      };
    }
  }
  return { startDate: "", endDate: "" };
};

export const readFileAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const deriveDateRange = (missionData: MissionData) => {
  if (missionData.startDate || missionData.endDate) {
    return {
      startDate: missionData.startDate ?? "",
      endDate: missionData.endDate ?? "",
    };
  }
  return parseDateDisplay(missionData.dateDisplay);
};
