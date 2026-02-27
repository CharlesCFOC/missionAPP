"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Building2,
  Calendar,
  Clock,
  Download,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  UserCircle,
  X,
} from "lucide-react";
import VolunteerDocumentsSection from "@/components/volunteerDocuments/VolunteerDocumentsSection";
import VolunteerReferencesSection from "@/components/volunteerReferences/VolunteerReferencesSection";

const SHIFT_PLANNER_STORAGE_KEY = "cfoc-demo-shift-planner";
const PUBLISHED_JOBS_STORAGE_KEY = "cfoc-volunteer-published-jobs";
const SHIFT_PLANNER_NOTIFICATIONS_STORAGE_KEY =
  "cfoc-demo-shift-planner-notifications";
const JOB_APPLICATIONS_STORAGE_KEY = "cfoc-demo-job-applications";

const SHIFT_PLANNER_DAY_ORDER = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

type ShiftPlannerDayId = (typeof SHIFT_PLANNER_DAY_ORDER)[number];
type ShiftPlannerAssignmentSource = "manager" | "claimed";

type ShiftPlannerAssignment = {
  name: string;
  email?: string;
  source?: ShiftPlannerAssignmentSource;
  assignedAt?: string;
};

type ShiftPlannerShift = {
  id: string;
  weekStart: string;
  day: ShiftPlannerDayId;
  start: string;
  end: string;
  roleId: string;
  roleTitle?: string;
  location?: string;
  assignments: (ShiftPlannerAssignment | null)[];
  createdAt?: string;
};

type ShiftPlannerState = {
  scope: string;
  selectedRoleId: string | null;
  claimEnabled: boolean;
  slotsCount: number;
  publishedWeeks: string[];
  shifts: ShiftPlannerShift[];
  updatedAt: string;
};

type ShiftPlannerVolunteerNotification = {
  id: string;
  createdAt: string;
  weekStart: string;
  recipientName: string;
  recipientEmail?: string;
  title: string;
  message: string;
};

type JobApplicationStatus = "Submitted";

type JobApplicationProfileSnapshot = {
  name: string;
  email: string;
  phone: string;
  location: string;
  availability: string[];
  skills: string[];
  hasCar: boolean;
  bio: string;
};

type JobApplicationRecord = {
  id: string;
  jobId: string;
  submittedAt: string;
  status: JobApplicationStatus;
  volunteerName: string;
  volunteerEmail: string;
  organizationName: string;
  message?: string;
  profile: JobApplicationProfileSnapshot;
};

type JobModeFilter = "all" | "remote" | "in_person" | "hybrid";

type PublishedJob = {
  id: string;
  title: string;
  type?: string;
  schedule?: string;
  location?: string;
  commitment?: string;
  organization?: string;
  department?: string;
};

type ScheduleItem = {
  id: string;
  title: string;
  organization: string;
  day: string;
  time: string;
  location: string;
  status: string;
  isToday: boolean;
  isOpen?: boolean;
  plannerShiftId?: string;
  sortAt?: number;
};

const parseLocalISODate = (value: string): Date | null => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  const parsed = new Date(year, month - 1, day);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
};

const isSameLocalDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const createDefaultShiftPlannerState = (): ShiftPlannerState => ({
  scope: "organization",
  selectedRoleId: null,
  claimEnabled: false,
  slotsCount: 3,
  publishedWeeks: [],
  shifts: [],
  updatedAt: new Date().toISOString(),
});

const readShiftPlannerFromStorage = (): ShiftPlannerState => {
  if (typeof window === "undefined") return createDefaultShiftPlannerState();
  try {
    const raw = window.localStorage.getItem(SHIFT_PLANNER_STORAGE_KEY);
    if (!raw) return createDefaultShiftPlannerState();
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return createDefaultShiftPlannerState();
    }
    const record = parsed as Record<string, unknown>;
    const publishedWeeks = Array.isArray(record.publishedWeeks)
      ? record.publishedWeeks.filter((value): value is string => typeof value === "string")
      : [];
    const shifts = Array.isArray(record.shifts)
      ? record.shifts.filter((value): value is ShiftPlannerShift => {
          if (!value || typeof value !== "object") return false;
          const row = value as Record<string, unknown>;
          if (typeof row.id !== "string") return false;
          if (typeof row.weekStart !== "string") return false;
          if (typeof row.day !== "string") return false;
          if (typeof row.start !== "string") return false;
          if (typeof row.end !== "string") return false;
          if (typeof row.roleId !== "string") return false;
          if (!Array.isArray(row.assignments)) return false;
          return true;
        })
      : [];
    return {
      scope: typeof record.scope === "string" ? record.scope : "organization",
      selectedRoleId:
        typeof record.selectedRoleId === "string" ? record.selectedRoleId : null,
      claimEnabled: Boolean(record.claimEnabled),
      slotsCount: typeof record.slotsCount === "number" ? record.slotsCount : 3,
      publishedWeeks,
      shifts,
      updatedAt:
        typeof record.updatedAt === "string"
          ? record.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return createDefaultShiftPlannerState();
  }
};

const writeShiftPlannerToStorage = (state: ShiftPlannerState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SHIFT_PLANNER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures
  }
};

const readPublishedJobsFromStorage = (): PublishedJob[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PUBLISHED_JOBS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is PublishedJob => {
      if (!value || typeof value !== "object") return false;
      const row = value as Record<string, unknown>;
      if (typeof row.id !== "string") return false;
      if (typeof row.title !== "string") return false;
      return true;
    });
  } catch {
    return [];
  }
};

const readJobApplicationsFromStorage = (): JobApplicationRecord[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(JOB_APPLICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is JobApplicationRecord => {
      if (!value || typeof value !== "object") return false;
      const row = value as Record<string, unknown>;
      if (typeof row.id !== "string") return false;
      if (typeof row.jobId !== "string") return false;
      if (typeof row.submittedAt !== "string") return false;
      if (row.status !== "Submitted") return false;
      if (typeof row.volunteerName !== "string") return false;
      if (typeof row.volunteerEmail !== "string") return false;
      if (typeof row.organizationName !== "string") return false;
      if (row.message !== undefined && typeof row.message !== "string") return false;
      if (!row.profile || typeof row.profile !== "object" || Array.isArray(row.profile)) {
        return false;
      }
      const profile = row.profile as Record<string, unknown>;
      if (typeof profile.name !== "string") return false;
      if (typeof profile.email !== "string") return false;
      if (typeof profile.phone !== "string") return false;
      if (typeof profile.location !== "string") return false;
      if (!Array.isArray(profile.availability)) return false;
      if (!Array.isArray(profile.skills)) return false;
      if (typeof profile.hasCar !== "boolean") return false;
      if (typeof profile.bio !== "string") return false;
      return true;
    });
  } catch {
    return [];
  }
};

const writeJobApplicationsToStorage = (applications: JobApplicationRecord[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      JOB_APPLICATIONS_STORAGE_KEY,
      JSON.stringify(applications)
    );
  } catch {
    // ignore storage failures
  }
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const detectJobMode = (job: PublishedJob): Exclude<JobModeFilter, "all"> => {
  const haystack = `${job.location ?? ""} ${job.schedule ?? ""} ${job.commitment ?? ""}`.toLowerCase();
  if (haystack.includes("hybrid")) return "hybrid";
  if (
    haystack.includes("remote") ||
    haystack.includes("online") ||
    haystack.includes("virtual")
  ) {
    return "remote";
  }
  return "in_person";
};

const getJobModeLabel = (mode: Exclude<JobModeFilter, "all">) => {
  if (mode === "remote") return "Remote";
  if (mode === "hybrid") return "Hybrid";
  return "In person";
};

const getJobRegionLabel = (job: PublishedJob) => {
  const location = (job.location ?? "").trim();
  if (!location) return "Unspecified";
  return location;
};

const readShiftPlannerNotificationsFromStorage = (): ShiftPlannerVolunteerNotification[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SHIFT_PLANNER_NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is ShiftPlannerVolunteerNotification => {
      if (!value || typeof value !== "object") return false;
      const row = value as Record<string, unknown>;
      if (typeof row.id !== "string") return false;
      if (typeof row.createdAt !== "string") return false;
      if (typeof row.weekStart !== "string") return false;
      if (typeof row.recipientName !== "string") return false;
      if (row.recipientEmail !== undefined && typeof row.recipientEmail !== "string") {
        return false;
      }
      if (typeof row.title !== "string") return false;
      if (typeof row.message !== "string") return false;
      return true;
    });
  } catch {
    return [];
  }
};

const formatNotificationTimestamp = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const volunteerTabs = [
  { id: "organizations", label: "Organization", icon: Building2 },
  { id: "findJob", label: "Find a job", icon: Briefcase },
  { id: "profile", label: "Profil", icon: UserCircle },
  { id: "shift", label: "Shift", icon: Clock },
  { id: "communications", label: "communication", icon: MessageCircle },
] as const;

type VolunteerTabId = (typeof volunteerTabs)[number]["id"];

