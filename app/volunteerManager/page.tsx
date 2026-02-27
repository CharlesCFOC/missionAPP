"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Hash,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Trash2,
  UserCircle,
  Users,
  Video,
} from "lucide-react";
import VolunteerDocumentsSection from "@/components/volunteerDocuments/VolunteerDocumentsSection";

const PUBLISHED_JOBS_STORAGE_KEY = "cfoc-volunteer-published-jobs";
const SUBMITTED_TIMESHEETS_STORAGE_KEY = "cfoc-demo-timesheets";
const DEMO_VOLUNTEER_DIRECTORY_KEY = "cfoc-demo-volunteer-directory";
const SAMPLE_CALENDARS_STORAGE_KEY = "cfoc-demo-sample-calendars";
const SHIFT_PLANNER_STORAGE_KEY = "cfoc-demo-shift-planner";
const SHIFT_PLANNER_NOTIFICATIONS_STORAGE_KEY =
  "cfoc-demo-shift-planner-notifications";
const SHIFT_PLANNER_CONFIRMATION_STORAGE_KEY =
  "cfoc-demo-shift-planner-confirmation";
const CALENDAR_ALL_DEPARTMENTS_ID = "__all_departments__";

type DemoVolunteerDirectoryEntry = {
  email: string;
  full_name?: string;
  birth_date?: string;
  updated_at?: string;
};

const normalizeEmailKey = (email: string) => email.trim().toLowerCase();

const readDemoVolunteerDirectoryFromStorage = (): Record<
  string,
  DemoVolunteerDirectoryEntry
> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DEMO_VOLUNTEER_DIRECTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const record = parsed as Record<string, unknown>;
    const directory: Record<string, DemoVolunteerDirectoryEntry> = {};

    Object.entries(record).forEach(([key, value]) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return;
      const normalizedKey = normalizeEmailKey(key);
      const row = value as Record<string, unknown>;
      directory[normalizedKey] = {
        email:
          typeof row.email === "string"
            ? normalizeEmailKey(row.email)
            : normalizedKey,
        full_name: typeof row.full_name === "string" ? row.full_name : undefined,
        birth_date: typeof row.birth_date === "string" ? row.birth_date : undefined,
        updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
      };
    });

    return directory;
  } catch {
    return {};
  }
};

type SampleCalendarVolunteerSlot = {
  id: string;
  label: string;
};

type SampleCalendarShift = {
  id: string;
  day: ScheduleDayId;
  start: string;
  end: string;
  assignedSlotIds: string[];
};

type SampleCalendar = {
  id: string;
  title: string;
  roleIds: string[];
  slots: SampleCalendarVolunteerSlot[];
  shifts: SampleCalendarShift[];
  updatedAt: string;
};

const readSampleCalendarsFromStorage = (): SampleCalendar[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAMPLE_CALENDARS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((value): value is SampleCalendar => {
      if (!value || typeof value !== "object") return false;
      const record = value as Record<string, unknown>;
      if (typeof record.id !== "string") return false;
      if (typeof record.title !== "string") return false;
      if (!Array.isArray(record.roleIds)) return false;
      if (!Array.isArray(record.slots)) return false;
      if (!Array.isArray(record.shifts)) return false;
      if (typeof record.updatedAt !== "string") return false;
      return true;
    });
  } catch {
    return [];
  }
};

const writeSampleCalendarsToStorage = (calendars: SampleCalendar[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SAMPLE_CALENDARS_STORAGE_KEY,
      JSON.stringify(calendars)
    );
  } catch {
    // ignore storage failures
  }
};

type ShiftPlannerScope = "organization" | "job";
type ShiftPlannerAssignmentSource = "manager" | "claimed";

type ShiftPlannerAssignment = {
  name: string;
  email?: string;
  source: ShiftPlannerAssignmentSource;
  assignedAt: string;
};

type ShiftPlannerShift = {
  id: string;
  weekStart: string;
  day: ScheduleDayId;
  start: string;
  end: string;
  roleId: string;
  roleTitle?: string;
  location?: string;
  assignments: (ShiftPlannerAssignment | null)[];
  createdAt: string;
};

type ShiftPlannerState = {
  scope: ShiftPlannerScope;
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

type ShiftPlannerConfirmationState = {
  confirmedAt: string;
  signature: string;
};

const createDefaultShiftPlannerState = (): ShiftPlannerState => ({
  scope: "organization",
  selectedRoleId: null,
  claimEnabled: false,
  slotsCount: 3,
  publishedWeeks: [],
  shifts: [],
  updatedAt: new Date().toISOString(),
});

const clampNumber = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const normalizeShiftPlannerState = (state: ShiftPlannerState): ShiftPlannerState => {
  const slotsCount = clampNumber(
    Number.isFinite(state.slotsCount) ? state.slotsCount : 3,
    1,
    5
  );
  const shifts = state.shifts.map((shift) => {
    const currentAssignments = Array.isArray(shift.assignments)
      ? shift.assignments
      : [];
    const normalizedAssignments = Array.from({ length: slotsCount }).map(
      (_, index) => {
        const value = currentAssignments[index] as unknown;
        if (!value) return null;
        if (typeof value !== "object") return null;
        const record = value as Record<string, unknown>;
        if (typeof record.name !== "string" || !record.name.trim()) return null;
        const source: ShiftPlannerAssignmentSource =
          record.source === "claimed" ? "claimed" : "manager";
        return {
          name: record.name,
          email: typeof record.email === "string" ? record.email : undefined,
          source,
          assignedAt:
            typeof record.assignedAt === "string"
              ? record.assignedAt
              : new Date().toISOString(),
        };
      }
    );

    return { ...shift, assignments: normalizedAssignments };
  });

  const publishedWeeks = Array.isArray(state.publishedWeeks)
    ? state.publishedWeeks.filter((value): value is string => typeof value === "string")
    : [];

  return { ...state, slotsCount, shifts, publishedWeeks };
};

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
    const scope: ShiftPlannerScope =
      record.scope === "job" ? "job" : "organization";
    const selectedRoleId =
      typeof record.selectedRoleId === "string" ? record.selectedRoleId : null;
    const claimEnabled = Boolean(record.claimEnabled);
    const slotsCount =
      typeof record.slotsCount === "number"
        ? clampNumber(record.slotsCount, 1, 5)
        : 3;
    const publishedWeeks = Array.isArray(record.publishedWeeks)
      ? record.publishedWeeks.filter((value): value is string => typeof value === "string")
      : [];

    const shifts = Array.isArray(record.shifts)
      ? record.shifts
          .filter((value): value is ShiftPlannerShift => {
            if (!value || typeof value !== "object") return false;
            const row = value as Record<string, unknown>;
            if (typeof row.id !== "string") return false;
            if (typeof row.weekStart !== "string") return false;
            if (typeof row.day !== "string") return false;
            if (typeof row.start !== "string") return false;
            if (typeof row.end !== "string") return false;
            if (typeof row.roleId !== "string") return false;
            if (!Array.isArray(row.assignments)) return false;
            if (typeof row.createdAt !== "string") return false;
            return true;
          })
          .map((shift) => ({
            ...shift,
            assignments: shift.assignments,
          }))
      : [];

    const updatedAt =
      typeof record.updatedAt === "string" ? record.updatedAt : new Date().toISOString();

    return normalizeShiftPlannerState({
      scope,
      selectedRoleId,
      claimEnabled,
      slotsCount,
      publishedWeeks,
      shifts,
      updatedAt,
    });
  } catch {
    return createDefaultShiftPlannerState();
  }
};

const writeShiftPlannerToStorage = (state: ShiftPlannerState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SHIFT_PLANNER_STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch {
    // ignore storage failures
  }
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

const writeShiftPlannerNotificationsToStorage = (
  notifications: ShiftPlannerVolunteerNotification[]
) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SHIFT_PLANNER_NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notifications)
    );
  } catch {
    // ignore storage failures
  }
};

const readShiftPlannerConfirmationFromStorage =
  (): ShiftPlannerConfirmationState | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(SHIFT_PLANNER_CONFIRMATION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
      const record = parsed as Record<string, unknown>;
      if (typeof record.confirmedAt !== "string") return null;
      if (typeof record.signature !== "string") return null;
      return { confirmedAt: record.confirmedAt, signature: record.signature };
    } catch {
      return null;
    }
  };

const writeShiftPlannerConfirmationToStorage = (
  confirmation: ShiftPlannerConfirmationState
) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SHIFT_PLANNER_CONFIRMATION_STORAGE_KEY,
      JSON.stringify(confirmation)
    );
  } catch {
    // ignore storage failures
  }
};

const buildShiftPlannerConfirmationSignature = (state: ShiftPlannerState): string => {
  const normalized = {
    claimEnabled: state.claimEnabled,
    slotsCount: state.slotsCount,
    publishedWeeks: [...state.publishedWeeks].sort(),
    shifts: [...state.shifts]
      .map((shift) => ({
        id: shift.id,
        weekStart: shift.weekStart,
        day: shift.day,
        start: shift.start,
        end: shift.end,
        roleId: shift.roleId,
        assignments: shift.assignments.map((assignment) =>
          assignment
            ? {
                name: assignment.name,
                email: assignment.email ?? "",
                source: assignment.source,
              }
            : null
        ),
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  };
  return JSON.stringify(normalized);
};

const formatLocalISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalISODate = (value: string): Date | null => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;
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

const getWeekStartISODate = (date: Date): string => {
  const anchor = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = anchor.getDay(); // 0 Sun ... 6 Sat
  const daysSinceMonday = (dayIndex + 6) % 7;
  anchor.setDate(anchor.getDate() - daysSinceMonday);
  return formatLocalISODate(anchor);
};

const addDaysToISODate = (isoDate: string, days: number): string => {
  const base = parseLocalISODate(isoDate);
  const date = base ?? new Date();
  date.setDate(date.getDate() + days);
  return formatLocalISODate(date);
};

type PublishedJob = {
  id: string;
  title: string;
  type: string;
  schedule: string;
  location: string;
  commitment: string;
};

const VOLUNTEER_MANAGER_TABS = [
  { id: "organisation", label: "Organization", icon: Building2 },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "volunteers", label: "Volunteers", icon: Users },
  { id: "roles", label: "Job", icon: Briefcase },
  { id: "timesheets", label: "Timesheets", icon: Clock },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "sessions", label: "Orientation Sessions", icon: Video },
];

const dashboardStats = [
  { label: "Active volunteers", value: "48", note: "+6 this week" },
  { label: "Pending profiles", value: "7", note: "Awaiting review" },
  { label: "Open roles", value: "12", note: "Across 4 orgs" },
  { label: "Hours logged", value: "326h", note: "Last 30 days" },
];

const initialVolunteerProfiles = [
  {
    id: "vol-1",
    name: "Maya L.",
    role: "Logistics",
    availability: "Tue, Thu 09:00-13:00",
    audience: "adult",
    status: "Pending",
    completion: "92%",
    hoursWorked: "12h",
  },
  {
    id: "vol-2",
    name: "Jonas P.",
    role: "Kids program",
    availability: "Wed 14:00-18:00",
    audience: "youth",
    status: "Pending",
    completion: "88%",
    hoursWorked: "8h",
  },
  {
    id: "vol-3",
    name: "Elisa M.",
    role: "Community kitchen",
    availability: "Mon, Fri 08:30-12:30",
    audience: "adult",
    status: "Approved",
    completion: "100%",
    hoursWorked: "34h",
  },
];

type VolunteerListing = (typeof initialVolunteerProfiles)[number];
type VolunteerAudience = VolunteerListing["audience"];
type VolunteerAudienceFilter = "everyone" | VolunteerAudience;

const parseBirthDate = (value: string): Date | null => {
  const normalized = value.trim();
  if (!normalized) return null;

  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
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
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const getAgeInYears = (birthDate: Date, now: Date): number => {
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};

const audienceFromBirthDate = (
  birthDate: string | undefined
): VolunteerAudience | null => {
  if (!birthDate) return null;
  const parsed = parseBirthDate(birthDate);
  if (!parsed) return null;
  const age = getAgeInYears(parsed, new Date());
  if (age < 0 || age > 120) return null;
  return age < 18 ? "youth" : "adult";
};

const volunteerAudienceLabel: Record<VolunteerAudience, string> = {
  adult: "Adults",
  youth: "Youth",
};

const volunteerAudienceTone: Record<VolunteerAudience, string> = {
  adult: "border border-white/10 bg-white/5 text-white/70",
  youth: "border border-[#4fa5ff]/30 bg-[#4fa5ff]/15 text-[#c7e5ff]",
};

const initialArchivedVolunteers = [
  {
    id: "arch-1",
    name: "Aline D.",
    role: "Community kitchen",
    audience: "adult",
    location: "Accra",
    lastActive: "Mar 2024",
    totalHours: "112h",
  },
  {
    id: "arch-2",
    name: "Jerome T.",
    role: "Logistics",
    audience: "adult",
    location: "Nairobi",
    lastActive: "Feb 2024",
    totalHours: "76h",
  },
  {
    id: "arch-3",
    name: "Rita S.",
    role: "Kids program",
    audience: "youth",
    location: "Lusaka",
    lastActive: "Jan 2024",
    totalHours: "64h",
  },
];

type ArchivedVolunteer = (typeof initialArchivedVolunteers)[number];

const initialRoles = [
  {
    id: "role-1",
    title: "Community kitchen support",
    department: "Community Kitchen",
    schedule: "Tue, Thu 09:00-13:00",
    location: "Accra",
    address: "12 Liberation Ave, Accra",
    targets: { volunteer: true, student: false, adults: true, youth: false },
    summary: "Support meal prep and distribution for community members.",
    keywords: ["kitchen", "food prep", "inventory"],
    commitmentLength: "Short Term",
    conditions: ["On-site", "Food safety training required"],
  },
  {
    id: "role-2",
    title: "Kids program assistant",
    department: "Youth Programs",
    schedule: "Wed 14:00-18:00",
    location: "Lusaka",
    address: "45 Unity Rd, Lusaka",
    targets: { volunteer: true, student: true, adults: false, youth: true },
    summary: "Assist with kids activities, check-ins, and classroom support.",
    keywords: ["youth", "mentoring", "activities"],
    commitmentLength: "Medium Term (4 months to 1 year)",
    conditions: ["On-site", "Background check required"],
  },
  {
    id: "role-3",
    title: "Logistics runner",
    department: "Operations",
    schedule: "Mon, Fri 08:30-12:30",
    location: "Nairobi",
    address: "8 Market Street, Nairobi",
    targets: { volunteer: true, student: false, adults: true, youth: false },
    summary: "Coordinate supplies, pickups, and quick errands during shifts.",
    keywords: ["logistics", "driver", "supplies"],
    commitmentLength: "",
    conditions: ["Hybrid", "Must have a driver's license"],
  },
];

type Role = (typeof initialRoles)[number];
type RoleDraft = Omit<Role, "id">;

type ArchivedRole = Role & {
  archivedAt: string;
};

const initialArchivedRoles: ArchivedRole[] = [
  {
    id: "arch-role-1",
    title: "Warehouse sorter",
    department: "Operations",
    schedule: "Tue 10:00-14:00",
    location: "Montreal",
    address: "11 Dockside Blvd, Montreal",
    targets: { volunteer: true, student: true, adults: true, youth: false },
    summary: "Sort incoming donations and prepare distribution boxes.",
    keywords: ["warehouse", "sorting", "donations"],
    commitmentLength: "One Time / Special Event",
    conditions: ["On-site", "Safety briefing required"],
    archivedAt: "3w ago",
  },
];

type ApplicantStatus = "Pending" | "Approved" | "Declined";
type RoleApplicant = {
  id: string;
  name: string;
  submitted: string;
  status: ApplicantStatus;
  role: string;
  location: string;
  availability: string;
  email: string;
  phone: string;
  skills: string[];
  hasCar: boolean;
  bio: string;
};

type VolunteerStatus = "Active" | "Inactive";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  location: string;
  status: VolunteerStatus;
  lastShift: string;
  hoursThisMonth: string;
};

const initialRoleApplicants: Record<string, RoleApplicant[]> = {
  "role-1": [
    {
      id: "app-1",
      name: "Maya L.",
      submitted: "2h ago",
      status: "Pending",
      role: "Community kitchen support",
      location: "Accra",
      availability: "Tue, Thu 09:00-13:00",
      email: "maya.l@cfoc.org",
      phone: "+233 55 214 0922",
      skills: ["Food prep", "Inventory", "Team support"],
      hasCar: false,
      bio: "Focused on community meals and food distribution support.",
    },
    {
      id: "app-2",
      name: "Elisa M.",
      submitted: "1d ago",
      status: "Approved",
      role: "Community kitchen support",
      location: "Accra",
      availability: "Mon, Fri 08:30-12:30",
      email: "elisa.m@cfoc.org",
      phone: "+233 50 118 4412",
      skills: ["Food safety", "Packing", "Coordination"],
      hasCar: true,
      bio: "Experienced volunteer in kitchen operations and logistics.",
    },
  ],
  "role-2": [
    {
      id: "app-3",
      name: "Jonas P.",
      submitted: "4h ago",
      status: "Pending",
      role: "Kids program assistant",
      location: "Lusaka",
      availability: "Wed 14:00-18:00",
      email: "jonas.p@cfoc.org",
      phone: "+260 97 441 2281",
      skills: ["Youth mentoring", "Storytelling", "Activity planning"],
      hasCar: false,
      bio: "Passionate about youth development and after-school programs.",
    },
    {
      id: "app-4",
      name: "Samuel R.",
      submitted: "2d ago",
      status: "Approved",
      role: "Kids program assistant",
      location: "Lusaka",
      availability: "Wed 14:00-18:00",
      email: "samuel.r@cfoc.org",
      phone: "+260 96 882 7710",
      skills: ["Tutoring", "Safety protocols", "Team coordination"],
      hasCar: true,
      bio: "Former teacher supporting children and family programs.",
    },
  ],
  "role-3": [
    {
      id: "app-5",
      name: "Grace N.",
      submitted: "6h ago",
      status: "Pending",
      role: "Logistics runner",
      location: "Nairobi",
      availability: "Mon, Fri 08:30-12:30",
      email: "grace.n@cfoc.org",
      phone: "+254 701 221 907",
      skills: ["Routing", "Driving", "Stock handling"],
      hasCar: true,
      bio: "Logistics volunteer with strong routing and delivery experience.",
    },
  ],
};

const roleTeams: Record<string, TeamMember[]> = {
  "role-1": [
    {
      id: "team-1",
      name: "Elisa M.",
      role: "Kitchen lead",
      location: "Accra",
      status: "Active",
      lastShift: "Yesterday 09:00-12:30",
      hoursThisMonth: "28h",
    },
    {
      id: "team-2",
      name: "Nora B.",
      role: "Food prep",
      location: "Accra",
      status: "Active",
      lastShift: "Today 09:00-12:20",
      hoursThisMonth: "21h",
    },
  ],
  "role-2": [
    {
      id: "team-3",
      name: "Jonas P.",
      role: "Activity support",
      location: "Lusaka",
      status: "Active",
      lastShift: "Wed 14:00-18:00",
      hoursThisMonth: "16h",
    },
    {
      id: "team-4",
      name: "Grace N.",
      role: "Youth mentor",
      location: "Lusaka",
      status: "Active",
      lastShift: "Wed 14:00-18:00",
      hoursThisMonth: "12h",
    },
  ],
  "role-3": [
    {
      id: "team-5",
      name: "Victor S.",
      role: "Driver",
      location: "Nairobi",
      status: "Active",
      lastShift: "Today 10:15-13:00",
      hoursThisMonth: "19h",
    },
    {
      id: "team-6",
      name: "Samuel R.",
      role: "Dispatch",
      location: "Nairobi",
      status: "Inactive",
      lastShift: "Mon 08:30-12:30",
      hoursThisMonth: "9h",
    },
  ],
};

const scheduleDayOptions = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
] as const;

const scheduleTimeOptions = [
  "08:00-12:00",
  "09:00-13:00",
  "14:00-18:00",
  "18:00-21:00",
  "Flexible",
] as const;

const commitmentLengthOptions = [
  "One Time / Special Event",
  "Short Term",
  "Long Term (Minimum of 6 months)",
  "Medium Term (4 months to 1 year)",
  "Long Term",
] as const;

type ScheduleDayId = (typeof scheduleDayOptions)[number]["id"];

const normalizeText = (value: string | string[]) => {
  return Array.isArray(value) ? value.join(" ") : value;
};

const inferJobType = (conditions: string | string[]) => {
  const lower = normalizeText(conditions).toLowerCase();
  if (lower.includes("remote")) return "Remote";
  if (lower.includes("hybrid")) return "Hybrid";
  if (lower.includes("on-site") || lower.includes("onsite")) return "On-site";
  if (lower.includes("in person") || lower.includes("in-person")) {
    return "On-site";
  }
  return "On-site";
};

const buildCommitment = (conditions: string | string[]) => {
  const text = normalizeText(conditions).trim();
  return text ? text : "";
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
};

type TimesheetStatus = "Pending" | "Approved" | "Declined";

type TimesheetEntry = {
  id: string;
  name: string;
  role: string;
  date: string;
  start: string;
  end: string;
  total: string;
  status: TimesheetStatus;
  submittedAt?: string;
  totalSeconds?: number;
  regularSeconds?: number;
  overtimeSeconds?: number;
  overtimeNote?: string;
};

type ArchivedTimesheetEntry = TimesheetEntry & {
  archivedAt: string;
};

const timeEntries: TimesheetEntry[] = [
  {
    id: "time-1",
    name: "Elisa M.",
    role: "Community kitchen",
    date: "Today",
    start: "09:10",
    end: "12:45",
    total: "3h 35m",
    status: "Pending",
  },
  {
    id: "time-2",
    name: "Samuel R.",
    role: "Logistics",
    date: "Yesterday",
    start: "08:40",
    end: "12:50",
    total: "4h 10m",
    status: "Approved",
  },
  {
    id: "time-3",
    name: "Grace N.",
    role: "Kids program",
    date: "Yesterday",
    start: "14:05",
    end: "17:40",
    total: "3h 35m",
    status: "Approved",
  },
];

const submittedShifts: TimesheetEntry[] = [
  {
    id: "hub-1",
    name: "Nora B.",
    role: "Community kitchen",
    date: "Today",
    start: "09:00",
    end: "12:20",
    total: "3h 20m",
    status: "Pending",
    submittedAt: "6m ago",
  },
  {
    id: "hub-2",
    name: "Victor S.",
    role: "Logistics runner",
    date: "Today",
    start: "10:15",
    end: "13:00",
    total: "2h 45m",
    status: "Pending",
    submittedAt: "22m ago",
  },
  {
    id: "hub-3",
    name: "Priya K.",
    role: "Kids program",
    date: "Yesterday",
    start: "14:05",
    end: "17:10",
    total: "3h 05m",
    status: "Pending",
    submittedAt: "1d ago",
  },
];

type VolunteerProfile = {
  name: string;
  role: string;
  location: string;
  availability: string;
  birth_date: string;
  email: string;
  phone: string;
  status: VolunteerStatus;
  skills: string[];
  bio: string;
};

