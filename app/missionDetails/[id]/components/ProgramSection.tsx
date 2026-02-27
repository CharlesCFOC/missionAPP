"use client";

import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import { MissionTimelineEntry } from "../types";
import { fadeIn } from "../utils";
import { TextInput, Textarea } from "./inputs";

type ProgramSectionProps = {
  timeline: MissionTimelineEntry[];
  isEditMode: boolean;
  onAddTimelineEntry: () => void;
  onTimelineChange: (index: number, key: keyof MissionTimelineEntry, value: string) => void;
};

export const ProgramSection = ({
  timeline,
  isEditMode,
  onAddTimelineEntry,
  onTimelineChange,
}: ProgramSectionProps) => (
  <motion.section
    variants={fadeIn}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6 }}
    className="space-y-4 h-full flex flex-col"
  >
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <h2 className="text-2xl font-bold text-[#ff9c4b]">Program</h2>
      {isEditMode ? (
        <TextInput
          value=""
          onChange={() => undefined}
          placeholder="Provide a link to the detailed schedule"
          className="pointer-events-none opacity-70"
        />
      ) : (
        <a
          href="https://example.com/zambia-detailed-planning.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-3 rounded-xl bg-gradient-to-r from-[#ff9c4b] via-[#ffb86b] to-[#ff9c4b] text-white hover:scale-[1.02] transition font-semibold shadow-lg text-sm"
        >
          Full Schedule (PDF)
        </a>
      )}
    </div>
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex-1 min-h-0 flex flex-col">
      <div className="relative pl-8 max-h-[60vh] md:max-h-[520px] overflow-y-auto pr-3 cfoc-scrollbar flex-1 min-h-0">
        <span className="absolute top-0 left-2 h-full w-[2px] bg-gradient-to-b from-[#ff9c4b] via-[#ffd08b] to-transparent opacity-90 shadow-[0_0_10px_rgba(255,156,75,0.55)]" />
        <ul className="space-y-5">
          {timeline.map((entry, index) => (
            <li key={index} className="relative">
              <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#ff9c4b] border-4 border-[#271c70] shadow-[0_0_10px_rgba(255,156,75,0.7)]" />
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-md space-y-2">
                {isEditMode ? (
                  <>
                    <TextInput
                      value={entry.day}
                      onChange={(val) => onTimelineChange(index, "day", val)}
                      placeholder="Day label..."
                    />
                    <TextInput
                      value={entry.title}
                      onChange={(val) => onTimelineChange(index, "title", val)}
                      placeholder="Title..."
                    />
                    <Textarea
                      value={entry.details}
                      onChange={(val) => onTimelineChange(index, "details", val)}
                      placeholder="Details..."
                      className="min-h-[90px]"
                    />
                  </>
                ) : (
                  <>
                    <p className="text-xs uppercase tracking-wide text-white/60">{entry.day}</p>
                    <h3 className="text-lg font-semibold text-white mt-0">{entry.title}</h3>
                    <p className="text-sm text-white/80 mt-1 leading-relaxed">{entry.details}</p>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    {isEditMode && (
      <button
        onClick={onAddTimelineEntry}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
      >
        <FaPlus /> Add day / activity
      </button>
    )}
  </motion.section>
);
