"use client";
import { useEffect, useState } from "react";
import {
  FileText,
  Folder,
  LayoutDashboard,
  ListChecks,
  Lock,
  MessageCircle,
  Plane,
  Share2,
  Users,
  Wallet,
} from "lucide-react";
import DashboardTab from "@/components/missionControl/DashboardTab";
import MissionsTab from "@/components/missionControl/MissionsTab";
import ProjectsTab from "@/components/missionControl/ProjectsTab";
import MessagesTab from "@/components/missionControl/MessagesTab";
import TeamTab from "@/components/missionControl/TeamTab";
import FinanceTab from "@/components/missionControl/FinanceTab";
import TodoTab from "@/components/missionControl/TodoTab";
import DriveTab from "@/components/missionControl/drive/DriveTab";
import MyOrganisationTab from "@/components/missionControl/MyOrganisationTab";
import MyExpediaTab from "@/components/missionControl/MyExpediaTab";

const MISSION_CONTROL_TABS = [
  { id: "organisation", label: "My Organization", icon: Lock },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "missions", label: "Missions", icon: Share2 },
  { id: "projects", label: "Projects", icon: FileText },
  { id: "team", label: "Team", icon: Users },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "drive", label: "Drive", icon: Folder },
  { id: "todo", label: "To-Do List", icon: ListChecks },
  { id: "expedia", label: "My Expedia", icon: Plane },
];

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newMessages, setNewMessages] = useState(3);
  const isExpediaTab = activeTab === "expedia";

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab />;
      case "missions": return <MissionsTab />;
      case "projects": return <ProjectsTab />;
      case "organisation": return <MyOrganisationTab allowEdit={false} showEditInSettingsLink />;
      case "team": return <TeamTab />;
      case "messages": return <MessagesTab />;
      case "finance": return <FinanceTab />;
      case "todo": return <TodoTab />;
      case "drive": return <DriveTab />;
      case "expedia": return <MyExpediaTab />;
      default: return <DashboardTab />;
    }
  };

  useEffect(() => {
    if (activeTab === "messages") {
      setNewMessages(0);
    }
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "messages") setNewMessages(0);
  };

  return (
    <main
      className="min-h-screen flex flex-col md:flex-row text-white"
      style={isExpediaTab ? { marginTop: 0, paddingTop: 0 } : undefined}
    >
      {/* ░░ MENU LATÉRAL FIXE ░░ */}
      <aside className="hidden md:flex fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white/5 backdrop-blur-xl text-white shadow-md flex-col py-8 px-4 space-y-3">
        {MISSION_CONTROL_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
          <div key={tab.id} className="space-y-2">
            <button
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`relative w-full flex items-center justify-start px-4 py-2 rounded-xl text-sm font-semibold text-left transition
                ${activeTab === tab.id
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
            {(tab.id === "organisation" || tab.id === "projects") && (
              <div className="my-2 h-px w-full bg-white/50" />
            )}
          </div>
          );
        })}
      </aside>

      <div
        className={`w-full md:ml-64 ${
          isExpediaTab ? "min-h-[calc(80vh-5rem)] flex flex-col" : ""
        }`}
      >
        <div className="md:hidden sticky top-16 z-20 border-b border-white/10 bg-[#120626]/80 backdrop-blur-md px-4 py-3">
          <div className="flex gap-2 overflow-x-auto cfoc-scrollbar pb-1">
            {MISSION_CONTROL_TABS.map((tab) => (
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

        {/* ░░ CONTENU DYNAMIQUE À DROITE ░░ */}
        <section
          className={`w-full ${
            isExpediaTab
              ? "flex-1 px-0 py-0 overflow-hidden"
              : "px-4 sm:px-6 md:px-10 py-10 md:py-16"
          }`}
        >
          {renderTab()}
        </section>
      </div>
    </main>
  );
}
