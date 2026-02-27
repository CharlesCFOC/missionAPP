"use client";

import { ChangeEvent, CSSProperties, RefObject, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCalendarCheck, FaMapMarkerAlt } from "react-icons/fa";
import { MissionData } from "../types";
import { fadeIn } from "../utils";
import { DateInput, TextInput } from "./inputs";

type HeaderSectionProps = {
  missionState: MissionData;
  isEditMode: boolean;
  dateRange: { startDate: string; endDate: string };
  formattedDateRange: string;
  spotsRemaining: number;
  progressPercentage: number;
  priceFormatter: Intl.NumberFormat;
  onUpdateField: <K extends keyof MissionData>(field: K, value: MissionData[K]) => void;
  onUpdateNumberField: (field: keyof MissionData, value: string) => void;
  onDateChange: (key: "startDate" | "endDate", value: string) => void;
  onCoverFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  coverFileInputRef: RefObject<HTMLInputElement | null>;
};

const DEFAULT_PALETTE = {
  a: "rgba(166, 2, 255, 1)",
  b: "rgba(249, 180, 255, 0.99)",
  c: "rgba(151, 17, 161, 0.52)",
  d: "rgba(7, 244, 55, 1)",
};

const MISSION_PALETTES: Record<string, typeof DEFAULT_PALETTE> = {
  zambia: {
    a: "rgba(145, 0, 155, 0.95)",
    b: "rgba(255, 143, 0, 0.95)",
    c: "rgba(211, 14, 255, 0.85)",
    d: "rgba(119, 218, 13, 0.95)",
  },
};

const getMissionPalette = (country?: string) => {
  const key = country?.toLowerCase().trim() ?? "";
  return MISSION_PALETTES[key] ?? DEFAULT_PALETTE;
};

const formatCountdownUnit = (value: number) => value.toString().padStart(2, "0");

