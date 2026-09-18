import { createServerFn } from "@tanstack/react-start";
import { EVENTS } from "./calendar";
import { allowAskTape } from "./rate-limit";

function todayET(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export const askTape = createServerFn({ method: "POST" })
  .validator((input: { prompt: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Tape is quiet in this environment." };
    if (!allowAskTape()) return { ok: false as const, error: "Tape is busy — try again in a minute." };

    const prompt = data.prompt.slice(0, 800);
    const iso = todayET();
    const todays = EVENTS.filter((e) => e.date === iso);
    const todayNote = todays.length
      ? ` Today (${iso}, ET) on the calendar: ${todays.map((e) => e.title).join("; ")}.`
      : ` Today is ${iso} (ET).`;
    const calendar = EVENTS.map(
      (e) => `${e.date} ${e.time ?? ""} ${e.title} — ${e.context} History: ${e.history}`,
    ).join("\n");
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              `You are the ACTA tape. Speak like a futures desk: MNQ, ES, gold, oil, VIX, DXY. Short sentences. No hype. ET times. When asked about a calendar print, say what it historically does in the first 15 minutes vs the rest of the session, which market usually leads, and the common fakeout.${todayNote} Give a walk, not a novel.`,
          },
          {
            role: "user",
            content: `Calendar:\n${calendar}\n\nAsk: ${prompt}`,
          },
        ],
      }),
    });
    if (!res.ok) return { ok: false as const, error: `Tape error ${res.status}` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { ok: true as const, text: body.choices?.[0]?.message?.content ?? "" };
  });
