"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import TeamOverview from "./TeamOverview";
import TeamFilters from "./TeamFilters";
import TeamSearch from "./TeamSearch";
import TeamCard from "./TeamCard";
import MemberDrawer from "./MemberDrawer";
import BulkActionBar from "./BulkActionBar";
import QuickAssignMenu from "./QuickAssignMenu";

type Member = {
  id: string;
  name: string;
  role: "Leader" | "Volunteer" | "Medical" | "Logistics" | "Pending";
  status: "Active" | "Pending" | "Archived";
  email: string;
  avatar: string;
  location: string;
  phone: string;
  tasks: string[];
  assignedMissions: string[];
  assignedProjects: string[];
};

const MISSION_NAMES = [
  "Medical Outreach - Kenya",
  "Youth Empowerment - Haiti",
  "Well Construction - Zambia",
];
const PROJECT_NAMES = [
  "Clean Water Initiative - Zambia",
  "Youth Empowerment Hub - Haiti",
  "Kenya Medical Outreach Center",
  "School Construction - Kenya",
];

const initialTeams: Member[] = [
  {
    id: "m1",
    name: "Jean M.",
    role: "Leader",
    status: "Active",
    email: "jean@example.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    location: "Zambia",
    phone: "+260-555-1010",
    tasks: ["Coordinate outreach team", "Weekly check-in"],
    assignedMissions: [MISSION_NAMES[0]],
    assignedProjects: [PROJECT_NAMES[0]],
  },
  {
    id: "m2",
    name: "Alice B.",
    role: "Volunteer",
    status: "Active",
    email: "alice@example.com",
    avatar: "https://i.pravatar.cc/150?img=24",
    location: "France",
    phone: "+33-555-8080",
    tasks: ["Logistics lead", "Supplies audit"],
    assignedMissions: [MISSION_NAMES[1]],
    assignedProjects: [],
  },
  {
    id: "m3",
    name: "Mark D.",
    role: "Medical",
    status: "Active",
    email: "mark@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    location: "Brazil",
    phone: "+55-555-2244",
    tasks: ["Clinic scheduling", "Vaccination drive"],
    assignedMissions: [MISSION_NAMES[0]],
    assignedProjects: [PROJECT_NAMES[2]],
  },
  {
    id: "m4",
    name: "Sophia L.",
    role: "Volunteer",
    status: "Pending",
    email: "sophia@example.com",
    avatar: "https://i.pravatar.cc/150?img=30",
    location: "Kenya",
    phone: "+254-555-6633",
    tasks: ["Onboarding paperwork"],
    assignedMissions: [MISSION_NAMES[2]],
    assignedProjects: [],
  },
  {
    id: "m5",
    name: "David R.",
    role: "Logistics",
    status: "Active",
    email: "david@example.com",
    avatar: "https://i.pravatar.cc/150?img=50",
    location: "USA",
    phone: "+1-555-9999",
    tasks: ["Transport coordination", "Warehouse inventory"],
    assignedMissions: [MISSION_NAMES[1]],
    assignedProjects: [PROJECT_NAMES[1]],
  },
];