export const HeaderSection = ({
  missionState,
  isEditMode,
  dateRange,
  formattedDateRange,
  spotsRemaining,
  progressPercentage,
  priceFormatter,
  onUpdateField,
  onUpdateNumberField,
  onDateChange,
  onCoverFileChange,
  coverFileInputRef,
}: HeaderSectionProps) => {
  const palette = getMissionPalette(missionState.country);
  const countdownTarget = dateRange.startDate || missionState.startDate || "";
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const renderHoverTitle = (value: string) => (
    <span className="inline-block">
      {value.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          aria-hidden="true"
          className="inline-block opacity-70 transition duration-300 ease-out hover:opacity-100 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
  const auroraStyle = {
    "--aurora-1": palette.a,
    "--aurora-2": palette.b,
    "--aurora-3": palette.c,
    "--aurora-4": palette.d,
  } as CSSProperties;

  useEffect(() => {
    if (!countdownTarget) {
      setCountdown(null);
      return;
    }
    const targetValue = countdownTarget.includes("T")
      ? countdownTarget
      : `${countdownTarget}T00:00:00`;
    const target = new Date(targetValue);
    if (Number.isNaN(target.getTime())) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = totalSeconds % 60;
      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [countdownTarget]);

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl shadow-2xl"
    >
      <div className="relative h-[480px] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#ff9c4b]/45 via-[#ffb86b]/25 to-[#080313]/80" />
        <div
          className="absolute inset-0 mission-aurora pointer-events-none"
          style={auroraStyle}
          aria-hidden="true"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#080313]/70 via-[#260d5c]/60 to-[#080313]/80" />
        <div className="relative z-10 p-10 space-y-6 backdrop-blur-[2px] h-full">
          {countdown && (
            <div className="md:absolute md:left-10 md:top-10">
              <div className="flex flex-wrap items-center gap-6 text-white">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-semibold tabular-nums">
                    {countdown.days}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                    Jours
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-semibold tabular-nums">
                    {formatCountdownUnit(countdown.hours)}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                    Heures
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-semibold tabular-nums">
                    {formatCountdownUnit(countdown.minutes)}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                    Minutes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-semibold tabular-nums">
                    {formatCountdownUnit(countdown.seconds)}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                    Secondes
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col md:flex-row md:gap-10 h-full">
            <div className="space-y-3 md:flex md:flex-col md:justify-end md:flex-1">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                Mission Trip
              </p>
              {isEditMode ? (
                <TextInput
                  value={missionState.name}
                  onChange={(val) => onUpdateField("name", val)}
                  placeholder="Mission title..."
                  className="text-3xl font-extrabold text-[#ff9c4b]"
                />
              ) : (
                <h1
                  className="text-3xl md:text-4xl font-extrabold text-[#ff9c4b]"
                  aria-label={missionState.name}
                >
                  {renderHoverTitle(missionState.name)}
                </h1>
              )}
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                <span className="inline-flex items-center gap-2 text-base font-medium">
                  <FaMapMarkerAlt className="text-[#ff9c4b]" />
                  {isEditMode ? (
                    <div className="flex items-center gap-2">
                      <TextInput
                        value={missionState.city}
                        onChange={(val) => onUpdateField("city", val)}
                        placeholder="City..."
                        className="w-40 text-sm"
                      />
                      <TextInput
                        value={missionState.country}
                        onChange={(val) => onUpdateField("country", val)}
                        placeholder="Country..."
                        className="w-40 text-sm"
                      />
                    </div>
                  ) : (
                    <>
                      {missionState.city}, {missionState.country}{" "}
                      {missionState.countryFlag}
                    </>
                  )}
                </span>
                <span className="inline-flex items-center gap-2 text-base font-medium">
                  <FaCalendarCheck className="text-[#ff9c4b]" />
                  {isEditMode ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <DateInput
                          value={dateRange.startDate}
                          onChange={(val) => onDateChange("startDate", val)}
                          className="w-40 text-sm"
                        />
                        <span className="text-xs text-white/70">to</span>
                        <DateInput
                          value={dateRange.endDate}
                          onChange={(val) => onDateChange("endDate", val)}
                          className="w-40 text-sm"
                        />
                      </div>
                      <span className="text-xs text-white/60">
                        {formattedDateRange || "Select a start and end date"}
                      </span>
                    </div>
                  ) : (
                    missionState.dateDisplay
                  )}
                </span>
              </div>
            </div>
            <div className="md:flex md:items-center">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl w-full md:w-[320px] space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase text-white/60">
                      Cost per person
                    </p>
                    {isEditMode ? (
                      <TextInput
                        value={missionState.pricePerPerson.toString()}
                        onChange={(val) =>
                          onUpdateNumberField("pricePerPerson", val)
                        }
                        placeholder="$0"
                        className="text-2xl font-extrabold"
                      />
                    ) : (
                      <p className="text-2xl font-extrabold">
                        {priceFormatter.format(missionState.pricePerPerson)}
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold text-xs motion-safe:animate-pulse">
                    {missionState.status ?? "Active"}
                  </span>
                </div>
                <div className="rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    {isEditMode ? (
                      <>
                        <TextInput
                          value={missionState.totalSpots.toString()}
                          onChange={(val) =>
                            onUpdateNumberField("totalSpots", val)
                          }
                          placeholder="Total spots"
                          className="w-28"
                        />
                        <TextInput
                          value={missionState.spotsReserved.toString()}
                          onChange={(val) =>
                            onUpdateNumberField("spotsReserved", val)
                          }
                          placeholder="Reserved spots"
                          className="w-28"
                        />
                      </>
                    ) : (
                      <>
                        <span>{missionState.spotsReserved} already reserved</span>
                        <span>{spotsRemaining} spots left</span>
                      </>
                    )}
                  </div>
                  <div className="h-3 bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff9c4b] to-[#ffd08b]"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  {!isEditMode && (
                    <div className="flex flex-col gap-3 pt-4">
                      <button className="w-full px-6 py-3 rounded-xl border border-white/30 bg-white/10 hover:border-[#ff9c4b] transition font-semibold shadow-xl text-center text-sm">
                        Make a donation
                      </button>

                      <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff9c4b] to-[#ffd08b] text-white hover:from-[#ffb86b] hover:to-[#ffe2b5] transition font-semibold shadow-xl text-center text-sm">
                        Join the mission
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {isEditMode && (
          <div className="absolute top-6 right-6 w-64 flex flex-col gap-2 z-20">
            <TextInput
              value={missionState.coverImage}
              onChange={(val) => onUpdateField("coverImage", val)}
              placeholder="Cover image URL..."
            />
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onCoverFileChange}
            />
            <button
              type="button"
              onClick={() => coverFileInputRef.current?.click()}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
            >
              Upload from computer
            </button>
          </div>
        )}
      </div>
    </motion.section>
  );
};
