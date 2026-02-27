"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Lottie from "lottie-react";
import ReactMarkdown from "react-markdown";
import { Sparkles, X } from "lucide-react";
import hopeAvatar from "@/public/hope-avatar.json";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type HopeAiSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const MAX_HISTORY = 6;

const quickPrompts = [
  "Résume mes tâches du jour.",
  "Rédige un message rapide à un volontaire.",
  "Quelles sont les heures en attente d'approbation ?",
  "Aide-moi à créer une nouvelle annonce de job.",
  "Propose un planning simple pour la semaine.",
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Salut 👋 Je suis Hope IA. Dis-moi ce que tu veux faire (volunteers, jobs, timesheets, messages) et je t'aide.",
  },
];

export default function HopeAiSidebar({ open, onClose }: HopeAiSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const historyPayload = useMemo(() => {
    return messages
      .filter((msg) => msg.id !== "welcome")
      .slice(-MAX_HISTORY)
      .map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }));
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const node = scrollContainerRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    try {
      const response = await fetch("/api/hopeChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: historyPayload }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Hope n'a pas pu repondre pour le moment.");
      }

      const data = await response.json().catch(() => null);
      const replyText =
        typeof data?.reply === "string"
          ? data.reply
          : "Hope n'a pas pu repondre pour le moment.";

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: replyText,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    await sendMessage(inputValue);
  };

  return (
    <>
      {/* Mobile scrim */}
      <button
        type="button"
        aria-label="Close Hope IA"
        onClick={onClose}
        className={`fixed inset-0 top-20 z-[60] bg-black/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Hope IA sidebar"
        className={`fixed bottom-0 right-0 top-20 z-[70] flex w-full flex-col border-l border-white/10 bg-[#0b0518]/80 backdrop-blur-2xl shadow-2xl transition-transform duration-300 sm:w-[420px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <div className="h-12 w-12 rounded-2xl border border-white/15 bg-white/5 flex items-center justify-center overflow-hidden">
            <Lottie
              animationData={hopeAvatar}
              loop
              autoplay
              className="h-10 w-10"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">
              Hope IA
            </p>
            <p className="text-sm font-semibold text-[#ff9c4b]">
              CFOC assistant
            </p>
          </div>
          <button
            type="button"
            aria-label="Close Hope IA"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-white/5 p-2 text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-white/10 px-5 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/60">
              Quick prompts
            </p>
            <Sparkles className="h-4 w-4 text-[#ff9c4b]" aria-hidden="true" />
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2 cfoc-scrollbar">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={isLoading}
                className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-white/80 transition hover:bg-white/10 disabled:opacity-60"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
          >
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow border ${
                    isUser
                      ? "ml-auto bg-[#4fa5ff]/20 text-white border-white/10"
                      : "mr-auto bg-white/10 text-white/90 border-white/15"
                  }`}
                >
                  <div className="prose prose-invert max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="mr-auto max-w-[85%] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80">
                Hope is thinking...
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-100">
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 px-4 py-3 flex gap-3 items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Ecris a Hope..."
              className="flex-1 bg-white/5 border border-white/15 rounded-2xl px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ff9c4b]"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="rounded-2xl bg-[#ff9c4b] px-4 py-2 text-sm font-semibold text-[#080313] transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
