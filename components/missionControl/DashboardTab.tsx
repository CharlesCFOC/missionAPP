"use client";

import { CSSProperties, useState } from "react";
import { FaHandsHelping, FaProjectDiagram, FaUsers, FaDollarSign } from "react-icons/fa";
import { motion } from "framer-motion";
export default function DashboardTab() {
  const recentActivities = {
    missions: [
      { text: "Medical Outreach - New mission created", time: "1h ago" },
      { text: "Youth Empowerment - Progress updated", time: "4h ago" },
    ],
    donations: [
      { text: "Clean Water Initiative - $250 received", time: "2h ago" },
      { text: "Kenya Medical Outreach - $100 received", time: "6h ago" },
    ],
    volunteers: [
      { text: "3 new volunteers joined Zambia team", time: "1h ago" },
      { text: "Volunteer John Doe completed onboarding", time: "5h ago" },
    ],
  };

  const [stats] = useState([
    { id: 1, label: "Total Donations", value: 12960, icon: <FaDollarSign />, color: "#ff9c4b" },
    { id: 2, label: "Active Projects", value: 8, icon: <FaProjectDiagram />, color: "#4fa5ff" },
    { id: 3, label: "Active Missions", value: 5, icon: <FaHandsHelping />, color: "#a5e7ff" },
    { id: 4, label: "Team Members", value: 14, icon: <FaUsers />, color: "#ffffff" },
  ]);

  const [donationRange, setDonationRange] = useState<"weekly" | "monthly">("monthly");

  const donationWeeklyData = Array.from({ length: 54 }, (_, index) => ({
    label: `Week ${index + 1}`,
    amount: 300 + ((index * 829) % 4701),
  }));

  const donationMonthlyData = [
    { label: "Janvier", amount: 456 },
    { label: "Fevrier", amount: 2654 },
    { label: "Mars", amount: 1783 },
    { label: "Avril", amount: 8950 },
    { label: "Mai", amount: 225 },
    { label: "Juin", amount: 899 },
    { label: "Juillet", amount: 3450 },
    { label: "Août", amount: 3065 },
    { label: "Septembre", amount: 654 },
    { label: "Octobre", amount: 12087 },
    { label: "Novembre", amount: 1901 },
    { label: "Decembre", amount: 850 },
  ];

  const donationData = donationRange === "weekly" ? donationWeeklyData : donationMonthlyData;
  const verticalLabelStyle: CSSProperties = {
    writingMode: "vertical-rl",
    textOrientation: "mixed",
    transform: "rotate(180deg)",
  };

  const coverageData = [
    { name: "Clean Water - Zambia", value: 21500 },
    { name: "Kenya Medical Mission", value: 18200 },
    { name: "Haiti Youth Hub", value: 14374 },
    { name: "DRC School Build", value: 13500 },
  ];

  const coverageColors = ["#ff9c4b", "#4fa5ff", "#a5e7ff", "#ffffff"];

  const donationMax = Math.max(...donationData.map((item) => item.amount), 1);
  const coverageTotal = coverageData.reduce((sum, item) => sum + item.value, 0);
  const coverageGradient = coverageData.reduce(
    (acc, item, index) => {
      const percentage = (item.value / coverageTotal) * 100;
      const start = acc.offset;
      const end = start + percentage;
      acc.stops.push(`${coverageColors[index % coverageColors.length]} ${start}% ${end}%`);
      acc.offset = end;
      return acc;
    },
    { stops: [] as string[], offset: 0 }
  );
  const coverageBackground = `conic-gradient(${coverageGradient.stops.join(", ")})`;

  return (
    <>
      <div className="text-white space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Mission Manager</p>
            <h1 className="text-3xl font-semibold">Welcome back, John 👋</h1>
            <p className="text-sm text-white/70">Here is a quick snapshot of what needs your attention.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-gradient-to-r from-[#ff9c4b] via-[#ffb86b] to-[#ff9c4b] px-4 py-2 text-sm font-semibold text-white transition hover:from-[#ffb86b] hover:to-[#ff9c4b]">
              Create mission
            </button>
            <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white">
              View missions
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">{s.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{s.value.toLocaleString("en-US")}</p>
                </div>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl"
                  style={{ color: s.color }}
                >
                  {s.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Donations</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Donation growth</h3>
              <div className="max-w-[55%] overflow-x-auto cfoc-scrollbar">
                <div className="inline-flex min-w-max rounded-full border border-white/10 bg-white/5 p-1 text-[11px] uppercase tracking-[0.2em]">
                  {(["weekly", "monthly"] as const).map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setDonationRange(range)}
                      className={`rounded-full px-3 py-1 transition ${
                        donationRange === range
                          ? "bg-white/15 text-white shadow"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {range === "weekly" ? "Weekly" : "Monthly"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-40 h-[240px] w-full overflow-x-auto cfoc-scrollbar">
              <div className="flex h-full min-w-max items-end gap-4 px-1">
                {donationData.map((item) => {
                  const height = (item.amount / donationMax) * 100;
                  return (
                    <div key={item.label} className="group flex h-full w-12 flex-col items-center">
                      <div
                        className="relative flex w-full flex-1 items-end justify-center"
                        style={{ ["--bar-height" as string]: `${height}%` } as CSSProperties}
                      >
                        <div
                          className="w-full rounded-lg bg-gradient-to-t from-[#ff9c4b] to-[#ffb86b]"
                          style={{ height: "var(--bar-height)", minHeight: "6px" } as CSSProperties}
                          title={`$${item.amount.toLocaleString("en-US")}`}
                        />
                        <div
                          className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-[#0f0f1a]/90 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100"
                          style={{ bottom: "calc(var(--bar-height) + 8px)" } as CSSProperties}
                        >
                          ${item.amount.toLocaleString("en-US")}
                        </div>
                      </div>
                      <div className="flex h-24 items-end justify-center pb-1">
                        <span
                          className="text-[9px] leading-none tracking-[0.12em] text-white/60"
                          style={verticalLabelStyle}
                        >
                          {item.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Coverage</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Mission distribution</h3>
            <div className="mt-4 flex h-[240px] items-center justify-center">
              <div className="relative h-44 w-44">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: coverageBackground,
                    WebkitMaskImage: "radial-gradient(circle, transparent 0 55%, #000 56%)",
                    maskImage: "radial-gradient(circle, transparent 0 55%, #000 56%)",
                  } as CSSProperties}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-xs text-white/70">
                  <span className="text-[11px] uppercase tracking-[0.2em]">Total</span>
                  <span className="text-base font-semibold text-white">$67'574</span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-white/70">
              <div className="flex items-center justify-between">
                <span>Total distributed</span>
                <span className="font-semibold text-white">$67'574</span>
              </div>
              <div className="grid gap-2">
                {coverageData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: coverageColors[index % coverageColors.length] }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-white/80">${item.value.toLocaleString("en-US")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent updates</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Last 24 hours</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <h3 className="text-sm font-semibold text-[#ff9c4b]">Missions</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                {recentActivities.missions.map((item, index) => (
                  <li key={index}>
                    {item.text} <span className="text-white/50">· {item.time}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <h3 className="text-sm font-semibold text-[#ff9c4b]">Donations</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                {recentActivities.donations.map((item, index) => (
                  <li key={index}>
                    {item.text} <span className="text-white/50">· {item.time}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <h3 className="text-sm font-semibold text-[#ff9c4b]">Volunteers</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                {recentActivities.volunteers.map((item, index) => (
                  <li key={index}>
                    {item.text} <span className="text-white/50">· {item.time}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Quick actions</h3>
            <p className="mt-1 text-sm text-white/70">Keep common actions within reach.</p>
            <div className="mt-4 grid gap-3">
              <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/20">
                View missions
              </button>
              <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/20">
                Create new project
              </button>
              <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/20">
                Create mission trip
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">To-do</h3>
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">3 tasks</span>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li className="flex items-start justify-between gap-3">
                <span>Submit Kenya mission report</span>
                <span className="text-xs text-white/50">Due 2024-06-15</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span>Review 2 pending donations</span>
                <span className="text-xs text-white/50">Due 2024-06-20</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span>Update volunteer list</span>
                <span className="text-xs text-white/50">Due 2024-06-18</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
