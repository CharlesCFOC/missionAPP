"use client";

import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import { MissionData, MissionStat } from "../types";
import { fadeIn } from "../utils";
import { TextInput, Textarea } from "./inputs";

type AboutSectionProps = {
  missionState: MissionData;
  isEditMode: boolean;
  onUpdateField: <K extends keyof MissionData>(field: K, value: MissionData[K]) => void;
  onAddObjective: () => void;
  onObjectiveChange: (index: number, value: string) => void;
  onAddStat: () => void;
  onStatChange: (index: number, key: keyof MissionStat, value: string) => void;
};

export const AboutSection = ({
  missionState,
  isEditMode,
  onUpdateField,
  onAddObjective,
  onObjectiveChange,
  onAddStat,
  onStatChange,
}: AboutSectionProps) => (
  <motion.section
    variants={fadeIn}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6 }}
    className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start"
  >
    <div className="lg:col-span-3 space-y-6">
      <h2 className="text-2xl font-bold text-[#ff9c4b]">About the mission</h2>
      {isEditMode ? (
        <Textarea
          value={missionState.description}
          onChange={(val) => onUpdateField("description", val)}
          placeholder="📝 Describe the mission goals and impact..."
          className="min-h-[160px]"
        />
      ) : (
        <p className="text-sm text-white/80 leading-relaxed">{missionState.description}</p>
      )}
      <ul className="space-y-3">
        {missionState.objectives.map((objective, index) => (
          <li
            key={index}
            className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
          >
            <span className="text-[#ff9c4b] mt-1">✦</span>
            {isEditMode ? (
              <Textarea
                value={objective}
                onChange={(val) => onObjectiveChange(index, val)}
                placeholder="Objective detail..."
                className="min-h-[60px]"
              />
            ) : (
              <span className="text-sm text-white/80">{objective}</span>
            )}
          </li>
        ))}
      </ul>
      {isEditMode && (
        <button
          onClick={onAddObjective}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
        >
          <FaPlus /> Add objective
        </button>
      )}
    </div>
    <div className="lg:col-span-2 space-y-4">
      <div
        className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl p-6 space-y-4"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(39,28,112,0.35))",
        }}
      >
        <h3 className="text-lg font-semibold text-[#ff9c4b]">Key statistics</h3>
        <div className="grid grid-cols-1 gap-4">
          {missionState.stats.map((stat, index) => (
            <div key={index} className="bg-white/5 rounded-2xl p-4 space-y-2">
              {isEditMode ? (
                <>
                  <TextInput
                    value={stat.label}
                    onChange={(val) => onStatChange(index, "label", val)}
                    placeholder="Label..."
                  />
                  <TextInput
                    value={stat.value}
                    onChange={(val) => onStatChange(index, "value", val)}
                    placeholder="Value..."
                  />
                </>
              ) : (
                <>
                  <p className="text-xs text-white/60 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-base font-semibold mt-1">{stat.value}</p>
                </>
              )}
            </div>
          ))}
        </div>
        {isEditMode && (
          <button
            onClick={onAddStat}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
          >
            <FaPlus /> Add stat
          </button>
        )}
      </div>
      {isEditMode && (
        <div className="rounded-3xl overflow-hidden border border-white/20 shadow-xl">
          <TextInput
            value={missionState.coverImage}
            onChange={(val) => onUpdateField("coverImage", val)}
            placeholder="Hero background image URL..."
          />
        </div>
      )}
    </div>
  </motion.section>
);
