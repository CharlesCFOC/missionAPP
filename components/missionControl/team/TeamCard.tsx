"use client";

import { motion } from "framer-motion";
import { FiEdit, FiExternalLink } from "react-icons/fi";

type Member = {
  id: string;
  name: string;
  role: "Leader" | "Volunteer" | "Medical" | "Logistics" | "Pending";
  status?: "Active" | "Pending" | "Archived";
  email: string;
  avatar: string;
  location: string;
  assignedMissions?: string[];
  assignedProjects?: string[];
};

type TeamCardProps = {
  member: Member;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onOpen: () => void;
  onAssign?: (member: Member) => void;
};

const roleClasses: Record<Member["role"], string> = {
  Leader: "bg-[#ff9c4b] text-[#080313]",
  Volunteer: "bg-blue-400/30 text-blue-100",
  Medical: "bg-green-400/30 text-green-100",
  Logistics: "bg-purple-400/30 text-purple-100",
  Pending: "bg-amber-300/30 text-amber-100",
};

export default function TeamCard({ member, selected, onSelect, onEdit, onOpen, onAssign }: TeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-xl backdrop-blur-xl"
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onSelect}
        className="h-5 w-5 cursor-pointer accent-[#ff9c4b]"
        aria-label={`Select ${member.name}`}
      />
      <button
        type="button"
        onClick={onOpen}
        className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#ff9c4b]"
      >
        <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
      </button>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-lg font-semibold text-white">{member.name}</p>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleClasses[member.role]}`}>
            {member.role}
          </span>
          {member.status && (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                member.status === "Active"
                  ? "bg-green-400/20 text-green-100"
                  : member.status === "Pending"
                  ? "bg-amber-300/20 text-amber-100"
                  : "bg-red-400/20 text-red-100"
              }`}
            >
              {member.status}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/70">
          <span className="hover:text-white">{member.email}</span>
          <span className="flex items-center gap-1 text-white/60">📍 {member.location}</span>
        </div>
        <p className="mt-2 text-sm text-white/60">
          {member.assignedMissions?.length || member.assignedProjects?.length ? (
            <>Assigned: {member.assignedMissions?.length ?? 0} missions · {member.assignedProjects?.length ?? 0} projects</>
          ) : (
            "No assignments yet"
          )}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAssign?.(member);
          }}
          className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <i className="ri-price-tag-3-line text-lg" />
        </button>
        <button type="button" onClick={onEdit} className="text-white/70 transition hover:text-white">
          <FiEdit size={16} />
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="rounded-lg border border-white/20 bg-white/5 p-2 text-white/80 transition hover:bg-white/15"
        >
          <FiExternalLink size={16} />
        </button>
      </div>
    </motion.div>
  );
}
