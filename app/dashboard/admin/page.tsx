"use client";

import Link from "next/link";

const kpis = [
  {
    label: "Total sales",
    value: "$48,250",
    delta: "+12.4%",
    note: "Last 30 days",
  },
  {
    label: "Donations",
    value: "$32,910",
    delta: "+6.1%",
    note: "Last 30 days",
  },
  {
    label: "Online now",
    value: "58",
    delta: "+8",
    note: "Compared to yesterday",
  },
  {
    label: "Pending approvals",
    value: "7",
    delta: "3 projects / 4 missions",
    note: "Awaiting review",
  },
];

const approvals = [
  {
    id: "APR-1024",
    type: "Project",
    resourceId: "project-clean-water-lusaka",
    title: "Clean Water Wells - Lusaka",
    owner: "Grace N.",
    submitted: "2h ago",
    goal: "$18,000",
    region: "Zambia",
    status: "Pending",
  },
  {
    id: "APR-1025",
    type: "Mission",
    resourceId: "mission-medical-outreach-port-au-prince",
    title: "Medical Outreach - Port-au-Prince",
    owner: "Samuel R.",
    submitted: "5h ago",
    goal: "$9,500",
    region: "Haiti",
    status: "Pending",
  },
  {
    id: "APR-1026",
    type: "Project",
    resourceId: "project-school-kits-kinshasa",
    title: "School Kits - Kinshasa",
    owner: "Elisa M.",
    submitted: "1d ago",
    goal: "$6,200",
    region: "DRC",
    status: "Needs info",
  },
  {
    id: "APR-1027",
    type: "Mission",
    resourceId: "mission-youth-camp-accra",
    title: "Youth Camp Support - Accra",
    owner: "Daniel K.",
    submitted: "2d ago",
    goal: "$12,400",
    region: "Ghana",
    status: "In review",
  },
];

const sales = [
  { day: "Mon", value: 12 },
  { day: "Tue", value: 16 },
  { day: "Wed", value: 10 },
  { day: "Thu", value: 18 },
  { day: "Fri", value: 22 },
  { day: "Sat", value: 15 },
  { day: "Sun", value: 19 },
];

const activity = [
  {
    id: "ACT-1",
    title: "Mission approved",
    detail: "Emergency Relief - Manila",
    time: "25m ago",
  },
  {
    id: "ACT-2",
    title: "Donation captured",
    detail: "$520 · Hope Clinic",
    time: "1h ago",
  },
  {
    id: "ACT-3",
    title: "Project submitted",
    detail: "Training Center - Kigali",
    time: "2h ago",
  },
  {
    id: "ACT-4",
    title: "New partner onboarded",
    detail: "FaithWorks Church",
    time: "3h ago",
  },
];

const statusTone: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  "Needs info": "bg-rose-100 text-rose-700",
  "In review": "bg-blue-100 text-blue-700",
};

const typeTone: Record<string, string> = {
  Project: "bg-indigo-100 text-indigo-700",
  Mission: "bg-emerald-100 text-emerald-700",
};

export default function AdminDashboard() {
  const maxSales = Math.max(...sales.map((entry) => entry.value));

  return (
    <main className="min-h-screen bg-[#f5f6f7] text-[#271c70]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Admin hub
            </p>
            <h1 className="text-3xl font-semibold">
              Review, approve, and monitor
            </h1>
            <p className="max-w-2xl text-sm text-gray-600">
              Validate new missions and projects before they go live, and keep an
              eye on live performance in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-full border border-[#271c70]/30 px-4 py-2 text-sm font-semibold text-[#271c70] transition hover:bg-white"
            >
              Download report
            </button>
            <button
              type="button"
              className="rounded-full bg-[#271c70] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff9c4b]"
            >
              Create quick note
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white bg-white p-5 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                {item.label}
              </p>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <p className="text-2xl font-semibold">{item.value}</p>
                <span className="text-xs font-semibold text-emerald-600">
                  {item.delta}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">{item.note}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Approvals queue</h2>
                <p className="text-sm text-gray-500">
                  New submissions waiting for review.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["All", "Projects", "Missions"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="rounded-full border border-[#271c70]/20 px-3 py-1 text-xs font-semibold text-[#271c70] hover:bg-[#f5f6f7]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 divide-y divide-gray-100">
              {approvals.map((item) => {
                const basePath =
                  item.type === "Project" ? "/projectDetails" : "/missionDetails";
                const viewHref = `${basePath}/${item.resourceId}`;
                const editHref = `${basePath}/${item.resourceId}?edit=true`;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeTone[item.type]}`}
                        >
                          {item.type}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[item.status]}`}
                        >
                          {item.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.submitted}
                        </span>
                      </div>
                      <div>
                        <p className="text-base font-semibold">{item.title}</p>
                        <p className="text-xs text-gray-500">
                          Submitted by {item.owner} / Goal {item.goal} /{" "}
                          {item.region}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={viewHref}
                        className="rounded-full border border-[#271c70]/30 px-3 py-1.5 text-xs font-semibold text-[#271c70] transition hover:bg-[#f5f6f7]"
                      >
                        View
                      </Link>
                      <Link
                        href={editHref}
                        className="rounded-full border border-[#271c70]/30 px-3 py-1.5 text-xs font-semibold text-[#271c70] transition hover:bg-[#f5f6f7]"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="rounded-full bg-[#271c70] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#ff9c4b]"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Sales overview</h2>
                <span className="text-xs text-gray-400">Last 7 days</span>
              </div>
              <div className="mt-5 flex h-24 items-end gap-3">
                {sales.map((entry) => {
                  const height = Math.max(
                    20,
                    Math.round((entry.value / maxSales) * 100)
                  );
                  return (
                    <div
                      key={entry.day}
                      className="flex h-full w-full flex-col items-center gap-2"
                    >
                      <div className="flex h-full w-full items-end rounded-full bg-[#ff9c4b]/15">
                        <div
                          className="w-full rounded-full bg-[#ff9c4b]"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {entry.day}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>$12,480 total</span>
                <span>Avg order $82</span>
              </div>
            </div>

            <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Live traffic</h2>
                <span className="text-xs text-emerald-600">Realtime</span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-semibold">58</p>
                <p className="text-xs text-gray-500">Visitors online now</p>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Top page</span>
                  <span className="text-xs font-semibold text-[#271c70]">
                    /missions/hope
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg session</span>
                  <span className="text-xs font-semibold text-[#271c70]">
                    3m 12s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Conversion</span>
                  <span className="text-xs font-semibold text-[#271c70]">
                    4.8%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent activity</h2>
            <button
              type="button"
              className="text-xs font-semibold text-[#271c70] hover:text-[#ff9c4b]"
            >
              View all
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {activity.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between rounded-2xl border border-gray-100 bg-[#f9fafc] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.detail}</p>
                </div>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
