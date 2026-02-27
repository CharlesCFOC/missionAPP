"use client";

import { motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiCalendar,
  FiCoffee,
  FiDollarSign,
  FiHome,
  FiInfo,
  FiMapPin,
  FiSend,
  FiShield,
} from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import { MissionData } from "../types";
import { fadeIn } from "../utils";
import { TextInput } from "./inputs";

type PracticalInfoSectionProps = {
  missionState: MissionData;
  isEditMode: boolean;
  onAddPractical: () => void;
  onPracticalChange: (index: number, key: "icon" | "label" | "value", value: string) => void;
};

const getPracticalIcon = (label: string) => {
  const normalized = label.toLowerCase();
  if (normalized.includes("date")) return FiCalendar;
  if (normalized.includes("destination")) return FiMapPin;
  if (normalized.includes("cost") || normalized.includes("price")) return FiDollarSign;
  if (normalized.includes("departure")) return FiSend;
  if (normalized.includes("accommodation") || normalized.includes("lodging")) return FiHome;
  if (normalized.includes("meals") || normalized.includes("meal")) return FiCoffee;
  if (normalized.includes("vaccine") || normalized.includes("vaccin")) return FiShield;
  if (normalized.includes("requirement")) return FiAlertTriangle;
  return FiInfo;
};

export const PracticalInfoSection = ({
  missionState,
  isEditMode,
  onAddPractical,
  onPracticalChange,
}: PracticalInfoSectionProps) => (
  <motion.section
    variants={fadeIn}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6 }}
    className="space-y-6 h-full flex flex-col"
  >
    <h2 className="text-2xl font-bold text-[#ff9c4b]">Informations</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
      {missionState.practicalInfo.map((item, index) => {
        const Icon = getPracticalIcon(item.label);
        return (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-lg min-h-[140px] flex flex-col justify-between"
          >
            {isEditMode ? (
              <>
                <TextInput
                  value={item.icon}
                  onChange={(val) => onPracticalChange(index, "icon", val)}
                  placeholder="Icon..."
                />
                <TextInput
                  value={item.label}
                  onChange={(val) => onPracticalChange(index, "label", val)}
                  placeholder="Label..."
                />
                <TextInput
                  value={item.value}
                  onChange={(val) => onPracticalChange(index, "value", val)}
                  placeholder="Value..."
                />
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-white/85" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-xs text-white/60 uppercase tracking-wide">{item.label}</p>
                </div>
                <p className="text-base font-semibold text-white mt-1">{item.value}</p>
              </>
            )}
          </div>
        );
      })}
    </div>
    {isEditMode && (
      <button
        onClick={onAddPractical}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
      >
        <FaPlus /> Add info item
      </button>
    )}
  </motion.section>
);