const volunteerDirectory: VolunteerProfile[] = [
  {
    name: "Maya L.",
    role: "Logistics",
    location: "Accra",
    availability: "Tue, Thu 09:00-13:00",
    birth_date: "1998-04-11",
    email: "maya.l@cfoc.org",
    phone: "+233 55 214 0922",
    status: "Active",
    skills: ["Routing", "Inventory", "Team support"],
    bio: "Logistics volunteer focused on inventory and delivery support.",
  },
  {
    name: "Jonas P.",
    role: "Kids program",
    location: "Lusaka",
    availability: "Wed 14:00-18:00",
    birth_date: "2011-09-23",
    email: "jonas.p@cfoc.org",
    phone: "+260 97 441 2281",
    status: "Active",
    skills: ["Youth mentoring", "Activity planning", "Storytelling"],
    bio: "Supporting after-school programs and youth development.",
  },
  {
    name: "Nora B.",
    role: "Community kitchen",
    location: "Accra",
    availability: "Mon, Wed 09:00-13:00",
    birth_date: "1992-01-15",
    email: "nora.b@cfoc.org",
    phone: "+233 55 319 4412",
    status: "Active",
    skills: ["Food prep", "Packing", "Team support"],
    bio: "Focused on kitchen prep and distribution support.",
  },
  {
    name: "Victor S.",
    role: "Logistics runner",
    location: "Nairobi",
    availability: "Tue, Thu 10:00-14:00",
    birth_date: "1990-06-10",
    email: "victor.s@cfoc.org",
    phone: "+254 701 114 902",
    status: "Active",
    skills: ["Routing", "Stock handling", "Dispatch"],
    bio: "Logistics volunteer with strong delivery experience.",
  },
  {
    name: "Priya K.",
    role: "Kids program",
    location: "Lusaka",
    availability: "Mon, Wed 14:00-17:00",
    birth_date: "2001-03-02",
    email: "priya.k@cfoc.org",
    phone: "+260 97 338 2211",
    status: "Active",
    skills: ["Mentoring", "Activity planning", "Youth support"],
    bio: "Passionate about after-school programs and youth engagement.",
  },
  {
    name: "Elisa M.",
    role: "Community kitchen",
    location: "Accra",
    availability: "Mon, Fri 08:30-12:30",
    birth_date: "1996-11-09",
    email: "elisa.m@cfoc.org",
    phone: "+233 50 118 4412",
    status: "Active",
    skills: ["Food safety", "Packing", "Coordination"],
    bio: "Experienced in kitchen operations and volunteer coordination.",
  },
  {
    name: "Samuel R.",
    role: "Logistics",
    location: "Nairobi",
    availability: "Tue, Thu 08:00-12:00",
    birth_date: "1987-08-28",
    email: "samuel.r@cfoc.org",
    phone: "+254 711 882 7710",
    status: "Active",
    skills: ["Inventory", "Route planning", "Team support"],
    bio: "Supports logistics planning and field distribution.",
  },
  {
    name: "Grace N.",
    role: "Kids program",
    location: "Lusaka",
    availability: "Wed 14:00-18:00",
    birth_date: "2009-05-19",
    email: "grace.n@cfoc.org",
    phone: "+260 96 221 907",
    status: "Active",
    skills: ["Tutoring", "Safety protocols", "Engagement"],
    bio: "Focused on child safety and program facilitation.",
  },
];

