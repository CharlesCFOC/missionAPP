"use client";

import { motion, AnimatePresence } from "framer-motion";

type Member = {
  id: string;
  name: string;
  role: "Leader" | "Volunteer" | "Medical" | "Logistics" | "Pending";
  email: string;
  avatar: string;
  location: string;
  phone: string;
  tasks: string[];
  assignedMissions?: string[];
  assignedProjects?: string[];
  skills?: string[];
};

type MemberDrawerProps = {
  member: Member | null;
  onClose: () => void;
  onAssignmentsChange?: (id: string, data: { missions: string[]; projects: string[] }) => void;
};

export default function MemberDrawer({ member, onClose, onAssignmentsChange }: MemberDrawerProps) {
  return (
    <AnimatePresence>
      {member && (
        <div className="fixed inset-0 z-40 flex top-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="ml-auto mt-[65px] flex h-full w-full max-w-[420px] flex-col gap-4 border-l border-white/20 bg-[#080313]/90 p-6 text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={member.avatar} alt={member.name} className="h-12 w-12 rounded-full border-2 border-[#ff9c4b]" />
                <div>
                  <p className="text-lg font-semibold">{member.name}</p>
                  <p className="text-sm text-white/60">{member.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/70 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Email</span>
                <button
                  type="button"
                  className="underline decoration-dotted underline-offset-4 hover:text-white"
                  onClick={() => navigator.clipboard?.writeText(member.email)}
                >
                  {member.email}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Phone</span>
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Location</span>
                <span>{member.location}</span>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white">
              <p className="text-sm font-semibold text-[#ff9c4b]">Tasks</p>
              {member.tasks.length === 0 ? (
                <p className="text-white/60">No tasks assigned.</p>
              ) : (
                <ul className="space-y-2">
                  {member.tasks.map((task) => (
                    <li key={task} className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm">
                      <span className="text-white/60">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Private Note */}
            <div className="space-y-2 rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white">
              <p className="text-sm font-semibold text-[#ff9c4b]">Private Note</p>
              <textarea
                className="w-full rounded-lg bg-white/10 p-2 text-white/80 outline-none border border-white/10 focus:border-[#ff9c4b]"
                rows={3}
                placeholder="Write a private note here..."
              />
            </div>

            {/* Skill List */}
            <div className="space-y-2 rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white">
              <p className="text-sm font-semibold text-[#ff9c4b]">Skills</p>
              <ul className="space-y-2">
                {(member.skills ?? []).map((skill) => (
                  <li
                    key={skill}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      className="text-white/60 hover:text-white"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="mt-2 rounded-lg bg-white/10 px-3 py-1 text-sm text-white/70 hover:text-white"
              >
                + Add Skill
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
