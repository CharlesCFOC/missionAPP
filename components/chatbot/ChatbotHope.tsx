"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import hopeAvatar from "@/public/hope-avatar.json";
import ReactMarkdown from "react-markdown";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const gradientPanel = "bg-gradient-to-br from-[#080313] via-[#260d5c] to-[#5d3ab9]";
const glassPanel = "bg-white/10 backdrop-blur-2xl";

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Salut 👋 Je suis Hope, ton assistante mission. Choisis une question rapide ci-dessous ou écris-moi ce dont tu as besoin.",
  },
];

const quickPrompts = [
  "Trouve-moi un hotel a Lusaka.",
  "Resume la derniere mission en 3 points.",
  "Quelles sont les priorites de cette semaine ?",
  "Propose un plan d'action pour une nouvelle mission.",
  "Ecris un message court pour remercier les donateurs.",
];

const MAX_HISTORY = 6;

export default function ChatbotHope() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const node = scrollContainerRef.current;
    if (node) {
      node.scrollTo({
        top: node.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isOpen]);

  const sendMessage = async (messageText: string) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
    };

    const historyPayload = messages
      .filter((msg) => msg.id !== "welcome")
      .slice(-MAX_HISTORY)
      .map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/hopeChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          history: historyPayload,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || "Hope n’a pas pu répondre pour le moment.";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const replyText =
        typeof data === "string"
          ? data
          : data.reply || data.message || JSON.stringify(data);

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

  function TypewriterText({ text, speed }: { text: string; speed?: number }) {
    const [displayedText, setDisplayedText] = useState("");
    useEffect(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText((prev) => text.slice(0, i));
        i++;
        if (i > text.length) {
          clearInterval(interval);
        }
      }, speed || 50);
      return () => clearInterval(interval);
    }, [text, speed]);
    return <span>{displayedText}</span>;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="hope-panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`${glassPanel} text-white shadow-2xl border border-white/20 rounded-3xl w-[90vw] max-w-md flex flex-col h-[520px] sm:h-[560px]`}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden">
                <Lottie animationData={hopeAvatar} loop autoplay className="w-16 h-16" />
              </div>
              <div className="flex-1">
                <p className="text-sm uppercase tracking-wide text-white/60">CFOC Hope Assistant</p>
                <p className="text-base font-semibold text-[#ff9c4b]">Always ready to help 🌍</p>
                <p className="text-white/80 text-sm mt-1">
                  By OpenAI gpt-5.2
                </p>
              </div>
              <button
                type="button"
                aria-label="Fermer Hope"
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="border-b border-white/10 px-5 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Questions rapides</p>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-2 cfoc-scrollbar">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      disabled={isLoading}
                      className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] text-white/80 transition hover:bg-white/20 disabled:opacity-60"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {messages.map((message) => {
                  const isUser = message.role === "user";
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${
                        isUser
                          ? "ml-auto bg-blue-500/40 text-white border border-white/10 backdrop-blur-sm"
                          : "mr-auto bg-white/10 text-[#ff9c4b] backdrop-blur-md border border-white/20"
                      }`}
                    >
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 {...props} style={{ marginBottom: "1.5em" }} />,
                            h2: ({ node, ...props }) => <h2 {...props} style={{ marginBottom: "1.5em" }} />,
                            h3: ({ node, ...props }) => <h3 {...props} style={{ marginBottom: "1.5em" }} />,
                            h4: ({ node, ...props }) => <h4 {...props} style={{ marginBottom: "1.5em" }} />,
                            p: ({ node, ...props }) => <p {...props} style={{ marginBottom: "1.5em" }} />,
                            li: ({ node, ...props }) => <li {...props} style={{ marginBottom: "1.5em" }} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  );
                })}

                {isLoading && (
                  <div className="mr-auto text-sm text-white/70 bg-white/10 border border-white/10 rounded-2xl px-4 py-2">
                    <TypewriterText text="Hope is thinking..." speed={80} />
                  </div>
                )}

                {error && (
                  <div className="text-xs text-red-200 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-2">
                    {error}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="border-t border-white/10 px-4 py-3 flex gap-3 items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Écris ton message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-[#ff9c4b] placeholder-white/50"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-2 rounded-2xl bg-[#ff9c4b] text-[#080313] font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition hover:brightness-110"
                >
                  Send
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        whileTap={{ scale: 0.96 }}
        className={`${gradientPanel} text-white px-5 py-3 rounded-full shadow-lg border border-white/10 text-sm font-semibold flex items-center gap-2`}
      >
        <div
          aria-hidden="true"
          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center overflow-hidden"
        >
          <Lottie animationData={hopeAvatar} loop autoplay className="w-7 h-7" />
        </div>
        {isOpen ? "Fermer Hope" : "Chat with Hope"}
      </motion.button>
    </div>
  );
}