const volunteerMessageThreads = [
  {
    id: "maya",
    name: "Maya L.",
    role: "Logistics volunteer",
    preview: "Confirming my shift for Thursday.",
    time: "14m ago",
    unread: 1,
    status: "online" as const,
    important: true,
    avatar:
      "https://images.unsplash.com/photo-1603415526960-f7e0328b1a2c?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Accra Kitchen Team",
    role: "Organization",
    preview: "We need 2 more volunteers for Saturday.",
    time: "2h ago",
    unread: 0,
    id: "accra-kitchen",
    status: "busy" as const,
    important: false,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "jonas",
    name: "Jonas P.",
    role: "Kids program (Youth)",
    preview: "Submitted my profile details.",
    time: "5h ago",
    unread: 0,
    status: "offline" as const,
    important: false,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "nora",
    name: "Nora B.",
    role: "Community kitchen volunteer",
    preview: "Is my last timesheet approved?",
    time: "Yesterday",
    unread: 2,
    status: "online" as const,
    important: true,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
];

const volunteerMessagesByThread: Record<
  string,
  { id: string; from: "me" | "them"; text: string; time: string }[]
> = {
  maya: [
    {
      id: "m1",
      from: "them",
      text: "Confirming my shift for Thursday. Still okay?",
      time: "14m ago",
    },
    {
      id: "m2",
      from: "me",
      text: "Yes, confirmed. See you at 09:00.",
      time: "12m ago",
    },
  ],
  "accra-kitchen": [
    {
      id: "a1",
      from: "them",
      text: "We need 2 more volunteers for Saturday.",
      time: "2h ago",
    },
    {
      id: "a2",
      from: "me",
      text: "Got it. I will reach out to the active volunteers today.",
      time: "2h ago",
    },
  ],
  jonas: [
    {
      id: "j1",
      from: "them",
      text: "Submitted my profile details.",
      time: "5h ago",
    },
    {
      id: "j2",
      from: "me",
      text: "Thanks Jonas. We will review and get back to you shortly.",
      time: "5h ago",
    },
  ],
  nora: [
    {
      id: "n1",
      from: "them",
      text: "Is my last timesheet approved?",
      time: "Yesterday",
    },
    {
      id: "n2",
      from: "me",
      text: "Pending review. I will approve it today if everything matches.",
      time: "Yesterday",
    },
  ],
};

const inboxStatusDot = {
  online: "bg-emerald-400",
  busy: "bg-yellow-400",
  offline: "bg-white/30",
};

const sessionPlatformOptions = [
  "Zoom",
  "Google Meet",
  "Microsoft Teams",
  "Webex",
  "Discord",
  "Skype",
  "WhatsApp",
  "Slack Huddle",
  "Jitsi Meet",
] as const;

type SessionPlatform = (typeof sessionPlatformOptions)[number];
type OrientationSessionMode = "Online" | "In-person";

type OrientationSession = {
  id: string;
  title: string;
  date: string;
  time: string;
  host: string;
  mode: OrientationSessionMode;
  platform?: SessionPlatform;
  link?: string;
  location?: string;
  capacity: number;
  registeredAttendeeIds: string[];
  invitedAttendeeIds: string[];
};

type OrientationSessionDraft = {
  title: string;
  date: string;
  time: string;
  host: string;
  mode: OrientationSessionMode;
  platform: SessionPlatform | "";
  link: string;
  location: string;
  capacity: string;
};

const initialOrientationSessions: OrientationSession[] = [
  {
    id: "session-1",
    title: "Onboarding Q&A",
    date: "2026-02-12",
    time: "16:00",
    host: "CFOC Team",
    mode: "Online",
    platform: "Zoom",
    link: "https://zoom.us/j/0000000000",
    capacity: 30,
    registeredAttendeeIds: ["vol-1", "vol-3"],
    invitedAttendeeIds: [],
  },
  {
    id: "session-2",
    title: "Safety briefing",
    date: "2026-02-09",
    time: "10:00",
    host: "Field Ops",
    mode: "In-person",
    location: "CFOC Office • 123 Main St",
    capacity: 20,
    registeredAttendeeIds: ["vol-2"],
    invitedAttendeeIds: [],
  },
];

const statusTone: Record<string, string> = {
  Pending: "bg-amber-500/20 text-amber-200",
  Approved: "bg-emerald-500/20 text-emerald-200",
  Declined: "bg-rose-500/20 text-rose-200",
};

const volunteerStatusTone: Record<VolunteerStatus, string> = {
  Active: "bg-emerald-500/20 text-emerald-200",
  Inactive: "bg-white/10 text-white/60",
};

type VolunteerTabId = (typeof VOLUNTEER_MANAGER_TABS)[number]["id"];

export default function VolunteerManagerPage() {
  const [activeTab, setActiveTab] = useState<VolunteerTabId>("dashboard");
  const [newMessages, setNewMessages] = useState(2);
  const [activeInboxThreadId, setActiveInboxThreadId] = useState<string | null>(
    volunteerMessageThreads[0]?.id ?? null
  );
  const [inboxQuery, setInboxQuery] = useState("");
  const [inboxDraft, setInboxDraft] = useState("");
  const [roleList, setRoleList] = useState<Role[]>(initialRoles);
  const [archivedRoles, setArchivedRoles] =
    useState<ArchivedRole[]>(initialArchivedRoles);
  const [showArchivedRoles, setShowArchivedRoles] = useState(false);
  const [volunteerProfiles, setVolunteerProfiles] = useState(
    initialVolunteerProfiles
  );
  const [archivedVolunteers, setArchivedVolunteers] = useState(
    initialArchivedVolunteers
  );
  const [demoVolunteerDirectory, setDemoVolunteerDirectory] = useState<
    Record<string, DemoVolunteerDirectoryEntry>
  >({});
  const [sampleCalendars, setSampleCalendars] = useState<SampleCalendar[]>([]);
  const [sampleCalendarsHydrated, setSampleCalendarsHydrated] = useState(false);
  const [shiftPlanner, setShiftPlanner] = useState<ShiftPlannerState>(() =>
    createDefaultShiftPlannerState()
  );
  const [shiftPlannerHydrated, setShiftPlannerHydrated] = useState(false);
  const [shiftPlannerWeekStart, setShiftPlannerWeekStart] = useState(() =>
    getWeekStartISODate(new Date())
  );
  const [calendarDepartmentId, setCalendarDepartmentId] = useState<string | null>(
    null
  );
  const [shiftPlannerAddDay, setShiftPlannerAddDay] = useState<ScheduleDayId | null>(
    null
  );
  const [shiftPlannerAddStart, setShiftPlannerAddStart] = useState("09:00");
  const [shiftPlannerAddEnd, setShiftPlannerAddEnd] = useState("13:00");
  const [shiftPlannerError, setShiftPlannerError] = useState<string | null>(null);
  const [shiftPlannerPreviewOpen, setShiftPlannerPreviewOpen] = useState(false);
  const [shiftPlannerPreviewMode, setShiftPlannerPreviewMode] = useState<
    "weeks" | "month"
  >("weeks");
  const [shiftPlannerPreviewWeeks, setShiftPlannerPreviewWeeks] = useState(2);
  const [shiftPlannerAssignSlot, setShiftPlannerAssignSlot] = useState<{
    shiftId: string;
    slotIndex: number;
  } | null>(null);
  const [shiftPlannerVolunteerQuery, setShiftPlannerVolunteerQuery] = useState("");
  const [shiftPlannerConfirmation, setShiftPlannerConfirmation] =
    useState<ShiftPlannerConfirmationState | null>(null);
  const [shiftPlannerConfirmFeedback, setShiftPlannerConfirmFeedback] = useState<{
    tone: "success" | "info" | "error";
    text: string;
  } | null>(null);
  const [sampleCalendarModal, setSampleCalendarModal] = useState<{
    mode: "add" | "edit" | null;
    calendarId?: string;
    presetRoleId?: string;
  }>({ mode: null });
  const [sampleCalendarDraft, setSampleCalendarDraft] = useState<SampleCalendar>({
    id: "",
    title: "",
    roleIds: [],
    slots: [],
    shifts: [],
    updatedAt: "",
  });
  const [sampleShiftDay, setSampleShiftDay] = useState<ScheduleDayId>("mon");
  const [sampleShiftStart, setSampleShiftStart] = useState("09:00");
  const [sampleShiftEnd, setSampleShiftEnd] = useState("13:00");
  const [sampleCalendarError, setSampleCalendarError] = useState<string | null>(
    null
  );
  const [roleModal, setRoleModal] = useState<{
    mode: "add" | "edit" | null;
    roleId?: string;
  }>({ mode: null });
  const [roleDraft, setRoleDraft] = useState<RoleDraft>({
    title: "",
    department: "",
    schedule: "",
    location: "",
    address: "",
    targets: { volunteer: true, student: false, adults: true, youth: false },
    summary: "",
    keywords: [],
    commitmentLength: "",
    conditions: [],
  });
  const [roleError, setRoleError] = useState<string | null>(null);
  const [applicantsRoleId, setApplicantsRoleId] = useState<string | null>(null);
  const [teamRoleId, setTeamRoleId] = useState<string | null>(null);
  const [jobFilter, setJobFilter] = useState("All jobs");
  const [audienceFilter, setAudienceFilter] =
    useState<VolunteerAudienceFilter>("everyone");
  const [showArchivedVolunteers, setShowArchivedVolunteers] = useState(false);
  const [roleScheduleDays, setRoleScheduleDays] = useState<ScheduleDayId[]>([]);
  const [roleScheduleTime, setRoleScheduleTime] = useState("");
  const [roleConditionDraft, setRoleConditionDraft] = useState("");
  const [roleKeywordDraft, setRoleKeywordDraft] = useState("");
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [applicantsByRole, setApplicantsByRole] =
    useState<Record<string, RoleApplicant[]>>(initialRoleApplicants);
  const [selectedApplicant, setSelectedApplicant] =
    useState<RoleApplicant | null>(null);
  const [selectedApplicantRoleId, setSelectedApplicantRoleId] =
    useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [timesheetProfile, setTimesheetProfile] =
    useState<VolunteerProfile | null>(null);
  const [timesheetMessageTarget, setTimesheetMessageTarget] =
    useState<VolunteerProfile | null>(null);
  const [timesheetMessageDraft, setTimesheetMessageDraft] = useState("");
  const [isTimesheetMessageSent, setIsTimesheetMessageSent] = useState(false);
  const [timesheetSearch, setTimesheetSearch] = useState("");
  const [pendingSubmittedShifts, setPendingSubmittedShifts] =
    useState<TimesheetEntry[]>(submittedShifts);
  const [pendingTimeEntries, setPendingTimeEntries] = useState<TimesheetEntry[]>(
    () => timeEntries.filter((entry) => entry.status === "Pending")
  );
  const [archivedTimesheets, setArchivedTimesheets] =
    useState<ArchivedTimesheetEntry[]>(() =>
      timeEntries
        .filter((entry) => entry.status !== "Pending")
        .map((entry) => ({ ...entry, archivedAt: entry.date }))
    );
  const [showArchivedTimesheets, setShowArchivedTimesheets] = useState(false);
  const [orientationSessions, setOrientationSessions] = useState<
    OrientationSession[]
  >(initialOrientationSessions);
  const [sessionModal, setSessionModal] = useState<{
    mode: "add" | "edit" | null;
    sessionId?: string;
  }>({ mode: null });
  const [sessionDraft, setSessionDraft] = useState<OrientationSessionDraft>({
    title: "",
    date: "",
    time: "",
    host: "",
    mode: "Online",
    platform: "Zoom",
    link: "",
    location: "",
    capacity: "20",
  });
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [inviteSessionId, setInviteSessionId] = useState<string | null>(null);
  const [inviteMode, setInviteMode] = useState<"individual" | "groups">(
    "individual"
  );
  const [inviteQuery, setInviteQuery] = useState("");
  const [selectedInviteeIds, setSelectedInviteeIds] = useState<string[]>([]);
  const [inviteRoleId, setInviteRoleId] = useState<string>("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const refreshDirectory = () => {
      setDemoVolunteerDirectory(readDemoVolunteerDirectoryFromStorage());
    };

    refreshDirectory();

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== DEMO_VOLUNTEER_DIRECTORY_KEY) return;
      refreshDirectory();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSampleCalendars(readSampleCalendarsFromStorage());
    setSampleCalendarsHydrated(true);
  }, []);

  useEffect(() => {
    if (!sampleCalendarsHydrated) return;
    writeSampleCalendarsToStorage(sampleCalendars);
  }, [sampleCalendars, sampleCalendarsHydrated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShiftPlanner(readShiftPlannerFromStorage());
    setShiftPlannerHydrated(true);
    setShiftPlannerConfirmation(readShiftPlannerConfirmationFromStorage());
  }, []);

  useEffect(() => {
    if (!shiftPlannerHydrated) return;
    writeShiftPlannerToStorage(shiftPlanner);
  }, [shiftPlanner, shiftPlannerHydrated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const refreshPlanner = () => setShiftPlanner(readShiftPlannerFromStorage());
    const refreshPlannerConfirmation = () =>
      setShiftPlannerConfirmation(readShiftPlannerConfirmationFromStorage());
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === SHIFT_PLANNER_STORAGE_KEY) {
        refreshPlanner();
      }
      if (!event.key || event.key === SHIFT_PLANNER_CONFIRMATION_STORAGE_KEY) {
        refreshPlannerConfirmation();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (shiftPlanner.scope !== "job") return;
    if (shiftPlanner.selectedRoleId && roleList.some((role) => role.id === shiftPlanner.selectedRoleId)) {
      return;
    }
    const fallbackRoleId = roleList[0]?.id ?? null;
    if (fallbackRoleId === shiftPlanner.selectedRoleId) return;
    setShiftPlanner((prev) => ({
      ...prev,
      selectedRoleId: fallbackRoleId,
      updatedAt: new Date().toISOString(),
    }));
  }, [shiftPlanner.scope, shiftPlanner.selectedRoleId, roleList]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedRaw = window.localStorage.getItem(
        SUBMITTED_TIMESHEETS_STORAGE_KEY
      );
      if (!storedRaw) return;
      const parsed = JSON.parse(storedRaw) as unknown;
      if (!Array.isArray(parsed)) return;

      const storedEntries = parsed.filter((value): value is TimesheetEntry => {
        if (typeof value !== "object" || value === null) return false;
        const record = value as Record<string, unknown>;
        if (typeof record.id !== "string") return false;
        if (typeof record.name !== "string") return false;
        if (typeof record.role !== "string") return false;
        if (typeof record.date !== "string") return false;
        if (typeof record.start !== "string") return false;
        if (typeof record.end !== "string") return false;
        if (typeof record.total !== "string") return false;
        if (
          record.status !== "Pending" &&
          record.status !== "Approved" &&
          record.status !== "Declined"
        ) {
          return false;
        }
        return true;
      });

      const pendingEntries = storedEntries.filter(
        (entry) => entry.status === "Pending"
      );
      if (pendingEntries.length === 0) return;

      setPendingSubmittedShifts((prev) => {
        const existingIds = new Set(prev.map((entry) => entry.id));
        const nextEntries = [
          ...pendingEntries.filter((entry) => !existingIds.has(entry.id)),
          ...prev,
        ];
        return nextEntries;
      });
    } catch (error) {
      console.error("Failed to load stored timesheets", error);
    }
  }, []);

  const handleTabChange = (tabId: VolunteerTabId) => {
    setActiveTab(tabId);
    if (tabId === "messages") {
      setNewMessages(0);
    }
  };

  const filteredInboxThreads = useMemo(() => {
    const lowered = inboxQuery.trim().toLowerCase();
    if (!lowered) return volunteerMessageThreads;
    return volunteerMessageThreads.filter((thread) =>
      thread.name.toLowerCase().includes(lowered)
    );
  }, [inboxQuery]);

  useEffect(() => {
    if (filteredInboxThreads.length === 0) {
      setActiveInboxThreadId(null);
      return;
    }
    if (!filteredInboxThreads.some((thread) => thread.id === activeInboxThreadId)) {
      setActiveInboxThreadId(filteredInboxThreads[0]?.id ?? null);
    }
  }, [filteredInboxThreads, activeInboxThreadId]);

  const activeInboxThread =
    filteredInboxThreads.find((thread) => thread.id === activeInboxThreadId) ||
    null;
  const activeInboxMessages = activeInboxThreadId
    ? volunteerMessagesByThread[activeInboxThreadId] ?? []
    : [];

  const handleSendInboxMessage = () => {
    if (!inboxDraft.trim()) return;
    setInboxDraft("");
  };

  const parseSchedule = (schedule: string) => {
    const match = schedule.match(
      /(\d{2}:\d{2}-\d{2}:\d{2}|Flexible)$/
    );
    const time = match ? match[1] : "";
    const dayPart = match ? schedule.replace(match[1], "").trim() : schedule;
    const dayLabels = dayPart
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const dayIds = scheduleDayOptions
      .filter((day) => dayLabels.includes(day.label))
      .map((day) => day.id);
    return { days: dayIds, time };
  };

  const buildScheduleLabel = (
    days: ScheduleDayId[],
    time: string
  ): string => {
    if (days.length === 0) return "";
    const labels = scheduleDayOptions
      .filter((day) => days.includes(day.id))
      .map((day) => day.label);
    return time ? `${labels.join(", ")} ${time}` : labels.join(", ");
  };

  const addRoleCondition = () => {
    const trimmed = roleConditionDraft.trim();
    if (!trimmed) return;
    setRoleDraft((prev) => {
      const normalized = trimmed.toLowerCase();
      const exists = prev.conditions.some(
        (condition) => condition.toLowerCase() === normalized
      );
      if (exists) return prev;
      return { ...prev, conditions: [...prev.conditions, trimmed] };
    });
    setRoleConditionDraft("");
  };

  const removeRoleCondition = (conditionIndex: number) => {
    setRoleDraft((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, index) => index !== conditionIndex),
    }));
  };

  const addRoleKeyword = () => {
    const trimmed = roleKeywordDraft.trim();
    if (!trimmed) return;
    setRoleDraft((prev) => {
      const normalized = trimmed.toLowerCase();
      const exists = prev.keywords.some((keyword) => keyword.toLowerCase() === normalized);
      if (exists) return prev;
      return { ...prev, keywords: [...prev.keywords, trimmed] };
    });
    setRoleKeywordDraft("");
  };

  const removeRoleKeyword = (keywordIndex: number) => {
    setRoleDraft((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, index) => index !== keywordIndex),
    }));
  };

  const openAddRole = () => {
    setRoleDraft({
      title: "",
      department: "",
      schedule: "",
      location: "",
      address: "",
      targets: { volunteer: true, student: false, adults: true, youth: false },
      summary: "",
      keywords: [],
      commitmentLength: "",
      conditions: [],
    });
    setRoleScheduleDays([]);
    setRoleScheduleTime("");
    setRoleConditionDraft("");
    setRoleKeywordDraft("");
    setRoleError(null);
    setRoleModal({ mode: "add" });
  };

  const openEditRole = (role: Role) => {
    const parsed = parseSchedule(role.schedule);
    setRoleDraft({
      title: role.title,
      department: role.department ?? "",
      schedule: role.schedule,
      location: role.location,
      address: role.address ?? "",
      targets: role.targets,
      summary: role.summary,
      keywords: role.keywords,
      commitmentLength: role.commitmentLength,
      conditions: role.conditions,
    });
    setRoleScheduleDays(parsed.days);
    setRoleScheduleTime(parsed.time);
    setRoleConditionDraft("");
    setRoleKeywordDraft("");
    setRoleError(null);
    setRoleModal({ mode: "edit", roleId: role.id });
  };

  const closeRoleModal = () => {
    setRoleModal({ mode: null });
    setRoleError(null);
    setRoleConditionDraft("");
    setRoleKeywordDraft("");
  };

  const publishRole = (role: Role) => {
    if (typeof window === "undefined") return;
    const publishedJob: PublishedJob = {
      id: role.id,
      title: role.title,
      type: inferJobType(role.conditions),
      schedule: role.schedule,
      location: role.location,
      commitment: buildCommitment(role.commitmentLength),
    };

    try {
      const storedRaw = window.localStorage.getItem(
        PUBLISHED_JOBS_STORAGE_KEY
      );
      const storedJobs = storedRaw
        ? (JSON.parse(storedRaw) as PublishedJob[])
        : [];
      const nextJobs = [
        publishedJob,
        ...storedJobs.filter((job) => job.id !== role.id),
      ];
      window.localStorage.setItem(
        PUBLISHED_JOBS_STORAGE_KEY,
        JSON.stringify(nextJobs)
      );
    } catch (error) {
      console.error("Failed to publish job", error);
    }
  };

  const handleRoleSave = (intent: "draft" | "publish") => {
    const scheduleLabel = buildScheduleLabel(
      roleScheduleDays,
      roleScheduleTime
    );
    const departmentLabel = roleDraft.department.trim() || "General";
    if (!roleDraft.title.trim()) {
      setRoleError("Role title is required.");
      return;
    }
    if (!scheduleLabel) {
      setRoleError("Select at least one day and time.");
      return;
    }
    if (
      !roleDraft.targets.volunteer &&
      !roleDraft.targets.student &&
      !roleDraft.targets.adults &&
      !roleDraft.targets.youth
    ) {
      setRoleError("Select at least one target profile.");
      return;
    }
    let roleToSave: Role | null = null;
    if (roleModal.mode === "add") {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        ...roleDraft,
        department: departmentLabel,
        schedule: scheduleLabel,
      };
      setRoleList((prev) => [newRole, ...prev]);
      roleToSave = newRole;
    }
    if (roleModal.mode === "edit" && roleModal.roleId) {
      const updatedRole: Role = {
        id: roleModal.roleId,
        ...roleDraft,
        department: departmentLabel,
        schedule: scheduleLabel,
      };
      setRoleList((prev) =>
        prev.map((role) =>
          role.id === roleModal.roleId
            ? updatedRole
            : role
        )
      );
      roleToSave = updatedRole;
    }
    if (roleToSave && intent === "publish") {
      publishRole(roleToSave);
    }
    setRoleModal({ mode: null });
    setRoleError(null);
  };

  const parseClockMinutes = (value: string): number | null => {
    const normalized = value.trim();
    const match = normalized.match(/^(\d{2}):(\d{2})$/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    if (hours < 0 || hours > 23) return null;
    if (minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  };

  const closeSampleCalendarModal = () => {
    setSampleCalendarModal({ mode: null });
    setSampleCalendarError(null);
  };

  const toggleSampleCalendarRole = (roleId: string) => {
    setSampleCalendarDraft((prev) => {
      const isSelected = prev.roleIds.includes(roleId);
      return {
        ...prev,
        roleIds: isSelected
          ? prev.roleIds.filter((id) => id !== roleId)
          : [...prev.roleIds, roleId],
      };
    });
  };

  const addSampleCalendarSlot = () => {
    setSampleCalendarDraft((prev) => {
      if (prev.slots.length >= 5) return prev;
      const nextIndex = prev.slots.length + 1;
      const slotId = `slot-${Date.now()}-${nextIndex}`;
      return {
        ...prev,
        slots: [...prev.slots, { id: slotId, label: `Volunteer ${nextIndex}` }],
      };
    });
  };

  const removeSampleCalendarSlot = (slotId: string) => {
    setSampleCalendarDraft((prev) => ({
      ...prev,
      slots: prev.slots.filter((slot) => slot.id !== slotId),
      shifts: prev.shifts.map((shift) => ({
        ...shift,
        assignedSlotIds: shift.assignedSlotIds.filter((id) => id !== slotId),
      })),
    }));
  };

  const updateSampleCalendarSlotLabel = (slotId: string, label: string) => {
    setSampleCalendarDraft((prev) => ({
      ...prev,
      slots: prev.slots.map((slot) =>
        slot.id === slotId ? { ...slot, label } : slot
      ),
    }));
  };

  const addSampleCalendarShift = () => {
    const startMinutes = parseClockMinutes(sampleShiftStart);
    const endMinutes = parseClockMinutes(sampleShiftEnd);
    if (startMinutes === null || endMinutes === null) {
      setSampleCalendarError("Enter a valid start and end time.");
      return;
    }
    if (endMinutes <= startMinutes) {
      setSampleCalendarError("End time must be after start time.");
      return;
    }

    setSampleCalendarDraft((prev) => {
      const shiftsForDay = prev.shifts.filter((shift) => shift.day === sampleShiftDay);
      if (shiftsForDay.length >= 3) {
        setSampleCalendarError("Max 3 shifts per day.");
        return prev;
      }
      setSampleCalendarError(null);
      const id = `shift-${Date.now()}`;
      const nextShift: SampleCalendarShift = {
        id,
        day: sampleShiftDay,
        start: sampleShiftStart,
        end: sampleShiftEnd,
        assignedSlotIds: [],
      };
      return { ...prev, shifts: [...prev.shifts, nextShift] };
    });
  };

  const removeSampleCalendarShift = (shiftId: string) => {
    setSampleCalendarDraft((prev) => ({
      ...prev,
      shifts: prev.shifts.filter((shift) => shift.id !== shiftId),
    }));
  };

  const toggleSampleCalendarAssignment = (shiftId: string, slotId: string) => {
    setSampleCalendarDraft((prev) => ({
      ...prev,
      shifts: prev.shifts.map((shift) => {
        if (shift.id !== shiftId) return shift;
        const isAssigned = shift.assignedSlotIds.includes(slotId);
        return {
          ...shift,
          assignedSlotIds: isAssigned
            ? shift.assignedSlotIds.filter((id) => id !== slotId)
            : [...shift.assignedSlotIds, slotId],
        };
      }),
    }));
  };

  const saveSampleCalendar = () => {
    const title = sampleCalendarDraft.title.trim();
    if (!title) {
      setSampleCalendarError("Title is required.");
      return;
    }
    if (sampleCalendarDraft.roleIds.length === 0) {
      setSampleCalendarError("Link at least one job.");
      return;
    }
    if (sampleCalendarDraft.slots.length === 0) {
      setSampleCalendarError("Add at least one volunteer slot.");
      return;
    }
    if (sampleCalendarDraft.shifts.length === 0) {
      setSampleCalendarError("Add at least one shift.");
      return;
    }

    const slotIds = new Set(sampleCalendarDraft.slots.map((slot) => slot.id));
    const normalized: SampleCalendar = {
      ...sampleCalendarDraft,
      title,
      roleIds: Array.from(new Set(sampleCalendarDraft.roleIds)),
      shifts: sampleCalendarDraft.shifts
        .map((shift) => ({
          ...shift,
          assignedSlotIds: shift.assignedSlotIds.filter((id) => slotIds.has(id)),
        }))
        .sort((a, b) => {
          const dayIndex =
            scheduleDayOptions.findIndex((day) => day.id === a.day) -
            scheduleDayOptions.findIndex((day) => day.id === b.day);
          if (dayIndex !== 0) return dayIndex;
          const aTime = parseClockMinutes(a.start) ?? 0;
          const bTime = parseClockMinutes(b.start) ?? 0;
          return aTime - bTime;
        }),
      updatedAt: new Date().toISOString(),
    };

    setSampleCalendars((prev) => {
      const exists = prev.some((calendar) => calendar.id === normalized.id);
      if (exists) {
        return prev.map((calendar) =>
          calendar.id === normalized.id ? normalized : calendar
        );
      }
      return [normalized, ...prev];
    });
    setSampleCalendarModal({ mode: null });
    setSampleCalendarError(null);
  };

  const closeApplicantsModal = () => {
    setApplicantsRoleId(null);
  };

  const openTeamModal = (roleId: string) => {
    setTeamRoleId(roleId);
  };

  const closeTeamModal = () => {
    setTeamRoleId(null);
  };

  const closeApplicantProfile = () => {
    setSelectedApplicant(null);
    setSelectedApplicantRoleId(null);
    setMessageDraft("");
    setIsMessageSent(false);
  };

  const openDeleteRole = (role: Role) => {
    setRoleToDelete(role);
  };

  const closeDeleteRole = () => {
    setRoleToDelete(null);
  };

  const confirmDeleteRole = () => {
    if (!roleToDelete) return;
    const role = roleToDelete;
    setRoleList((prev) => prev.filter((item) => item.id !== role.id));
    setArchivedRoles((prev) => [
      { ...role, archivedAt: "Recently" },
      ...prev,
    ]);
    if (typeof window !== "undefined") {
      try {
        const storedRaw = window.localStorage.getItem(
          PUBLISHED_JOBS_STORAGE_KEY
        );
        if (storedRaw) {
          const storedJobs = JSON.parse(storedRaw) as PublishedJob[];
          const nextJobs = storedJobs.filter((job) => job.id !== role.id);
          window.localStorage.setItem(
            PUBLISHED_JOBS_STORAGE_KEY,
            JSON.stringify(nextJobs)
          );
        }
      } catch (error) {
        console.error("Failed to unpublish archived role", error);
      }
    }
    setRoleToDelete(null);
  };

  const handleUnarchiveRole = (role: ArchivedRole) => {
    setArchivedRoles((prev) => prev.filter((item) => item.id !== role.id));
    setRoleList((prev) => [
      {
        id: role.id,
        title: role.title,
        department: role.department,
        schedule: role.schedule,
        location: role.location,
        address: role.address,
        targets: role.targets,
        summary: role.summary,
        keywords: role.keywords,
        commitmentLength: role.commitmentLength,
        conditions: role.conditions,
      },
      ...prev,
    ]);
  };

  const updateApplicantStatus = (
    roleId: string,
    applicantId: string,
    status: ApplicantStatus
  ) => {
    setApplicantsByRole((prev) => ({
      ...prev,
      [roleId]: (prev[roleId] ?? []).map((applicant) =>
        applicant.id === applicantId ? { ...applicant, status } : applicant
      ),
    }));
    setSelectedApplicant((prev) =>
      prev && prev.id === applicantId ? { ...prev, status } : prev
    );
  };

  const handleApproveApplicant = (roleId: string, applicantId: string) => {
    updateApplicantStatus(roleId, applicantId, "Approved");
  };

  const handleDeclineApplicant = (roleId: string, applicantId: string) => {
    updateApplicantStatus(roleId, applicantId, "Declined");
  };

  const handleSendMessage = () => {
    if (!messageDraft.trim()) return;
    setIsMessageSent(true);
    setMessageDraft("");
  };

  const resolveVolunteerProfile = (
    name: string,
    role: string
  ): VolunteerProfile => {
    return (
      volunteerDirectory.find((profile) => profile.name === name) ?? {
        name,
        role,
        location: "Unknown",
        availability: "Flexible",
        birth_date: "",
        email: "volunteer@cfoc.org",
        phone: "+000 000 0000",
        status: "Active",
        skills: ["Volunteer support"],
        bio: "Profile details are being completed.",
      }
    );
  };

  const resolveTargetAudience = (
    name: string,
    role: string,
    fallbackAudience: VolunteerAudience
  ): VolunteerAudience => {
    const profileDetails = resolveVolunteerProfile(name, role);
    const emailKey = normalizeEmailKey(profileDetails.email);
    const storedBirthDate = demoVolunteerDirectory[emailKey]?.birth_date;
    const derived = audienceFromBirthDate(
      storedBirthDate ?? profileDetails.birth_date
    );
    return derived ?? fallbackAudience;
  };

  const handleArchiveVolunteer = (profile: VolunteerListing) => {
    setVolunteerProfiles((prev) =>
      prev.filter((item) => item.id !== profile.id)
    );
    const profileDetails = resolveVolunteerProfile(profile.name, profile.role);
    setArchivedVolunteers((prev) => [
      {
        id: `arch-${Date.now()}`,
        name: profile.name,
        role: profile.role,
        audience: profile.audience,
        location: profileDetails.location,
        lastActive: "Recently",
        totalHours: profile.hoursWorked ?? "n/a",
      },
      ...prev,
    ]);
  };

  const handleUnarchiveVolunteer = (volunteer: ArchivedVolunteer) => {
    setArchivedVolunteers((prev) =>
      prev.filter((item) => item.id !== volunteer.id)
    );
    const profileDetails = resolveVolunteerProfile(
      volunteer.name,
      volunteer.role
    );
    setVolunteerProfiles((prev) => [
      {
        id: `vol-${Date.now()}`,
        name: volunteer.name,
        role: volunteer.role,
        availability: profileDetails.availability,
        audience: volunteer.audience,
        status: "Pending",
        completion: "80%",
        hoursWorked: volunteer.totalHours ?? "0h",
      },
      ...prev,
    ]);
  };

  const openTimesheetProfile = (name: string, role: string) => {
    setTimesheetProfile(resolveVolunteerProfile(name, role));
  };

  const closeTimesheetProfile = () => {
    setTimesheetProfile(null);
  };

  const openTimesheetMessage = (name: string, role: string) => {
    setTimesheetMessageTarget(resolveVolunteerProfile(name, role));
    setTimesheetMessageDraft("");
    setIsTimesheetMessageSent(false);
  };

  const closeTimesheetMessage = () => {
    setTimesheetMessageTarget(null);
    setTimesheetMessageDraft("");
    setIsTimesheetMessageSent(false);
  };

  const handleTimesheetMessageSend = () => {
    if (!timesheetMessageDraft.trim()) return;
    setIsTimesheetMessageSent(true);
    setTimesheetMessageDraft("");
  };

  const approveTimesheet = (
    entry: TimesheetEntry,
    source: "submitted" | "recent"
  ) => {
    const archivedEntry: ArchivedTimesheetEntry = {
      ...entry,
      status: "Approved",
      archivedAt: "Recently",
    };
    setArchivedTimesheets((prev) => [archivedEntry, ...prev]);
    if (source === "submitted") {
      setPendingSubmittedShifts((prev) =>
        prev.filter((item) => item.id !== entry.id)
      );
      if (typeof window !== "undefined") {
        try {
          const storedRaw = window.localStorage.getItem(
            SUBMITTED_TIMESHEETS_STORAGE_KEY
          );
          if (storedRaw) {
            const parsed = JSON.parse(storedRaw) as unknown;
            if (Array.isArray(parsed)) {
              const nextEntries = parsed.filter((value) => {
                if (typeof value !== "object" || value === null) return true;
                const record = value as Record<string, unknown>;
                return record.id !== entry.id;
              });
              window.localStorage.setItem(
                SUBMITTED_TIMESHEETS_STORAGE_KEY,
                JSON.stringify(nextEntries)
              );
            }
          }
        } catch (error) {
          console.error("Failed to update stored timesheets", error);
        }
      }
      return;
    }
    setPendingTimeEntries((prev) => prev.filter((item) => item.id !== entry.id));
  };

  const openAddSession = () => {
    setSessionDraft({
      title: "",
      date: "",
      time: "",
      host: "CFOC Team",
      mode: "Online",
      platform: "Zoom",
      link: "",
      location: "",
      capacity: "20",
    });
    setSessionError(null);
    setSessionModal({ mode: "add" });
  };

  const openEditSession = (session: OrientationSession) => {
    setSessionDraft({
      title: session.title,
      date: session.date,
      time: session.time,
      host: session.host,
      mode: session.mode,
      platform: session.platform ?? "Zoom",
      link: session.link ?? "",
      location: session.location ?? "",
      capacity: session.capacity.toString(),
    });
    setSessionError(null);
    setSessionModal({ mode: "edit", sessionId: session.id });
  };

  const closeSessionModal = () => {
    setSessionModal({ mode: null });
    setSessionError(null);
  };

  const saveSession = () => {
    const capacity = Number.parseInt(sessionDraft.capacity, 10);
    if (!sessionDraft.title.trim()) {
      setSessionError("Session title is required.");
      return;
    }
    if (!sessionDraft.date) {
      setSessionError("Date is required.");
      return;
    }
    if (!sessionDraft.time) {
      setSessionError("Time is required.");
      return;
    }
    if (!sessionDraft.host.trim()) {
      setSessionError("Host is required.");
      return;
    }
    if (!Number.isFinite(capacity) || capacity <= 0) {
      setSessionError("Capacity must be a positive number.");
      return;
    }
    if (sessionDraft.mode === "Online") {
      if (!sessionDraft.platform) {
        setSessionError("Select a platform.");
        return;
      }
      if (!sessionDraft.link.trim()) {
        setSessionError("Meeting link is required for online sessions.");
        return;
      }
    }
    if (sessionDraft.mode === "In-person") {
      if (!sessionDraft.location.trim()) {
        setSessionError("Location is required for in-person sessions.");
        return;
      }
    }

    const existingSession =
      sessionModal.mode === "edit" && sessionModal.sessionId
        ? orientationSessions.find((session) => session.id === sessionModal.sessionId) ??
          null
        : null;
    const onlinePlatform =
      sessionDraft.mode === "Online" && sessionDraft.platform
        ? sessionDraft.platform
        : undefined;
    const nextSession: OrientationSession = {
      id:
        sessionModal.mode === "edit" && sessionModal.sessionId
          ? sessionModal.sessionId
          : `session-${Date.now()}`,
      title: sessionDraft.title.trim(),
      date: sessionDraft.date,
      time: sessionDraft.time,
      host: sessionDraft.host.trim(),
      mode: sessionDraft.mode,
      platform: onlinePlatform,
      link: sessionDraft.mode === "Online" ? sessionDraft.link.trim() : undefined,
      location:
        sessionDraft.mode === "In-person" ? sessionDraft.location.trim() : undefined,
      capacity,
      registeredAttendeeIds: existingSession?.registeredAttendeeIds ?? [],
      invitedAttendeeIds: existingSession?.invitedAttendeeIds ?? [],
    };

    if (sessionModal.mode === "edit" && sessionModal.sessionId) {
      setOrientationSessions((prev) =>
        prev.map((session) =>
          session.id === sessionModal.sessionId ? nextSession : session
        )
      );
    } else {
      setOrientationSessions((prev) => [nextSession, ...prev]);
    }
    closeSessionModal();
  };

  const openInviteModal = (sessionId: string) => {
    setInviteSessionId(sessionId);
    setInviteMode("individual");
    setInviteQuery("");
    setSelectedInviteeIds([]);
    setInviteRoleId("");
    setInviteError(null);
    setInviteSuccess(false);
  };

  const closeInviteModal = () => {
    setInviteSessionId(null);
    setInviteQuery("");
    setSelectedInviteeIds([]);
    setInviteRoleId("");
    setInviteError(null);
    setInviteSuccess(false);
  };

  const sendInvites = (attendeeIds: string[]) => {
    if (!inviteSessionId) return;
    const cleaned = attendeeIds.map((id) => id.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      setInviteError("Select at least one recipient.");
      return;
    }
    setOrientationSessions((prev) =>
      prev.map((session) => {
        if (session.id !== inviteSessionId) return session;
        const nextInvited = Array.from(
          new Set([...session.invitedAttendeeIds, ...cleaned])
        );
        return { ...session, invitedAttendeeIds: nextInvited };
      })
    );
    setInviteError(null);
    setInviteSuccess(true);
    setSelectedInviteeIds([]);
  };

  const teamRole = teamRoleId
    ? roleList.find((role) => role.id === teamRoleId)
    : null;
  const teamMembers = teamRoleId ? roleTeams[teamRoleId] ?? [] : [];
  const filteredPendingSubmittedShifts = useMemo(() => {
    const lowered = timesheetSearch.trim().toLowerCase();
    if (!lowered) return pendingSubmittedShifts;
    return pendingSubmittedShifts.filter((entry) =>
      entry.name.toLowerCase().includes(lowered)
    );
  }, [pendingSubmittedShifts, timesheetSearch]);

  const filteredPendingTimeEntries = useMemo(() => {
    const lowered = timesheetSearch.trim().toLowerCase();
    if (!lowered) return pendingTimeEntries;
    return pendingTimeEntries.filter((entry) =>
      entry.name.toLowerCase().includes(lowered)
    );
  }, [pendingTimeEntries, timesheetSearch]);

  const filteredArchivedTimesheets = useMemo(() => {
    const lowered = timesheetSearch.trim().toLowerCase();
    if (!lowered) return archivedTimesheets;
    return archivedTimesheets.filter((entry) =>
      entry.name.toLowerCase().includes(lowered)
    );
  }, [archivedTimesheets, timesheetSearch]);

  const filteredInviteVolunteers = useMemo(() => {
    const lowered = inviteQuery.trim().toLowerCase();
    if (!lowered) return volunteerProfiles;
    return volunteerProfiles.filter(
      (profile) =>
        profile.name.toLowerCase().includes(lowered) ||
        profile.role.toLowerCase().includes(lowered)
    );
  }, [inviteQuery, volunteerProfiles]);

  const departmentSuggestions = useMemo(() => {
    const map = new Map<string, string>();
    roleList.forEach((role) => {
      const label =
        typeof role.department === "string" ? role.department.trim() : "";
      if (!label) return;
      const key = label.toLowerCase();
      if (!map.has(key)) {
        map.set(key, label);
      }
    });
    if (!map.has("general")) {
      map.set("general", "General");
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [roleList]);

  const calendarDepartmentGroups = useMemo(() => {
    const normalizeDepartmentId = (value: string) => {
      const trimmed = value.trim();
      return trimmed ? trimmed.toLowerCase() : "general";
    };
    const departmentMap = new Map<
      string,
      { id: string; label: string; roles: Role[] }
    >();

    roleList.forEach((role) => {
      const label = role.department?.trim() || "General";
      const id = normalizeDepartmentId(label);
      const existing = departmentMap.get(id);
      if (existing) {
        existing.roles.push(role);
      } else {
        departmentMap.set(id, { id, label, roles: [role] });
      }
    });

    const groups = Array.from(departmentMap.values())
      .map((group) => {
        const roleIds = group.roles.map((role) => role.id);
        const roleIdSet = new Set(roleIds);
        const sampleCalendarsCount = sampleCalendars.filter((calendar) =>
          calendar.roleIds.some((roleId) => roleIdSet.has(roleId))
        ).length;
        return {
          ...group,
          roleIds,
          sampleCalendarsCount,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    const allRoleIds = roleList.map((role) => role.id);
    const allSampleCalendarsCount = sampleCalendars.length;

    return [
      {
        id: CALENDAR_ALL_DEPARTMENTS_ID,
        label: "All departments",
        roles: roleList,
        roleIds: allRoleIds,
        sampleCalendarsCount: allSampleCalendarsCount,
      },
      ...groups,
    ];
  }, [roleList, sampleCalendars]);

  const selectedCalendarDepartment = useMemo(() => {
    if (!calendarDepartmentId) return null;
    return (
      calendarDepartmentGroups.find((group) => group.id === calendarDepartmentId) ??
      null
    );
  }, [calendarDepartmentGroups, calendarDepartmentId]);

  const calendarScopedRoles = useMemo(() => {
    if (!selectedCalendarDepartment) return roleList;
    return selectedCalendarDepartment.roles;
  }, [roleList, selectedCalendarDepartment]);

  const calendarScopedRoleIdsSet = useMemo(
    () => new Set(calendarScopedRoles.map((role) => role.id)),
    [calendarScopedRoles]
  );

  useEffect(() => {
    if (!calendarDepartmentId) return;
    if (selectedCalendarDepartment) return;
    setCalendarDepartmentId(null);
  }, [calendarDepartmentId, selectedCalendarDepartment]);

  useEffect(() => {
    if (!calendarDepartmentId) return;
    if (shiftPlanner.scope !== "job") return;
    if (!calendarScopedRoles.length) return;
    if (
      shiftPlanner.selectedRoleId &&
      calendarScopedRoleIdsSet.has(shiftPlanner.selectedRoleId)
    ) {
      return;
    }

    const fallbackRoleId = calendarScopedRoles[0]?.id ?? null;
    if (fallbackRoleId === shiftPlanner.selectedRoleId) return;
    setShiftPlanner((prev) => ({
      ...prev,
      selectedRoleId: fallbackRoleId,
      updatedAt: new Date().toISOString(),
    }));
  }, [
    calendarDepartmentId,
    calendarScopedRoleIdsSet,
    calendarScopedRoles,
    shiftPlanner.scope,
    shiftPlanner.selectedRoleId,
  ]);

  const roleTitleLookup = useMemo(() => {
    const map = new Map<string, string>();
    roleList.forEach((role) => map.set(role.id, role.title));
    return map;
  }, [roleList]);

  const shiftPlannerWeekOptions = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    });
    const currentWeekStart = getWeekStartISODate(new Date());
    const baseOptions = Array.from({ length: 4 }).map((_, index) => {
      const start = addDaysToISODate(currentWeekStart, index * 7);
      const end = addDaysToISODate(start, 6);
      const startDate = parseLocalISODate(start) ?? new Date();
      const endDate = parseLocalISODate(end) ?? new Date();
      return {
        id: start,
        start,
        end,
        label: `${formatter.format(startDate)} – ${formatter.format(endDate)}`,
      };
    });

    if (baseOptions.some((option) => option.id === shiftPlannerWeekStart)) {
      return baseOptions;
    }

    const selectedEnd = addDaysToISODate(shiftPlannerWeekStart, 6);
    const selectedStartDate = parseLocalISODate(shiftPlannerWeekStart) ?? new Date();
    const selectedEndDate = parseLocalISODate(selectedEnd) ?? new Date();
    return [
      {
        id: shiftPlannerWeekStart,
        start: shiftPlannerWeekStart,
        end: selectedEnd,
        label: `${formatter.format(selectedStartDate)} – ${formatter.format(selectedEndDate)}`,
      },
      ...baseOptions,
    ];
  }, [shiftPlannerWeekStart]);

  const shiftPlannerWeekPublished = useMemo(
    () => shiftPlanner.publishedWeeks.includes(shiftPlannerWeekStart),
    [shiftPlanner.publishedWeeks, shiftPlannerWeekStart]
  );

  const shiftPlannerScopedShifts = useMemo(() => {
    const shifts = shiftPlanner.shifts.filter((shift) =>
      calendarScopedRoleIdsSet.has(shift.roleId)
    );
    return shiftPlanner.scope === "job" && shiftPlanner.selectedRoleId
      ? shifts.filter((shift) => shift.roleId === shiftPlanner.selectedRoleId)
      : shifts;
  }, [
    calendarScopedRoleIdsSet,
    shiftPlanner.shifts,
    shiftPlanner.scope,
    shiftPlanner.selectedRoleId,
  ]);

  const shiftPlannerShiftsForWeek = useMemo(() => {
    const shifts = shiftPlannerScopedShifts.filter(
      (shift) => shift.weekStart === shiftPlannerWeekStart
    );
    return [...shifts].sort((a, b) => {
      const dayIndex =
        scheduleDayOptions.findIndex((day) => day.id === a.day) -
        scheduleDayOptions.findIndex((day) => day.id === b.day);
      if (dayIndex !== 0) return dayIndex;
      const aTime = parseClockMinutes(a.start) ?? 0;
      const bTime = parseClockMinutes(b.start) ?? 0;
      if (aTime !== bTime) return aTime - bTime;
      return a.roleId.localeCompare(b.roleId);
    });
  }, [
    shiftPlannerScopedShifts,
    shiftPlannerWeekStart,
  ]);

  const shiftPlannerShiftsByDay = useMemo(() => {
    const byDay = scheduleDayOptions.reduce((acc, day) => {
      acc[day.id] = [];
      return acc;
    }, {} as Record<ScheduleDayId, ShiftPlannerShift[]>);

    shiftPlannerShiftsForWeek.forEach((shift) => {
      if (shift.day in byDay) {
        byDay[shift.day].push(shift);
      }
    });
    return byDay;
  }, [shiftPlannerShiftsForWeek]);

  const shiftPlannerShiftsByDate = useMemo(() => {
    const byDate = new Map<string, ShiftPlannerShift[]>();
    shiftPlannerScopedShifts.forEach((shift) => {
      const dayIndex = scheduleDayOptions.findIndex((day) => day.id === shift.day);
      if (dayIndex < 0) return;
      const isoDate = addDaysToISODate(shift.weekStart, dayIndex);
      const current = byDate.get(isoDate);
      if (current) {
        current.push(shift);
      } else {
        byDate.set(isoDate, [shift]);
      }
    });

    byDate.forEach((shifts) => {
      shifts.sort((a, b) => {
        const aTime = parseClockMinutes(a.start) ?? 0;
        const bTime = parseClockMinutes(b.start) ?? 0;
        if (aTime !== bTime) return aTime - bTime;
        return a.roleId.localeCompare(b.roleId);
      });
    });

    return byDate;
  }, [shiftPlannerScopedShifts]);

  const shiftPlannerPreviewRows = useMemo(() => {
    const anchor = parseLocalISODate(shiftPlannerWeekStart) ?? new Date();
    const rows: Array<
      Array<{
        isoDate: string;
        date: Date;
        isInCurrentMonth: boolean;
      }>
    > = [];

    if (shiftPlannerPreviewMode === "weeks") {
      const totalDays = shiftPlannerPreviewWeeks * 7;
      const days = Array.from({ length: totalDays }).map((_, index) => {
        const isoDate = addDaysToISODate(shiftPlannerWeekStart, index);
        const parsed = parseLocalISODate(isoDate);
        const date = parsed ?? new Date(anchor);
        return { isoDate, date, isInCurrentMonth: true };
      });
      for (let i = 0; i < days.length; i += 7) {
        rows.push(days.slice(i, i + 7));
      }
      return rows;
    }

    const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    const gridStart = new Date(monthStart);
    gridStart.setDate(gridStart.getDate() - ((gridStart.getDay() + 6) % 7));
    const gridEnd = new Date(monthEnd);
    gridEnd.setDate(gridEnd.getDate() + (6 - ((gridEnd.getDay() + 6) % 7)));

    const days: Array<{
      isoDate: string;
      date: Date;
      isInCurrentMonth: boolean;
    }> = [];
    for (
      let cursor = new Date(gridStart);
      cursor <= gridEnd;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
      days.push({
        isoDate: formatLocalISODate(date),
        date,
        isInCurrentMonth: date.getMonth() === anchor.getMonth(),
      });
    }

    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [shiftPlannerPreviewMode, shiftPlannerPreviewWeeks, shiftPlannerWeekStart]);

  const shiftPlannerPreviewLabel = useMemo(() => {
    if (shiftPlannerPreviewMode === "weeks") {
      return `${shiftPlannerPreviewWeeks} week${
        shiftPlannerPreviewWeeks > 1 ? "s" : ""
      } preview`;
    }
    const anchor = parseLocalISODate(shiftPlannerWeekStart) ?? new Date();
    return anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [shiftPlannerPreviewMode, shiftPlannerPreviewWeeks, shiftPlannerWeekStart]);

  const shiftPlannerVolunteerEmailLookup = useMemo(() => {
    const map = new Map<string, string>();
    Object.values(applicantsByRole).forEach((applicants) => {
      applicants.forEach((applicant) => {
        if (!map.has(applicant.name)) {
          map.set(applicant.name, applicant.email);
        }
      });
    });
    return map;
  }, [applicantsByRole]);

  const shiftPlannerFilteredVolunteers = useMemo(() => {
    const lowered = shiftPlannerVolunteerQuery.trim().toLowerCase();
    if (!lowered) return volunteerProfiles;
    return volunteerProfiles.filter(
      (profile) =>
        profile.name.toLowerCase().includes(lowered) ||
        profile.role.toLowerCase().includes(lowered)
    );
  }, [shiftPlannerVolunteerQuery, volunteerProfiles]);

  const sampleCalendarRoleOptions = useMemo(() => {
    if (!calendarDepartmentId) return roleList;
    return calendarScopedRoles;
  }, [calendarDepartmentId, calendarScopedRoles, roleList]);

  const shiftPlannerCurrentSignature = useMemo(
    () => buildShiftPlannerConfirmationSignature(shiftPlanner),
    [shiftPlanner]
  );

  const hasUnconfirmedShiftPlannerChanges = useMemo(() => {
    if (!shiftPlannerHydrated) return false;
    if (!shiftPlannerConfirmation) return shiftPlanner.shifts.length > 0;
    return shiftPlannerConfirmation.signature !== shiftPlannerCurrentSignature;
  }, [
    shiftPlanner.shifts.length,
    shiftPlannerConfirmation,
    shiftPlannerCurrentSignature,
    shiftPlannerHydrated,
  ]);

  const shiftPlannerLastConfirmedLabel = useMemo(() => {
    if (!shiftPlannerConfirmation?.confirmedAt) return null;
    const parsed = new Date(shiftPlannerConfirmation.confirmedAt);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [shiftPlannerConfirmation?.confirmedAt]);

  const confirmShiftPlannerChanges = () => {
    setShiftPlannerError(null);

    if (!hasUnconfirmedShiftPlannerChanges) {
      setShiftPlannerConfirmFeedback({
        tone: "info",
        text: "No new changes to confirm.",
      });
      return;
    }

    if (!shiftPlanner.publishedWeeks.includes(shiftPlannerWeekStart)) {
      setShiftPlannerConfirmFeedback({
        tone: "info",
        text: "Publish this week before sending volunteer notifications.",
      });
      return;
    }

    const recipientMap = new Map<string, { name: string; email?: string }>();
    shiftPlannerShiftsForWeek.forEach((shift) => {
      shift.assignments.forEach((assignment) => {
        if (!assignment) return;
        const name = assignment.name.trim();
        if (!name) return;
        const email =
          typeof assignment.email === "string" ? normalizeEmailKey(assignment.email) : "";
        const key = email || name.toLowerCase();
        if (!key || recipientMap.has(key)) return;
        recipientMap.set(key, { name, email: email || undefined });
      });
    });

    const nowIso = new Date().toISOString();
    const weekLabel =
      shiftPlannerWeekOptions.find((week) => week.id === shiftPlannerWeekStart)?.label ??
      shiftPlannerWeekStart;
    const message = `The schedule has been updated for ${weekLabel}. Please review your shifts in Volunteer Hub.`;

    if (recipientMap.size > 0) {
      const existingNotifications = readShiftPlannerNotificationsFromStorage();
      const nextNotifications: ShiftPlannerVolunteerNotification[] = [
        ...Array.from(recipientMap.values()).map((recipient, index) => ({
          id: `planner-notif-${Date.now()}-${index + 1}`,
          createdAt: nowIso,
          weekStart: shiftPlannerWeekStart,
          recipientName: recipient.name,
          recipientEmail: recipient.email,
          title: "Schedule updated",
          message,
        })),
        ...existingNotifications,
      ].slice(0, 500);
      writeShiftPlannerNotificationsToStorage(nextNotifications);
    }

    const confirmation: ShiftPlannerConfirmationState = {
      confirmedAt: nowIso,
      signature: shiftPlannerCurrentSignature,
    };
    writeShiftPlannerConfirmationToStorage(confirmation);
    setShiftPlannerConfirmation(confirmation);
    setShiftPlannerConfirmFeedback({
      tone: "success",
      text:
        recipientMap.size > 0
          ? `Changes confirmed. ${recipientMap.size} volunteer notification${
              recipientMap.size > 1 ? "s" : ""
            } sent.`
          : "Changes confirmed. No assigned volunteers to notify for this week.",
    });
  };

  useEffect(() => {
    if (!hasUnconfirmedShiftPlannerChanges) return;
    if (shiftPlannerConfirmFeedback?.tone !== "success") return;
    setShiftPlannerConfirmFeedback(null);
  }, [hasUnconfirmedShiftPlannerChanges, shiftPlannerConfirmFeedback?.tone]);

  const setShiftPlannerScope = (scope: ShiftPlannerScope) => {
    setShiftPlannerError(null);
    setShiftPlanner((prev) => {
      if (prev.scope === scope) return prev;
      const nextSelectedRoleId =
        scope === "job"
          ? prev.selectedRoleId ?? calendarScopedRoles[0]?.id ?? null
          : prev.selectedRoleId;
      return {
        ...prev,
        scope,
        selectedRoleId: nextSelectedRoleId,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const setShiftPlannerSelectedRole = (roleId: string) => {
    setShiftPlannerError(null);
    setShiftPlanner((prev) => ({
      ...prev,
      selectedRoleId: roleId,
      updatedAt: new Date().toISOString(),
    }));
  };

  const toggleShiftPlannerClaim = () => {
    setShiftPlannerError(null);
    setShiftPlanner((prev) => ({
      ...prev,
      claimEnabled: !prev.claimEnabled,
      updatedAt: new Date().toISOString(),
    }));
  };

  const toggleShiftPlannerPublishWeek = () => {
    setShiftPlannerError(null);
    setShiftPlanner((prev) => {
      const alreadyPublished = prev.publishedWeeks.includes(shiftPlannerWeekStart);
      const nextWeeks = alreadyPublished
        ? prev.publishedWeeks.filter((week) => week !== shiftPlannerWeekStart)
        : [shiftPlannerWeekStart, ...prev.publishedWeeks];
      return { ...prev, publishedWeeks: nextWeeks, updatedAt: new Date().toISOString() };
    });
  };

  const updateShiftPlannerSlotsCount = (nextSlots: number) => {
    setShiftPlannerError(null);
    setShiftPlanner((prev) => {
      const slotsCount = clampNumber(nextSlots, 1, 5);
      if (slotsCount === prev.slotsCount) return prev;
      const shifts = prev.shifts.map((shift) => {
        if (shift.assignments.length === slotsCount) return shift;
        if (shift.assignments.length < slotsCount) {
          return {
            ...shift,
            assignments: [
              ...shift.assignments,
              ...Array.from({ length: slotsCount - shift.assignments.length }).map(
                () => null
              ),
            ],
          };
        }
        return { ...shift, assignments: shift.assignments.slice(0, slotsCount) };
      });
      return { ...prev, slotsCount, shifts, updatedAt: new Date().toISOString() };
    });
  };

  const openShiftPlannerAddShift = (dayId: ScheduleDayId) => {
    setShiftPlannerError(null);
    setShiftPlannerAddDay(dayId);
    setShiftPlannerAddStart("09:00");
    setShiftPlannerAddEnd("13:00");
  };

  const cancelShiftPlannerAddShift = () => {
    setShiftPlannerError(null);
    setShiftPlannerAddDay(null);
  };

  const addShiftPlannerShift = () => {
    if (!shiftPlannerAddDay) return;
    const startMinutes = parseClockMinutes(shiftPlannerAddStart);
    const endMinutes = parseClockMinutes(shiftPlannerAddEnd);
    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
      setShiftPlannerError("Please enter a valid time range.");
      return;
    }

    const roleId = shiftPlanner.selectedRoleId ?? calendarScopedRoles[0]?.id ?? null;

    if (!roleId) {
      setShiftPlannerError("No job available for this calendar.");
      return;
    }

    const dayShiftCount = shiftPlanner.shifts.filter(
      (shift) =>
        shift.weekStart === shiftPlannerWeekStart &&
        shift.day === shiftPlannerAddDay &&
        shift.roleId === roleId
    ).length;
    if (dayShiftCount >= 3) {
      setShiftPlannerError("Max 3 shifts per day for this job.");
      return;
    }

    const now = new Date().toISOString();
    const baseId = Date.now();
    const role = roleList.find((item) => item.id === roleId) ?? null;
    const newShift: ShiftPlannerShift = {
      id: `planner-${baseId}`,
      weekStart: shiftPlannerWeekStart,
      day: shiftPlannerAddDay,
      start: shiftPlannerAddStart,
      end: shiftPlannerAddEnd,
      roleId,
      roleTitle: role?.title,
      location: role?.location,
      assignments: Array.from({ length: shiftPlanner.slotsCount }).map(() => null),
      createdAt: now,
    };

    setShiftPlanner((prev) => ({
      ...prev,
      shifts: [...prev.shifts, newShift],
      updatedAt: now,
    }));
    setShiftPlannerAddDay(null);
    setShiftPlannerError(null);
  };

  const removeShiftPlannerShift = (shiftId: string) => {
    const now = new Date().toISOString();
    setShiftPlanner((prev) => ({
      ...prev,
      shifts: prev.shifts.filter((shift) => shift.id !== shiftId),
      updatedAt: now,
    }));
  };

  const openShiftPlannerAssign = (shiftId: string, slotIndex: number) => {
    setShiftPlannerError(null);
    setShiftPlannerAssignSlot({ shiftId, slotIndex });
    setShiftPlannerVolunteerQuery("");
  };

  const openShiftPlannerAssignForWeek = (shiftId: string) => {
    const currentShift =
      shiftPlannerShiftsForWeek.find((shift) => shift.id === shiftId) ??
      shiftPlanner.shifts.find((shift) => shift.id === shiftId) ??
      null;
    if (!currentShift) return;

    const openInCurrent = currentShift.assignments.findIndex(
      (assignment) => assignment === null
    );
    if (openInCurrent >= 0) {
      openShiftPlannerAssign(currentShift.id, openInCurrent);
      return;
    }

    const fallbackShift = shiftPlannerShiftsForWeek.find((shift) =>
      shift.assignments.some((assignment) => assignment === null)
    );
    if (fallbackShift) {
      const fallbackOpenIndex = fallbackShift.assignments.findIndex(
        (assignment) => assignment === null
      );
      openShiftPlannerAssign(fallbackShift.id, fallbackOpenIndex >= 0 ? fallbackOpenIndex : 0);
      return;
    }

    openShiftPlannerAssign(currentShift.id, 0);
  };

  const closeShiftPlannerAssign = () => {
    setShiftPlannerAssignSlot(null);
    setShiftPlannerVolunteerQuery("");
  };

  const clearShiftPlannerAssignment = () => {
    if (!shiftPlannerAssignSlot) return;
    const now = new Date().toISOString();
    setShiftPlanner((prev) => ({
      ...prev,
      shifts: prev.shifts.map((shift) => {
        if (shift.id !== shiftPlannerAssignSlot.shiftId) return shift;
        const assignments = [...shift.assignments];
        assignments[shiftPlannerAssignSlot.slotIndex] = null;
        return { ...shift, assignments };
      }),
      updatedAt: now,
    }));
  };

  const assignShiftPlannerVolunteer = (volunteer: VolunteerListing) => {
    if (!shiftPlannerAssignSlot) return;
    const now = new Date().toISOString();
    const email = shiftPlannerVolunteerEmailLookup.get(volunteer.name);
    setShiftPlanner((prev) => ({
      ...prev,
      shifts: prev.shifts.map((shift) => {
        if (shift.id !== shiftPlannerAssignSlot.shiftId) return shift;
        const assignments = [...shift.assignments];
        assignments[shiftPlannerAssignSlot.slotIndex] = {
          name: volunteer.name,
          email,
          source: "manager",
          assignedAt: now,
        };
        return { ...shift, assignments };
      }),
      updatedAt: now,
    }));
    closeShiftPlannerAssign();
  };

  const generateShiftPlannerFromRoleSchedule = () => {
    const roleId = shiftPlanner.selectedRoleId;
    if (!roleId) {
      setShiftPlannerError("Select a job to generate shifts.");
      return;
    }
    const role = roleList.find((item) => item.id === roleId) ?? null;
    if (!role) {
      setShiftPlannerError("Selected job is no longer available.");
      return;
    }
    const parsed = parseSchedule(role.schedule);
    const rangeMatch = parsed.time.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    if (!rangeMatch || parsed.days.length === 0) {
      setShiftPlannerError("This job schedule is not a fixed time range.");
      return;
    }
    const start = rangeMatch[1];
    const end = rangeMatch[2];
    const startMinutes = parseClockMinutes(start);
    const endMinutes = parseClockMinutes(end);
    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
      setShiftPlannerError("This job schedule time range is invalid.");
      return;
    }

    const now = new Date().toISOString();
    setShiftPlanner((prev) => {
      let shifts = [...prev.shifts];
      parsed.days.forEach((day) => {
        const dayShiftCount = shifts.filter(
          (shift) =>
            shift.weekStart === shiftPlannerWeekStart &&
            shift.day === day &&
            shift.roleId === roleId
        ).length;
        if (dayShiftCount >= 3) return;

        const exists = shifts.some(
          (shift) =>
            shift.weekStart === shiftPlannerWeekStart &&
            shift.roleId === roleId &&
            shift.day === day &&
            shift.start === start &&
            shift.end === end
        );
        if (exists) return;

        const baseId = Date.now() + Math.floor(Math.random() * 1000);
        shifts = [
          ...shifts,
          {
            id: `planner-${baseId}`,
            weekStart: shiftPlannerWeekStart,
            day,
            start,
            end,
            roleId,
            roleTitle: role.title,
            location: role.location,
            assignments: Array.from({ length: prev.slotsCount }).map(() => null),
            createdAt: now,
          },
        ];
      });
      return { ...prev, shifts, updatedAt: now };
    });
    setShiftPlannerError(null);
  };

  const copyShiftPlannerWeekToNext = () => {
    const fromWeek = shiftPlannerWeekStart;
    const nextWeek = addDaysToISODate(fromWeek, 7);
    const now = new Date().toISOString();
    setShiftPlanner((prev) => {
      const sourceShifts = prev.shifts.filter((shift) => shift.weekStart === fromWeek);
      if (sourceShifts.length === 0) return prev;

      const existingKeys = new Set(
        prev.shifts
          .filter((shift) => shift.weekStart === nextWeek)
          .map((shift) => `${shift.day}-${shift.start}-${shift.end}-${shift.roleId}`)
      );

      const copies = sourceShifts
        .filter(
          (shift) =>
            !existingKeys.has(`${shift.day}-${shift.start}-${shift.end}-${shift.roleId}`)
        )
        .map((shift, index) => ({
          ...shift,
          id: `planner-${Date.now()}-${index}`,
          weekStart: nextWeek,
          createdAt: now,
        }));

      if (copies.length === 0) return prev;
      return { ...prev, shifts: [...prev.shifts, ...copies], updatedAt: now };
    });
    setShiftPlannerWeekStart(nextWeek);
    setShiftPlannerError(null);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "organisation":
        return (
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold text-[#4fa5ff]">
                Your organization
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Present your mission, goals, and operating details to volunteers.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#120626]/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Organization profile
                  </p>
                  <p className="mt-3 text-sm text-white/80">
                    CFOC Volunteer Network
                  </p>
                  <p className="text-sm text-white/60">
                    Accra, Lusaka, Nairobi
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#120626]/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Mission focus
                  </p>
                  <p className="mt-3 text-sm text-white/80">
                    Serve communities through education, health, and logistics.
                  </p>
                  <p className="text-sm text-white/60">
                    12 active volunteer roles
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-full bg-[#271c70] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
                >
                  Edit organization profile
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/10"
                >
                  Publish volunteer guide
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <CheckCircle2 className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
                  Approval rules
                </div>
                <p className="mt-3 text-sm text-white/70">
                  Review profiles before volunteers can join shifts.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-white/60">
                  <li>Profile completion above 80%</li>
                  <li>Availability matches open roles</li>
                  <li>Background checks where required</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <MessageCircle className="h-4 w-4 text-[#ff9c4b]" aria-hidden="true" />
                  Communication
                </div>
                <p className="mt-3 text-sm text-white/70">
                  Centralize updates, onboarding notes, and announcements.
                </p>
                <button
                  type="button"
                  className="mt-4 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/10"
                >
                  Send broadcast
                </button>
              </div>
            </div>
          </section>
        );
      case "volunteers": {
        const audienceOptions: { id: VolunteerAudienceFilter; label: string }[] = [
          { id: "everyone", label: "Everyone" },
          { id: "adult", label: "Adults" },
          { id: "youth", label: "Youth" },
        ];
        const jobOptions = [
          "All jobs",
          ...Array.from(
            new Set([
              ...roleList.map((role) => role.title),
              ...volunteerProfiles.map((profile) => profile.role),
              ...archivedVolunteers.map((volunteer) => volunteer.role),
            ])
          ),
        ];
        const filteredProfilesByJob =
          jobFilter === "All jobs"
            ? volunteerProfiles
            : volunteerProfiles.filter((profile) => profile.role === jobFilter);
        const filteredProfiles =
          audienceFilter === "everyone"
            ? filteredProfilesByJob
            : filteredProfilesByJob.filter(
                (profile) =>
                  resolveTargetAudience(profile.name, profile.role, profile.audience) ===
                  audienceFilter
              );
        const activeProfiles = filteredProfiles.filter(
          (profile) => profile.status === "Approved"
        );
        const pendingProfiles = filteredProfiles.filter(
          (profile) => profile.status === "Pending"
        );
        const filteredArchivedVolunteersByJob =
          jobFilter === "All jobs"
            ? archivedVolunteers
            : archivedVolunteers.filter((volunteer) => volunteer.role === jobFilter);
        const filteredArchivedVolunteers =
          audienceFilter === "everyone"
            ? filteredArchivedVolunteersByJob
            : filteredArchivedVolunteersByJob.filter(
                (volunteer) =>
                  resolveTargetAudience(
                    volunteer.name,
                    volunteer.role,
                    volunteer.audience
                  ) === audienceFilter
              );

        return (
          <section className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#4fa5ff]">
                  Volunteer profiles
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                    Filter by job
                  </label>
                  <select
                    value={jobFilter}
                    onChange={(event) => setJobFilter(event.target.value)}
                    className="rounded-full border border-white/10 bg-[#120626]/60 px-3 py-2 text-xs text-white focus:border-[#4fa5ff] focus:outline-none"
                  >
                    {jobOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                    Target profiles
                  </label>
                  <select
                    value={audienceFilter}
                    onChange={(event) =>
                      setAudienceFilter(event.target.value as VolunteerAudienceFilter)
                    }
                    className="rounded-full border border-white/10 bg-[#120626]/60 px-3 py-2 text-xs text-white focus:border-[#4fa5ff] focus:outline-none"
                  >
                    {audienceOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/10"
                >
                  Export list
                </button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Active volunteers
                    </h3>
                    <p className="text-xs text-white/50">
                      {activeProfiles.length} active
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {activeProfiles.map((profile) => {
                    const targetAudience = resolveTargetAudience(
                      profile.name,
                      profile.role,
                      profile.audience
                    );

                    return (
                      <div
                        key={profile.id}
                        className="flex flex-col gap-4 rounded-2xl border border-[#4fa5ff] bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {profile.name}
                          </p>
                          <p className="text-xs text-white/60">{profile.role}</p>
                          <p className="text-xs text-[#4fa5ff]">
                            Availability: {profile.availability}
                          </p>
                          <p className="text-xs text-white/60">
                            Hours worked: {profile.hoursWorked}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[profile.status]}`}
                          >
                            {profile.status}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${volunteerAudienceTone[targetAudience]}`}
                          >
                            {volunteerAudienceLabel[targetAudience]}
                          </span>
                          <span className="text-xs text-white/60">
                            Profile {profile.completion}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              openTimesheetProfile(profile.name, profile.role)
                            }
                            className="rounded-full border border-white/20 p-2 text-white/80 transition hover:border-white/40 hover:text-white"
                            aria-label="View profile"
                          >
                            <UserCircle className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArchiveVolunteer(profile)}
                            className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-white/40 hover:text-white"
                            aria-label="Archive volunteer"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Pending approval
                    </h3>
                    <p className="text-xs text-white/50">
                      {pendingProfiles.length} awaiting review
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {pendingProfiles.length === 0 ? (
                    <p className="text-xs text-white/60">
                      No pending volunteers for this job.
                    </p>
                  ) : (
                    pendingProfiles.map((profile) => {
                      const targetAudience = resolveTargetAudience(
                        profile.name,
                        profile.role,
                        profile.audience
                      );

                      return (
                        <div
                          key={profile.id}
                          className="flex flex-col gap-4 rounded-2xl border border-[#ff9c4b] bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {profile.name}
                            </p>
                            <p className="text-xs text-white/60">{profile.role}</p>
                            <p className="text-xs text-[#ff9c4b]">
                              Availability: {profile.availability}
                            </p>
                            <p className="text-xs text-white/60">
                              Hours worked: {profile.hoursWorked}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[profile.status]}`}
                            >
                              {profile.status}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${volunteerAudienceTone[targetAudience]}`}
                            >
                              {volunteerAudienceLabel[targetAudience]}
                            </span>
                            <span className="text-xs text-white/60">
                              Profile {profile.completion}
                            </span>
                            <button
                              type="button"
                              className="rounded-full bg-[#271c70] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openTimesheetProfile(profile.name, profile.role)
                              }
                              className="rounded-full border border-white/20 p-2 text-white/80 transition hover:border-white/40 hover:text-white"
                              aria-label="View profile"
                            >
                              <UserCircle className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleArchiveVolunteer(profile)}
                              className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-white/40 hover:text-white"
                              aria-label="Archive volunteer"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowArchivedVolunteers((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
              >
                <span>Archived volunteers</span>
                <span className="flex items-center gap-2 text-xs text-white/60">
                  {filteredArchivedVolunteers.length} archived
                  {showArchivedVolunteers ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
              </button>
              {showArchivedVolunteers && (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredArchivedVolunteers.map((volunteer) => {
                    const targetAudience = resolveTargetAudience(
                      volunteer.name,
                      volunteer.role,
                      volunteer.audience
                    );

                    return (
                      <div
                        key={volunteer.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {volunteer.name}
                            </p>
                            <p className="text-xs text-white/60">
                              {volunteer.role}
                            </p>
                            <p className="text-xs text-white/50">
                              {volunteer.location}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${volunteerAudienceTone[targetAudience]}`}
                            >
                              {volunteerAudienceLabel[targetAudience]}
                            </span>
                            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/60">
                              Archived
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUnarchiveVolunteer(volunteer)}
                              className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                            >
                              Unarchive
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/60">
                          <span>Last active: {volunteer.lastActive}</span>
                          <span>Total hours: {volunteer.totalHours}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        );
      }
	      case "roles":
	        return (
	          <section className="space-y-6">
	            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
	              <h2 className="text-2xl font-semibold text-[#4fa5ff]">
	                Job postings
	              </h2>
	              <button
	                type="button"
	                onClick={openAddRole}
	                className="rounded-full bg-[#271c70] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
	              >
	                Add new role
	              </button>
	            </div>
	            <div className="grid gap-4 md:grid-cols-2">
	              {roleList.map((role) => (
	                <div
	                  key={role.id}
	                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
	                >
	                  <div className="flex items-start justify-between gap-3">
		                    <div>
		                      <p className="text-sm font-semibold text-white">
		                        {role.title}
		                      </p>
		                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
		                        Target profiles
		                      </p>
		                      <div className="mt-1 flex flex-wrap gap-2">
		                        {role.targets.volunteer && (
		                          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
		                            Volunteer
		                          </span>
	                        )}
	                        {role.targets.student && (
	                          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
	                            Student
	                          </span>
	                        )}
	                        {role.targets.adults && (
	                          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
	                            Adults
	                          </span>
	                        )}
		                        {role.targets.youth && (
		                          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
		                            Youth
		                          </span>
		                        )}
		                      </div>
		                    </div>
	                    <button
	                      type="button"
	                      onClick={() => openDeleteRole(role)}
	                      className="rounded-full border border-[#4fa5ff] p-2 text-[#4fa5ff] transition hover:border-[#7cc7ff] hover:text-[#7cc7ff]"
	                      aria-label={`Archive ${role.title}`}
                    >
                      <Trash2
                        className="h-3 w-3 text-[#4fa5ff]"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
	                  <p className="mt-2 text-xs text-white/70">
	                    {role.schedule}
	                  </p>
	                  <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
	                    <MapPin className="h-3 w-3 text-white/50" aria-hidden="true" />
	                    <span>{role.location}</span>
	                  </div>
	                  {role.address && (
	                    <div className="flex items-center gap-2 text-xs text-white/50">
	                      <Building2
	                        className="h-3 w-3 text-white/50"
	                        aria-hidden="true"
	                      />
	                      <span>{role.address}</span>
	                    </div>
	                  )}
		                  {role.commitmentLength.trim() && (
		                    <div className="mt-2 flex items-center gap-2 text-[11px] text-white/50">
		                      <Clock className="h-3 w-3 text-white/50" aria-hidden="true" />
		                      <span>
		                        Commitment length:{" "}
		                        <span className="text-white/70">
		                          {role.commitmentLength}
		                        </span>
		                      </span>
		                    </div>
		                  )}
		                  {role.keywords.length > 0 && (
		                    <div className="mt-1 flex items-center gap-2 text-[11px] text-white/50">
		                      <Hash className="h-3 w-3 text-white/50" aria-hidden="true" />
		                      <span>
		                        Keywords:{" "}
		                        <span className="text-white/70">
		                          {role.keywords.slice(0, 5).join(", ")}
		                          {role.keywords.length > 5
		                            ? ` +${role.keywords.length - 5}`
		                            : ""}
		                        </span>
		                      </span>
		                    </div>
		                  )}
		                  {role.summary.trim() && (
		                    <p className="mt-2 text-xs text-white/60">{role.summary}</p>
		                  )}
	                  {role.conditions.length > 0 && (
	                    <>
	                      <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-white/60">
	                        {role.conditions.slice(0, 3).map((condition) => (
	                          <li key={condition}>{condition}</li>
	                        ))}
	                      </ul>
	                      {role.conditions.length > 3 && (
	                        <p className="mt-2 text-[11px] text-white/50">
	                          +{role.conditions.length - 3} more
	                        </p>
	                      )}
	                    </>
	                  )}
		                  <div className="mt-4 flex flex-wrap gap-2">
		                    <button
		                      type="button"
		                      onClick={() => setApplicantsRoleId(role.id)}
	                      className="rounded-full border border-[#ff9c4b] px-3 py-1.5 text-xs font-semibold text-[#ff9c4b] transition hover:border-[#ffd08b] hover:text-[#ffd08b]"
	                    >
	                      View applicants
	                    </button>
	                    <button
	                      type="button"
	                      onClick={() => openTeamModal(role.id)}
	                      className="rounded-full border border-[#ff9c4b] px-3 py-1.5 text-xs font-semibold text-[#ff9c4b] transition hover:border-[#ffd08b] hover:text-[#ffd08b]"
	                    >
	                      See team
	                    </button>
		                    <button
		                      type="button"
		                      onClick={() => openEditRole(role)}
		                      className="rounded-full border border-[#ff9c4b] px-3 py-1.5 text-xs font-semibold text-[#ff9c4b] transition hover:border-[#ffd08b] hover:text-[#ffd08b]"
		                    >
		                      Edit role
		                    </button>
		                  </div>
	                </div>
	              ))}
	            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowArchivedRoles((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
              >
                <span>Archived jobs</span>
                <span className="flex items-center gap-2 text-xs text-white/60">
                  {archivedRoles.length} archived
                  {showArchivedRoles ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
              </button>
              {showArchivedRoles && (
                <div className="grid gap-3 md:grid-cols-2">
                  {archivedRoles.length === 0 ? (
                    <p className="text-xs text-white/60">
                      No archived jobs yet.
                    </p>
                  ) : (
                    archivedRoles.map((role) => (
                      <div
                        key={role.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
	                        <div className="flex items-start justify-between gap-4">
		                          <div>
		                            <p className="text-sm font-semibold text-white">
		                              {role.title}
		                            </p>
		                            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
		                              Target profiles
		                            </p>
		                            <div className="mt-1 flex flex-wrap gap-2">
		                              {role.targets.volunteer && (
		                                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
		                                  Volunteer
		                                </span>
	                              )}
	                              {role.targets.student && (
	                                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
	                                  Student
	                                </span>
	                              )}
	                              {role.targets.adults && (
	                                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
	                                  Adults
	                                </span>
	                              )}
	                              {role.targets.youth && (
	                                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
	                                  Youth
	                                </span>
	                              )}
	                            </div>
		                            <p className="mt-1 text-xs text-white/70">
		                              {role.schedule}
		                            </p>
		                            <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
		                              <MapPin
		                                className="h-3 w-3 text-white/50"
		                                aria-hidden="true"
		                              />
		                              <span>{role.location}</span>
		                            </div>
		                            {role.address && (
		                              <div className="flex items-center gap-2 text-xs text-white/50">
		                                <Building2
		                                  className="h-3 w-3 text-white/50"
		                                  aria-hidden="true"
		                                />
		                                <span>{role.address}</span>
		                              </div>
		                            )}
		                            {role.commitmentLength.trim() && (
		                              <div className="mt-2 flex items-center gap-2 text-[11px] text-white/50">
		                                <Clock
		                                  className="h-3 w-3 text-white/50"
		                                  aria-hidden="true"
		                                />
		                                <span>
		                                  Commitment length:{" "}
		                                  <span className="text-white/70">
		                                    {role.commitmentLength}
		                                  </span>
		                                </span>
		                              </div>
		                            )}
		                            {role.keywords.length > 0 && (
		                              <div className="mt-1 flex items-center gap-2 text-[11px] text-white/50">
		                                <Hash
		                                  className="h-3 w-3 text-white/50"
		                                  aria-hidden="true"
		                                />
		                                <span>
		                                  Keywords:{" "}
		                                  <span className="text-white/70">
		                                    {role.keywords.slice(0, 5).join(", ")}
		                                    {role.keywords.length > 5
		                                      ? ` +${role.keywords.length - 5}`
		                                      : ""}
		                                  </span>
		                                </span>
		                              </div>
		                            )}
		                            {role.summary.trim() && (
		                              <p className="mt-2 text-xs text-white/60">
		                                {role.summary}
		                              </p>
		                            )}
	                            {role.conditions.length > 0 && (
	                              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-white/60">
	                                {role.conditions.slice(0, 3).map((condition) => (
	                                  <li key={condition}>{condition}</li>
	                                ))}
	                              </ul>
	                            )}
	                            <p className="mt-2 text-[11px] text-white/50">
	                              Archived {role.archivedAt}
	                            </p>
	                          </div>
                          <button
                            type="button"
                            onClick={() => handleUnarchiveRole(role)}
                            className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                          >
                            Unarchive
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
	            {roleModal.mode && (
	              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
	                <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto cfoc-scrollbar rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
	                  <div className="flex items-center justify-between">
	                    <h3 className="text-lg font-semibold">
	                      {roleModal.mode === "add" ? "Add new role" : "Edit role"}
	                    </h3>
                    <button
                      type="button"
                      onClick={closeRoleModal}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-white/70">
	                    <div>
	                      <label className="text-xs text-white/50">Role title</label>
	                      <input
	                        type="text"
	                        value={roleDraft.title}
                        onChange={(event) =>
                          setRoleDraft((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
	                        placeholder="Community kitchen support"
	                      />
	                    </div>
                      <div>
                        <label className="text-xs text-white/50">Department</label>
                        <input
                          type="text"
                          value={roleDraft.department}
                          onChange={(event) =>
                            setRoleDraft((prev) => ({
                              ...prev,
                              department: event.target.value,
                            }))
                          }
                          list="cfoc-role-departments"
                          className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
                          placeholder="Operations"
                        />
                        <datalist id="cfoc-role-departments">
                          {departmentSuggestions.map((department) => (
                            <option key={department} value={department} />
                          ))}
                        </datalist>
                      </div>
	                    <div>
	                      <label className="text-xs text-white/50">
	                        Target profiles
	                      </label>
	                      <div className="mt-2 flex flex-wrap gap-2">
	                        <label className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
	                          <input
	                            type="checkbox"
	                            checked={roleDraft.targets.volunteer}
	                            onChange={(event) =>
	                              setRoleDraft((prev) => ({
	                                ...prev,
	                                targets: {
	                                  ...prev.targets,
	                                  volunteer: event.target.checked,
	                                },
	                              }))
	                            }
	                            className="h-4 w-4 accent-[#ff9c4b]"
	                          />
	                          Volunteer
	                        </label>
	                        <label className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
	                          <input
	                            type="checkbox"
	                            checked={roleDraft.targets.student}
	                            onChange={(event) =>
	                              setRoleDraft((prev) => ({
	                                ...prev,
	                                targets: {
	                                  ...prev.targets,
	                                  student: event.target.checked,
	                                },
	                              }))
	                            }
	                            className="h-4 w-4 accent-[#ff9c4b]"
	                          />
	                          Student
	                        </label>
	                        <label className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
	                          <input
	                            type="checkbox"
	                            checked={roleDraft.targets.adults}
	                            onChange={(event) =>
	                              setRoleDraft((prev) => ({
	                                ...prev,
	                                targets: {
	                                  ...prev.targets,
	                                  adults: event.target.checked,
	                                },
	                              }))
	                            }
	                            className="h-4 w-4 accent-[#ff9c4b]"
	                          />
	                          Adults
	                        </label>
	                        <label className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
	                          <input
	                            type="checkbox"
	                            checked={roleDraft.targets.youth}
	                            onChange={(event) =>
	                              setRoleDraft((prev) => ({
	                                ...prev,
	                                targets: {
	                                  ...prev.targets,
	                                  youth: event.target.checked,
	                                },
	                              }))
	                            }
	                            className="h-4 w-4 accent-[#ff9c4b]"
	                          />
	                          Youth
	                        </label>
	                      </div>
	                    </div>
	                    <div>
	                      <label className="text-xs text-white/50">Brief post</label>
	                      <textarea
	                        value={roleDraft.summary}
	                        onChange={(event) =>
	                          setRoleDraft((prev) => ({
	                            ...prev,
	                            summary: event.target.value,
	                          }))
	                        }
	                        rows={2}
	                        className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
	                        placeholder="Write a short description for the job post..."
	                      />
	                    </div>
	                    <div>
	                      <div className="flex items-center justify-between">
	                        <label className="text-xs text-white/50">Keywords</label>
	                        <span className="text-[11px] text-white/50">
	                          {roleDraft.keywords.length} items
	                        </span>
	                      </div>
	                      {roleDraft.keywords.length === 0 ? (
	                        <p className="mt-2 text-xs text-white/50">
	                          No keywords added yet.
	                        </p>
	                      ) : (
	                        <div className="mt-2 flex flex-wrap gap-2">
	                          {roleDraft.keywords.map((keyword, index) => (
	                            <span
	                              key={`${keyword}-${index}`}
	                              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70"
	                            >
	                              <span className="text-white/80">#{keyword}</span>
	                              <button
	                                type="button"
	                                onClick={() => removeRoleKeyword(index)}
	                                className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/60 transition hover:border-white/30 hover:text-white"
	                                aria-label="Remove keyword"
	                              >
	                                ×
	                              </button>
	                            </span>
	                          ))}
	                        </div>
	                      )}
	                      <div className="mt-3 flex gap-2">
	                        <input
	                          type="text"
	                          value={roleKeywordDraft}
	                          onChange={(event) => setRoleKeywordDraft(event.target.value)}
	                          onKeyDown={(event) => {
	                            if (event.key !== "Enter") return;
	                            event.preventDefault();
	                            addRoleKeyword();
	                          }}
	                          placeholder="Add a keyword..."
	                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
	                        />
	                        <button
	                          type="button"
	                          onClick={addRoleKeyword}
	                          disabled={!roleKeywordDraft.trim()}
	                          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
	                            roleKeywordDraft.trim()
	                              ? "border border-white/20 text-white/90 hover:border-white/40 hover:bg-white/10"
	                              : "cursor-not-allowed border border-white/10 bg-white/5 text-white/40"
	                          }`}
	                        >
	                          Add
	                        </button>
	                      </div>
	                      <p className="mt-2 text-[11px] text-white/50">
	                        Used to help search and match volunteers.
	                      </p>
	                    </div>
	                    <div>
	                      <label className="text-xs text-white/50">Schedule</label>
	                      <div className="mt-2 space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
	                        <div className="flex flex-wrap gap-2">
	                          {scheduleDayOptions.map((day) => {
                            const isSelected = roleScheduleDays.includes(day.id);
                            return (
                              <button
                                key={day.id}
                                type="button"
                                onClick={() =>
                                  setRoleScheduleDays((prev) =>
                                    prev.includes(day.id)
                                      ? prev.filter((item) => item !== day.id)
                                      : [...prev, day.id]
                                  )
                                }
                                className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                                  isSelected
                                    ? "border-[#ff9c4b] bg-[#ff9c4b]/20 text-white"
                                    : "border-white/20 text-white/70 hover:border-white/40"
                                }`}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
	                        <div>
	                          <select
	                            value={roleScheduleTime}
	                            onChange={(event) => setRoleScheduleTime(event.target.value)}
	                            className="w-full rounded-lg border border-white/10 bg-[#120626]/60 px-3 py-2 text-sm text-white focus:border-[#ff9c4b] focus:outline-none"
	                          >
	                            <option value="">Select time</option>
	                            {scheduleTimeOptions.map((time) => (
	                              <option key={time} value={time}>
	                                {time}
	                              </option>
	                            ))}
	                          </select>
	                        </div>
	                      </div>
	                    </div>
	                    <div>
	                      <div className="flex items-center justify-between">
	                        <label className="text-xs text-white/50">
	                          Commitment Length
	                        </label>
	                        <span className="text-[11px] text-white/50">
	                          Optional
	                        </span>
	                      </div>
	                      <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-white/5">
	                        {commitmentLengthOptions.map((option, index) => {
	                          const isSelected = roleDraft.commitmentLength === option;
	                          return (
	                            <label
	                              key={option}
	                              className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-xs text-white/80 transition hover:bg-white/5 ${
	                                index === commitmentLengthOptions.length - 1
	                                  ? ""
	                                  : "border-b border-white/10"
	                              }`}
	                            >
	                              <input
	                                type="checkbox"
	                                checked={isSelected}
	                                onChange={() =>
	                                  setRoleDraft((prev) => ({
	                                    ...prev,
	                                    commitmentLength: isSelected ? "" : option,
	                                  }))
	                                }
	                                className="h-4 w-4 accent-[#ff9c4b]"
	                              />
	                              <span className="text-white/80">{option}</span>
	                            </label>
	                          );
	                        })}
	                      </div>
	                    </div>
	                    <div>
	                      <label className="text-xs text-white/50">Location</label>
	                      <input
	                        type="text"
	                        value={roleDraft.location}
                        onChange={(event) =>
                          setRoleDraft((prev) => ({
                            ...prev,
                            location: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
                        placeholder="Montreal"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50">Address</label>
                      <input
                        type="text"
                        value={roleDraft.address}
                        onChange={(event) =>
                          setRoleDraft((prev) => ({
                            ...prev,
                            address: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
                        placeholder="123 Main St"
                      />
                    </div>
	                    <div>
	                      <div className="flex items-center justify-between">
	                        <label className="text-xs text-white/50">
	                          Key conditions
	                        </label>
	                        <span className="text-[11px] text-white/50">
	                          {roleDraft.conditions.length} items
	                        </span>
	                      </div>
	                      {roleDraft.conditions.length === 0 ? (
	                        <p className="mt-2 text-xs text-white/50">
	                          No conditions added yet.
	                        </p>
	                      ) : (
	                        <div className="mt-2 space-y-2">
	                          {roleDraft.conditions.map((condition, index) => (
	                            <div
	                              key={`${condition}-${index}`}
	                              className="flex items-center justify-between rounded-lg border border-white/10 bg-[#120626]/60 px-3 py-2"
	                            >
	                              <p className="text-xs text-white/80">
	                                {condition}
	                              </p>
	                              <button
	                                type="button"
	                                onClick={() => removeRoleCondition(index)}
	                                className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/60 transition hover:border-white/30 hover:text-white"
	                                aria-label="Remove condition"
	                              >
	                                ×
	                              </button>
	                            </div>
	                          ))}
	                        </div>
	                      )}
	                      <div className="mt-3 flex gap-2">
	                        <input
	                          type="text"
	                          value={roleConditionDraft}
	                          onChange={(event) =>
	                            setRoleConditionDraft(event.target.value)
	                          }
	                          onKeyDown={(event) => {
	                            if (event.key !== "Enter") return;
	                            event.preventDefault();
	                            addRoleCondition();
	                          }}
	                          placeholder="Add a condition..."
	                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
	                        />
	                        <button
	                          type="button"
	                          onClick={addRoleCondition}
	                          disabled={!roleConditionDraft.trim()}
	                          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
	                            roleConditionDraft.trim()
	                              ? "border border-white/20 text-white/90 hover:border-white/40 hover:bg-white/10"
	                              : "cursor-not-allowed border border-white/10 bg-white/5 text-white/40"
	                          }`}
	                        >
	                          Add
	                        </button>
	                      </div>
	                      <p className="mt-2 text-[11px] text-white/50">
	                        Conditions are displayed as key bullet points on the job card.
	                      </p>
	                    </div>
                    {roleError && (
                      <p className="text-xs text-amber-200">{roleError}</p>
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={closeRoleModal}
                      className="flex-1 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleSave("draft")}
                      className="flex-1 rounded-full border border-[#4fa5ff] px-4 py-2 text-xs font-semibold text-[#4fa5ff] transition hover:border-[#7cc7ff] hover:text-[#7cc7ff]"
                    >
                      Save draft
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleSave("publish")}
                      className="flex-1 rounded-full bg-[#ff9c4b] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#ffd08b]"
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </div>
            )}
            {applicantsRoleId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Applicants
                    </h3>
                    <button
                      type="button"
                      onClick={closeApplicantsModal}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-white/70">
                    {(applicantsByRole[applicantsRoleId] ?? []).length === 0 ? (
                      <p className="text-xs text-white/60">
                        No applicants yet.
                      </p>
                    ) : (
                      (applicantsByRole[applicantsRoleId] ?? []).map((applicant) => {
                        const isPending = applicant.status === "Pending";
                        return (
                          <div
                            key={applicant.id}
                            className="rounded-xl border border-white/10 bg-[#120626]/60 px-4 py-3"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {applicant.name}
                                </p>
                                <p className="text-xs text-white/60">
                                  Submitted {applicant.submitted}
                                </p>
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[applicant.status]}`}
                              >
                                {applicant.status}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedApplicant(applicant);
                                  setSelectedApplicantRoleId(applicantsRoleId);
                                }}
                                className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/40 hover:text-white"
                              >
                                View profile
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleApproveApplicant(applicantsRoleId, applicant.id)
                                }
                                disabled={!isPending}
                                className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                                  isPending
                                    ? "bg-[#271c70] text-white hover:bg-[#ff9c4b]"
                                    : "cursor-not-allowed border border-white/10 text-white/40"
                                }`}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeclineApplicant(applicantsRoleId, applicant.id)
                                }
                                disabled={!isPending}
                                className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                                  isPending
                                    ? "border-white/20 text-white/80 hover:border-white/40 hover:text-white"
                                    : "cursor-not-allowed border-white/10 text-white/40"
                                }`}
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
            {teamRoleId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                        Assigned team
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {teamRole?.title ?? "Team"}
                      </p>
                      {teamRole && (
                        <p className="text-xs text-white/60">
                          {teamRole.schedule} - {teamRole.location}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={closeTeamModal}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-white/70">
                    {teamMembers.length === 0 ? (
                      <p className="text-xs text-white/60">
                        No volunteers assigned yet.
                      </p>
                    ) : (
                      teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="rounded-xl border border-white/10 bg-[#120626]/60 px-4 py-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white/60">
                                {member.name
                                  .split(" ")
                                  .map((part) => part.charAt(0))
                                  .join("")}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {member.name}
                                </p>
                                <p className="text-xs text-white/60">
                                  {member.location}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${volunteerStatusTone[member.status]}`}
                            >
                              {member.status}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/60">
                            <span>Role: {member.role}</span>
                            <span>Last shift: {member.lastShift}</span>
                            <span>
                              Hours this month: {member.hoursThisMonth}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
            {selectedApplicant && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5">
                        <UserCircle
                          className="h-6 w-6 text-white/60"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {selectedApplicant.name}
                        </p>
                        <p className="text-sm text-white/70">
                          {selectedApplicant.role}
                        </p>
                        <p className="text-sm text-white/50">
                          {selectedApplicant.location}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[selectedApplicant.status]}`}
                    >
                      {selectedApplicant.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-white/70">
                    <p>
                      <span className="text-white/50">Availability:</span>{" "}
                      {selectedApplicant.availability}
                    </p>
                    <p>
                      <span className="text-white/50">Has a car:</span>{" "}
                      {selectedApplicant.hasCar ? "Yes" : "No"}
                    </p>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-white/60">
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        {selectedApplicant.email}
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        {selectedApplicant.phone}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                        Skills
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedApplicant.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                        Bio
                      </p>
                      <p className="mt-2 text-sm text-white/70">
                        {selectedApplicant.bio}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#120626]/60 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                          Message applicant
                        </p>
                        {isMessageSent && (
                          <span className="text-[10px] text-emerald-200">
                            Sent
                          </span>
                        )}
                      </div>
                      <textarea
                        value={messageDraft}
                        onChange={(event) => {
                          setMessageDraft(event.target.value);
                          setIsMessageSent(false);
                        }}
                        rows={3}
                        placeholder="Write a quick note..."
                        className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSendMessage}
                          className="rounded-full bg-[#271c70] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
                        >
                          Send message
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={closeApplicantProfile}
                      className="flex-1 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      Close
                    </button>
                    {selectedApplicantRoleId && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleApproveApplicant(
                              selectedApplicantRoleId,
                              selectedApplicant.id
                            )
                          }
                          disabled={selectedApplicant.status !== "Pending"}
                          className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition ${
                            selectedApplicant.status === "Pending"
                              ? "bg-[#271c70] text-white hover:bg-[#ff9c4b]"
                              : "cursor-not-allowed border border-white/10 text-white/40"
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeclineApplicant(
                              selectedApplicantRoleId,
                              selectedApplicant.id
                            )
                          }
                          disabled={selectedApplicant.status !== "Pending"}
                          className={`flex-1 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                            selectedApplicant.status === "Pending"
                              ? "border-white/20 text-white/80 hover:border-white/40 hover:text-white"
                              : "cursor-not-allowed border-white/10 text-white/40"
                          }`}
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            {roleToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Archive job?</h3>
                    <button
                      type="button"
                      onClick={closeDeleteRole}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-white/70">
                    This moves the job &quot;{roleToDelete.title}&quot; to Archived jobs.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={closeDeleteRole}
                      className="flex-1 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteRole}
                      className="flex-1 rounded-full bg-[#ff9c4b] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#ffd08b]"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      case "timesheets":
        return (
          <section className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-semibold text-[#4fa5ff]">
                Timesheet approvals
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <input
                  type="text"
                  value={timesheetSearch}
                  onChange={(event) => setTimesheetSearch(event.target.value)}
                  placeholder="Search by volunteer name..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none sm:w-72"
                />
                <button
                  type="button"
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/10"
                >
                  Export timesheets
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Submitted shifts
                  </h3>
                  <p className="text-xs text-white/60">
                    Auto-submitted from Volunteer HUB when volunteers clock off.
                  </p>
                </div>
                <span className="text-xs text-white/50">
                  {filteredPendingSubmittedShifts.length} awaiting approval
                </span>
              </div>
              {filteredPendingSubmittedShifts.length === 0 ? (
                <p className="text-xs text-white/60">
                  No submitted shifts awaiting approval.
                </p>
              ) : (
                filteredPendingSubmittedShifts.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                  >
	                    <div>
	                      <p className="text-sm font-semibold text-white">
	                        {entry.name}
	                      </p>
	                      <p className="text-xs text-white/60">{entry.role}</p>
	                      <p className="text-xs text-white/60">
	                        {entry.date} / {entry.start} - {entry.end}
	                      </p>
	                      {entry.submittedAt && (
	                        <p className="text-xs text-white/50">
	                          Submitted {entry.submittedAt}
	                        </p>
	                      )}
	                      {entry.overtimeNote && (
	                        <div className="mt-2 rounded-xl border border-white/10 bg-[#120626]/60 p-3 text-[11px] text-white/70">
	                          <span className="font-semibold text-white/80">
	                            Overtime note:
	                          </span>{" "}
	                          {entry.overtimeNote}
	                        </div>
	                      )}
	                    </div>
	                    <div className="flex flex-wrap items-center gap-3">
	                      <div className="flex flex-col items-end gap-0.5">
	                        <span className="text-sm font-semibold text-white">
	                          {entry.total}
	                        </span>
	                        {typeof entry.overtimeSeconds === "number" &&
	                          entry.overtimeSeconds > 0 && (
	                            <span className="text-[11px] text-white/60">
	                              Work{" "}
	                              {formatDuration(
	                                typeof entry.regularSeconds === "number"
	                                  ? entry.regularSeconds
	                                  : Math.max(
	                                      0,
	                                      (entry.totalSeconds ?? 0) -
	                                        entry.overtimeSeconds
	                                    )
	                              )}{" "}
	                              <span className="text-white/30">•</span>{" "}
	                              <span className="text-[#ff9c4b]">
	                                OT +{formatDuration(entry.overtimeSeconds)}
	                              </span>
	                            </span>
	                          )}
	                      </div>
	                      <span
	                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[entry.status]}`}
	                      >
	                        {entry.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => approveTimesheet(entry, "submitted")}
                        className="rounded-full bg-[#271c70] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openTimesheetProfile(entry.name, entry.role)
                        }
                        className="rounded-full border border-white/20 p-2 text-white/80 transition hover:border-white/40 hover:text-white"
                        aria-label="View profile"
                      >
                        <UserCircle className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openTimesheetMessage(entry.name, entry.role)
                        }
                        className="rounded-full border border-white/20 p-2 text-white/80 transition hover:border-white/40 hover:text-white"
                        aria-label="Send message"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Recent timesheets
                </h3>
                <span className="text-xs text-white/50">Last 7 days</span>
              </div>
              {filteredPendingTimeEntries.length === 0 ? (
                <p className="text-xs text-white/60">
                  No recent timesheets awaiting approval.
                </p>
              ) : (
                filteredPendingTimeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                  >
	                    <div>
	                      <p className="text-sm font-semibold text-white">
	                        {entry.name}
	                      </p>
	                      <p className="text-xs text-white/60">{entry.role}</p>
	                      <p className="text-xs text-white/60">
	                        {entry.date} / {entry.start} - {entry.end}
	                      </p>
	                      {entry.overtimeNote && (
	                        <div className="mt-2 rounded-xl border border-white/10 bg-[#120626]/60 p-3 text-[11px] text-white/70">
	                          <span className="font-semibold text-white/80">
	                            Overtime note:
	                          </span>{" "}
	                          {entry.overtimeNote}
	                        </div>
	                      )}
	                    </div>
	                    <div className="flex flex-wrap items-center gap-3">
	                      <div className="flex flex-col items-end gap-0.5">
	                        <span className="text-sm font-semibold text-white">
	                          {entry.total}
	                        </span>
	                        {typeof entry.overtimeSeconds === "number" &&
	                          entry.overtimeSeconds > 0 && (
	                            <span className="text-[11px] text-white/60">
	                              Work{" "}
	                              {formatDuration(
	                                typeof entry.regularSeconds === "number"
	                                  ? entry.regularSeconds
	                                  : Math.max(
	                                      0,
	                                      (entry.totalSeconds ?? 0) -
	                                        entry.overtimeSeconds
	                                    )
	                              )}{" "}
	                              <span className="text-white/30">•</span>{" "}
	                              <span className="text-[#ff9c4b]">
	                                OT +{formatDuration(entry.overtimeSeconds)}
	                              </span>
	                            </span>
	                          )}
	                      </div>
	                      <span
	                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[entry.status]}`}
	                      >
	                        {entry.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => approveTimesheet(entry, "recent")}
                        className="rounded-full bg-[#271c70] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openTimesheetProfile(entry.name, entry.role)
                        }
                        className="rounded-full border border-white/20 p-2 text-white/80 transition hover:border-white/40 hover:text-white"
                        aria-label="View profile"
                      >
                        <UserCircle className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openTimesheetMessage(entry.name, entry.role)
                        }
                        className="rounded-full border border-white/20 p-2 text-white/80 transition hover:border-white/40 hover:text-white"
                        aria-label="Send message"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowArchivedTimesheets((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
              >
                <span>Archived timesheets</span>
                <span className="flex items-center gap-2 text-xs text-white/60">
                  {filteredArchivedTimesheets.length} archived
                  {showArchivedTimesheets ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
              </button>
              {showArchivedTimesheets && (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredArchivedTimesheets.length === 0 ? (
                    <p className="text-xs text-white/60">
                      No archived timesheets yet.
                    </p>
                  ) : (
                    filteredArchivedTimesheets.map((entry) => (
	                      <div
	                        key={entry.id}
	                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
	                      >
	                        <div>
	                          <p className="text-sm font-semibold text-white">
	                            {entry.name}
	                          </p>
	                          <p className="text-xs text-white/60">{entry.role}</p>
	                          <p className="text-xs text-white/60">
	                            {entry.date} / {entry.start} - {entry.end}
	                          </p>
	                          <p className="mt-1 text-[11px] text-white/50">
	                            Approved {entry.archivedAt}
	                          </p>
	                          {entry.overtimeNote && (
	                            <div className="mt-2 rounded-xl border border-white/10 bg-[#120626]/60 p-3 text-[11px] text-white/70">
	                              <span className="font-semibold text-white/80">
	                                Overtime note:
	                              </span>{" "}
	                              {entry.overtimeNote}
	                            </div>
	                          )}
	                        </div>
	                        <div className="flex flex-wrap items-center gap-3">
	                          <div className="flex flex-col items-end gap-0.5">
	                            <span className="text-sm font-semibold text-white">
	                              {entry.total}
	                            </span>
	                            {typeof entry.overtimeSeconds === "number" &&
	                              entry.overtimeSeconds > 0 && (
	                                <span className="text-[11px] text-white/60">
	                                  Work{" "}
	                                  {formatDuration(
	                                    typeof entry.regularSeconds === "number"
	                                      ? entry.regularSeconds
	                                      : Math.max(
	                                          0,
	                                          (entry.totalSeconds ?? 0) -
	                                            entry.overtimeSeconds
	                                        )
	                                  )}{" "}
	                                  <span className="text-white/30">•</span>{" "}
	                                  <span className="text-[#ff9c4b]">
	                                    OT +{formatDuration(entry.overtimeSeconds)}
	                                  </span>
	                                </span>
	                              )}
	                          </div>
	                          <span
	                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[entry.status]}`}
	                          >
	                            {entry.status}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              openTimesheetProfile(entry.name, entry.role)
                            }
                            className="rounded-full border border-white/20 p-2 text-white/80 transition hover:border-white/40 hover:text-white"
                            aria-label="View profile"
                          >
                            <UserCircle className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openTimesheetMessage(entry.name, entry.role)
                            }
                            className="rounded-full border border-white/20 p-2 text-white/80 transition hover:border-white/40 hover:text-white"
                            aria-label="Send message"
                          >
                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </section>
        );
      case "calendar":
        return (
          <section id="calendar-root" className="space-y-8">
            <div className="space-y-2">
              {calendarDepartmentId && (
                <a
                  href="#calendar-root"
                  onClick={(event) => {
                    event.preventDefault();
                    setCalendarDepartmentId(null);
                  }}
                  className="inline-flex items-center text-xs font-semibold text-white/70 transition hover:text-[#7cc9ff]"
                >
                  &larr; Root / departments
                </a>
              )}
              <div>
                <h2 className="text-2xl font-semibold text-[#4fa5ff]">
                  Calendar
                </h2>
              </div>
            </div>

            {!calendarDepartmentId ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Projects / departments
                    </h3>
                    <p className="text-xs text-white/60">
                      Select a department to manage all calendar views for its jobs.
                    </p>
                  </div>
                  <span className="text-xs text-white/50">
                    {Math.max(0, calendarDepartmentGroups.length - 1)} departments
                  </span>
                </div>

                {roleList.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <p className="text-sm font-semibold text-white">
                      No jobs yet.
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                      Add a job first, then group it inside a department.
                    </p>
                    <button
                      type="button"
                      onClick={openAddRole}
                      className="mt-4 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/10"
                    >
                      Add a job
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {calendarDepartmentGroups.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => setCalendarDepartmentId(group.id)}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-white/30 hover:bg-white/10"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {group.label}
                            </p>
                            <p className="mt-2 text-xs text-white/60">
                              {group.roles.length} jobs
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/60">
                          <span className="inline-flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-white/40" aria-hidden="true" />
                            {group.roles.length} jobs
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
	            ) : (
	              <div className="space-y-4">
	                <div className="rounded-2xl border border-sky-300/20 bg-[#0a102b]/70 bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-indigo-500/20 p-5">
	                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
	                    Department
	                  </p>
	                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
	                    <div>
	                      <h3 className="text-xl font-semibold text-white">
	                        {selectedCalendarDepartment?.label ?? "Department"}
	                      </h3>
	                      <div className="mt-2 flex flex-wrap gap-2">
	                        {calendarScopedRoles.some(
	                          (role) => role.targets.volunteer
	                        ) && (
	                          <span className="rounded-full border border-sky-200/40 bg-sky-500/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-50">
	                            Volunteer
	                          </span>
	                        )}
	                        {calendarScopedRoles.some(
	                          (role) => role.targets.student
	                        ) && (
	                          <span className="rounded-full border border-indigo-200/40 bg-indigo-500/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-50">
	                            Student
	                          </span>
	                        )}
	                      </div>
	                      <p className="mt-1 text-xs text-white/60">
	                        {calendarScopedRoles.length} jobs
	                      </p>
	                    </div>
	                  </div>
	                </div>

                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                      <div className="flex flex-col gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Shift planner
                          </h3>
                          <p className="mt-1 text-xs text-white/60">
                            Plan and assign shifts up to 4 weeks ahead. Default is
                            manager assigned; optionally allow volunteers to claim open
                            slots.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex rounded-full border border-white/20 p-0.5">
                            <button
                              type="button"
                              onClick={() => setShiftPlannerScope("organization")}
                              className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                                shiftPlanner.scope === "organization"
                                  ? "rounded-full bg-[#ff9c4b] text-black"
                                  : "text-white/70 hover:text-white"
                              }`}
                            >
                              Department
                            </button>
                            <button
                              type="button"
                              onClick={() => setShiftPlannerScope("job")}
                              className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                                shiftPlanner.scope === "job"
                                  ? "rounded-full bg-[#ff9c4b] text-black"
                                  : "text-white/70 hover:text-white"
                              }`}
                            >
                              Job
                            </button>
                          </div>

                          <select
                            value={shiftPlannerWeekStart}
                            onChange={(event) =>
                              setShiftPlannerWeekStart(event.target.value)
                            }
                            className="rounded-full border border-white/20 bg-[#120626]/60 px-4 py-2 text-xs font-semibold text-white/80 focus:border-[#ff9c4b] focus:outline-none"
                            aria-label="Select week"
                          >
                            {shiftPlannerWeekOptions.map((week) => (
                              <option key={week.id} value={week.id}>
                                {week.label}
                              </option>
                            ))}
                          </select>

                          {shiftPlanner.scope === "job" && (
                            <select
                              value={shiftPlanner.selectedRoleId ?? ""}
                              onChange={(event) =>
                                setShiftPlannerSelectedRole(event.target.value)
                              }
                              className="rounded-full border border-white/20 bg-[#120626]/60 px-4 py-2 text-xs font-semibold text-white/80 focus:border-[#ff9c4b] focus:outline-none"
                              aria-label="Select job"
                            >
                              {calendarScopedRoles.length === 0 ? (
                                <option value="">No jobs</option>
                              ) : (
                                calendarScopedRoles.map((role) => (
                                  <option key={role.id} value={role.id}>
                                    {role.title}
                                  </option>
                                ))
                              )}
                            </select>
                          )}

                          <button
                            type="button"
                            onClick={toggleShiftPlannerClaim}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                              shiftPlanner.claimEnabled
                                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
                                : "border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:text-white"
                            }`}
                            aria-pressed={shiftPlanner.claimEnabled}
                          >
                            Claim: {shiftPlanner.claimEnabled ? "On" : "Off"}
                          </button>

                          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70">
                            <span>Slots</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateShiftPlannerSlotsCount(shiftPlanner.slotsCount - 1)
                              }
                              className="rounded-full border border-white/20 px-2 py-0.5 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
                              aria-label="Decrease slots"
                            >
                              -
                            </button>
                            <span className="min-w-[1.5rem] text-center text-white">
                              {shiftPlanner.slotsCount}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateShiftPlannerSlotsCount(shiftPlanner.slotsCount + 1)
                              }
                              className="rounded-full border border-white/20 px-2 py-0.5 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
                              aria-label="Increase slots"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={generateShiftPlannerFromRoleSchedule}
                            disabled={
                              shiftPlanner.scope !== "job" || !shiftPlanner.selectedRoleId
                            }
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                              shiftPlanner.scope === "job" && shiftPlanner.selectedRoleId
                                ? "bg-[#271c70] text-white hover:bg-[#ff9c4b]"
                                : "cursor-not-allowed border border-white/10 text-white/40"
                            }`}
                          >
                            Generate
                          </button>

                          <button
                            type="button"
                            onClick={copyShiftPlannerWeekToNext}
                            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                          >
                            Copy week
                          </button>

                          <button
                            type="button"
                            onClick={toggleShiftPlannerPublishWeek}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                              shiftPlannerWeekPublished
                                ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
                                : "bg-[#271c70] text-white hover:bg-[#ff9c4b]"
                            }`}
                          >
                            {shiftPlannerWeekPublished ? "Published" : "Publish"}
                          </button>

                          <button
                            type="button"
                            onClick={confirmShiftPlannerChanges}
                            disabled={!hasUnconfirmedShiftPlannerChanges}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                              hasUnconfirmedShiftPlannerChanges
                                ? "border-[#ff9c4b]/60 bg-[#ff9c4b]/15 text-white hover:border-[#7cc9ff] hover:bg-[#4fa5ff]/15"
                                : "cursor-not-allowed border-white/10 bg-white/5 text-white/40"
                            }`}
                          >
                            {hasUnconfirmedShiftPlannerChanges
                              ? "Confirm changes"
                              : "Changes confirmed"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setShiftPlannerPreviewOpen(true)}
                            className="rounded-full border border-sky-300/40 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-500/20"
                          >
                            Aperçu
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/60">
                          {shiftPlannerLastConfirmedLabel ? (
                            <span>Last confirmation: {shiftPlannerLastConfirmedLabel}</span>
                          ) : (
                            <span>No confirmation sent yet.</span>
                          )}
                          {shiftPlannerConfirmFeedback && (
                            <span
                              className={`rounded-full px-2.5 py-1 font-semibold ${
                                shiftPlannerConfirmFeedback.tone === "success"
                                  ? "bg-emerald-500/15 text-emerald-100"
                                  : shiftPlannerConfirmFeedback.tone === "error"
                                    ? "bg-rose-500/15 text-rose-100"
                                    : "bg-white/10 text-white/80"
                              }`}
                            >
                              {shiftPlannerConfirmFeedback.text}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {shiftPlannerError && (
                      <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                        {shiftPlannerError}
                      </div>
                    )}

                    <div className="grid gap-3">
                      {scheduleDayOptions.map((day, index) => {
                        const dateIso = addDaysToISODate(shiftPlannerWeekStart, index);
                        const date = parseLocalISODate(dateIso);
                        const dayShifts = shiftPlannerShiftsByDay[day.id] ?? [];
                        const isAddOpen = shiftPlannerAddDay === day.id;
                        const allowAddShift =
                          calendarScopedRoles.length > 0 &&
                          (shiftPlanner.scope !== "job" || dayShifts.length < 3);
                        return (
                          <div
                            key={day.id}
                            className="rounded-2xl border border-white/10 bg-white/5 p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                  {day.label}
                                </p>
                                <p className="text-sm font-semibold text-white">
                                  {date
                                    ? date.toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : dateIso}
                                </p>
                              </div>
                              <span className="text-xs text-white/50">
                                {dayShifts.length} shifts
                              </span>
                            </div>

                            <div className="mt-2 space-y-2">
                              {dayShifts.length === 0 ? (
                                <p className="text-xs text-white/60">
                                  No shifts yet.
                                </p>
                              ) : (
                                dayShifts.map((shift) => {
                                  const roleTitle =
                                    roleTitleLookup.get(shift.roleId) ?? "Job";
                                  const assignedAssignments = shift.assignments.filter(
                                    (assignment): assignment is ShiftPlannerAssignment =>
                                      assignment !== null
                                  );
                                  const assignedCount = assignedAssignments.length;
                                  const totalSlots = shift.assignments.length;
                                  const openCount = Math.max(totalSlots - assignedCount, 0);
                                  return (
                                    <div
                                      key={shift.id}
                                      className="cursor-pointer rounded-xl border border-white/10 bg-[#120626]/60 p-2 transition hover:border-white/25 hover:bg-[#120626]/75"
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => openShiftPlannerAssignForWeek(shift.id)}
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                          event.preventDefault();
                                          openShiftPlannerAssignForWeek(shift.id);
                                        }
                                      }}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <p className="text-xs font-semibold text-white">
                                            {shift.start}-{shift.end}
                                          </p>
                                          <p className="mt-1 truncate text-xs text-white/70">
                                            {roleTitle}
                                          </p>
                                          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/60">
                                            <span>{assignedCount}/{totalSlots} assigned</span>
                                            <span>{openCount} open</span>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            removeShiftPlannerShift(shift.id);
                                          }}
                                          className="rounded-full border border-white/20 p-1.5 text-white/70 transition hover:border-white/40 hover:text-white"
                                          aria-label="Remove shift"
                                        >
                                          <Trash2
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                          />
                                        </button>
                                      </div>
                                      {assignedAssignments.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                          {assignedAssignments.slice(0, 3).map((assignment) => (
                                            <span
                                              key={`${shift.id}-${assignment.name}`}
                                              className="rounded-full border border-sky-300/40 bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-100"
                                            >
                                              {assignment.name}
                                            </span>
                                          ))}
                                          {assignedAssignments.length > 3 && (
                                            <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                                              +{assignedAssignments.length - 3}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            <div className="mt-2.5">
                              {isAddOpen ? (
                                <div className="rounded-xl border border-white/10 bg-[#120626]/60 p-2.5">
                                  <div className="grid gap-2">
                                    <div className="grid gap-2 sm:grid-cols-2">
                                      <label className="space-y-0.5">
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                                          Start
                                        </span>
                                        <input
                                          type="time"
                                          value={shiftPlannerAddStart}
                                          onChange={(event) =>
                                            setShiftPlannerAddStart(event.target.value)
                                          }
                                          className="w-full rounded-lg border border-white/10 bg-[#080313]/40 px-2.5 py-1.5 text-[11px] text-white focus:border-[#ff9c4b] focus:outline-none"
                                        />
                                      </label>
                                      <label className="space-y-0.5">
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                                          End
                                        </span>
                                        <input
                                          type="time"
                                          value={shiftPlannerAddEnd}
                                          onChange={(event) =>
                                            setShiftPlannerAddEnd(event.target.value)
                                          }
                                          className="w-full rounded-lg border border-white/10 bg-[#080313]/40 px-2.5 py-1.5 text-[11px] text-white focus:border-[#ff9c4b] focus:outline-none"
                                        />
                                      </label>
                                    </div>

                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={cancelShiftPlannerAddShift}
                                        className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={addShiftPlannerShift}
                                        className="rounded-full bg-[#271c70] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
                                      >
                                        Add shift
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openShiftPlannerAddShift(day.id)}
                                  disabled={!allowAddShift}
                                  className={`w-full rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                    allowAddShift
                                      ? "border border-white/20 text-white/80 hover:border-white/40 hover:bg-white/10 hover:text-white"
                                      : "cursor-not-allowed border border-white/10 text-white/40"
                                  }`}
                                >
                                  Add shift
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {shiftPlannerPreviewOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
                <div className="w-full max-w-6xl max-h-[88vh] overflow-y-auto cfoc-scrollbar rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">Aperçu planning</h3>
                      <p className="text-xs text-white/60">
                        Vue lecture seule. Les shifts ne sont pas modifiables ici.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShiftPlannerPreviewOpen(false)}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-full border border-white/20 p-0.5">
                      <button
                        type="button"
                        onClick={() => setShiftPlannerPreviewMode("weeks")}
                        className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                          shiftPlannerPreviewMode === "weeks"
                            ? "rounded-full bg-[#ff9c4b] text-black"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        Semaines
                      </button>
                      <button
                        type="button"
                        onClick={() => setShiftPlannerPreviewMode("month")}
                        className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                          shiftPlannerPreviewMode === "month"
                            ? "rounded-full bg-[#ff9c4b] text-black"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        Mois
                      </button>
                    </div>

                    {shiftPlannerPreviewMode === "weeks" && (
                      <select
                        value={shiftPlannerPreviewWeeks}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          setShiftPlannerPreviewWeeks(
                            Number.isFinite(value) ? clampNumber(value, 1, 4) : 2
                          );
                        }}
                        className="rounded-full border border-white/20 bg-[#120626]/60 px-4 py-2 text-xs font-semibold text-white/80 focus:border-[#ff9c4b] focus:outline-none"
                        aria-label="Select weeks preview range"
                      >
                        <option value={1}>1 week</option>
                        <option value={2}>2 weeks</option>
                        <option value={3}>3 weeks</option>
                        <option value={4}>4 weeks</option>
                      </select>
                    )}

                    <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70">
                      {shiftPlannerPreviewLabel}
                    </span>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <div className="min-w-[980px] rounded-2xl border border-white/10 bg-[#120626]/50 p-3">
                      <div className="grid grid-cols-7 gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                        {scheduleDayOptions.map((day) => (
                          <div key={`preview-header-${day.id}`}>{day.label}</div>
                        ))}
                      </div>
                      <div className="mt-2 space-y-2">
                        {shiftPlannerPreviewRows.map((week, weekIndex) => (
                          <div
                            key={`preview-week-${weekIndex}`}
                            className="grid grid-cols-7 gap-2"
                          >
                            {week.map((cell) => {
                              const dayShifts =
                                shiftPlannerShiftsByDate.get(cell.isoDate) ?? [];
                              const assignedCount = dayShifts.reduce(
                                (total, shift) =>
                                  total +
                                  shift.assignments.filter(
                                    (assignment) => assignment !== null
                                  ).length,
                                0
                              );
                              const totalSlots = dayShifts.reduce(
                                (total, shift) => total + shift.assignments.length,
                                0
                              );
                              return (
                                <div
                                  key={cell.isoDate}
                                  className={`min-h-[140px] rounded-xl border p-2 ${
                                    shiftPlannerPreviewMode === "month" &&
                                    !cell.isInCurrentMonth
                                      ? "border-white/5 bg-[#080313]/20 text-white/40"
                                      : "border-white/10 bg-[#080313]/35"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-[11px] font-semibold text-white/80">
                                      {cell.date.toLocaleDateString(undefined, {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                    </p>
                                    <span className="text-[10px] text-white/45">
                                      {dayShifts.length} shift
                                      {dayShifts.length > 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  {dayShifts.length > 0 ? (
                                    <>
                                      <p className="mt-1 text-[10px] text-white/55">
                                        {assignedCount}/{totalSlots} assigned
                                      </p>
                                      <div className="mt-1.5 space-y-1">
                                        {dayShifts.slice(0, 3).map((shift) => {
                                          const shiftAssigned = shift.assignments.filter(
                                            (assignment) => assignment !== null
                                          ).length;
                                          const roleTitle =
                                            roleTitleLookup.get(shift.roleId) ?? "Job";
                                          return (
                                            <div
                                              key={`preview-${shift.id}`}
                                              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1"
                                            >
                                              <p className="text-[10px] font-semibold text-white/85">
                                                {shift.start}-{shift.end}
                                              </p>
                                              <p className="truncate text-[10px] text-white/60">
                                                {roleTitle}
                                              </p>
                                              <p className="text-[10px] text-white/50">
                                                {shiftAssigned}/{shift.assignments.length} assigned
                                              </p>
                                            </div>
                                          );
                                        })}
                                        {dayShifts.length > 3 && (
                                          <p className="text-[10px] text-white/45">
                                            +{dayShifts.length - 3} more
                                          </p>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <p className="mt-2 text-[10px] text-white/40">No shifts</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {shiftPlannerAssignSlot && (() => {
              const shift =
                shiftPlanner.shifts.find(
                  (item) => item.id === shiftPlannerAssignSlot.shiftId
                ) ?? null;
              if (!shift) return null;
              const dayLabel =
                scheduleDayOptions.find((day) => day.id === shift.day)?.label ??
                shift.day;
              const roleTitle = roleTitleLookup.get(shift.roleId) ?? "Job";
              const slotLabel = `Volunteer ${shiftPlannerAssignSlot.slotIndex + 1}`;
              const currentAssignment =
                shift.assignments[shiftPlannerAssignSlot.slotIndex] ?? null;
              const assignedCount = shift.assignments.filter(
                (assignment) => assignment !== null
              ).length;

              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
                  <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto cfoc-scrollbar rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold">Assign volunteer</h3>
                      <button
                        type="button"
                        onClick={closeShiftPlannerAssign}
                        className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                      >
                        Close
                      </button>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                        Shift
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {roleTitle}
                      </p>
                      <p className="mt-1 text-xs text-white/60">
                        {dayLabel} · {shift.start}-{shift.end} · {slotLabel}
                      </p>
                      <p className="mt-1 text-[11px] text-white/50">
                        {assignedCount}/{shift.assignments.length} assigned
                      </p>
                    </div>

                    <div className="mt-4">
                      <label className="text-xs text-white/50">Search</label>
                      <input
                        type="text"
                        value={shiftPlannerVolunteerQuery}
                        onChange={(event) =>
                          setShiftPlannerVolunteerQuery(event.target.value)
                        }
                        placeholder="Search volunteers..."
                        className="mt-2 w-full rounded-lg border border-white/10 bg-[#080313]/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
                      />
                    </div>

                    <div className="mt-4 space-y-2">
                      {shiftPlannerFilteredVolunteers.length === 0 ? (
                        <p className="text-xs text-white/60">
                          No volunteers found.
                        </p>
                      ) : (
                        shiftPlannerFilteredVolunteers.map((volunteer) => {
                          const isSelected =
                            currentAssignment?.name === volunteer.name;
                          return (
                            <button
                              key={volunteer.id}
                              type="button"
                              onClick={() => assignShiftPlannerVolunteer(volunteer)}
                              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                                isSelected
                                  ? "border-emerald-400/40 bg-emerald-500/10"
                                  : "border-white/10 bg-[#120626]/60 hover:border-white/20 hover:bg-[#120626]/80"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-white">
                                    {volunteer.name}
                                  </p>
                                  <p className="truncate text-xs text-white/60">
                                    {volunteer.role}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${volunteerAudienceTone[volunteer.audience]}`}
                                  >
                                    {volunteerAudienceLabel[volunteer.audience]}
                                  </span>
                                  {isSelected && (
                                    <CheckCircle2
                                      className="h-4 w-4 text-emerald-300"
                                      aria-hidden="true"
                                    />
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={clearShiftPlannerAssignment}
                        className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
                      >
                        Clear slot
                      </button>
                      <button
                        type="button"
                        onClick={closeShiftPlannerAssign}
                        className="rounded-full bg-[#271c70] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {sampleCalendarModal.mode && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
                <div className="w-full max-w-5xl max-h-[85vh] overflow-y-auto cfoc-scrollbar rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold">
                      {sampleCalendarModal.mode === "add"
                        ? "New sample calendar"
                        : "Edit sample calendar"}
                    </h3>
                    <button
                      type="button"
                      onClick={closeSampleCalendarModal}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  {sampleCalendarError && (
                    <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {sampleCalendarError}
                    </div>
                  )}

                  <div className="mt-6 grid gap-6 md:grid-cols-[360px_1fr]">
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs text-white/50">Title</label>
                        <input
                          type="text"
                          value={sampleCalendarDraft.title}
                          onChange={(event) =>
                            setSampleCalendarDraft((prev) => ({
                              ...prev,
                              title: event.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
                          placeholder="Sample schedule"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-white/50">
                            Link to job(s)
                          </label>
                          <span className="text-[11px] text-white/50">
                            {sampleCalendarDraft.roleIds.length} selected
                          </span>
                        </div>
                        <div className="mt-2 max-h-44 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-[#120626]/60 p-3 cfoc-scrollbar">
                          {sampleCalendarRoleOptions.map((role) => {
                            const isSelected =
                              sampleCalendarDraft.roleIds.includes(role.id);
                            return (
                              <label
                                key={role.id}
                                className="flex cursor-pointer items-center gap-2 text-xs text-white/80"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSampleCalendarRole(role.id)}
                                  className="h-4 w-4 accent-[#ff9c4b]"
                                />
                                <span className="min-w-0 truncate">{role.title}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-white/50">
                            Volunteer columns
                          </label>
                          <span className="text-[11px] text-white/50">
                            {sampleCalendarDraft.slots.length}/5
                          </span>
                        </div>
                        <div className="mt-2 space-y-2">
                          {sampleCalendarDraft.slots.map((slot) => (
                            <div
                              key={slot.id}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                value={slot.label}
                                onChange={(event) =>
                                  updateSampleCalendarSlotLabel(
                                    slot.id,
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
                                placeholder="Volunteer"
                              />
                              <button
                                type="button"
                                onClick={() => removeSampleCalendarSlot(slot.id)}
                                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={addSampleCalendarSlot}
                          disabled={sampleCalendarDraft.slots.length >= 5}
                          className="mt-3 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Add volunteer
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-white/50">Shifts</label>
                          <span className="text-[11px] text-white/50">
                            Max 3 per day
                          </span>
                        </div>
                        <div className="mt-2 flex flex-col gap-2 rounded-xl border border-white/10 bg-[#120626]/60 p-3">
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              value={sampleShiftDay}
                              onChange={(event) =>
                                setSampleShiftDay(event.target.value as ScheduleDayId)
                              }
                              className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white focus:border-[#ff9c4b] focus:outline-none"
                            >
                              {scheduleDayOptions.map((day) => (
                                <option key={day.id} value={day.id}>
                                  {day.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="time"
                              value={sampleShiftStart}
                              onChange={(event) => setSampleShiftStart(event.target.value)}
                              className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white focus:border-[#ff9c4b] focus:outline-none"
                            />
                            <input
                              type="time"
                              value={sampleShiftEnd}
                              onChange={(event) => setSampleShiftEnd(event.target.value)}
                              className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white focus:border-[#ff9c4b] focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={addSampleCalendarShift}
                            className="rounded-full bg-[#271c70] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
                          >
                            Add shift
                          </button>
                        </div>

                        {sampleCalendarDraft.shifts.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {sampleCalendarDraft.shifts
                              .slice()
                              .sort((a, b) => {
                                const dayIndex =
                                  scheduleDayOptions.findIndex(
                                    (day) => day.id === a.day
                                  ) -
                                  scheduleDayOptions.findIndex(
                                    (day) => day.id === b.day
                                  );
                                if (dayIndex !== 0) return dayIndex;
                                const aTime = parseClockMinutes(a.start) ?? 0;
                                const bTime = parseClockMinutes(b.start) ?? 0;
                                return aTime - bTime;
                              })
                              .map((shift) => (
                                <div
                                  key={shift.id}
                                  className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                                >
                                  <select
                                    value={shift.day}
                                    onChange={(event) => {
                                      const nextDay = event.target
                                        .value as ScheduleDayId;
                                      setSampleCalendarDraft((prev) => {
                                        const nextShifts = prev.shifts.map((row) =>
                                          row.id === shift.id
                                            ? { ...row, day: nextDay }
                                            : row
                                        );
                                        const countForDay = nextShifts.filter(
                                          (row) => row.day === nextDay
                                        ).length;
                                        if (countForDay > 3) return prev;
                                        return { ...prev, shifts: nextShifts };
                                      });
                                    }}
                                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:border-[#ff9c4b] focus:outline-none"
                                  >
                                    {scheduleDayOptions.map((day) => (
                                      <option key={day.id} value={day.id}>
                                        {day.label}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="time"
                                    value={shift.start}
                                    onChange={(event) =>
                                      setSampleCalendarDraft((prev) => ({
                                        ...prev,
                                        shifts: prev.shifts.map((row) =>
                                          row.id === shift.id
                                            ? { ...row, start: event.target.value }
                                            : row
                                        ),
                                      }))
                                    }
                                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:border-[#ff9c4b] focus:outline-none"
                                  />
                                  <input
                                    type="time"
                                    value={shift.end}
                                    onChange={(event) =>
                                      setSampleCalendarDraft((prev) => ({
                                        ...prev,
                                        shifts: prev.shifts.map((row) =>
                                          row.id === shift.id
                                            ? { ...row, end: event.target.value }
                                            : row
                                        ),
                                      }))
                                    }
                                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:border-[#ff9c4b] focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeSampleCalendarShift(shift.id)}
                                    className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          type="button"
                          onClick={closeSampleCalendarModal}
                          className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveSampleCalendar}
                          className="rounded-full bg-[#ff9c4b] px-5 py-2 text-xs font-semibold text-black transition hover:bg-[#ffd08b]"
                        >
                          Save calendar
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">
                          Preview grid
                        </p>
                        <span className="text-[11px] text-white/50">
                          Click cells to toggle assignments
                        </span>
                      </div>

                      {sampleCalendarDraft.slots.length === 0 ||
                      sampleCalendarDraft.shifts.length === 0 ? (
                        <p className="mt-4 text-sm text-white/60">
                          Add at least one volunteer and one shift to see the grid.
                        </p>
                      ) : (
                        <div className="mt-4 overflow-x-auto">
                          {(() => {
                            const sortedShifts = sampleCalendarDraft.shifts
                              .slice()
                              .sort((a, b) => {
                                const dayIndex =
                                  scheduleDayOptions.findIndex(
                                    (day) => day.id === a.day
                                  ) -
                                  scheduleDayOptions.findIndex(
                                    (day) => day.id === b.day
                                  );
                                if (dayIndex !== 0) return dayIndex;
                                const aTime = parseClockMinutes(a.start) ?? 0;
                                const bTime = parseClockMinutes(b.start) ?? 0;
                                return aTime - bTime;
                              });

                            const shiftGroups = scheduleDayOptions
                              .map((day) => ({
                                day,
                                shifts: sortedShifts.filter((shift) => shift.day === day.id),
                              }))
                              .filter((group) => group.shifts.length > 0);

                            const gridTemplateColumns = `minmax(170px, 1fr) repeat(${sampleCalendarDraft.slots.length}, minmax(84px, 1fr))`;

                            return (
                              <div className="min-w-[720px] space-y-4">
                                <div
                                  className="grid gap-2 px-1"
                                  style={{ gridTemplateColumns }}
                                >
                                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                                    Shift
                                  </div>
                                  {sampleCalendarDraft.slots.map((slot) => (
                                    <div
                                      key={slot.id}
                                      className="px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50"
                                    >
                                      {slot.label}
                                    </div>
                                  ))}
                                </div>

                                <div className="space-y-3">
                                  {shiftGroups.map((group) => (
                                    <div
                                      key={group.day.id}
                                      className="rounded-2xl border border-white/10 bg-[#120626]/40 p-3"
                                    >
                                      <div className="flex items-center justify-between px-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                                          {group.day.label}
                                        </p>
                                        <p className="text-[11px] text-white/40">
                                          {group.shifts.length} shifts
                                        </p>
                                      </div>

                                      <div className="mt-2 space-y-2">
                                        {group.shifts.map((shift) => (
                                          <div
                                            key={shift.id}
                                            className="grid overflow-hidden rounded-xl border border-white/10 bg-[#120626]/60"
                                            style={{ gridTemplateColumns }}
                                          >
                                            <div className="border-r border-white/10 px-3 py-2 text-xs text-white/80">
                                              {shift.start}-{shift.end}
                                            </div>

                                            {sampleCalendarDraft.slots.map((slot, index) => {
                                              const isAssigned =
                                                shift.assignedSlotIds.includes(slot.id);
                                              const isLast =
                                                index ===
                                                sampleCalendarDraft.slots.length - 1;
                                              return (
                                                <div
                                                  key={`${shift.id}-${slot.id}`}
                                                  className={`flex items-center justify-center px-2 py-2 ${
                                                    isLast
                                                      ? ""
                                                      : "border-r border-white/10"
                                                  }`}
                                                >
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      toggleSampleCalendarAssignment(
                                                        shift.id,
                                                        slot.id
                                                      )
                                                    }
                                                    className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition ${
                                                      isAssigned
                                                        ? "border-emerald-300/40 bg-emerald-500/15 text-emerald-200"
                                                        : "border-white/10 bg-white/5 text-white/40 hover:border-white/25 hover:text-white/70"
                                                    }`}
                                                    aria-label={
                                                      isAssigned
                                                        ? `Unassign ${slot.label}`
                                                        : `Assign ${slot.label}`
                                                    }
                                                  >
                                                    {isAssigned ? (
                                                      <CheckCircle2
                                                        className="h-4 w-4"
                                                        aria-hidden="true"
                                                      />
                                                    ) : (
                                                      " "
                                                    )}
                                                  </button>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      case "messages":
        return (
          <section className="min-h-[75vh]">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] text-white">
              <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Inbox
                    </p>
                    <h2 className="text-lg font-semibold text-white">
                      Volunteer messages
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
                    value={inboxQuery}
                    onChange={(event) => setInboxQuery(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
                  />
                </div>

                <div className="mt-4 space-y-2">
                  {filteredInboxThreads.length === 0 ? (
                    <p className="text-sm text-white/50">
                      No conversations found.
                    </p>
                  ) : (
                    filteredInboxThreads.map((thread) => {
                      const isActive = thread.id === activeInboxThreadId;
                      return (
                        <button
                          key={thread.id}
                          type="button"
                          onClick={() => setActiveInboxThreadId(thread.id)}
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
                                inboxStatusDot[thread.status]
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
                {activeInboxThread ? (
                  <>
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={activeInboxThread.avatar}
                          alt={activeInboxThread.name}
                          className="h-10 w-10 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {activeInboxThread.name}
                          </p>
                          <p className="text-xs text-white/50">
                            {activeInboxThread.role} ·{" "}
                            {activeInboxThread.status}
                          </p>
                        </div>
                      </div>
                      <button className="text-xs uppercase tracking-[0.2em] text-white/60 transition hover:text-white">
                        Options
                      </button>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                      {activeInboxMessages.map((message) => (
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
                          value={inboxDraft}
                          onChange={(event) => setInboxDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") handleSendInboxMessage();
                          }}
                          placeholder="Write a message..."
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSendInboxMessage}
                          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-[#ff9c4b] hover:text-white"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-sm text-white/60">
                    {filteredInboxThreads.length === 0
                      ? "No conversations available."
                      : "Select a conversation to start."}
                  </div>
                )}
              </section>
            </div>
          </section>
        );
      case "sessions":
        return (
          <section className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-semibold text-[#4fa5ff]">
                Orientation sessions
              </h2>
              <button
                type="button"
                onClick={openAddSession}
                className="rounded-full bg-[#271c70] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
              >
                Schedule session
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {orientationSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Calendar className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
                    {session.title}
                  </div>
                  <p className="mt-2 text-xs text-white/70">
                    {session.date}, {session.time}
                  </p>
                  <p className="text-xs text-white/50">Host: {session.host}</p>
                  <p className="text-xs text-white/50">
                    Mode:{" "}
                    <span className="text-white/70">
                      {session.mode}
                      {session.mode === "Online" && session.platform
                        ? ` • ${session.platform}`
                        : ""}
                    </span>
                  </p>
                  {session.mode === "Online" && session.link && (
                    <p className="text-xs text-white/50 break-all">
                      Link:{" "}
                      <span className="text-white/70">{session.link}</span>
                    </p>
                  )}
                  {session.mode === "In-person" && session.location && (
                    <p className="text-xs text-white/50">
                      Location:{" "}
                      <span className="text-white/70">{session.location}</span>
                    </p>
                  )}
                  <p className="mt-2 text-xs text-white/50">
                    Seats:{" "}
                    <span className="text-white/70">
                      {session.registeredAttendeeIds.length}/{session.capacity}
                    </span>
                  </p>
                  <p className="text-xs text-white/50">
                    Invited:{" "}
                    <span className="text-white/70">
                      {session.invitedAttendeeIds.length}
                    </span>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditSession(session)}
                      className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/10"
                    >
                      Open details
                    </button>
                    <button
                      type="button"
                      onClick={() => openInviteModal(session.id)}
                      className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/10"
                    >
                      Invite volunteers
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case "dashboard":
      default:
        return (
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {dashboardStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs text-white/60">{stat.note}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Pending approvals
                  </h3>
                  <span className="text-xs text-white/50">Needs review</span>
                </div>
                <div className="mt-4 space-y-3">
                  {volunteerProfiles.slice(0, 2).map((profile) => (
                    <div
                      key={profile.id}
                      className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#120626]/60 px-4 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {profile.name}
                        </p>
                        <p className="text-xs text-white/60">{profile.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/50">
                          {profile.availability}
                        </span>
                        <button
                          type="button"
                          className="rounded-full bg-[#271c70] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Active shifts
                  </h3>
                  <span className="text-xs text-white/50">Live</span>
                </div>
                <div className="mt-4 space-y-3">
                  {timeEntries.slice(0, 2).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-[#120626]/60 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {entry.name}
                        </p>
                        <p className="text-xs text-white/60">
                          {entry.role} / {entry.start}
                        </p>
                      </div>
                      <span className="text-xs text-white/50">{entry.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Upcoming orientation sessions
                </h3>
                <span className="text-xs text-white/50">Next 7 days</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {orientationSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-xl border border-white/10 bg-[#120626]/60 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-white">
                      {session.title}
                    </p>
                    <p className="text-xs text-white/60">
                      {session.date}, {session.time}
                    </p>
                    <p className="text-xs text-white/50">
                      Host: {session.host}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row text-white">
      <aside className="hidden md:flex fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white/5 backdrop-blur-xl text-white shadow-md flex-col py-8 px-4 space-y-3">
        {VOLUNTEER_MANAGER_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <div key={tab.id} className="space-y-2">
              <button
                type="button"
                onClick={() => handleTabChange(tab.id)}
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

                {tab.id === "messages" && newMessages > 0 && (
                  <span className="absolute top-2 right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {newMessages}
                  </span>
                )}
              </button>
              {(tab.id === "organisation" || tab.id === "roles") && (
                <div className="my-2 h-px w-full bg-white/50" />
              )}
            </div>
          );
        })}
      </aside>

      <div className="w-full md:ml-64">
        <div className="md:hidden sticky top-16 z-20 border-b border-white/10 bg-[#120626]/80 backdrop-blur-md px-4 py-3">
          <div className="flex gap-2 overflow-x-auto cfoc-scrollbar pb-1">
            {VOLUNTEER_MANAGER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`relative min-w-max rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#2f6bff] via-[#4fa5ff] to-[#7cc7ff] text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.label}
                {tab.id === "messages" && newMessages > 0 && (
                  <span className="absolute -top-1 -right-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {newMessages}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

	        <section className="w-full px-4 sm:px-6 md:px-10 py-10 md:py-16">
	          {renderTab()}
	        </section>

	        {sessionModal.mode && (
	          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
	            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
	              <div className="flex items-center justify-between gap-3">
	                <h3 className="text-lg font-semibold">
	                  {sessionModal.mode === "add"
	                    ? "Schedule orientation session"
	                    : "Edit orientation session"}
	                </h3>
	                <button
	                  type="button"
	                  onClick={closeSessionModal}
	                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
	                >
	                  Close
	                </button>
	              </div>

	              <div className="mt-4 space-y-3 text-sm text-white/70">
	                <div>
	                  <label className="text-xs text-white/50">Session title</label>
	                  <input
	                    type="text"
	                    value={sessionDraft.title}
	                    onChange={(event) => {
	                      setSessionDraft((prev) => ({
	                        ...prev,
	                        title: event.target.value,
	                      }));
	                      setSessionError(null);
	                    }}
	                    placeholder="Orientation session"
	                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
	                  />
	                </div>

	                <div className="grid gap-3 sm:grid-cols-2">
	                  <div>
	                    <label className="text-xs text-white/50">Date</label>
	                    <input
	                      type="date"
	                      value={sessionDraft.date}
	                      onChange={(event) => {
	                        setSessionDraft((prev) => ({
	                          ...prev,
	                          date: event.target.value,
	                        }));
	                        setSessionError(null);
	                      }}
	                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#ff9c4b] focus:outline-none"
	                    />
	                  </div>
	                  <div>
	                    <label className="text-xs text-white/50">Time</label>
	                    <input
	                      type="time"
	                      value={sessionDraft.time}
	                      onChange={(event) => {
	                        setSessionDraft((prev) => ({
	                          ...prev,
	                          time: event.target.value,
	                        }));
	                        setSessionError(null);
	                      }}
	                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#ff9c4b] focus:outline-none"
	                    />
	                  </div>
	                </div>

	                <div>
	                  <label className="text-xs text-white/50">Mode</label>
	                  <div className="mt-2 inline-flex rounded-full border border-white/20 p-0.5">
	                    {(["Online", "In-person"] as const).map((mode) => {
	                      const isSelected = sessionDraft.mode === mode;
	                      return (
	                        <button
	                          key={mode}
	                          type="button"
	                          onClick={() => {
	                            setSessionDraft((prev) => ({
	                              ...prev,
	                              mode,
	                            }));
	                            setSessionError(null);
	                          }}
	                          className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
	                            isSelected
	                              ? "rounded-full bg-[#ff9c4b] text-black"
	                              : "text-white/70 hover:text-white"
	                          }`}
	                        >
	                          {mode}
	                        </button>
	                      );
	                    })}
	                  </div>
	                </div>

	                {sessionDraft.mode === "Online" ? (
	                  <div className="grid gap-3 sm:grid-cols-2">
	                    <div>
	                      <label className="text-xs text-white/50">Platform</label>
	                      <select
	                        value={sessionDraft.platform}
	                        onChange={(event) => {
	                          setSessionDraft((prev) => ({
	                            ...prev,
	                            platform: event.target.value as SessionPlatform,
	                          }));
	                          setSessionError(null);
	                        }}
	                        className="mt-2 w-full rounded-lg border border-white/10 bg-[#120626]/60 px-3 py-2 text-sm text-white focus:border-[#ff9c4b] focus:outline-none"
	                      >
	                        {sessionPlatformOptions.map((platform) => (
	                          <option key={platform} value={platform}>
	                            {platform}
	                          </option>
	                        ))}
	                      </select>
	                    </div>
	                    <div>
	                      <label className="text-xs text-white/50">
	                        Meeting link
	                      </label>
	                      <input
	                        type="url"
	                        value={sessionDraft.link}
	                        onChange={(event) => {
	                          setSessionDraft((prev) => ({
	                            ...prev,
	                            link: event.target.value,
	                          }));
	                          setSessionError(null);
	                        }}
	                        placeholder="https://..."
	                        className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
	                      />
	                    </div>
	                  </div>
	                ) : (
	                  <div>
	                    <label className="text-xs text-white/50">Location</label>
	                    <input
	                      type="text"
	                      value={sessionDraft.location}
	                      onChange={(event) => {
	                        setSessionDraft((prev) => ({
	                          ...prev,
	                          location: event.target.value,
	                        }));
	                        setSessionError(null);
	                      }}
	                      placeholder="Address or meeting point"
	                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
	                    />
	                  </div>
	                )}

	                <div className="grid gap-3 sm:grid-cols-2">
	                  <div>
	                    <label className="text-xs text-white/50">Host</label>
	                    <input
	                      type="text"
	                      value={sessionDraft.host}
	                      onChange={(event) => {
	                        setSessionDraft((prev) => ({
	                          ...prev,
	                          host: event.target.value,
	                        }));
	                        setSessionError(null);
	                      }}
	                      placeholder="CFOC Team"
	                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
	                    />
	                  </div>
	                  <div>
	                    <label className="text-xs text-white/50">Capacity</label>
	                    <input
	                      type="number"
	                      inputMode="numeric"
	                      min={1}
	                      value={sessionDraft.capacity}
	                      onChange={(event) => {
	                        setSessionDraft((prev) => ({
	                          ...prev,
	                          capacity: event.target.value,
	                        }));
	                        setSessionError(null);
	                      }}
	                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#ff9c4b] focus:outline-none"
	                    />
	                  </div>
	                </div>

	                {sessionError && (
	                  <p className="text-xs text-amber-200">{sessionError}</p>
	                )}
	              </div>

	              <div className="mt-5 flex flex-wrap gap-3">
	                <button
	                  type="button"
	                  onClick={closeSessionModal}
	                  className="flex-1 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
	                >
	                  Cancel
	                </button>
	                <button
	                  type="button"
	                  onClick={saveSession}
	                  className="flex-1 rounded-full bg-[#ff9c4b] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#ffd08b]"
	                >
	                  Save
	                </button>
	              </div>
	            </div>
	          </div>
	        )}

	        {inviteSessionId && (
	          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
	            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
	              <div className="flex items-center justify-between gap-3">
	                <div>
	                  <h3 className="text-lg font-semibold">Invite volunteers</h3>
	                  <p className="mt-1 text-xs text-white/60">
	                    Session:{" "}
	                    {orientationSessions.find(
	                      (session) => session.id === inviteSessionId
	                    )?.title ?? "Orientation session"}
	                  </p>
	                </div>
	                <button
	                  type="button"
	                  onClick={closeInviteModal}
	                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
	                >
	                  Close
	                </button>
	              </div>

	              <div className="mt-4 flex flex-wrap items-center gap-2">
	                <div className="inline-flex rounded-full border border-white/20 p-0.5">
	                  {(
	                    [
	                      { id: "individual", label: "Individuals" },
	                      { id: "groups", label: "Groups" },
	                    ] as const
	                  ).map((mode) => {
	                    const isSelected = inviteMode === mode.id;
	                    return (
	                      <button
	                        key={mode.id}
	                        type="button"
	                        onClick={() => {
	                          setInviteMode(mode.id);
	                          setInviteError(null);
	                          setInviteSuccess(false);
	                        }}
	                        className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
	                          isSelected
	                            ? "rounded-full bg-[#ff9c4b] text-black"
	                            : "text-white/70 hover:text-white"
	                        }`}
	                      >
	                        {mode.label}
	                      </button>
	                    );
	                  })}
	                </div>
	                {inviteSuccess && (
	                  <span className="text-xs text-emerald-200">Invites queued</span>
	                )}
	              </div>

	              <div className="mt-4 space-y-3 text-sm text-white/70">
	                {inviteMode === "individual" ? (
	                  <>
	                    <input
	                      type="text"
	                      value={inviteQuery}
	                      onChange={(event) => setInviteQuery(event.target.value)}
	                      placeholder="Search volunteer..."
	                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
	                    />
		                    <div className="max-h-64 overflow-y-auto cfoc-scrollbar space-y-2">
		                      {filteredInviteVolunteers.length === 0 ? (
		                        <p className="text-xs text-white/60">
		                          {volunteerProfiles.length === 0
		                            ? "No volunteers available."
		                            : "No matching volunteers."}
		                        </p>
		                      ) : (
		                        filteredInviteVolunteers.map((profile) => {
		                          const isSelected = selectedInviteeIds.includes(profile.id);
		                          return (
		                            <button
		                              key={profile.id}
		                              type="button"
		                              onClick={() => {
		                                setSelectedInviteeIds((prev) =>
		                                  prev.includes(profile.id)
		                                    ? prev.filter((id) => id !== profile.id)
		                                    : [...prev, profile.id]
		                                );
		                                setInviteError(null);
		                                setInviteSuccess(false);
		                              }}
		                              className="w-full rounded-xl border border-white/10 bg-[#120626]/60 px-4 py-3 text-left transition hover:border-white/30"
		                            >
		                              <div className="flex items-center justify-between gap-4">
		                                <div>
		                                  <p className="text-sm font-semibold text-white">
		                                    {profile.name}
		                                  </p>
		                                  <p className="text-xs text-white/60">
		                                    {profile.role}
		                                  </p>
		                                </div>
		                                <span
		                                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
		                                    isSelected
		                                      ? "border-[#ff9c4b] bg-[#ff9c4b]/20 text-[#ff9c4b]"
		                                      : "border-white/20 text-white/40"
		                                  }`}
		                                  aria-hidden="true"
		                                >
		                                  {isSelected ? "✓" : ""}
		                                </span>
		                              </div>
		                            </button>
		                          );
		                        })
		                      )}
		                    </div>
		                  </>
		                ) : (
	                  <>
	                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
	                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
	                        Registered for this session
	                      </p>
	                      <p className="mt-2 text-sm text-white/80">
	                        {orientationSessions.find(
	                          (session) => session.id === inviteSessionId
	                        )?.registeredAttendeeIds.length ?? 0}{" "}
	                        registered
	                      </p>
	                      <button
	                        type="button"
	                        onClick={() => {
	                          const registered =
	                            orientationSessions.find(
	                              (session) => session.id === inviteSessionId
	                            )?.registeredAttendeeIds ?? [];
	                          sendInvites(registered);
	                        }}
	                        className="mt-3 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/10"
	                      >
	                        Invite registered
	                      </button>
	                    </div>

	                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
	                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
	                        Pending for a job
	                      </p>
	                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
	                        <select
	                          value={inviteRoleId}
	                          onChange={(event) => {
	                            setInviteRoleId(event.target.value);
	                            setInviteError(null);
	                            setInviteSuccess(false);
	                          }}
	                          className="w-full rounded-lg border border-white/10 bg-[#120626]/60 px-3 py-2 text-sm text-white focus:border-[#ff9c4b] focus:outline-none"
	                        >
	                          <option value="">Select a job</option>
	                          {roleList.map((role) => (
	                            <option key={role.id} value={role.id}>
	                              {role.title}
	                            </option>
	                          ))}
	                        </select>
	                        <button
	                          type="button"
	                          disabled={!inviteRoleId}
	                          onClick={() => {
	                            if (!inviteRoleId) return;
	                            const pending = (applicantsByRole[inviteRoleId] ?? [])
	                              .filter((applicant) => applicant.status === "Pending")
	                              .map((applicant) => applicant.email);
	                            sendInvites(pending);
	                          }}
	                          className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
	                            inviteRoleId
	                              ? "border border-white/20 text-white/90 hover:border-white/40 hover:bg-white/10"
	                              : "cursor-not-allowed border border-white/10 bg-white/5 text-white/40"
	                          }`}
	                        >
	                          Invite pending
	                        </button>
	                      </div>
	                      {inviteRoleId && (
	                        <p className="mt-2 text-xs text-white/60">
	                          {(applicantsByRole[inviteRoleId] ?? []).filter(
	                            (applicant) => applicant.status === "Pending"
	                          ).length || 0}{" "}
	                          pending applicants
	                        </p>
	                      )}
	                    </div>
	                  </>
	                )}

	                {inviteError && (
	                  <p className="text-xs text-amber-200">{inviteError}</p>
	                )}
	              </div>

	              <div className="mt-5 flex flex-wrap gap-3">
	                <button
	                  type="button"
	                  onClick={closeInviteModal}
	                  className="flex-1 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
	                >
	                  Cancel
	                </button>
	                {inviteMode === "individual" && (
	                  <button
	                    type="button"
	                    onClick={() => sendInvites(selectedInviteeIds)}
	                    className="flex-1 rounded-full bg-[#ff9c4b] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#ffd08b]"
	                  >
	                    Send invites
	                  </button>
	                )}
	              </div>
	            </div>
	          </div>
	        )}

	        {timesheetProfile && (
	          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
	            <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto cfoc-scrollbar rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
	              <div className="flex items-start justify-between gap-4">
	                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5">
                    <UserCircle className="h-6 w-6 text-white/60" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {timesheetProfile.name}
                    </p>
                    <p className="text-sm text-white/70">
                      {timesheetProfile.role}
                    </p>
                    <p className="text-sm text-white/50">
                      {timesheetProfile.location}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${volunteerStatusTone[timesheetProfile.status]}`}
                >
                  {timesheetProfile.status}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm text-white/70">
                <p>
                  <span className="text-white/50">Availability:</span>{" "}
                  {timesheetProfile.availability}
                </p>
                <div className="grid gap-2 text-white/60">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {timesheetProfile.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {timesheetProfile.phone}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Skills
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {timesheetProfile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Bio
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    {timesheetProfile.bio}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <VolunteerDocumentsSection
                  mode="manager"
                  volunteerEmail={timesheetProfile.email}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={closeTimesheetProfile}
                  className="flex-1 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {timesheetMessageTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Message volunteer
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {timesheetMessageTarget.name}
                  </p>
                  <p className="text-xs text-white/60">
                    {timesheetMessageTarget.role}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeTimesheetMessage}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Close
                </button>
              </div>
              <textarea
                value={timesheetMessageDraft}
                onChange={(event) => {
                  setTimesheetMessageDraft(event.target.value);
                  setIsTimesheetMessageSent(false);
                }}
                rows={4}
                placeholder="Write a message..."
                className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
              />
              {isTimesheetMessageSent && (
                <p className="mt-2 text-xs text-emerald-200">Sent</p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={closeTimesheetMessage}
                  className="flex-1 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTimesheetMessageSend}
                  className="flex-1 rounded-full bg-[#ff9c4b] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#ffd08b]"
                >
                  Send message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
