"use client";

import { CSSProperties, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Users,
  Video,
} from "lucide-react";

const PUBLISHED_JOBS_STORAGE_KEY = "cfoc-volunteer-published-jobs";
const SAMPLE_CALENDARS_STORAGE_KEY = "cfoc-demo-sample-calendars";

type SampleCalendarVolunteerSlot = {
  id: string;
  label: string;
};

type SampleCalendarShift = {
  id: string;
  day: string;
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

const scheduleDayOptions = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
] as const;

const parseClockMinutes = (value: string): number | null => {
  const match = value.trim().match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
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
      return true;
    });
  } catch {
    return [];
  }
};

const managerPillars = [
  {
    title: "Manage volunteer profiles",
    items: ["Collect profiles", "Review applications", "Approve onboarding"],
  },
  {
    title: "Publish roles and schedules",
    items: ["Define conditions", "Set time slots", "Track applicants"],
  },
  {
    title: "Validate timesheets",
    items: ["Clock in and out", "Approve hours", "Export totals"],
  },
];

const volunteerHighlights = [
  "Create a profile and set availability.",
  "Browse roles, requirements, and time slots.",
  "Apply to join an organization.",
  "Clock in and out to track hours.",
  "Review approved time and activity.",
];

const organizationHighlights = [
  "Present your organization, mission, and goals.",
  "Approve volunteer profiles and applications.",
  "Communicate with volunteers in one place.",
  "Validate timesheets and export totals.",
  "Host orientation sessions for onboarding.",
];

const managerTestimonials = [
  {
    quote:
      "The Volunteer Manager turned our volunteer operations into a clear process. We onboard faster and stay focused on the vision.",
    name: "Amira K.",
    title: "Program Director",
  },
  {
    quote:
      "Profiles, approvals, timesheets, and messaging in one place means fewer follow-ups and more time serving the mission.",
    name: "Daniel R.",
    title: "Operations Manager",
  },
  {
    quote:
      "We always know what is pending and what needs attention, so the team stays aligned and supported week after week.",
    name: "Sofia L.",
    title: "Volunteer Lead",
  },
];

type JobOpportunity = {
  id?: string;
  title: string;
  type: string;
  schedule: string;
  location: string;
  commitment: string;
};

const baseJobOpportunities: JobOpportunity[] = [
  {
    title: "Community kitchen support",
    type: "On-site",
    schedule: "Tue, Thu 09:00-13:00",
    location: "Montreal",
    commitment: "2 shifts per week",
  },
  {
    title: "Kids program assistant",
    type: "On-site",
    schedule: "Wed 14:00-18:00",
    location: "Toronto",
    commitment: "Weekly session",
  },
  {
    title: "Logistics runner",
    type: "Hybrid",
    schedule: "Mon, Fri 08:30-12:30",
    location: "Vancouver",
    commitment: "2 mornings per week",
  },
  {
    title: "Volunteer coordinator",
    type: "Remote",
    schedule: "Flexible, 6h weekly",
    location: "Ottawa",
    commitment: "Ongoing",
  },
];

const openRoles = [
  {
    title: "Community kitchen support",
    meta: "On-site - Tue, Thu 09:00-13:00",
    location: "Montreal",
  },
  {
    title: "Kids program assistant",
    meta: "On-site - Wed 14:00-18:00",
    location: "Toronto",
  },
  {
    title: "Logistics runner",
    meta: "Hybrid - Mon, Fri 08:30-12:30",
    location: "Vancouver",
  },
];

const pendingProfiles = [
  { name: "Maya L.", role: "Logistics", submitted: "2h ago" },
  { name: "Jonas P.", role: "Kids program", submitted: "5h ago" },
];

const timesheetEntries = [
  { name: "Elisa M.", role: "Kitchen", hours: "3h 35m", status: "Pending" },
  { name: "Samuel R.", role: "Logistics", hours: "4h 10m", status: "Approved" },
];

