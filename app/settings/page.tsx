"use client";

import { KeyboardEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter, useSearchParams } from "next/navigation";
import DonationsTab from "@/components/settings/payments/DonationsTab";
import MissionTripsTab from "@/components/settings/payments/MissionTripsTab";
import SubscriptionsTab from "@/components/settings/payments/SubscriptionsTab";
import MissionTripsTabSettings from "@/components/settings/mission-trips/MissionTripsTab";
import ProjectsTab from "@/components/settings/projects/ProjectsTab";
import SecurityPanel from "@/components/settings/security/SecurityPanel";
import VolunteerProfilePanel from "@/components/settings/profile/VolunteerProfilePanel";
import MyOrganisationTab from "@/components/missionControl/MyOrganisationTab";
import AuthGuard from "@/components/auth/AuthGuard";

type TabKey =
  | "profile"
  | "organisation"
  | "payments"
  | "security"
  | "notifications"
  | "projects"
  | "missionTrips";

type PaymentActivity = {
  id: string;
  amount: number;
  date: string;
  status: string;
  project?: string;
};

type MissionTripPayment = {
  id: string;
  missionName: string;
  destination: string;
  departureDate: string;
  totalCost: number;
  amountPaid: number;
  nextDueDate: string;
  nextDueAmount: number;
  status: "On track" | "Pending" | "Overdue";
};

const FALLBACK_PAYMENTS: PaymentActivity[] = [
  {
    id: "payment-1",
    amount: 250,
    date: "Dec 18, 2024",
    status: "Completed",
    project: "Zambia Outreach 2025",
  },
  {
    id: "payment-2",
    amount: 120,
    date: "Jan 05, 2025",
    status: "Pending",
    project: "Haiti Rebuild 2025",
  },
];

const FALLBACK_MISSION_TRIP_PAYMENTS: MissionTripPayment[] = [
  {
    id: "mt-1",
    missionName: "Zambia Outreach 2025",
    destination: "Zambia",
    departureDate: "2025-07-15",
    totalCost: 2400,
    amountPaid: 1200,
    nextDueDate: "2025-03-15",
    nextDueAmount: 600,
    status: "On track",
  },
  {
    id: "mt-2",
    missionName: "Haiti Rebuild 2025",
    destination: "Haiti",
    departureDate: "2025-10-01",
    totalCost: 1800,
    amountPaid: 600,
    nextDueDate: "2025-05-01",
    nextDueAmount: 600,
    status: "Pending",
  },
];

const tabs: Record<TabKey, { label: string; description: string; details: string }> =
  {
    profile: {
      label: "Profile",
      description: "Profile Settings",
      details: "Manage your personal information here.",
    },
    organisation: {
      label: "Organization",
      description: "Organization Profile",
      details: "Manage your organization profile and partner snapshot.",
    },
    payments: {
      label: "Payments",
      description: "Payment & Donations",
      details: "View your donation and payment records.",
    },
    security: {
      label: "Security",
      description: "Security Controls",
      details: "Update your password and enable two-factor authentication.",
    },
    notifications: {
      label: "Notifications",
      description: "Notification Preferences",
      details: "Configure how you receive alerts and updates.",
    },
    projects: {
      label: "Projects",
      description: "My Projects",
      details: "Track your ongoing projects and see their progress.",
    },
    missionTrips: {
      label: "Mission Trips",
      description: "My Mission Trips",
      details: "Follow your mission trips, payments, and latest updates.",
    },
  };

const toDisplayName = (value: string | null | undefined) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return "";
  return trimmed;
};

