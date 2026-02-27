"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaCalendarCheck, FaEnvelope, FaPhoneAlt, FaPlus } from "react-icons/fa";
import { MissionLeader } from "../types";
import { fadeIn } from "../utils";
import { TextInput } from "./inputs";

type LeadersSectionProps = {
  leaders: MissionLeader[];
  isEditMode: boolean;
  onAddLeader: () => void;
  onRemoveLeader: (index: number) => void;
  onLeaderChange: (index: number, key: keyof MissionLeader, value: string) => void;
  onInviteUser?: (email: string) => void;
};

export const LeadersSection = ({
  leaders,
  isEditMode,
  onAddLeader,
  onRemoveLeader,
  onLeaderChange,
  onInviteUser,
}: LeadersSectionProps) => {
  const [searchEmail, setSearchEmail] = useState("");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const existingProfiles = useMemo(
    () => [
      {
        email: "marie.dupont@cfoc.org",
        name: "Marie Dupont",
        role: "Global coordinator",
        phone: "+1 (404) 555-0184",
        image:
          "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      },
      {
        email: "james.banda@hopezambia.org",
        name: "James Banda",
        role: "Field leader - Hope Zambia",
        phone: "+260 97 555 0134",
        image:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      },
      {
        email: "rachel.mwewa@cfoc.org",
        name: "Rachel Mwewa",
        role: "Logistics lead",
        phone: "+260 96 555 0441",
        image:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      },
    ],
    []
  );

  const handleInviteOrAssign = () => {
    const trimmed = searchEmail.trim().toLowerCase();
    if (!trimmed) return;

    const found = existingProfiles.find(
      (profile) => profile.email.toLowerCase() === trimmed
    );

    const targetIndex =
      leaders.findIndex(
        (leader) => !leader.email || leader.email.toLowerCase() === trimmed
      ) || 0;

    if (found) {
      onLeaderChange(targetIndex, "name", found.name);
      onLeaderChange(targetIndex, "role", found.role);
      onLeaderChange(targetIndex, "phone", found.phone);
      onLeaderChange(targetIndex, "email", found.email);
      onLeaderChange(targetIndex, "avatar", found.image);
      onLeaderChange(
        targetIndex,
        "image" as unknown as keyof MissionLeader,
        found.image as string
      );
      return;
    }

    onInviteUser?.(trimmed);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadedURL = URL.createObjectURL(file);
    onLeaderChange(index, "avatar", uploadedURL);
    onLeaderChange(index, "image" as unknown as keyof MissionLeader, uploadedURL);
    event.target.value = "";
  };

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-[#ff9c4b]">Mission leadership</h2>

      {isEditMode && (
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <TextInput
            value={searchEmail}
            onChange={setSearchEmail}
            placeholder="Search user by email"
            className="sm:flex-1"
          />
          <button
            onClick={handleInviteOrAssign}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#271c70] hover:bg-[#ff9c4b] hover:text-black transition font-semibold shadow text-sm"
          >
            Invite / Assign
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaders.map((leader, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl space-y-4 relative"
          >
            {isEditMode && (
              <button
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center text-base shadow-lg"
                onClick={() => onRemoveLeader(index)}
                aria-label="Remove leader"
              >
                ×
              </button>
            )}

            <img
              src={
                leader.image ||
                leader.avatar ||
                (isEditMode
                  ? "https://via.placeholder.com/128x128.png?text=Avatar"
                  : "")
              }
              alt={leader.name || "Leader avatar"}
              className="w-32 h-32 object-cover rounded-2xl border border-white/20 shadow-lg mx-auto"
            />

            {isEditMode && (
              <>
                <input
                  ref={(el) => {
                    fileInputRefs.current[index] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleFileChange(event, index)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[index]?.click()}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
                >
                  Upload photo
                </button>
              </>
            )}

            <div className="flex-1 space-y-3">
              {isEditMode ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  <TextInput
                    value={leader.name}
                    onChange={(val) => onLeaderChange(index, "name", val)}
                    placeholder="Leader name..."
                  />
                  <TextInput
                    value={leader.role}
                    onChange={(val) => onLeaderChange(index, "role", val)}
                    placeholder="Role..."
                  />
                  <TextInput
                    value={leader.email}
                    onChange={(val) => onLeaderChange(index, "email", val)}
                    placeholder="Email..."
                  />
                  <TextInput
                    value={leader.phone}
                    onChange={(val) => onLeaderChange(index, "phone", val)}
                    placeholder="Phone..."
                  />
                  <TextInput
                    value={leader.avatar}
                    onChange={(val) => onLeaderChange(index, "avatar", val)}
                    placeholder="Avatar URL..."
                    className="sm:col-span-2"
                  />
                </div>
              ) : (
                <div className="space-y-3 text-center">
                  <div>
                    <h3 className="text-xl font-semibold">{leader.name}</h3>
                    <p className="text-sm text-white/70 font-medium">{leader.role}</p>
                  </div>
                  <div className="flex flex-nowrap items-center gap-3 justify-center">
                    {leader.email && (
                      <a
                        href={`mailto:${leader.email}`}
                        aria-label="Email leader"
                        title="Email"
                        className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#271c70] hover:bg-[#ff9c4b] hover:text-black transition shadow"
                      >
                        <FaEnvelope />
                      </a>
                    )}
                    {leader.phone && (
                      <a
                        href={`tel:${leader.phone.replace(/\s+/g, "")}`}
                        aria-label="Call leader"
                        title="Phone"
                        className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-white/30 hover:border-[#ff9c4b] transition shadow"
                      >
                        <FaPhoneAlt />
                      </a>
                    )}
                    <button
                      type="button"
                      aria-label="Schedule a call"
                      title="Schedule a call"
                      className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 transition shadow"
                    >
                      <FaCalendarCheck />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isEditMode && (
        <button
          onClick={onAddLeader}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
        >
          <FaPlus /> Add leader
        </button>
      )}
    </motion.section>
  );
};