const initialProfile = {
  name: "Alex Martin",
  role: "Volunteer",
  location: "Montreal, Canada",
  birthMonth: 5,
  birthDay: 12,
  birthYear: 1995,
  status: "Active",
  hasCar: true,
  bio: "Volunteer with 3 years of experience in community kitchens and youth mentoring. Available on weekdays and open to outreach missions.",
  email: "alex.martin@cfoc.org",
  phone: "+1 (514) 555-0142",
  languages: ["English", "French"],
  skills: ["Logistics", "Food prep", "Youth mentoring"],
  availability: [
    "Tue Morning (In person)",
    "Wed Afternoon (In person)",
    "Fri Morning (In person)",
  ],
  organizations: ["Hope Kitchen", "Youth Action", "Field Ops", "CFOC Impact"],
};

type OrganizationStatus = "Active" | "Onboarding" | "Pending" | "Inactive";

type OrganizationCard = {
  id: string;
  name: string;
  threadId?: string;
  mission: string;
  location: string;
  coordinator: string;
  contactEmail: string;
  contactPhone: string;
  nextShift: string;
  focus: string[];
  status: OrganizationStatus;
  submittedAt?: string;
};

const initialOrganizationCards: OrganizationCard[] = [
  {
    id: "org-1",
    name: "Hope Kitchen",
    threadId: "hope-kitchen",
    mission: "Community meals and food relief across the city.",
    location: "Montreal, Canada",
    coordinator: "Sophie R.",
    contactEmail: "hope.kitchen@cfoc.org",
    contactPhone: "+1 (514) 555-0109",
    nextShift: "Tue 09:00-13:00",
    focus: ["Food relief", "Community meals"],
    status: "Active",
  },
  {
    id: "org-2",
    name: "Youth Action",
    threadId: "youth-action",
    mission: "After-school programs and mentoring for youth.",
    location: "Toronto, Canada",
    coordinator: "Marcus L.",
    contactEmail: "youth.action@cfoc.org",
    contactPhone: "+1 (416) 555-0178",
    nextShift: "Wed 14:00-18:00",
    focus: ["Mentoring", "Education support"],
    status: "Active",
  },
  {
    id: "org-3",
    name: "Field Ops",
    threadId: "field-ops",
    mission: "Logistics support for regional outreach missions.",
    location: "Vancouver, Canada",
    coordinator: "Nina C.",
    contactEmail: "field.ops@cfoc.org",
    contactPhone: "+1 (604) 555-0124",
    nextShift: "Fri 08:30-12:30",
    focus: ["Logistics", "Field support"],
    status: "Onboarding",
  },
  {
    id: "org-4",
    name: "CFOC Impact",
    threadId: "cfoc-impact",
    mission: "Volunteer network coordination and training.",
    location: "Montreal, Canada",
    coordinator: "CFOC Team",
    contactEmail: "support@cfoc.org",
    contactPhone: "+1 (514) 555-0194",
    nextShift: "Orientation call - Thu 16:00",
    focus: ["Onboarding", "Training"],
    status: "Active",
  },
  {
    id: "org-5",
    name: "River City Outreach",
    mission: "Outreach and support for families in transition.",
    location: "Ottawa, Canada",
    coordinator: "Elena W.",
    contactEmail: "river.city@cfoc.org",
    contactPhone: "+1 (613) 555-0182",
    nextShift: "Pending confirmation",
    focus: ["Community outreach", "Family services"],
    status: "Pending",
    submittedAt: "2h ago",
  },
];

type ProfileState = typeof initialProfile;

const defaultScheduleItems: ScheduleItem[] = [
  {
    id: "schedule-1",
    title: "Community kitchen support",
    organization: "Hope Kitchen",
    day: "Today",
    time: "09:00-13:00",
    location: "Montreal",
    status: "Upcoming",
    isToday: true,
  },
  {
    id: "schedule-2",
    title: "Kids program assistant",
    organization: "Youth Action",
    day: "Wed",
    time: "14:00-18:00",
    location: "Toronto",
    status: "Confirmed",
    isToday: false,
  },
  {
    id: "schedule-3",
    title: "Logistics runner",
    organization: "Field Ops",
    day: "Fri",
    time: "08:30-12:30",
    location: "Vancouver",
    status: "Pending",
    isToday: false,
  },
];

const initialTimeLogs = [
  {
    id: "time-1",
    title: "Community kitchen support",
    organization: "Hope Kitchen",
    date: "Mon",
    duration: "3h 40m",
    status: "Approved",
  },
  {
    id: "time-2",
    title: "Kids program assistant",
    organization: "Youth Action",
    date: "Sat",
    duration: "4h 05m",
    status: "Approved",
  },
  {
    id: "time-3",
    title: "Logistics runner",
    organization: "Field Ops",
    date: "Sun",
    duration: "2h 55m",
    status: "Pending",
  },
];

type TimeLog = (typeof initialTimeLogs)[number];

const safeFilenamePart = (value: string) => {
  const slug = value
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return slug || "item";
};

type ThreadStatus = "online" | "busy" | "offline";

type Thread = {
  id: string;
  name: string;
  role: string;
  preview: string;
  time: string;
  unread: number;
  status: ThreadStatus;
  important: boolean;
  avatar: string;
};

const initialCommunicationThreads: Thread[] = [
  {
    id: "hope-kitchen",
    name: "Hope Kitchen",
    role: "Organization",
    preview: "Reminder: bring gloves for the Tuesday shift.",
    time: "10:24",
    unread: 2,
    status: "online",
    important: true,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "youth-action",
    name: "Youth Action",
    role: "Organization",
    preview: "New schedule posted for next week.",
    time: "Yesterday",
    unread: 0,
    status: "busy",
    important: false,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "field-ops",
    name: "Field Ops",
    role: "Organization",
    preview: "Please confirm availability for Friday.",
    time: "Mon",
    unread: 1,
    status: "offline",
    important: true,
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cfoc-impact",
    name: "CFOC Impact",
    role: "Coordinator",
    preview: "Welcome to the volunteer network!",
    time: "Sun",
    unread: 0,
    status: "online",
    important: false,
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=400&q=80",
  },
];

const messagesByThread: Record<
  string,
  { id: string; from: "me" | "them"; text: string; time: string }[]
> = {
  "hope-kitchen": [
    {
      id: "hk-1",
      from: "them",
      text: "Reminder: bring gloves for the Tuesday shift.",
      time: "10:24",
    },
    {
      id: "hk-2",
      from: "me",
      text: "Got it! I will be there 10 minutes early.",
      time: "10:29",
    },
  ],
  "youth-action": [
    {
      id: "ya-1",
      from: "them",
      text: "New schedule posted for next week.",
      time: "Yesterday",
    },
    {
      id: "ya-2",
      from: "me",
      text: "Thanks, I can take the Wednesday slot.",
      time: "Yesterday",
    },
  ],
  "field-ops": [
    {
      id: "fo-1",
      from: "them",
      text: "Please confirm availability for Friday.",
      time: "Mon",
    },
    {
      id: "fo-2",
      from: "me",
      text: "Confirmed, I am available Friday morning.",
      time: "Mon",
    },
  ],
  "cfoc-impact": [
    {
      id: "ci-1",
      from: "them",
      text: "Welcome to the volunteer network!",
      time: "Sun",
    },
    {
      id: "ci-2",
      from: "me",
      text: "Thank you, excited to get started.",
      time: "Sun",
    },
  ],
};

const statusTone: Record<string, string> = {
  Upcoming: "bg-blue-500/20 text-blue-200",
  Confirmed: "bg-emerald-500/20 text-emerald-200",
  Pending: "bg-amber-500/20 text-amber-200",
  Open: "bg-emerald-500/10 text-emerald-100",
  Approved: "bg-emerald-500/20 text-emerald-200",
};

const orgStatusTone: Record<OrganizationStatus, string> = {
  Active: "bg-emerald-500/20 text-emerald-200",
  Onboarding: "bg-amber-500/20 text-amber-200",
  Pending: "bg-blue-500/20 text-blue-200",
  Inactive: "bg-white/10 text-white/60",
};

const statusDot: Record<ThreadStatus, string> = {
  online: "bg-emerald-400",
  busy: "bg-yellow-400",
  offline: "bg-white/30",
};

