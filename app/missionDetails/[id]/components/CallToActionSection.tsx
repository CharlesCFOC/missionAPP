"use client";

import { motion } from "framer-motion";
import { TextInput } from "./inputs";
import { fadeIn } from "../utils";

type CallToActionSectionProps = {
  isEditMode: boolean;
  missionName: string;
};

export const CallToActionSection = ({ isEditMode, missionName }: CallToActionSectionProps) => (
  <motion.section
    variants={fadeIn}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6 }}
    className="text-center space-y-6"
  >
    {isEditMode ? (
      <TextInput
        value={missionName}
        onChange={() => undefined}
        placeholder="This call-to-action reflects your mission message."
        className="pointer-events-none opacity-60 text-lg"
      />
    ) : (
      <p className="text-base md:text-lg italic text-white">
        Transforming Lives, Impacting Communities.
      </p>
    )}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <button className="px-6 py-3 rounded-xl border border-white/30 hover:border-[#ff9c4b] transition font-semibold shadow-lg text-sm">
        Join this mission
      </button>
      <button className="px-6 py-3 rounded-xl border border-white/30 hover:border-[#ff9c4b] transition font-semibold shadow-lg text-sm">
        Donate now
      </button>
    </div>
  </motion.section>
);