export default function VolunteerManagerOverviewPage() {
  const [publishedJobs, setPublishedJobs] = useState<JobOpportunity[]>([]);
  const [sampleCalendars, setSampleCalendars] = useState<SampleCalendar[]>([]);
  const [activeSampleCalendar, setActiveSampleCalendar] =
    useState<SampleCalendar | null>(null);
  const [overviewMode, setOverviewMode] = useState<
    "volunteer" | "organization" | null
  >(null);
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedRaw = window.localStorage.getItem(PUBLISHED_JOBS_STORAGE_KEY);
    if (!storedRaw) return;
    try {
      const storedJobs = JSON.parse(storedRaw) as JobOpportunity[];
      setPublishedJobs(storedJobs);
    } catch (error) {
      console.error("Failed to load published jobs", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSampleCalendars(readSampleCalendarsFromStorage());
  }, []);

  const publishedTitles = new Set(
    publishedJobs.map((job) => job.title.toLowerCase())
  );
  const jobOpportunities = [
    ...publishedJobs,
    ...baseJobOpportunities.filter(
      (job) => !publishedTitles.has(job.title.toLowerCase())
    ),
  ];
  const jobOpportunitiesLoop = [...jobOpportunities, ...jobOpportunities];
  const activeSampleShiftRows = activeSampleCalendar
    ? [...activeSampleCalendar.shifts].sort((a, b) => {
        const dayIndex =
          scheduleDayOptions.findIndex((day) => day.id === a.day) -
          scheduleDayOptions.findIndex((day) => day.id === b.day);
        if (dayIndex !== 0) return dayIndex;
        const aTime = parseClockMinutes(a.start) ?? 0;
        const bTime = parseClockMinutes(b.start) ?? 0;
        return aTime - bTime;
      })
    : [];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#080313] via-[#260d5c] to-[#5d3ab9] text-white overflow-hidden">
      <div
        className="absolute inset-0 mission-aurora pointer-events-none"
        style={auroraStyle}
        aria-hidden="true"
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#080313]/80 via-[#260d5c]/70 to-[#080313]/80" />
      <div className="relative z-10">
        <motion.header
          className="max-w-6xl mx-auto px-6 pt-24 pb-10 text-center"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            Volunteer Overview
          </p>
          <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-white">
            Choose your space
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/70 max-w-2xl mx-auto">
            Pick the view that matches your role to see the right tools and
            information.
          </p>

          <div
            role="tablist"
            aria-label="Volunteer overview tabs"
            className="mt-8 grid gap-4 md:grid-cols-2 text-left"
          >
            <button
              type="button"
              role="tab"
              aria-selected={overviewMode === "volunteer"}
              onClick={() => setOverviewMode("volunteer")}
              className={`group rounded-2xl border bg-white/5 p-6 text-left transition hover:bg-white/10 ${
                overviewMode === "volunteer"
                  ? "border-[#4fa5ff] shadow-[0_0_0_1px_rgba(79,165,255,0.35)]"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">
                    I am volunteer
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    Find opportunity, manage your time, remote job possible.
                  </p>
                </div>
                <span
                  className={`mt-1 inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] transition ${
                    overviewMode === "volunteer"
                      ? "border-[#4fa5ff]/40 bg-[#4fa5ff]/15 text-white"
                      : "border-white/15 text-white/60 group-hover:text-white/80"
                  }`}
                >
                  Volunteer
                </span>
              </div>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={overviewMode === "organization"}
              onClick={() => setOverviewMode("organization")}
              className={`group rounded-2xl border bg-white/5 p-6 text-left transition hover:bg-white/10 ${
                overviewMode === "organization"
                  ? "border-[#ff9c4b] shadow-[0_0_0_1px_rgba(255,156,75,0.35)]"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">
                    I am an organization
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    Manage volunteer profiles, publish roles and schedules,
                    validate timesheets.
                  </p>
                </div>
                <span
                  className={`mt-1 inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] transition ${
                    overviewMode === "organization"
                      ? "border-[#ff9c4b]/45 bg-[#ff9c4b]/15 text-white"
                      : "border-white/15 text-white/60 group-hover:text-white/80"
                  }`}
                >
                  Org
                </span>
              </div>
            </button>
          </div>
        </motion.header>

        {overviewMode === "volunteer" && (
          <>
            <motion.section
              className="max-w-6xl mx-auto px-6 pb-10 text-center"
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                Find roles. Track shifts. Keep it simple.
              </h2>
              <p className="mt-3 text-sm md:text-base text-white/70 max-w-2xl mx-auto">
                Browse opportunities, clock your volunteer time, and stay in
                touch with organizations from one calm workspace.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3 text-left">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Find opportunity
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 text-[#4fa5ff]"
                        aria-hidden="true"
                      />
                      <span>Browse published roles.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 text-[#4fa5ff]"
                        aria-hidden="true"
                      />
                      <span>See schedules before applying.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 text-[#4fa5ff]"
                        aria-hidden="true"
                      />
                      <span>Apply in one place.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Manage your time
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 text-[#4fa5ff]"
                        aria-hidden="true"
                      />
                      <span>Clock in and out for each shift.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 text-[#4fa5ff]"
                        aria-hidden="true"
                      />
                      <span>See upcoming shifts at a glance.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 text-[#4fa5ff]"
                        aria-hidden="true"
                      />
                      <span>Download approved time as PDF.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Remote job possible
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 text-[#4fa5ff]"
                        aria-hidden="true"
                      />
                      <span>Remote and hybrid opportunities.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 text-[#4fa5ff]"
                        aria-hidden="true"
                      />
                      <span>Flexible schedules for busy weeks.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 text-[#4fa5ff]"
                        aria-hidden="true"
                      />
                      <span>Stay connected via chat.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.section>

            <motion.section
              className="relative max-w-6xl mx-auto px-6 pt-6 pb-20"
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
            >
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
                  <div className="space-y-8 min-w-0">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-semibold text-[#4fa5ff] mb-3">
                        Volunteer overview
                      </h2>
                      <p className="text-sm text-white/70">
                        Everything you need to volunteer with clarity: roles,
                        schedules, hours, and communication.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                        What you can do
                      </p>
                      <ul className="space-y-2 text-sm text-white/80">
                        {volunteerHighlights.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Check
                              className="mt-0.5 h-4 w-4 text-[#4fa5ff]"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <Briefcase
                            className="h-4 w-4 text-[#4fa5ff]"
                            aria-hidden="true"
                          />
                          Job opportunities
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                          Carousel
                        </span>
                      </div>
                      <div className="mt-4 cfoc-carousel w-full overflow-hidden">
                        <div className="cfoc-carousel-scroll w-full overflow-hidden">
                          <div className="cfoc-carousel-track">
	                            {jobOpportunitiesLoop.map((job, index) => {
	                              const linkedSample =
	                                job.id
	                                  ? sampleCalendars.find((calendar) =>
	                                      calendar.roleIds.includes(job.id ?? "")
	                                    ) ?? null
	                                  : null;
	                              return (
	                                <div
	                                  key={`${job.title}-${index}`}
	                                  className="w-[230px] rounded-xl border border-white/10 bg-[#120626]/60 p-3"
	                                >
	                                  <div className="flex items-start justify-between gap-2">
	                                    <p className="text-sm font-semibold text-white">
	                                      {job.title}
	                                    </p>
	                                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white/70">
	                                      {job.type}
	                                    </span>
	                                  </div>
	                                  <div className="mt-2 space-y-1 text-[11px] text-white/60">
	                                    <div className="flex items-center gap-2">
	                                      <MapPin
	                                        className="h-3 w-3"
	                                        aria-hidden="true"
	                                      />
	                                      <span>{job.location}</span>
	                                    </div>
	                                    <div className="flex items-center gap-2">
	                                      <Calendar
	                                        className="h-3 w-3"
	                                        aria-hidden="true"
	                                      />
	                                      <span>{job.schedule}</span>
	                                    </div>
	                                    {job.commitment && (
	                                      <div className="flex items-center gap-2">
	                                        <Clock
	                                          className="h-3 w-3"
	                                          aria-hidden="true"
	                                        />
	                                        <span>{job.commitment}</span>
	                                      </div>
	                                    )}
	                                  </div>

	                                  {linkedSample && (
	                                    <button
	                                      type="button"
	                                      onClick={() =>
	                                        setActiveSampleCalendar(linkedSample)
	                                      }
	                                      className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4fa5ff] transition hover:text-white"
	                                    >
	                                      <Calendar
	                                        className="h-3 w-3"
	                                        aria-hidden="true"
	                                      />
	                                      Sample schedule
	                                    </button>
	                                  )}
	                                </div>
	                              );
	                            })}
	                          </div>
	                        </div>
	                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#140b2f]/60 p-4 md:p-5 min-h-[420px] flex flex-col min-w-0 w-full overflow-hidden">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">
                      Quick snapshot
                    </p>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            <Calendar
                              className="h-4 w-4 text-[#4fa5ff]"
                              aria-hidden="true"
                            />
                            Upcoming shifts
                          </div>
                          <span className="text-xs text-white/50">This week</span>
                        </div>
                        <div className="mt-3 space-y-2 text-xs text-white/70">
                          <div className="rounded-xl border border-white/10 bg-[#120626]/50 px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white/90">
                                Community kitchen support
                              </span>
                              <span className="text-white/60">Today</span>
                            </div>
                            <p className="mt-1">09:00-13:00 · Montreal</p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-[#120626]/50 px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white/90">
                                Kids program assistant
                              </span>
                              <span className="text-white/60">Wed</span>
                            </div>
                            <p className="mt-1">14:00-18:00 · Toronto</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <Clock
                            className="h-4 w-4 text-[#4fa5ff]"
                            aria-hidden="true"
                          />
                          Time worked
                        </div>
                        <p className="mt-2 text-xs text-white/60">
                          Approved hours can be downloaded as a PDF timesheet.
                        </p>
                        <div className="mt-3 space-y-2 text-xs text-white/70">
                          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#120626]/50 px-3 py-2">
                            <span className="font-semibold text-white/90">
                              3h 40m
                            </span>
                            <span className="text-white/60">Approved</span>
                          </div>
                          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#120626]/50 px-3 py-2">
                            <span className="font-semibold text-white/90">
                              2h 55m
                            </span>
                            <span className="text-white/60">Pending</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <MessageCircle
                            className="h-4 w-4 text-[#4fa5ff]"
                            aria-hidden="true"
                          />
                          Communication
                        </div>
                        <p className="mt-2 text-xs text-white/60">
                          Keep everything in one chat thread per organization.
                        </p>
                        <div className="mt-3 space-y-2 text-xs text-white/70">
                          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#120626]/50 px-3 py-2">
                            <span className="font-semibold text-white/90">
                              Hope Kitchen
                            </span>
                            <span className="text-white/60">1 new</span>
                          </div>
                          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#120626]/50 px-3 py-2">
                            <span className="font-semibold text-white/90">
                              Youth Action
                            </span>
                            <span className="text-white/60">No unread</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </>
        )}

        {overviewMode === "organization" && (
          <>
            <motion.section
              className="max-w-6xl mx-auto px-6 pb-6 text-center"
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Volunteer Manager
              </p>
              <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-white">
                Lead volunteer operations with confidence
              </h2>
              <p className="mt-4 text-sm md:text-base text-white/70 max-w-2xl mx-auto">
                Review profiles, publish roles, and approve time in a calm,
                structured workspace built for volunteer teams.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3 text-left">
                {managerPillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6"
                  >
                    <h3 className="text-lg font-semibold text-white">
                      {pillar.title}
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-white/70">
                      {pillar.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check
                            className="mt-0.5 h-4 w-4 text-[#4fa5ff]"
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.section>

        <motion.section
          className="relative max-w-6xl mx-auto px-6 pt-10 pb-20"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
              <div className="space-y-8 min-w-0">
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-[#4fa5ff] mb-3">
                    Volunteer Manager
                  </h2>
                  <p className="text-sm text-white/70">
                    A focused manager view for organizations to recruit, guide,
                    and validate volunteers.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Organization view
                  </p>
                  <ul className="space-y-2 text-sm text-white/80">
                    {organizationHighlights.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check
                          className="mt-0.5 h-4 w-4 text-[#ff9c4b]"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5 min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <MessageCircle
                        className="h-4 w-4 text-[#ff9c4b]"
                        aria-hidden="true"
                      />
                      Testimonials
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                      Leaders
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {managerTestimonials.map((item) => (
                      <div
                        key={item.name}
                        className="rounded-xl border border-white/10 bg-[#120626]/60 p-3"
                      >
                        <p className="text-sm text-white/80 leading-relaxed">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-white/60">
                          <span className="font-semibold text-white/85">
                            {item.name}
                          </span>
                          <span className="truncate">{item.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#140b2f]/60 p-4 md:p-5 min-h-[420px] flex flex-col min-w-0 w-full overflow-hidden">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">
                  Live snapshot
                </p>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Users className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
                      Open volunteer roles
                    </div>
                    <div className="mt-3 space-y-3 text-xs text-white/70">
                      {openRoles.map((role) => (
                        <div
                          key={role.title}
                          className="rounded-xl border border-white/10 bg-[#120626]/50 px-3 py-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white/90">
                              {role.title}
                            </span>
                            <span className="text-white/60">{role.location}</span>
                          </div>
                          <p className="mt-1">{role.meta}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Clock className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
                        Timesheet check-ins
                      </div>
                      <span className="text-xs text-white/50">Today</span>
                    </div>
                    <div className="mt-3 space-y-2 text-xs text-white/70">
                      {timesheetEntries.map((entry) => (
                        <div
                          key={`${entry.name}-${entry.role}`}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-[#120626]/50 px-3 py-2"
                        >
                          <div>
                            <p className="text-white/90 font-semibold">
                              {entry.name}
                            </p>
                            <p className="text-white/60">{entry.role}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/90 font-semibold">
                              {entry.hours}
                            </p>
                            <p className="text-white/60">{entry.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

	                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
	                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
	                      <Video className="h-4 w-4 text-[#ff9c4b]" aria-hidden="true" />
	                      Orientation sessions
	                    </div>
                    <div className="mt-3 space-y-2 text-xs text-white/70">
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#120626]/50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-white/60" aria-hidden="true" />
                          <span>Onboarding Q and A</span>
                        </div>
                        <span>Thu 16:00</span>
                      </div>
                      <button
                        type="button"
                        className="w-full rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/10"
                      >
                        Schedule new session
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <MessageCircle
                        className="h-4 w-4 text-[#4fa5ff]"
                        aria-hidden="true"
                      />
                      Pending profiles
                    </div>
                    <div className="mt-3 space-y-2 text-xs text-white/70">
                      {pendingProfiles.map((profile) => (
                        <div
                          key={profile.name}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-[#120626]/50 px-3 py-2"
                        >
                          <div>
                            <p className="text-white/90 font-semibold">
                              {profile.name}
                            </p>
                            <p className="text-white/60">{profile.role}</p>
                          </div>
                          <span className="text-white/60">{profile.submitted}</span>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="w-full rounded-full bg-[#271c70] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
                      >
                        Review profiles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
          </>
        )}

        {activeSampleCalendar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
            <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto cfoc-scrollbar rounded-2xl border border-white/10 bg-[#140b2f] p-6 text-white shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Sample schedule
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {activeSampleCalendar.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/60">
                    This is a sample calendar to help you understand what your
                    weekly schedule could look like.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSampleCalendar(null)}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 overflow-x-auto">
                {(() => {
                  const shiftGroups = scheduleDayOptions
                    .map((day) => ({
                      day,
                      shifts: activeSampleShiftRows.filter((shift) => shift.day === day.id),
                    }))
                    .filter((group) => group.shifts.length > 0);

                  const gridTemplateColumns = `minmax(170px, 1fr) repeat(${activeSampleCalendar.slots.length}, minmax(72px, 1fr))`;

                  return (
                    <div className="min-w-[720px] space-y-4">
                      <div
                        className="grid gap-2 px-1"
                        style={{ gridTemplateColumns }}
                      >
                        <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                          Shift
                        </div>
                        {activeSampleCalendar.slots.map((slot) => (
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

                                  {activeSampleCalendar.slots.map((slot, index) => {
                                    const isAssigned =
                                      shift.assignedSlotIds.includes(slot.id);
                                    const isLast =
                                      index === activeSampleCalendar.slots.length - 1;
                                    return (
                                      <div
                                        key={`${shift.id}-${slot.id}`}
                                        className={`flex items-center justify-center px-2 py-2 ${
                                          isLast ? "" : "border-r border-white/10"
                                        }`}
                                      >
                                        {isAssigned ? (
                                          <Check
                                            className="h-4 w-4 text-emerald-300"
                                            aria-hidden="true"
                                          />
                                        ) : (
                                          <span className="text-white/20">—</span>
                                        )}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
