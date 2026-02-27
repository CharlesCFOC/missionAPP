"use client";

import { useEffect, useMemo, useState } from "react";

const threads = [
  {
    id: "marie",
    name: "Marie L.",
    role: "Missionary",
    preview: "See you tomorrow for the mission prep!",
    time: "10:24",
    unread: 2,
    status: "online" as const,
    important: true,
    avatar:
      "https://images.unsplash.com/photo-1603415526960-f7e0328b1a2c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "david",
    name: "David K.",
    role: "Organizer",
    preview: "Just finished the budget report.",
    time: "Yesterday",
    unread: 0,
    status: "offline" as const,
    important: false,
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "team-zambia",
    name: "Team Zambia",
    role: "Field team",
    preview: "Meeting confirmed at 6PM.",
    time: "Mon",
    unread: 4,
    status: "busy" as const,
    important: true,
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "charles",
    name: "Charles D.",
    role: "Coordinator",
    preview: "Shared the latest mission checklist.",
    time: "Sun",
    unread: 0,
    status: "online" as const,
    important: false,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
  },
];

const messagesByThread: Record<
  string,
  { id: string; from: "me" | "them"; text: string; time: string }[]
> = {
  marie: [
    {
      id: "m1",
      from: "them",
      text: "See you tomorrow for the mission prep!",
      time: "10:24",
    },
    {
      id: "m2",
      from: "me",
      text: "Perfect. I will bring the updated materials.",
      time: "10:28",
    },
  ],
  david: [
    {
      id: "d1",
      from: "them",
      text: "Just finished the budget report.",
      time: "Yesterday",
    },
    {
      id: "d2",
      from: "me",
      text: "Great. Please send the summary when ready.",
      time: "Yesterday",
    },
  ],
  "team-zambia": [
    {
      id: "z1",
      from: "them",
      text: "Meeting confirmed at 6PM.",
      time: "Mon",
    },
    {
      id: "z2",
      from: "me",
      text: "Thanks everyone. Please share your updates before then.",
      time: "Mon",
    },
  ],
  charles: [
    {
      id: "c1",
      from: "them",
      text: "Shared the latest mission checklist.",
      time: "Sun",
    },
    {
      id: "c2",
      from: "me",
      text: "Received. I will review it tonight.",
      time: "Sun",
    },
  ],
};

const statusDot = {
  online: "bg-emerald-400",
  busy: "bg-yellow-400",
  offline: "bg-white/30",
};

export default function MessagesTab() {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(threads[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const filteredThreads = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    if (!lowered) return threads;
    return threads.filter((thread) =>
      thread.name.toLowerCase().includes(lowered)
    );
  }, [query]);

  useEffect(() => {
    if (filteredThreads.length === 0) {
      setActiveThreadId(null);
      return;
    }
    if (!filteredThreads.some((thread) => thread.id === activeThreadId)) {
      setActiveThreadId(filteredThreads[0]?.id ?? null);
    }
  }, [filteredThreads, activeThreadId]);

  const activeThread = filteredThreads.find((thread) => thread.id === activeThreadId) || null;
  const activeMessages = activeThreadId ? messagesByThread[activeThreadId] ?? [] : [];

  const handleSend = () => {
    if (!draft.trim()) return;
    setDraft("");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] min-h-[75vh] text-white">
      <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Inbox</p>
            <h2 className="text-lg font-semibold text-white">Conversations</h2>
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
            <p className="text-sm text-white/50">No conversations found.</p>
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
                  } ${thread.important ? "border-l-2 border-[#ff9c4b]" : "border border-transparent"}`}
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
                      <p className="text-sm font-semibold text-white">{thread.name}</p>
                      <span className="text-xs text-white/50">{thread.time}</span>
                    </div>
                    <p className="text-xs text-white/50">{thread.role}</p>
                    <p className="mt-1 text-xs text-white/70 line-clamp-1">{thread.preview}</p>
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
                  <p className="text-sm font-semibold text-white">{activeThread.name}</p>
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
                  <p className="mt-2 text-[11px] text-white/50">{message.time}</p>
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
  );
}