const nameFromEmail = (email: string | null | undefined) => {
  const normalized = typeof email === "string" ? email.trim() : "";
  if (!normalized.includes("@")) return "";
  const localPart = normalized.split("@")[0] ?? "";
  if (!localPart) return "";
  return localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const supabase = useSupabaseClient();
  const session = useSession();
  const userId = session?.user?.id ?? null;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [payments, setPayments] = useState<PaymentActivity[]>(FALLBACK_PAYMENTS);
  const [missionTripPayments] = useState<MissionTripPayment[]>(
    FALLBACK_MISSION_TRIP_PAYMENTS
  );
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [greetingName, setGreetingName] = useState("there");

  const isAdminRole = (role: unknown) => {
    const normalized = typeof role === "string" ? role.trim().toLowerCase() : "";
    return [
      "admin",
      "manager",
      "volunteer manager",
      "volunteer_manager",
      "mission manager",
      "mission_manager",
      "org admin",
      "organization admin",
      "organisation admin",
    ].includes(normalized);
  };

  const canEditOrganizationFromMembership = (role: unknown) => {
    const normalized = typeof role === "string" ? role.trim().toLowerCase() : "";
    return ["owner", "admin", "manager"].includes(normalized);
  };

  const tabParam = useMemo(() => {
    const raw = searchParams.get("tab");
    return raw && Object.prototype.hasOwnProperty.call(tabs, raw)
      ? (raw as TabKey)
      : null;
  }, [searchParams]);

  useEffect(() => {
    if (!tabParam) return;
    setActiveTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    let cancelled = false;

    const fetchProfileHighlights = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("recent_payments, full_name")
        .eq("id", userId)
        .single();

      if (cancelled) return;
      if (error || !data) return;

      const row = data as { recent_payments?: unknown; full_name?: unknown };

      if (Array.isArray((data as { recent_payments?: unknown }).recent_payments)) {
        setPayments((data as { recent_payments: PaymentActivity[] }).recent_payments);
      }

      const fullName = toDisplayName(
        typeof row.full_name === "string" ? row.full_name : ""
      );
      if (fullName) {
        setGreetingName(fullName);
      }
    };

    fetchProfileHighlights();

    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  useEffect(() => {
    const metadataName = toDisplayName(
      (session?.user?.user_metadata?.full_name as string | undefined) ??
        (session?.user?.user_metadata?.name as string | undefined)
    );
    const fallbackName = metadataName || nameFromEmail(session?.user?.email);

    if (fallbackName) {
      setGreetingName(fallbackName);
      return;
    }

    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("cfoc-demo-profile");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { full_name?: unknown };
      const localName = toDisplayName(
        typeof parsed.full_name === "string" ? parsed.full_name : ""
      );
      if (localName) {
        setGreetingName(localName);
      }
    } catch {
      // ignore storage parse failures
    }
  }, [session?.user?.email, session?.user?.user_metadata]);

  useEffect(() => {
    let cancelled = false;

    const fetchRole = async () => {
      if (!userId) return;

      const [profileResult, membershipResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("organization_memberships")
          .select("role, status, created_at")
          .eq("user_id", userId)
          .eq("status", "active")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      const profileRole =
        (profileResult.data as { role?: unknown } | null)?.role ?? null;
      const membershipRole =
        (membershipResult.data as { role?: unknown } | null)?.role ?? null;

      const hasProfilePrivilege = isAdminRole(profileRole);
      const hasMembershipPrivilege = canEditOrganizationFromMembership(membershipRole);

      if (profileResult.error && membershipResult.error) {
        setIsOrgAdmin(false);
        return;
      }

      setIsOrgAdmin(hasProfilePrivilege || hasMembershipPrivilege);
    };

    fetchRole();

    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  useEffect(() => {
    if (userId) return;
    if (typeof window === "undefined") return;
    setIsOrgAdmin(window.localStorage.getItem("cfoc-demo-auth") === "1");
  }, [userId]);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);
    router.replace(`/settings?${params.toString()}`);
  };

  const handleKeyPress = (
    event: KeyboardEvent<HTMLButtonElement>,
    key: TabKey
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTabChange(key);
    }
  };

  const handleProfileNameChange = useCallback(
    (fullName: string) => {
      const next = toDisplayName(fullName);
      if (next) {
        setGreetingName(next);
        return;
      }
      const fallback = nameFromEmail(session?.user?.email) || "there";
      setGreetingName(fallback);
    },
    [session?.user?.email]
  );

  return (
    <AuthGuard>
      <section className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-[#080313] via-[#260d5c] to-[#5d3ab9] px-4 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <motion.h1
              className="text-4xl font-semibold tracking-tight"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Hi {greetingName}
            </motion.h1>
            <motion.p
              className="mt-3 text-white/70"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Welcome On Your settings Page
            </motion.p>
          </div>

        <div
          role="tablist"
          aria-label="Settings sections"
          className="flex flex-wrap gap-2 rounded-2xl bg-white/10 p-3 backdrop-blur"
        >
          {(Object.keys(tabs) as TabKey[]).map((key) => {
            const isActive = key === activeTab;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`settings-panel-${key}`}
                id={`settings-tab-${key}`}
                className={`relative flex-1 min-w-[120px] rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9c4b] ${
                  isActive
                    ? "text-[#080313]"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => handleTabChange(key)}
                onKeyDown={(event) => handleKeyPress(event, key)}
              >
                <span className="relative z-10">{tabs[key].label}</span>
                {isActive && (
                  <>
                    <motion.div
                      layoutId="tabBackground"
                      className="absolute inset-0 rounded-xl bg-[#ff9c4b]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-10">
          <AnimatePresence mode="wait">
            {activeTab === "profile" ? (
              <VolunteerProfilePanel onProfileNameChange={handleProfileNameChange} />
            ) : activeTab === "organisation" ? (
              <motion.div
                key="organisation"
                id="settings-panel-organisation"
                role="tabpanel"
                aria-labelledby="settings-tab-organisation"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <MyOrganisationTab embedded allowEdit={isOrgAdmin} />
              </motion.div>
            ) : activeTab === "payments" ? (
              <PaymentsPanel
                payments={payments}
                missionTripPayments={missionTripPayments}
              />
            ) : activeTab === "security" ? (
              <SecurityPanel />
            ) : activeTab === "projects" ? (
              <ProjectsTab />
            ) : activeTab === "missionTrips" ? (
              <MissionTripsTabSettings
                trips={missionTripPayments}
                payments={payments}
              />
            ) : (
              <motion.div
                key={activeTab}
                id={`settings-panel-${activeTab}`}
                role="tabpanel"
                aria-labelledby={`settings-tab-${activeTab}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl bg-white/10 p-8 backdrop-blur-xl shadow-2xl"
              >
                <h2 className="text-2xl font-semibold">
                  {tabs[activeTab].description}
                </h2>
                <p className="mt-2 text-white/70">{tabs[activeTab].details}</p>
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <motion.div
                    className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-lg"
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm uppercase tracking-[0.2em] text-white/50">
                      Overview
                    </p>
                    <p className="mt-3 text-lg font-medium">
                      {tabs[activeTab].details}
                    </p>
                  </motion.div>
                  <motion.div
                    className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-lg"
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm uppercase tracking-[0.2em] text-white/50">
                      Quick Action
                    </p>
                    <p className="mt-3 text-lg font-medium">
                      Seamlessly manage all{" "}
                      {tabs[activeTab].label.toLowerCase()} preferences without
                      leaving this page.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </section>
    </AuthGuard>
  );
}

type PaymentsPanelProps = {
  payments: PaymentActivity[];
  missionTripPayments: MissionTripPayment[];
};

type PaymentSubTab = "missions" | "donations" | "subscriptions";

function PaymentsPanel({ payments, missionTripPayments }: PaymentsPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<PaymentSubTab>("missions");
  const subTabs: { key: PaymentSubTab; label: string }[] = [
    { key: "missions", label: "Mission Trips" },
    { key: "donations", label: "Donations" },
    { key: "subscriptions", label: "Subscriptions" },
  ];

  return (
    <motion.div
      key="payments"
      id="settings-panel-payments"
      role="tabpanel"
      aria-labelledby="settings-tab-payments"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <section className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-2xl md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="min-w-0 md:max-w-[420px]">
            <h2 className="text-2xl font-semibold text-white">
              Payment &amp; Donations
            </h2>
          </div>

          <div className="flex flex-nowrap gap-2 overflow-x-auto md:overflow-visible">
            {subTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSubTab(tab.key)}
                className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9c4b] ${
                  activeSubTab === tab.key
                    ? "border-[#ff9c4b]/40 bg-[#ff9c4b]/15 text-[#ff9c4b]"
                    : "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
                }`}
                aria-pressed={activeSubTab === tab.key}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeSubTab === "missions" && (
        <MissionTripsTab data={missionTripPayments} />
      )}
      {activeSubTab === "donations" && <DonationsTab data={payments} />}
      {activeSubTab === "subscriptions" && <SubscriptionsTab />}
    </motion.div>
  );
}
