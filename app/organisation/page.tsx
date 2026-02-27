"use client";

import { CSSProperties, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Check,
  Download,
  FileText,
  Folder,
  Keyboard,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  Plus,
  Search,
  Share2,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import Lottie from "lottie-react";
import hopeAvatar from "/public/hope-avatar.json";

const missionManagerTools = [
  {
    name: "Hope Assistant - By Open IA",
    description: "Get instant support for your missions and projects management.",
    icon: Bot,
    preview: {
      type: "assistant",
      prompts: [
        "Find a hotel in Lusaka.",
        "Summarize the last mission in 3 points.",
        "Show the latest project update.",
      ],
    },
  },
  {
    name: "White Label",
    description: "Share your present missions and projects with partners and communities.",
    icon: Share2,
    preview: {
      type: "white-label",
      title: "Partner-ready page",
    },
  },
  {
    name: "Dashboard",
    description: "See the big picture at a glance.",
    icon: LayoutDashboard,
    preview: {
      type: "dashboard",
      title: "Mission overview",
      stats: [
        { label: "Active missions", value: "5" },
        { label: "Projects", value: "8" },
        { label: "Donations", value: "$12,960" },
      ],
    },
  },
  {
    name: "Team",
    description: "Assign roles and keep everyone aligned.",
    icon: Users,
    preview: {
      type: "team",
      title: "Team overview",
      subtitle: "Active roles",
      items: ["Project Lead", "Field Ops", "Volunteer Care"],
    },
  },
  {
    name: "Chat",
    description: "Keep conversations and updates in one place.",
    icon: MessageCircle,
    preview: {
      type: "chat",
      title: "Mission chat",
      messages: [
        { from: "Coordination", text: "Logistics confirmed.", side: "left" },
        { from: "Volunteer", text: "Supplies arriving today.", side: "left" },
        { from: "You", text: "Sharing the update with everyone.", side: "right" },
      ],
    },
  },
  {
    name: "Finance",
    description: "Track budgets, donations, and spending.",
    icon: Wallet,
    preview: {
      type: "finance",
      title: "Budget tracker",
      stats: [
        { label: "Donations", value: "$12,960", fill: "70%" },
        { label: "Spent", value: "$4,820", fill: "35%" },
      ],
    },
  },
  {
    name: "Drive",
    description: "Store files securely and share with the right people.",
    icon: Folder,
    preview: {
      type: "drive",
      title: "Shared drive",
      files: [
        { name: "Project plan.pdf", meta: "Updated today" },
        { name: "Budget Q3.xlsx", meta: "Finance" },
        { name: "Partner brief.docx", meta: "Outreach" },
      ],
    },
  },
  {
    name: "To-do List",
    description: "Organize tasks and follow progress.",
    icon: ListChecks,
    preview: {
      type: "todo",
      title: "Weekly tasks",
      tasks: [
        { label: "Assign field volunteers", done: true },
        { label: "Publish mission update", done: false },
        { label: "Confirm transport plan", done: false },
      ],
    },
  },
] as const;

type MissionManagerTool = (typeof missionManagerTools)[number];

type FinanceRow = {
  category: string;
  detail: string;
  amount: string;
  type: string;
  status: string;
};

const financeRows: FinanceRow[] = [
  {
    category: "Travel",
    detail: "Flights",
    amount: "$1,200",
    type: "Expense",
    status: "Approved",
  },
  {
    category: "Supplies",
    detail: "Water filters",
    amount: "$860",
    type: "Expense",
    status: "Pending",
  },
  {
    category: "Donations",
    detail: "Community",
    amount: "$3,400",
    type: "Income",
    status: "Received",
  },
];

const renderMissionManagerPreview = (tool: MissionManagerTool) => {
  switch (tool.preview.type) {
    case "assistant":
      return (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/10">
              <Lottie animationData={hopeAvatar} loop autoplay className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#4fa5ff]">
                Hope Assistant - By Open IA
              </p>
              <p className="text-sm font-semibold text-[#4fa5ff]">Always ready to help</p>
              <p className="text-xs text-[#4fa5ff]/70">
                CFOC Hope Assistant - by OpenAI gpt-5.2
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              Quick questions
            </p>
            <div className="flex gap-2 overflow-x-auto cfoc-scrollbar pb-1">
              {tool.preview.prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] text-white/80 transition hover:bg-white/20"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs text-[#ff9c4b]">
            Hi, I am Hope. Choose a quick question below or type what you need.
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-white/60">
            <Keyboard className="h-4 w-4 text-white/50" aria-hidden="true" />
            <span>Type your message...</span>
            <span className="ml-auto rounded-full bg-[#ff9c4b] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#2a1847]">
              Send
            </span>
          </div>
        </div>
      );
    case "white-label":
      return (
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#4fa5ff]">White label</p>
            <h4 className="text-lg font-semibold text-white">{tool.preview.title}</h4>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff9c4b] to-[#ffb86b] text-[9px] font-semibold text-[#2a1847] text-center leading-tight px-1">
                Your organization
              </div>
              <div>
                <p className="text-sm font-semibold text-white">CFOC Mission International</p>
                <p className="text-xs text-white/60">Partner header view</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Email", "Call", "Website"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full bg-[#4fa5ff]" />
            <span>Share a branded experience for partners and communities.</span>
          </div>
        </div>
      );
    case "dashboard": {
      const dashboardBars = [
        { label: "Jan", amount: 1200 },
        { label: "Feb", amount: 2800 },
        { label: "Mar", amount: 1900 },
        { label: "Apr", amount: 4300 },
        { label: "May", amount: 1600 },
        { label: "Jun", amount: 2400 },
        { label: "Jul", amount: 3100 },
        { label: "Aug", amount: 2700 },
        { label: "Sep", amount: 3600 },
        { label: "Oct", amount: 4200 },
        { label: "Nov", amount: 3900 },
        { label: "Dec", amount: 4600 },
      ];
      const dashboardMax = Math.max(...dashboardBars.map((item) => item.amount), 1);
      return (
        <div className="flex h-full flex-col gap-4 min-w-0">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Snapshot</p>
            <h4 className="text-lg font-semibold text-white">{tool.preview.title}</h4>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {tool.preview.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              Monthly trend
            </p>
            <div className="mt-3 flex items-end gap-2 h-24">
              {dashboardBars.map((bar) => (
                <div key={bar.label} className="flex-1">
                  <div className="rounded-full bg-white/10 h-24 flex items-end">
                    <div
                      className="w-full rounded-full bg-gradient-to-t from-[#ff9c4b] to-[#ffb86b]"
                      style={{ height: `${(bar.amount / dashboardMax) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[9px] text-white/50 text-center">{bar.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    case "team":
      return (
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Team</p>
            <h4 className="text-lg font-semibold text-white">{tool.preview.title}</h4>
            <p className="text-xs text-white/60">{tool.preview.subtitle}</p>
          </div>
          <div className="space-y-2">
            {tool.preview.items.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <span className="text-sm text-white/80">{item}</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    case "chat":
      return (
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Chat</p>
            <h4 className="text-lg font-semibold text-white">{tool.preview.title}</h4>
          </div>
          <div className="space-y-3">
            {tool.preview.messages.map((message) => (
              <div
                key={message.text}
                className={`max-w-[78%] rounded-2xl px-3 py-2 text-xs ${
                  message.side === "right"
                    ? "ml-auto bg-[#ff9c4b] text-[#2a1847] shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                    : "bg-white/10 text-white/70"
                }`}
              >
                <span className="block text-[9px] uppercase tracking-[0.2em] text-white/50">
                  {message.from}
                </span>
                <span className={message.side === "right" ? "text-[#2a1847]" : "text-white/80"}>
                  {message.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-white/60">
            <Keyboard className="h-4 w-4 text-white/50" aria-hidden="true" />
            <span>Type your message...</span>
            <span className="ml-auto rounded-full bg-[#ff9c4b] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#2a1847]">
              Send
            </span>
          </div>
        </div>
      );
    case "finance":
      return (
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Finance</p>
            <h4 className="text-lg font-semibold text-white">{tool.preview.title}</h4>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/60">
              <span>Latest activity</span>
              <span className="inline-flex items-center gap-2 text-[10px] text-white/60">
                <Download className="h-3 w-3 text-white/70" aria-hidden="true" />
                Export
              </span>
            </div>
            <div className="grid grid-cols-[1.1fr_1.6fr_0.9fr_0.9fr_0.5fr] gap-2 border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/60">
              <span>Category</span>
              <span>Details</span>
              <span>Amount</span>
              <span>Type</span>
              <span>Status</span>
            </div>
            {financeRows.map((row, index) => (
              <div
                key={row.detail}
                className={`grid grid-cols-[1.1fr_1.6fr_0.9fr_0.9fr_0.5fr] gap-2 px-3 py-2 ${
                  index === 1 ? "bg-[#ff9c4b]/10" : index === 2 ? "bg-white/10" : ""
                }`}
              >
                <span className="text-xs text-white/80">{row.category}</span>
                <span className="text-xs text-white/60">{row.detail}</span>
                <span className="text-xs text-white">{row.amount}</span>
                <span className="text-xs text-white/70">{row.type}</span>
                <span className="text-xs text-white/50">{row.status}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {tool.preview.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"
              >
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>{stat.label}</span>
                  <span className="text-white font-semibold">{stat.value}</span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#ff9c4b] to-[#ffb86b]"
                    style={{ width: stat.fill }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "drive": {
      const driveFolders = ["Mission Reports", "New project", "Photos"];
      const movingFile = tool.preview.files[1] ?? tool.preview.files[0];
      return (
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Drive</p>
            <h4 className="text-lg font-semibold text-white">{tool.preview.title}</h4>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-1 min-w-[180px] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-white/60">
                <Search className="h-3.5 w-3.5 text-white/50" aria-hidden="true" />
                <span>Search files or folders...</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-white/70">
                <Plus className="h-3.5 w-3.5 text-white/60" aria-hidden="true" />
                New folder
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-white/70">
                <Upload className="h-3.5 w-3.5 text-white/60" aria-hidden="true" />
                Upload file
              </span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/60">
                <span>Folder</span>
                <span className="ml-auto inline-flex items-center gap-2 text-[10px] text-white/60">
                  Browse
                  <ArrowRight className="h-3 w-3 text-white/40" aria-hidden="true" />
                </span>
              </div>
              {driveFolders.map((folder) => (
                <div
                  key={folder}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-[#ff9c4b]" aria-hidden="true" />
                    <span className="font-semibold text-white">{folder}</span>
                  </div>
                  <span className="text-[10px] text-white/40">Folder</span>
                </div>
              ))}
              {tool.preview.files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#ff9c4b]" aria-hidden="true" />
                    <span className="font-semibold text-white">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-white/50">{file.meta}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <FileText className="h-4 w-4 text-[#ff9c4b]" aria-hidden="true" />
                <span className="font-semibold text-white">{movingFile.name}</span>
                <motion.span
                  className="ml-auto inline-flex items-center gap-2 text-[10px] text-white/60"
                >
                  <Upload className="h-3 w-3 text-white/60" aria-hidden="true" />
                  <span className="cfoc-typewriter">is uploading...</span>
                </motion.span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#ff9c4b] to-[#ffb86b]"
                  initial={{ width: "10%" }}
                  animate={{ width: ["10%", "90%", "10%"] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    case "todo":
      return (
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">To-do list</p>
            <h4 className="text-lg font-semibold text-white">{tool.preview.title}</h4>
          </div>
          <div className="space-y-2">
            {tool.preview.tasks.map((task) => (
              <div
                key={task.label}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    task.done ? "bg-[#ff9c4b]" : "bg-white/20"
                  }`}
                />
                <span className={task.done ? "text-white/90" : "text-white/60"}>
                  {task.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
};

const whyImpact = [
  {
    title: "Public visibility",
    copy: "Supporters can discover and engage with missions that matter.",
  },
  {
    title: "Internal structure",
    copy: "Teams know who owns what and work stays organized.",
  },
  {
    title: "Faster decisions",
    copy: "Leaders see blockers and act with confidence.",
  },
  {
    title: "Less burnout",
    copy: "Consistency replaces chaos, even when leaders change.",
  },
];

export default function OrganisationPage() {
  const [activeToolIndex, setActiveToolIndex] = useState(0);
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
  const stagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };
  const activeTool = missionManagerTools[activeToolIndex];

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
          className="max-w-6xl mx-auto px-6 pt-24 pb-8 text-center"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            My Mission Manager
          </h1>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">
                Manage your project
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {["Create", "Present", "Organize", "Foundraise"].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">
                Manage your mission
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {[
                  "Coordinate",
                  "Communicate",
                  "Give clarity",
                  "Receive support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">
                We manage your trip
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {[
                  "Expert travel agent",
                  "Focus on your need",
                  "Anderstand mission field",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.header>
        <motion.section
          id="mission-manager"
          className="relative max-w-6xl mx-auto px-6 pt-16"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr] items-start">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-[#4fa5ff] mb-3">
                    Mission Manager
                  </h2>
                  <p className="text-sm text-white/70">
                    It removes stress, creates ownership, and keeps momentum when leaders change.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    You get access to
                  </p>
                  <div className="space-y-3">
                    {missionManagerTools.map((tool, index) => {
                      const Icon = tool.icon;
                      const isActive = index === activeToolIndex;
                      const isAssistant = tool.preview.type === "assistant";
                      const isWhiteLabel = tool.preview.type === "white-label";
                      const isHighlighted = isAssistant || isWhiteLabel;
                      return (
                        <div key={tool.name} className="space-y-3">
                          <div
                            role="button"
                            tabIndex={0}
                            onMouseEnter={() => setActiveToolIndex(index)}
                            onFocus={() => setActiveToolIndex(index)}
                            className={`flex items-start gap-3 rounded-2xl px-4 py-3 transition ${
                              isActive
                                ? "border border-white/20 bg-white/10"
                                : "border border-transparent hover:border-white/20 hover:bg-white/5"
                            }`}
                          >
                            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                              <Icon
                                className={`h-4 w-4 ${
                                  isHighlighted ? "text-[#4fa5ff]" : "text-[#ff9c4b]"
                                }`}
                                aria-hidden="true"
                              />
                            </span>
                            <div className="flex flex-col">
                              <span
                                className={`text-sm font-semibold ${
                                  isHighlighted ? "text-[#4fa5ff]" : "text-white"
                                }`}
                              >
                                {tool.name}
                              </span>
                              <span
                                className={`text-sm ${
                                  isAssistant || isWhiteLabel
                                    ? "text-white font-normal"
                                    : "text-white/70 font-normal"
                                }`}
                              >
                                {tool.description}
                              </span>
                            </div>
                          </div>
                          {tool.preview.type === "white-label" && (
                            <div className="h-px w-full bg-white/20" aria-hidden="true" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#140b2f]/60 p-4 md:p-5 lg:mt-16 min-h-[420px] flex flex-col min-w-0 w-full overflow-hidden">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
                  Live preview
                </p>
                <motion.div
                  key={activeTool.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="flex-1 min-w-0"
                >
                  {renderMissionManagerPreview(activeTool)}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="why"
          className="relative max-w-6xl mx-auto px-6 pb-24 pt-12"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-[#ff9c4b] mb-6">
            Why CFOC Impact
          </h2>
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {whyImpact.map((item) => (
              <motion.div
                key={item.title}
                variants={reveal}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-white/70">{item.copy}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