const formatElapsed = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${secs}`;
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
};

const parseTimeToMinutes = (value: string) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const parseTimeRange = (range: string) => {
  const parts = range.split("-");
  if (parts.length !== 2) return null;
  const startMinutes = parseTimeToMinutes(parts[0] ?? "");
  const endMinutes = parseTimeToMinutes(parts[1] ?? "");
  if (startMinutes === null || endMinutes === null) return null;
  return { startMinutes, endMinutes };
};

const buildScheduleForToday = (timeRange: string) => {
  const parsed = parseTimeRange(timeRange);
  if (!parsed) return null;

  const base = new Date();
  base.setHours(0, 0, 0, 0);

  const startAt = new Date(base);
  startAt.setMinutes(parsed.startMinutes);

  const endAt = new Date(base);
  endAt.setMinutes(parsed.endMinutes);

  if (endAt.getTime() <= startAt.getTime()) {
    endAt.setDate(endAt.getDate() + 1);
  }

  return { startAt, endAt };
};

const formatClockTime = (timestampMs: number) => {
  const date = new Date(timestampMs);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const countWords = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
};

export default function VolunteerHubPage() {
  const [activeTab, setActiveTab] = useState<VolunteerTabId>("shift");
  const [profileState] = useState<ProfileState>(initialProfile);
  const [timeLogState, setTimeLogState] = useState(initialTimeLogs);
  const [showTimeWorked, setShowTimeWorked] = useState(false);
  const [threads, setThreads] = useState(initialCommunicationThreads);
  const [organizationCards, setOrganizationCards] =
    useState<OrganizationCard[]>(initialOrganizationCards);
  const [primaryOrgId, setPrimaryOrgId] = useState<string | null>(
    initialOrganizationCards[0]?.id ?? null
  );
  const [isManageConnectionsOpen, setIsManageConnectionsOpen] = useState(false);
  const [pendingStopId, setPendingStopId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
  const [activeShiftStartedAt, setActiveShiftStartedAt] = useState<number | null>(
    null
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pendingShiftStop, setPendingShiftStop] = useState<null | {
    startAtMs: number;
    stopAtMs: number;
    totalSeconds: number;
    regularSeconds: number;
    overtimeSeconds: number;
    scheduledEndAtMs: number | null;
    requiresOvertimeNote: boolean;
  }>(null);
  const [overtimeNoteDraft, setOvertimeNoteDraft] = useState("");
  const [overtimeNoteError, setOvertimeNoteError] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    initialCommunicationThreads[0]?.id ?? null
  );
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [shiftPlannerState, setShiftPlannerState] = useState<ShiftPlannerState>(() =>
    createDefaultShiftPlannerState()
  );
  const [publishedJobs, setPublishedJobs] = useState<PublishedJob[]>([]);
  const [shiftPlannerNotifications, setShiftPlannerNotifications] = useState<
    ShiftPlannerVolunteerNotification[]
  >([]);
  const [jobApplications, setJobApplications] = useState<JobApplicationRecord[]>([]);
  const [findJobSearch, setFindJobSearch] = useState("");
  const [findJobRegionFilter, setFindJobRegionFilter] = useState("all");
  const [findJobModeFilter, setFindJobModeFilter] = useState<JobModeFilter>("all");
  const [findJobCommitmentFilter, setFindJobCommitmentFilter] = useState("all");
  const [selectedFindJobId, setSelectedFindJobId] = useState<string | null>(null);
  const [jobSubmissionMessage, setJobSubmissionMessage] = useState("");
  const [jobSubmissionFeedback, setJobSubmissionFeedback] = useState<{
    tone: "success" | "info" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShiftPlannerState(readShiftPlannerFromStorage());
    setPublishedJobs(readPublishedJobsFromStorage());
    setShiftPlannerNotifications(readShiftPlannerNotificationsFromStorage());
    setJobApplications(readJobApplicationsFromStorage());

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === SHIFT_PLANNER_STORAGE_KEY) {
        setShiftPlannerState(readShiftPlannerFromStorage());
      }
      if (!event.key || event.key === PUBLISHED_JOBS_STORAGE_KEY) {
        setPublishedJobs(readPublishedJobsFromStorage());
      }
      if (!event.key || event.key === SHIFT_PLANNER_NOTIFICATIONS_STORAGE_KEY) {
        setShiftPlannerNotifications(readShiftPlannerNotificationsFromStorage());
      }
      if (!event.key || event.key === JOB_APPLICATIONS_STORAGE_KEY) {
        setJobApplications(readJobApplicationsFromStorage());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const publishedJobLookup = useMemo(() => {
    const map = new Map<string, PublishedJob>();
    publishedJobs.forEach((job) => map.set(job.id, job));
    return map;
  }, [publishedJobs]);

  const plannerScheduleItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const latestDay = new Date(today);
    latestDay.setDate(latestDay.getDate() + 28);

    const formatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });
    const volunteerEmail = profileState.email.trim().toLowerCase();
    const volunteerName = profileState.name.trim().toLowerCase();

    const results: ScheduleItem[] = [];

    shiftPlannerState.shifts.forEach((shift) => {
      if (!shiftPlannerState.publishedWeeks.includes(shift.weekStart)) return;

      const weekStartDate = parseLocalISODate(shift.weekStart);
      if (!weekStartDate) return;
      const dayIndex = SHIFT_PLANNER_DAY_ORDER.indexOf(shift.day);
      if (dayIndex < 0) return;

      const shiftDate = new Date(weekStartDate);
      shiftDate.setDate(shiftDate.getDate() + dayIndex);
      shiftDate.setHours(0, 0, 0, 0);

      if (shiftDate.getTime() < today.getTime()) return;
      if (shiftDate.getTime() > latestDay.getTime()) return;

      const isToday = isSameLocalDay(shiftDate, today);
      const dayLabel = isToday ? "Today" : formatter.format(shiftDate);
      const job = publishedJobLookup.get(shift.roleId) ?? null;

      const title = job?.title ?? shift.roleTitle ?? "Shift";
      const location = job?.location ?? shift.location ?? "TBD";
      const timeRange = `${shift.start}-${shift.end}`;

      const isAssignedToVolunteer = shift.assignments.some((assignment) => {
        if (!assignment) return false;
        const assignedEmail =
          typeof assignment.email === "string"
            ? assignment.email.trim().toLowerCase()
            : "";
        if (assignedEmail && volunteerEmail) {
          return assignedEmail === volunteerEmail;
        }
        const assignedName =
          typeof assignment.name === "string"
            ? assignment.name.trim().toLowerCase()
            : "";
        return assignedName !== "" && assignedName === volunteerName;
      });

      const hasOpenSlot = shift.assignments.some((assignment) => !assignment);

      if (isAssignedToVolunteer) {
        results.push({
          id: `planner-${shift.id}`,
          title,
          organization: "Volunteer Manager",
          day: dayLabel,
          time: timeRange,
          location,
          status: "Confirmed",
          isToday,
          plannerShiftId: shift.id,
          sortAt:
            shiftDate.getTime() +
            (parseTimeToMinutes(shift.start) ?? 0) * 60 * 1000,
        });
        return;
      }

      if (shiftPlannerState.claimEnabled && hasOpenSlot) {
        results.push({
          id: `planner-open-${shift.id}`,
          title,
          organization: "Volunteer Manager",
          day: dayLabel,
          time: timeRange,
          location,
          status: "Open",
          isToday,
          isOpen: true,
          plannerShiftId: shift.id,
          sortAt:
            shiftDate.getTime() +
            (parseTimeToMinutes(shift.start) ?? 0) * 60 * 1000,
        });
      }
    });

    return results.sort((a, b) => (a.sortAt ?? 0) - (b.sortAt ?? 0));
  }, [
    profileState.email,
    profileState.name,
    publishedJobLookup,
    shiftPlannerState.claimEnabled,
    shiftPlannerState.publishedWeeks,
    shiftPlannerState.shifts,
  ]);

  const scheduleItems = useMemo(() => {
    if (plannerScheduleItems.length > 0) return plannerScheduleItems;
    return defaultScheduleItems;
  }, [plannerScheduleItems]);

  const volunteerShiftNotifications = useMemo(() => {
    const volunteerEmail = profileState.email.trim().toLowerCase();
    const volunteerName = profileState.name.trim().toLowerCase();

    return shiftPlannerNotifications
      .filter((notification) => {
        const recipientEmail =
          typeof notification.recipientEmail === "string"
            ? notification.recipientEmail.trim().toLowerCase()
            : "";
        if (recipientEmail && volunteerEmail) {
          return recipientEmail === volunteerEmail;
        }
        const recipientName = notification.recipientName.trim().toLowerCase();
        return recipientName !== "" && recipientName === volunteerName;
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
      });
  }, [profileState.email, profileState.name, shiftPlannerNotifications]);

  const volunteerJobApplicationLookup = useMemo(() => {
    const map = new Map<string, JobApplicationRecord>();
    const volunteerEmail = normalizeText(profileState.email);
    const volunteerName = normalizeText(profileState.name);

    jobApplications.forEach((application) => {
      const emailMatches =
        normalizeText(application.volunteerEmail) === volunteerEmail && volunteerEmail !== "";
      const nameMatches =
        normalizeText(application.volunteerName) === volunteerName && volunteerName !== "";
      if (!emailMatches && !nameMatches) return;

      const existing = map.get(application.jobId);
      if (!existing) {
        map.set(application.jobId, application);
        return;
      }
      const existingTime = new Date(existing.submittedAt).getTime();
      const nextTime = new Date(application.submittedAt).getTime();
      if ((Number.isFinite(nextTime) ? nextTime : 0) > (Number.isFinite(existingTime) ? existingTime : 0)) {
        map.set(application.jobId, application);
      }
    });

    return map;
  }, [jobApplications, profileState.email, profileState.name]);

  const findJobCards = useMemo(() => {
    return publishedJobs.map((job) => {
      const mode = detectJobMode(job);
      const region = getJobRegionLabel(job);
      const organizationName =
        typeof job.organization === "string" && job.organization.trim()
          ? job.organization.trim()
          : "CFOC Impact";
      const commitment = (job.commitment ?? "").trim() || "Flexible";
      const type = (job.type ?? "").trim() || "Volunteer";
      const searchText = [
        job.title,
        organizationName,
        region,
        job.location ?? "",
        job.schedule ?? "",
        type,
        commitment,
        job.department ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return {
        ...job,
        mode,
        modeLabel: getJobModeLabel(mode),
        region,
        organizationName,
        commitmentLabel: commitment,
        typeLabel: type,
        searchText,
      };
    });
  }, [publishedJobs]);

  const findJobRegionOptions = useMemo(() => {
    const unique = Array.from(
      new Set(findJobCards.map((job) => job.region).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    return unique;
  }, [findJobCards]);

  const findJobCommitmentOptions = useMemo(() => {
    const unique = Array.from(
      new Set(findJobCards.map((job) => job.commitmentLabel).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    return unique;
  }, [findJobCards]);

  const filteredFindJobCards = useMemo(() => {
    const query = normalizeText(findJobSearch);
    return findJobCards.filter((job) => {
      if (query && !job.searchText.includes(query)) return false;
      if (findJobRegionFilter !== "all" && job.region !== findJobRegionFilter) return false;
      if (findJobModeFilter !== "all" && job.mode !== findJobModeFilter) return false;
      if (
        findJobCommitmentFilter !== "all" &&
        job.commitmentLabel !== findJobCommitmentFilter
      ) {
        return false;
      }
      return true;
    });
  }, [
    findJobCards,
    findJobCommitmentFilter,
    findJobModeFilter,
    findJobRegionFilter,
    findJobSearch,
  ]);

  const selectedFindJob = useMemo(
    () => findJobCards.find((job) => job.id === selectedFindJobId) ?? null,
    [findJobCards, selectedFindJobId]
  );
  const selectedFindJobApplication = useMemo(() => {
    if (!selectedFindJob) return null;
    return volunteerJobApplicationLookup.get(selectedFindJob.id) ?? null;
  }, [selectedFindJob, volunteerJobApplicationLookup]);
  const hasActiveFindJobFilters =
    findJobSearch.trim() !== "" ||
    findJobRegionFilter !== "all" ||
    findJobModeFilter !== "all" ||
    findJobCommitmentFilter !== "all";

  useEffect(() => {
    if (activeTab !== "findJob") return;
    if (filteredFindJobCards.length === 0) {
      if (selectedFindJobId !== null) {
        setSelectedFindJobId(null);
      }
      return;
    }
    const hasSelectedVisibleCard = filteredFindJobCards.some(
      (job) => job.id === selectedFindJobId
    );
    if (!hasSelectedVisibleCard) {
      setSelectedFindJobId(filteredFindJobCards[0]?.id ?? null);
    }
  }, [activeTab, filteredFindJobCards, selectedFindJobId]);

  useEffect(() => {
    if (activeTab !== "findJob") {
      setJobSubmissionFeedback(null);
    }
  }, [activeTab]);

  useEffect(() => {
    setJobSubmissionFeedback(null);
    setJobSubmissionMessage("");
  }, [selectedFindJobId]);

  const isVolunteerProfileReadyForSubmission = useMemo(() => {
    return (
      normalizeText(profileState.name) !== "" &&
      normalizeText(profileState.email) !== "" &&
      normalizeText(profileState.location) !== ""
    );
  }, [profileState.email, profileState.location, profileState.name]);

  const submitVolunteerProfileToJob = (jobId: string) => {
    const job = findJobCards.find((item) => item.id === jobId) ?? null;
    if (!job) {
      setJobSubmissionFeedback({
        tone: "error",
        text: "This job is no longer available.",
      });
      return;
    }

    if (!isVolunteerProfileReadyForSubmission) {
      setJobSubmissionFeedback({
        tone: "info",
        text: "Complete your profile (name, email, location) before submitting.",
      });
      return;
    }

    const existing = volunteerJobApplicationLookup.get(jobId);
    if (existing) {
      setJobSubmissionFeedback({
        tone: "info",
        text: "Your profile is already submitted for this job.",
      });
      return;
    }

    const nowIso = new Date().toISOString();
    const application: JobApplicationRecord = {
      id: `job-app-${Date.now()}`,
      jobId: job.id,
      submittedAt: nowIso,
      status: "Submitted",
      volunteerName: profileState.name.trim() || "Volunteer",
      volunteerEmail: profileState.email.trim(),
      organizationName: job.organizationName,
      message: jobSubmissionMessage.trim() || undefined,
      profile: {
        name: profileState.name,
        email: profileState.email,
        phone: profileState.phone,
        location: profileState.location,
        availability: [...profileState.availability],
        skills: [...profileState.skills],
        hasCar: profileState.hasCar,
        bio: profileState.bio,
      },
    };

    setJobApplications((prev) => {
      const next = [application, ...prev];
      writeJobApplicationsToStorage(next);
      return next;
    });
    setJobSubmissionMessage("");
    setJobSubmissionFeedback({
      tone: "success",
      text: `Profile sent to ${job.organizationName}.`,
    });
  };

  const clearFindJobFilters = () => {
    setFindJobSearch("");
    setFindJobRegionFilter("all");
    setFindJobModeFilter("all");
    setFindJobCommitmentFilter("all");
  };

  const claimPlannerShift = (plannerShiftId: string) => {
    const now = new Date().toISOString();
    setShiftPlannerState((prev) => {
      const shift =
        prev.shifts.find((item) => item.id === plannerShiftId) ?? null;
      if (!shift) return prev;
      if (!prev.claimEnabled) return prev;
      if (!prev.publishedWeeks.includes(shift.weekStart)) return prev;

      const openIndex = shift.assignments.findIndex((assignment) => !assignment);
      if (openIndex < 0) return prev;

      const nextAssignments = [...shift.assignments];
      nextAssignments[openIndex] = {
        name: profileState.name.trim() || "Volunteer",
        email: profileState.email.trim() || undefined,
        source: "claimed",
        assignedAt: now,
      };

      const nextShifts = prev.shifts.map((item) =>
        item.id === plannerShiftId ? { ...item, assignments: nextAssignments } : item
      );
      const nextState: ShiftPlannerState = {
        ...prev,
        shifts: nextShifts,
        updatedAt: now,
      };
      writeShiftPlannerToStorage(nextState);
      return nextState;
    });
  };

  const activeShift = scheduleItems.find((item) => item.id === activeShiftId);
  const activeShiftSchedule = useMemo(() => {
    if (!activeShift) return null;
    return buildScheduleForToday(activeShift.time);
  }, [activeShift]);
  const overtimeGraceEndAtMs = useMemo(() => {
    if (!activeShiftSchedule) return null;
    return activeShiftSchedule.endAt.getTime() + 15 * 60 * 1000;
  }, [activeShiftSchedule]);

  const downloadTimesheetPdf = async (log: TimeLog) => {
    if (typeof window === "undefined") return;

    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

      const orgCard = organizationCards.find(
        (org) => org.name === log.organization
      );
      const generatedAt = new Date();
      const generatedLabel = generatedAt.toLocaleString("en-CA");

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const marginX = 56;
      const contentWidth = width - marginX * 2;
      let y = height - 72;
      const black = rgb(0, 0, 0);
      const gray = rgb(0.45, 0.45, 0.45);
      const lightGray = rgb(0.85, 0.85, 0.85);

      const drawLine = () => {
        page.drawLine({
          start: { x: marginX, y },
          end: { x: width - marginX, y },
          thickness: 1,
          color: lightGray,
        });
        y -= 18;
      };

      const drawTitle = (text: string) => {
        page.drawText(text, {
          x: marginX,
          y,
          size: 22,
          font: fontBold,
          color: black,
        });
        y -= 32;
      };

      const drawSection = (text: string) => {
        page.drawText(text, {
          x: marginX,
          y,
          size: 12,
          font: fontBold,
          color: black,
        });
        y -= 18;
      };

      const drawKeyValue = (label: string, value: string) => {
        const labelX = marginX;
        const valueX = marginX + 150;
        const maxChars = Math.max(18, Math.floor((contentWidth - 150) / 6));
        const words = value.split(/\s+/);
        const lines: string[] = [];
        let current = "";
        words.forEach((word) => {
          const next = current ? `${current} ${word}` : word;
          if (next.length > maxChars) {
            if (current) lines.push(current);
            current = word;
          } else {
            current = next;
          }
        });
        if (current) lines.push(current);

        page.drawText(label, {
          x: labelX,
          y,
          size: 11,
          font: fontBold,
          color: black,
        });
        const first = lines[0] ?? "";
        page.drawText(first, {
          x: valueX,
          y,
          size: 11,
          font,
          color: black,
        });
        y -= 16;

        lines.slice(1).forEach((line) => {
          page.drawText(line, {
            x: valueX,
            y,
            size: 11,
            font,
            color: black,
          });
          y -= 16;
        });
      };

      // Header
      page.drawText("CFOC Impact", {
        x: marginX,
        y,
        size: 12,
        font: fontBold,
        color: black,
      });
      page.drawText(generatedLabel, {
        x: width - marginX - 200,
        y,
        size: 10,
        font,
        color: gray,
      });
      y -= 26;

      drawTitle("Volunteer Timesheet");
      drawLine();

      // Organization
      drawSection("Organization");
      drawKeyValue("Company", log.organization);
      if (orgCard?.coordinator) drawKeyValue("Coordinator", orgCard.coordinator);
      if (orgCard?.contactEmail) drawKeyValue("Email", orgCard.contactEmail);
      if (orgCard?.contactPhone) drawKeyValue("Phone", orgCard.contactPhone);

      y -= 8;
      drawLine();

      // Volunteer
      drawSection("Volunteer");
      drawKeyValue("Name", profileState.name);
      drawKeyValue("Role", profileState.role);
      drawKeyValue("Location", profileState.location);
      drawKeyValue("Email", profileState.email);
      drawKeyValue("Phone", profileState.phone);

      y -= 8;
      drawLine();

      // Hours
      drawSection("Hours");
      drawKeyValue("Job", log.title);
      drawKeyValue("Date", log.date);
      drawKeyValue("Time worked", log.duration);
      drawKeyValue("Status", log.status);

      // Footer
      page.drawText("Generated from Volunteer HUB (mock data).", {
        x: marginX,
        y: 40,
        size: 9,
        font,
        color: gray,
      });

      const pdfBytes = await pdfDoc.save();
      const pdfArray = new Uint8Array(pdfBytes);
      const pdfBuffer = pdfArray.buffer as ArrayBuffer;
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `timesheet_${safeFilenamePart(
        log.organization
      )}_${safeFilenamePart(profileState.name)}_${safeFilenamePart(log.date)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 400);
    } catch (error) {
      console.error("Failed to download PDF", error);
    }
  };

  const auroraStyle = {
    "--aurora-1": "rgba(166, 2, 255, 1)",
    "--aurora-2": "rgba(249, 180, 255, 0.99)",
    "--aurora-3": "rgba(151, 17, 161, 0.52)",
    "--aurora-4": "rgba(7, 244, 55, 1)",
  } as CSSProperties;

  const reveal = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };
  const contentWrapperClass =
    activeTab === "profile" ||
    activeTab === "organizations" ||
    activeTab === "communications" ||
    activeTab === "findJob"
      ? "p-0"
      : "rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10";

  const filteredThreads = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    if (!lowered) return threads;
    return threads.filter((thread) =>
      thread.name.toLowerCase().includes(lowered)
    );
  }, [query, threads]);

  const pendingOrganizations = useMemo(
    () => organizationCards.filter((org) => org.status === "Pending"),
    [organizationCards]
  );

  const activeOrganizations = useMemo(
    () => organizationCards.filter((org) => org.status !== "Pending"),
    [organizationCards]
  );

  useEffect(() => {
    if (filteredThreads.length === 0) {
      setActiveThreadId(null);
      return;
    }
    if (!filteredThreads.some((thread) => thread.id === activeThreadId)) {
      setActiveThreadId(filteredThreads[0]?.id ?? null);
    }
  }, [filteredThreads, activeThreadId]);

  useEffect(() => {
    if (!activeShiftId || !activeShiftStartedAt) return;
    const tick = () => {
      const nextSeconds = Math.max(
        0,
        Math.floor((Date.now() - activeShiftStartedAt) / 1000)
      );
      setElapsedSeconds(nextSeconds);
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [activeShiftId, activeShiftStartedAt]);

  const handleShiftStart = (jobId: string) => {
    if (activeShiftId === jobId) return;
    setActiveShiftId(jobId);
    setActiveShiftStartedAt(Date.now());
    setElapsedSeconds(0);
  };

  const requestShiftStop = (jobId: string) => {
    if (activeShiftId !== jobId) return;
    const stopAtMs = Date.now();
    const startAtMs =
      activeShiftStartedAt ?? Math.max(0, stopAtMs - elapsedSeconds * 1000);

    const shift = scheduleItems.find((item) => item.id === jobId) ?? null;
    const scheduledEndAtMs = shift
      ? buildScheduleForToday(shift.time)?.endAt.getTime() ?? null
      : null;

    const overtimeThresholdMs =
      scheduledEndAtMs === null ? null : scheduledEndAtMs + 15 * 60 * 1000;
    const requiresOvertimeNote =
      overtimeThresholdMs !== null && stopAtMs > overtimeThresholdMs;

    const totalSeconds = Math.max(0, Math.floor((stopAtMs - startAtMs) / 1000));
    const overtimeSeconds =
      scheduledEndAtMs === null
        ? 0
        : Math.max(
            0,
            Math.floor(
              (stopAtMs - Math.max(scheduledEndAtMs, startAtMs)) / 1000
            )
          );
    const regularSeconds = Math.max(0, totalSeconds - overtimeSeconds);

    setPendingStopId(jobId);
    setIsConfirmOpen(true);
    setPendingShiftStop({
      startAtMs,
      stopAtMs,
      totalSeconds,
      regularSeconds,
      overtimeSeconds,
      scheduledEndAtMs,
      requiresOvertimeNote,
    });
    setOvertimeNoteDraft("");
    setOvertimeNoteError(null);
  };

  const confirmShiftStop = () => {
    if (!activeShift || !pendingStopId || !pendingShiftStop) {
      setIsConfirmOpen(false);
      setPendingStopId(null);
      setPendingShiftStop(null);
      return;
    }

    if (pendingShiftStop.requiresOvertimeNote) {
      const words = countWords(overtimeNoteDraft);
      if (words < 30) {
        setOvertimeNoteError("Please enter at least 30 words.");
        return;
      }
    }

    const newEntry = {
      id: `time-${Date.now()}`,
      title: activeShift.title,
      organization: activeShift.organization,
      date: "Today",
      duration: formatDuration(pendingShiftStop.totalSeconds),
      status: "Pending",
    };
    setTimeLogState((prev) => [newEntry, ...prev]);

    if (typeof window !== "undefined") {
      try {
        const storageKey = "cfoc-demo-timesheets";
        const storedRaw = window.localStorage.getItem(storageKey);
        const storedEntries = storedRaw
          ? (JSON.parse(storedRaw) as unknown[])
          : [];
        const submission = {
          id: `hub-${Date.now()}`,
          name: profileState.name,
          role: activeShift.title,
          date: "Today",
          start: formatClockTime(pendingShiftStop.startAtMs),
          end: formatClockTime(pendingShiftStop.stopAtMs),
          total: formatDuration(pendingShiftStop.totalSeconds),
          totalSeconds: pendingShiftStop.totalSeconds,
          regularSeconds: pendingShiftStop.regularSeconds,
          overtimeSeconds: pendingShiftStop.overtimeSeconds,
          overtimeNote: pendingShiftStop.requiresOvertimeNote
            ? overtimeNoteDraft.trim()
            : undefined,
          status: "Pending",
          submittedAt: "Just now",
        };
        const nextEntries = [
          submission,
          ...storedEntries.filter(
            (entry) =>
              typeof entry === "object" &&
              entry !== null &&
              "id" in entry &&
              (entry as { id?: unknown }).id !== submission.id
          ),
        ];
        window.localStorage.setItem(storageKey, JSON.stringify(nextEntries));
      } catch (error) {
        console.error("Failed to save timesheet submission", error);
      }
    }

    setActiveShiftId(null);
    setActiveShiftStartedAt(null);
    setElapsedSeconds(0);
    setIsConfirmOpen(false);
    setPendingStopId(null);
    setPendingShiftStop(null);
    setOvertimeNoteDraft("");
    setOvertimeNoteError(null);
  };

  const cancelShiftStop = () => {
    setIsConfirmOpen(false);
    setPendingStopId(null);
    setPendingShiftStop(null);
    setOvertimeNoteDraft("");
    setOvertimeNoteError(null);
  };

  const activeThread =
    filteredThreads.find((thread) => thread.id === activeThreadId) || null;
  const activeMessages = activeThreadId
    ? messagesByThread[activeThreadId] ?? []
    : [];

  const handleSend = () => {
    if (!draft.trim()) return;
    setDraft("");
  };

  const handleContactManager = (org: OrganizationCard) => {
    const threadId = org.threadId ?? `org-${org.id}`;
    setThreads((prev) => {
      if (prev.some((thread) => thread.id === threadId)) {
        return prev;
      }
      const newThread: Thread = {
        id: threadId,
        name: org.name,
        role: "Organization",
        preview: "Start a conversation with the manager.",
        time: "Now",
        unread: 0,
        status: "online",
        important: false,
        avatar:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
      };
      return [newThread, ...prev];
    });
    setQuery("");
    setActiveTab("communications");
    setActiveThreadId(threadId);
  };

  const handleApproveOrganization = (orgId: string) => {
    setOrganizationCards((prev) =>
      prev.map((org) =>
        org.id === orgId ? { ...org, status: "Active" } : org
      )
    );
  };

  const handleDeclineOrganization = (orgId: string) => {
    setOrganizationCards((prev) => prev.filter((org) => org.id !== orgId));
    setPrimaryOrgId((prev) => (prev === orgId ? null : prev));
  };

  const handleDisconnectOrganization = (orgId: string) => {
    setOrganizationCards((prev) => prev.filter((org) => org.id !== orgId));
    setPrimaryOrgId((prev) => (prev === orgId ? null : prev));
  };

  const handleSetPrimaryOrganization = (orgId: string) => {
    setPrimaryOrgId(orgId);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#080313] via-[#260d5c] to-[#5d3ab9] text-white overflow-hidden">
      <div
        className="absolute inset-0 mission-aurora pointer-events-none"
        style={auroraStyle}
        aria-hidden="true"
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#080313]/80 via-[#260d5c]/70 to-[#080313]/80" />
      <div className="relative z-10">
        <div className="min-h-screen flex flex-col md:flex-row text-white">
          <aside className="hidden md:flex fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white/5 backdrop-blur-xl text-white shadow-md flex-col py-8 px-4 space-y-3">
            {volunteerTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative w-full flex items-center justify-start px-4 py-2 rounded-xl text-sm font-semibold text-left transition ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#2f6bff] via-[#4fa5ff] to-[#7cc7ff] text-white font-extrabold shadow-lg"
                      : "text-white font-extrabold hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon
                      className={`h-5 w-5 ${
                        activeTab === tab.id ? "text-[#7cc7ff]" : "text-[#4fa5ff]"
                      }`}
                      aria-hidden="true"
                    />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </aside>

          <div className="w-full md:ml-64">
            <div className="md:hidden sticky top-16 z-20 border-b border-white/10 bg-[#120626]/80 backdrop-blur-md px-4 py-3">
              <div className="flex gap-2 overflow-x-auto cfoc-scrollbar pb-1">
                {volunteerTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative min-w-max rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-[#2f6bff] via-[#4fa5ff] to-[#7cc7ff] text-white shadow-lg"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <motion.header
              className="max-w-6xl mx-auto px-6 pt-10 pb-2 text-center"
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            />

            <motion.section
              className="relative max-w-6xl mx-auto px-6 pt-6 pb-20"
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className={contentWrapperClass}>
              {activeTab === "communications" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] min-h-[60vh] text-white">
                  <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                          Inbox
                        </p>
                        <h2 className="text-lg font-semibold text-white">
                          Conversations
                        </h2>
                      </div>
                      <button className="text-xs uppercase tracking-[0.2em] text-white/60 transition hover:text-white">
                        New message
                      </button>
                    </div>

                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
                      />
                    </div>

                    <div className="mt-4 space-y-2">
                      {filteredThreads.length === 0 ? (
                        <p className="text-sm text-white/50">
                          No conversations found.
                        </p>
                      ) : (
                        filteredThreads.map((thread) => {
                          const isActive = thread.id === activeThreadId;
                          return (
                            <button
                              key={thread.id}
                              type="button"
                              onClick={() => setActiveThreadId(thread.id)}
                              className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                                isActive ? "bg-white/10" : "hover:bg-white/5"
                              } ${
                                thread.important
                                  ? "border-l-2 border-[#ff9c4b]"
                                  : "border border-transparent"
                              }`}
                            >
                              <div className="relative">
                                <img
                                  src={thread.avatar}
                                  alt={thread.name}
                                  className="h-10 w-10 rounded-full object-cover border border-white/20"
                                />
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-[#1a0c34] ${
                                    statusDot[thread.status]
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-white">
                                    {thread.name}
                                  </p>
                                  <span className="text-xs text-white/50">
                                    {thread.time}
                                  </span>
                                </div>
                                <p className="text-xs text-white/50">
                                  {thread.role}
                                </p>
                                <p className="mt-1 text-xs text-white/70 line-clamp-1">
                                  {thread.preview}
                                </p>
                              </div>
                              {thread.unread > 0 && (
                                <span className="ml-1 rounded-full bg-[#ff9c4b] px-2 py-0.5 text-[10px] font-semibold text-[#080313]">
                                  {thread.unread}
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </aside>

                  <section className="flex flex-col rounded-2xl border border-white/10 bg-white/5">
                    {activeThread ? (
                      <>
                        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={activeThread.avatar}
                              alt={activeThread.name}
                              className="h-10 w-10 rounded-full object-cover border border-white/20"
                            />
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {activeThread.name}
                              </p>
                              <p className="text-xs text-white/50">
                                {activeThread.role} · {activeThread.status}
                              </p>
                            </div>
                          </div>
                          <button className="text-xs uppercase tracking-[0.2em] text-white/60 transition hover:text-white">
                            Options
                          </button>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                          {activeMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                                message.from === "me"
                                  ? "ml-auto bg-[#ff9c4b]/20 text-white"
                                  : "bg-white/10 text-white/80"
                              }`}
                            >
                              <p>{message.text}</p>
                              <p className="mt-2 text-[11px] text-white/50">
                                {message.time}
                              </p>
                            </div>
                          ))}
                        </div>

                      <div className="border-t border-white/10 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") handleSend();
                            }}
                            placeholder="Write a message..."
                            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleSend}
                            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-[#ff9c4b] hover:text-white"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-1 items-center justify-center text-sm text-white/60">
                      {filteredThreads.length === 0
                        ? "No conversations available."
                        : "Select a conversation to start."}
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Profil</p>
                      <p className="mt-1 text-sm text-white/60">
                        Modifie tes informations personnelles dans Settings.
                      </p>
                    </div>
                    <Link
                      href="/settings?tab=profile"
                      className="inline-flex items-center justify-center rounded-full bg-[#271c70] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
                    >
                      Modifier dans Settings
                    </Link>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                  <VolunteerDocumentsSection mode="volunteer" />
                  <VolunteerReferencesSection mode="volunteer" />
                </div>
              </div>
            )}

            {activeTab === "shift" && (
              <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] items-start">
                <div className="space-y-10 min-w-0">
                  <section className="space-y-4">
                    {volunteerShiftNotifications.length > 0 && (
                      <div className="rounded-xl border border-sky-300/30 bg-sky-500/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">
                            Updates from manager
                          </p>
                          <span className="text-[11px] text-sky-100/80">
                            {volunteerShiftNotifications.length} notification
                            {volunteerShiftNotifications.length > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="mt-3 space-y-2">
                          {volunteerShiftNotifications.slice(0, 3).map((notification) => (
                            <div
                              key={notification.id}
                              className="rounded-lg border border-white/10 bg-[#120626]/50 px-3 py-2"
                            >
                              <p className="text-xs font-semibold text-white">
                                {notification.title}
                              </p>
                              <p className="mt-0.5 text-xs text-white/70">
                                {notification.message}
                              </p>
                              <p className="mt-1 text-[10px] text-white/50">
                                {formatNotificationTimestamp(notification.createdAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Calendar className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
                        My schedule
                      </div>
                      <button
                        type="button"
                        className="text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white"
                      >
                        View calendar
                      </button>
                    </div>
                    <div className="space-y-3">
                      {scheduleItems.map((item) => {
                        const isActive = activeShiftId === item.id;
                        return (
                          <div
                            key={item.id}
                            className={`flex flex-col gap-3 rounded-xl border px-4 py-3 md:flex-row md:items-center md:justify-between ${
                              item.isOpen
                                ? "border-emerald-400/30 bg-emerald-500/10"
                                : item.isToday
                                  ? "border-[#ff9c4b]/40 bg-white/10"
                                  : "border-white/10 bg-[#120626]/60"
                            }`}
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-white">
                                  {item.title}
                                </p>
                                {item.isToday && (
                                  <span className="rounded-full border border-[#ff9c4b]/40 bg-[#ff9c4b]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ff9c4b]">
                                    Today
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/60">
                                {item.organization}
                              </p>
                              <p className="text-xs text-white/50">
                                {item.day} / {item.time} / {item.location}
                              </p>
                            </div>
                            {item.isOpen ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[item.status]}`}
                                >
                                  {item.status}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    item.plannerShiftId
                                      ? claimPlannerShift(item.plannerShiftId)
                                      : undefined
                                  }
                                  disabled={!item.plannerShiftId}
                                  className={`rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                                    item.plannerShiftId
                                      ? "bg-[#271c70] text-white hover:bg-[#ff9c4b]"
                                      : "cursor-not-allowed border border-white/10 text-white/40"
                                  }`}
                                >
                                  Claim
                                </button>
                              </div>
                            ) : item.isToday ? (
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="inline-flex rounded-full border border-white/20 p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleShiftStart(item.id)}
                                    className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                                      isActive
                                        ? "rounded-full bg-[#ff9c4b] text-black"
                                        : "text-white/70 hover:text-white"
                                    }`}
                                  >
                                    ON
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => requestShiftStop(item.id)}
                                    disabled={!isActive}
                                    className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                                      !isActive
                                        ? "rounded-full bg-white/10 text-white/60"
                                        : "text-white/70 hover:text-white"
                                    }`}
                                  >
                                    OFF
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[item.status]}`}
                              >
                                {item.status}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Clock className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
                        Time worked
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTimeWorked((prev) => !prev)}
                        className="text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white"
                      >
                        {showTimeWorked ? "See less" : "See more"}
                      </button>
                    </div>
                    {showTimeWorked && (
                      <div className="space-y-3">
                        {timeLogState.map((log) => (
                          <div
                            key={log.id}
                            className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#120626]/60 px-4 py-3 md:flex-row md:items-center md:justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {log.title}
                              </p>
                              <p className="text-xs text-white/60">
                                {log.organization} / {log.date}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-white">
                                {log.duration}
                              </span>
                              {log.status === "Approved" && (
                                <button
                                  type="button"
                                  onClick={() => downloadTimesheetPdf(log)}
                                  className="rounded-full border border-white/20 p-2 text-white/80 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                                  aria-label="Download PDF"
                                >
                                  <Download
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </button>
                              )}
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[log.status]}`}
                              >
                                {log.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                <div className="space-y-6">
	                  <section className="space-y-3">
	                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
	                      <Clock className="h-4 w-4 text-[#ff9c4b]" aria-hidden="true" />
	                      Shift timer
	                    </div>
	                    <div className="space-y-2">
	                      {activeShift ? (
	                        <>
	                          <p className="text-xs text-white/60">
	                            Active: {activeShift.title}
	                          </p>
	                          {activeShiftSchedule && (
	                            <p className="text-xs text-white/50">
	                              Shift ends at{" "}
	                              {formatClockTime(activeShiftSchedule.endAt.getTime())}{" "}
	                              (grace until{" "}
	                              {formatClockTime(
	                                activeShiftSchedule.endAt.getTime() + 15 * 60 * 1000
	                              )}
	                              ).
	                            </p>
	                          )}
	                          <p className="text-3xl font-semibold text-white">
	                            {formatElapsed(elapsedSeconds)}
	                          </p>
	                          {activeShiftSchedule &&
	                            Date.now() > activeShiftSchedule.endAt.getTime() && (
	                              <p
	                                className={`text-xs ${
	                                  overtimeGraceEndAtMs !== null &&
	                                  Date.now() > overtimeGraceEndAtMs
	                                    ? "text-[#ff9c4b]"
	                                    : "text-white/60"
	                                }`}
	                              >
	                                Overtime: +
	                                {formatDuration(
	                                  Math.floor(
	                                    (Date.now() - activeShiftSchedule.endAt.getTime()) /
	                                      1000
	                                  )
	                                )}
	                                {overtimeGraceEndAtMs !== null &&
	                                Date.now() > overtimeGraceEndAtMs
	                                  ? " (note required)"
	                                  : ""}
	                              </p>
	                            )}
	                          <button
	                            type="button"
	                            onClick={() => requestShiftStop(activeShift.id)}
	                            className="mt-2 w-full rounded-full bg-[#ff9c4b] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#ffd08b]"
                          >
                            Stop shift
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-white/60">
                            No active shift. Turn ON today&apos;s shift to begin tracking.
                          </p>
                          <p className="text-3xl font-semibold text-white">
                            00:00:00
                          </p>
                        </>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === "findJob" && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                <section className="min-w-0 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                          Volunteer Hub
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">
                          Find a job
                        </h2>
                        <p className="mt-2 text-sm text-white/60">
                          {filteredFindJobCards.length} result
                          {filteredFindJobCards.length === 1 ? "" : "s"} ·
                          Submit your profile in a few clicks
                        </p>
                      </div>
                      {hasActiveFindJobFilters && (
                        <button
                          type="button"
                          onClick={clearFindJobFilters}
                          className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.9fr)]">
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                          Search
                        </span>
                        <div className="relative">
                          <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                            aria-hidden="true"
                          />
                          <input
                            type="text"
                            value={findJobSearch}
                            onChange={(event) => setFindJobSearch(event.target.value)}
                            placeholder="Role, org, keyword..."
                            className="w-full rounded-xl border border-white/10 bg-[#120626]/60 px-9 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#ff9c4b] focus:outline-none"
                          />
                          {findJobSearch.trim() !== "" && (
                            <button
                              type="button"
                              onClick={() => setFindJobSearch("")}
                              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                              aria-label="Clear search"
                            >
                              <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                          Region
                        </span>
                        <select
                          value={findJobRegionFilter}
                          onChange={(event) => setFindJobRegionFilter(event.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#120626]/60 px-3 py-2.5 text-sm text-white focus:border-[#ff9c4b] focus:outline-none"
                        >
                          <option value="all">All regions</option>
                          {findJobRegionOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                          Mode
                        </span>
                        <select
                          value={findJobModeFilter}
                          onChange={(event) =>
                            setFindJobModeFilter(event.target.value as JobModeFilter)
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#120626]/60 px-3 py-2.5 text-sm text-white focus:border-[#ff9c4b] focus:outline-none"
                        >
                          <option value="all">All modes</option>
                          <option value="remote">Remote</option>
                          <option value="in_person">In person</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                          Commitment
                        </span>
                        <select
                          value={findJobCommitmentFilter}
                          onChange={(event) =>
                            setFindJobCommitmentFilter(event.target.value)
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#120626]/60 px-3 py-2.5 text-sm text-white focus:border-[#ff9c4b] focus:outline-none"
                        >
                          <option value="all">All commitments</option>
                          {findJobCommitmentOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  {jobSubmissionFeedback && (
                    <div
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        jobSubmissionFeedback.tone === "success"
                          ? "border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
                          : jobSubmissionFeedback.tone === "error"
                            ? "border-rose-300/30 bg-rose-500/10 text-rose-100"
                            : "border-sky-300/30 bg-sky-500/10 text-sky-100"
                      }`}
                    >
                      {jobSubmissionFeedback.text}
                    </div>
                  )}

                  {findJobCards.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                      No published jobs yet. Organizations need to publish roles first.
                    </div>
                  ) : filteredFindJobCards.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                      No jobs match your filters. Try clearing filters or search.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredFindJobCards.map((job) => {
                        const application =
                          volunteerJobApplicationLookup.get(job.id) ?? null;
                        const isSelected = selectedFindJobId === job.id;
                        const isApplied = application !== null;
                        return (
                          <button
                            key={job.id}
                            type="button"
                            onClick={() => setSelectedFindJobId(job.id)}
                            className={`w-full rounded-2xl border p-4 text-left transition ${
                              isSelected
                                ? "border-[#4fa5ff]/50 bg-[#1a1340]/90 shadow-[0_0_0_1px_rgba(79,165,255,0.2)]"
                                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-base font-semibold text-white">
                                    {job.title}
                                  </p>
                                  <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                                    {job.modeLabel}
                                  </span>
                                  {isApplied && (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                      Submitted
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-sm text-white/70">
                                  {job.organizationName}
                                  {job.department ? ` · ${job.department}` : ""}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">
                                    <MapPin className="h-3.5 w-3.5 text-[#4fa5ff]" aria-hidden="true" />
                                    {job.region}
                                  </span>
                                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">
                                    {job.typeLabel}
                                  </span>
                                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">
                                    {job.commitmentLabel}
                                  </span>
                                </div>

                                {(job.schedule ?? "").trim() !== "" && (
                                  <p className="mt-3 text-xs text-white/50">
                                    Schedule: {job.schedule}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 md:flex-col md:items-end">
                                <span className="text-xs font-semibold text-white/60">
                                  {isApplied ? "Already submitted" : "Open"}
                                </span>
                                <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
                                  {isSelected ? "Selected" : "View"}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>

                <aside className="self-start rounded-2xl border border-white/10 bg-white/5 p-5 xl:sticky xl:top-24">
                  {selectedFindJob ? (
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                            Job details
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-white">
                            {selectedFindJob.title}
                          </h3>
                          <p className="mt-1 text-sm text-white/70">
                            {selectedFindJob.organizationName}
                            {selectedFindJob.department
                              ? ` · ${selectedFindJob.department}`
                              : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFindJobId(null)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/30 hover:text-white xl:hidden"
                          aria-label="Close job details"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80">
                          <MapPin className="h-3.5 w-3.5 text-[#4fa5ff]" aria-hidden="true" />
                          {selectedFindJob.region}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80">
                          {selectedFindJob.modeLabel}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80">
                          {selectedFindJob.commitmentLabel}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80">
                          {selectedFindJob.typeLabel}
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#120626]/50 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                          Summary
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-white/75">
                          <p>
                            <span className="text-white/50">Location:</span>{" "}
                            {selectedFindJob.location?.trim() || "TBD"}
                          </p>
                          <p>
                            <span className="text-white/50">Schedule:</span>{" "}
                            {selectedFindJob.schedule?.trim() || "To be confirmed"}
                          </p>
                          <p>
                            <span className="text-white/50">Commitment:</span>{" "}
                            {selectedFindJob.commitmentLabel}
                          </p>
                          <p className="text-xs text-white/55">
                            Your volunteer profile (name, contact, location, skills,
                            availability) will be sent to the organization.
                          </p>
                        </div>
                      </div>

                      {!isVolunteerProfileReadyForSubmission && (
                        <div className="rounded-xl border border-amber-300/25 bg-amber-500/10 p-4 text-sm text-amber-100">
                          Complete your profile (name, email, location) before submitting.
                          <div className="mt-3">
                            <Link
                              href="/settings?tab=profile"
                              className="inline-flex items-center justify-center rounded-full border border-amber-200/30 px-4 py-2 text-xs font-semibold text-amber-50 transition hover:border-amber-100/60 hover:bg-amber-500/10"
                            >
                              Complete profile
                            </Link>
                          </div>
                        </div>
                      )}

                      <div className="rounded-xl border border-white/10 bg-[#120626]/50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">
                            Submit your profile
                          </p>
                          {selectedFindJobApplication && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Sent
                            </span>
                          )}
                        </div>

                        {selectedFindJobApplication ? (
                          <div className="mt-3 space-y-2 text-sm text-white/70">
                            <p>
                              Your profile was sent to{" "}
                              <span className="font-semibold text-white">
                                {selectedFindJob.organizationName}
                              </span>
                              .
                            </p>
                            <p className="text-xs text-white/50">
                              Submitted{" "}
                              {formatNotificationTimestamp(
                                selectedFindJobApplication.submittedAt
                              )}
                            </p>
                            {selectedFindJobApplication.message && (
                              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65">
                                Message: {selectedFindJobApplication.message}
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <label className="mt-3 block">
                              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                                Message (optional)
                              </span>
                              <textarea
                                value={jobSubmissionMessage}
                                onChange={(event) =>
                                  setJobSubmissionMessage(event.target.value)
                                }
                                rows={4}
                                placeholder="Short note to the organization..."
                                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#ff9c4b] focus:outline-none"
                              />
                            </label>

                            <div className="mt-4 grid gap-2 text-xs text-white/60">
                              <p>
                                <span className="text-white/45">Name:</span>{" "}
                                {profileState.name}
                              </p>
                              <p>
                                <span className="text-white/45">Email:</span>{" "}
                                {profileState.email}
                              </p>
                              <p>
                                <span className="text-white/45">Location:</span>{" "}
                                {profileState.location}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                submitVolunteerProfileToJob(selectedFindJob.id)
                              }
                              disabled={!isVolunteerProfileReadyForSubmission}
                              className={`mt-4 w-full rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                                isVolunteerProfileReadyForSubmission
                                  ? "bg-[#271c70] text-white hover:bg-[#ff9c4b] hover:text-black"
                                  : "cursor-not-allowed border border-white/10 bg-white/5 text-white/40"
                              }`}
                            >
                              Submit my profile
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-[#120626]/40 p-5 text-sm text-white/60">
                      {filteredFindJobCards.length > 0
                        ? "Select a job to view details and submit your profile."
                        : "No job selected."}
                    </div>
                  )}
                </aside>
              </div>
            )}

            {activeTab === "organizations" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Connected organizations
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Organization details
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManageConnectionsOpen(true)}
                    className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                  >
                    Manage connections
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {organizationCards.map((org) => {
                    const isPending = org.status === "Pending";
                    const isPrimary = org.id === primaryOrgId;
                    return (
                      <div
                        key={org.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-white">
                              <Building2
                                className="h-4 w-4 text-[#4fa5ff]"
                                aria-hidden="true"
                              />
                              {org.name}
                            </div>
                            <p className="mt-2 text-xs text-white/60">
                              {org.location}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${orgStatusTone[org.status]}`}
                            >
                              {org.status}
                            </span>
                            {isPrimary && (
                              <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                                Primary
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-white/70">
                          {org.mission}
                        </p>

                        <div className="mt-4 grid gap-2 text-xs text-white/60">
                          {org.submittedAt && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-white/50" aria-hidden="true" />
                              Submitted {org.submittedAt}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4 text-white/50" aria-hidden="true" />
                            Coordinator: {org.coordinator}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-white/50" aria-hidden="true" />
                            Next shift: {org.nextShift}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-white/50" aria-hidden="true" />
                            {org.contactEmail}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-white/50" aria-hidden="true" />
                            {org.contactPhone}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {org.focus.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70"
                            >
                              {item}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleContactManager(org)}
                          disabled={isPending}
                          className={`mt-4 rounded-full px-4 py-2 text-xs font-semibold transition ${
                            isPending
                              ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/50"
                              : "bg-[#271c70] text-white hover:bg-[#ff9c4b]"
                          }`}
                        >
                          {isPending ? "Awaiting approval" : "Contact manager"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {isManageConnectionsOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                            Manage connections
                          </p>
                          <h3 className="mt-2 text-xl font-semibold">
                            Pending and connected organizations
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsManageConnectionsOpen(false)}
                          className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                        >
                          Close
                        </button>
                      </div>

                      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-white">
                              Pending requests
                            </h4>
                            <span className="text-xs text-white/50">
                              {pendingOrganizations.length} waiting
                            </span>
                          </div>
                          {pendingOrganizations.length === 0 ? (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                              No pending requests right now.
                            </div>
                          ) : (
                            pendingOrganizations.map((org) => (
                              <div
                                key={org.id}
                                className="rounded-xl border border-white/10 bg-[#120626]/60 p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-white">
                                      {org.name}
                                    </p>
                                    <p className="text-xs text-white/60">
                                      {org.location}
                                    </p>
                                    {org.submittedAt && (
                                      <p className="text-xs text-white/50">
                                        Submitted {org.submittedAt}
                                      </p>
                                    )}
                                  </div>
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${orgStatusTone[org.status]}`}
                                  >
                                    {org.status}
                                  </span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleApproveOrganization(org.id)}
                                    className="rounded-full bg-[#271c70] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#ff9c4b]"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeclineOrganization(org.id)}
                                    className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/40 hover:text-white"
                                  >
                                    Decline
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-white">
                              Connected organizations
                            </h4>
                            <span className="text-xs text-white/50">
                              {activeOrganizations.length} active
                            </span>
                          </div>
                          {activeOrganizations.length === 0 ? (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                              No active connections yet.
                            </div>
                          ) : (
                            activeOrganizations.map((org) => {
                              const isPrimary = org.id === primaryOrgId;
                              return (
                                <div
                                  key={org.id}
                                  className="rounded-xl border border-white/10 bg-[#120626]/60 p-4"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-white">
                                        {org.name}
                                      </p>
                                      <p className="text-xs text-white/60">
                                        {org.location}
                                      </p>
                                    </div>
                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-semibold ${orgStatusTone[org.status]}`}
                                    >
                                      {org.status}
                                    </span>
                                  </div>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {isPrimary ? (
                                      <span className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                                        Primary
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleSetPrimaryOrganization(org.id)}
                                        className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/40 hover:text-white"
                                      >
                                        Set primary
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDisconnectOrganization(org.id)}
                                      className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/40 hover:text-white"
                                    >
                                      Disconnect
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "shift" &&
              isConfirmOpen &&
              activeShift &&
              pendingShiftStop && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
                  <h3 className="text-lg font-semibold">Submit shift time?</h3>
                  <p className="mt-2 text-sm text-white/70">
                    This time will be submitted for approval in Volunteer Manager.
                  </p>
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                    <p className="font-semibold text-white">{activeShift.title}</p>
                    <p className="text-white/60">{activeShift.organization}</p>
                    <p className="mt-2 text-white/70">
                      Logged time: {formatDuration(pendingShiftStop.totalSeconds)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/60">
                      <span>
                        Regular: {formatDuration(pendingShiftStop.regularSeconds)}
                      </span>
                      {pendingShiftStop.overtimeSeconds > 0 && (
                        <>
                          <span className="text-white/30">•</span>
                          <span className="text-[#ff9c4b]">
                            Overtime: +{formatDuration(pendingShiftStop.overtimeSeconds)}
                          </span>
                        </>
                      )}
                    </div>
                    {pendingShiftStop.scheduledEndAtMs !== null && (
                      <p className="mt-2 text-[11px] text-white/50">
                        Shift ends at {formatClockTime(pendingShiftStop.scheduledEndAtMs)}{" "}
                        (grace until{" "}
                        {formatClockTime(
                          pendingShiftStop.scheduledEndAtMs + 15 * 60 * 1000
                        )}
                        ).
                      </p>
                    )}
                  </div>
                  {pendingShiftStop.requiresOvertimeNote && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-white">
                          Overtime explanation
                        </p>
                        <p className="text-[11px] text-white/60">
                          {countWords(overtimeNoteDraft)}/30 words
                        </p>
                      </div>
                      <textarea
                        value={overtimeNoteDraft}
                        onChange={(event) => {
                          setOvertimeNoteDraft(event.target.value);
                          setOvertimeNoteError(null);
                        }}
                        rows={4}
                        placeholder="Explain why you worked overtime..."
                        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#ff9c4b] focus:outline-none"
                      />
                      {overtimeNoteError && (
                        <p className="text-[11px] text-rose-200">
                          {overtimeNoteError}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={cancelShiftStop}
                      className="flex-1 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmShiftStop}
                      disabled={
                        pendingShiftStop.requiresOvertimeNote &&
                        countWords(overtimeNoteDraft) < 30
                      }
                      className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition ${
                        pendingShiftStop.requiresOvertimeNote &&
                        countWords(overtimeNoteDraft) < 30
                          ? "border border-white/10 bg-white/10 text-white/40"
                          : "bg-[#ff9c4b] text-black hover:bg-[#ffd08b]"
                      }`}
                    >
                      Submit time
                    </button>
                  </div>
                </div>
              </div>
            )}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
