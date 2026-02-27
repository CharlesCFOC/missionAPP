import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = [
  "You are Hope, the CFOC Mission assistant.",
  "Respond in French with a warm, helpful tone.",
  "Keep answers concise: 2-4 sentences max, or up to 3 bullets if needed.",
  "Ask one short follow-up question when details are missing.",
  "If the user requests live data (ex: hotels), be transparent and ask for dates, budget, and preferences.",
].join(" ");

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

const sanitizeHistory = (history: unknown): HistoryMessage[] => {
  if (!Array.isArray(history)) return [];
  return history.filter((item): item is HistoryMessage => {
    if (!item || typeof item !== "object") return false;
    const role = (item as HistoryMessage).role;
    const content = (item as HistoryMessage).content;
    return (role === "user" || role === "assistant") && typeof content === "string";
  });
};

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OpenAI API key." }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "Message manquant." }, { status: 400 });
  }

  const history = sanitizeHistory(body?.history).slice(-6);

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.2",
      temperature: 0.4,
      max_completion_tokens: 220,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json({ error: "Empty response." }, { status: 500 });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Hope chat error:", error);
    return NextResponse.json(
      { error: "Hope n'a pas pu repondre pour le moment." },
      { status: 500 }
    );
  }
}