export default function MissionTeamsTab() {
  const [members, setMembers] = useState<Member[]>(initialTeams);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerMember, setDrawerMember] = useState<Member | null>(null);
  const [assignTarget, setAssignTarget] = useState<Member | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const availableProjects = PROJECT_NAMES;
  const availableMissions = MISSION_NAMES;

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesFilter =
        activeFilter === "all"
          ? true
          : activeFilter === "pending"
          ? member.status === "Pending"
          : activeFilter === "leaders"
          ? member.role === "Leader"
          : activeFilter === "volunteers"
          ? member.role === "Volunteer"
          : activeFilter === "medical"
          ? member.role === "Medical"
          : true;

      const matchesSearch =
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, members, search]);

  const stats = useMemo(() => {
    return {
      total: members.length,
      leaders: members.filter((m) => m.role === "Leader").length,
      volunteers: members.filter((m) => m.role === "Volunteer").length,
      medical: members.filter((m) => m.role === "Medical").length,
    };
  }, [members]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const openDrawer = (member: Member) => setDrawerMember(member);
  const closeDrawer = () => setDrawerMember(null);

  const handleEdit = (member: Member) => {
    alert(`Edit ${member.name}`);
  };

  const handleAddMember = () => alert("Add member");

  const handleRemoveSelected = () => {
    setMembers((prev) => prev.filter((member) => !selected.includes(member.id)));
    setSelected([]);
  };

  const handleArchiveSelected = () => {
    setMembers((prev) =>
      prev.map((member) => (selected.includes(member.id) ? { ...member, status: "Archived" } : member))
    );
    setSelected([]);
  };

  const handleEmailSelected = () => {
    alert(`Email to: ${members.filter((m) => selected.includes(m.id)).map((m) => m.email).join(", ")}`);
  };

  const handleAssignmentsChange = (id: string, data: { missions: string[]; projects: string[] }) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, assignedMissions: data.missions, assignedProjects: data.projects } : member
      )
    );
  };

  const handleOpenAssign = (member: Member) => {
    setAssignTarget(member);
    setAssignOpen(true);
  };

  const handleApplyAssign = (value: string) => {
    if (!assignTarget) return;
    const isMission = availableMissions.includes(value);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === assignTarget.id
          ? {
              ...m,
              assignedProjects:
                !isMission && m.assignedProjects.includes(value)
                  ? m.assignedProjects.filter((p) => p !== value)
                  : !isMission
                  ? [...m.assignedProjects, value]
                  : m.assignedProjects,
              assignedMissions:
                isMission && m.assignedMissions.includes(value)
                  ? m.assignedMissions.filter((p) => p !== value)
                  : isMission
                  ? [...m.assignedMissions, value]
                  : m.assignedMissions,
            }
          : m
      )
    );
  };

  return (
    <div className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <motion.h1
              className="text-3xl font-semibold"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              Mission Teams
            </motion.h1>
            <p className="text-white/70">Manage members, roles, and mission readiness.</p>
          </div>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddMember}
            className="rounded-xl bg-[#ff9c4b] px-4 py-2 text-sm font-semibold text-[#080313] shadow-lg transition hover:bg-[#ffb877]"
          >
            + Add Member
          </motion.button>
        </div>

        <TeamOverview
          totalMembers={stats.total}
          leaders={stats.leaders}
          volunteers={stats.volunteers}
          medical={stats.medical}
          lastUpdated="auto"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <TeamFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            filters={[
              { key: "all", label: "All" },
              { key: "leaders", label: "Leaders" },
              { key: "volunteers", label: "Volunteers" },
              { key: "medical", label: "Medical" },
              { key: "pending", label: "Pending" },
            ]}
          />
          <div className="min-w-[260px] flex-1 md:max-w-sm">
            <TeamSearch value={search} onChange={setSearch} />
          </div>
        </div>

        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <TeamCard
              key={member.id}
              member={member}
              selected={selected.includes(member.id)}
              onSelect={() => toggleSelect(member.id)}
              onEdit={() => handleEdit(member)}
              onOpen={() => openDrawer(member)}
              onAssign={handleOpenAssign}
            />
          ))}
          {filteredMembers.length === 0 && (
            <motion.div
              className="rounded-2xl border border-white/15 bg-white/10 p-6 text-white/70"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Aucun team trouvé pour le moment.
            </motion.div>
          )}
        </div>
      </div>

      <MemberDrawer member={drawerMember} onClose={closeDrawer} onAssignmentsChange={handleAssignmentsChange} />

      <BulkActionBar
        count={selected.length}
        onRemove={handleRemoveSelected}
        onArchive={handleArchiveSelected}
        onEmail={handleEmailSelected}
      />

      {assignOpen && assignTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setAssignOpen(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <QuickAssignMenu
              items={[...availableProjects, ...availableMissions]}
              selected={[...assignTarget.assignedProjects, ...assignTarget.assignedMissions]}
              onChange={handleApplyAssign}
              onClose={() => setAssignOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
