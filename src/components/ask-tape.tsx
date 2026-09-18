import { useState } from "react";
import { askTape } from "@/lib/tape";
import { cn } from "@/lib/utils";

type Chip = { label: string; prompt: string };

const DEFAULT: Chip[] = [
  {
    label: "Grok · walk this month",
    prompt: "Walk this month for MNQ, ES, gold. What matters, what to ignore.",
  },
  {
    label: "Grok · today's FOMC",
    prompt:
      "Today is 16 Sep 2026. FOMC + dots + retail sales. How do I trade MNQ into 14:00 and the presser.",
  },
];

export function AskTape({ chips = DEFAULT, id }: { chips?: Chip[]; id?: string }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("Walk today's tape.");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run(q: string) {
    setBusy(true);
    setErr("");
    setText("");
    setOpen(true);
    const res = await askTape({ data: { prompt: q } });
    setBusy(false);
    if (!res.ok) setErr(res.error);
    else setText(res.text);
  }

  return (
    <div id={id} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <button key={c.label} type="button" onClick={() => run(c.prompt)} className="pill pill-solid">
            {c.label}
          </button>
        ))}
      </div>
      {open ? (
        <div className="bg-surface border-line rounded-2xl border p-4">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (prompt.trim()) void run(prompt.trim());
            }}
          >
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-raised text-fg border-line min-h-11 flex-1 rounded-full border px-4 text-sm outline-none"
              placeholder="Ask the tape"
            />
            <button type="submit" disabled={busy} className="pill pill-solid min-h-11">
              {busy ? "Reading…" : "Send"}
            </button>
          </form>
          {err ? <p className="text-down mt-3 text-sm">{err}</p> : null}
          {text ? (
            <p className={cn("text-fg mt-3 text-sm leading-relaxed whitespace-pre-wrap")}>{text}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
