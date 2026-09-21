import { useState } from "react";
import { getLevels, type LevelPack } from "@/lib/levels";
import { cn } from "@/lib/utils";

const KEY: Record<string, keyof LevelPack | "prior" | "overnight"> = {
  "Prior day high / low": "prior",
  VWAP: "vwap",
  "Overnight range": "overnight",
  "ONH / ONL": "overnight",
  "Yearly opening reference": "yearOpen",
  "London VWAP": "vwap",
  "Prior settle": "prior",
};

function fmt(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function read(key: string, pack: LevelPack) {
  const kind = KEY[key];
  if (kind === "prior") return `High ${fmt(pack.priorHigh)} · Low ${fmt(pack.priorLow)}`;
  if (kind === "overnight") return `ONH ${fmt(pack.onh)} · ONL ${fmt(pack.onl)}`;
  if (kind === "vwap") return fmt(pack.vwap);
  if (kind === "yearOpen") return fmt(pack.yearOpen);
  return null;
}

export function LevelKeys({ slug, labels }: { slug: string; labels: string[] }) {
  const [pack, setPack] = useState<LevelPack | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function hit(label: string) {
    if (!KEY[label]) return;
    setOpen(label);
    if (pack || busy) return;
    setBusy(true);
    const next = await getLevels({ data: { slug } });
    setPack(next);
    setBusy(false);
  }

  return (
    <ul className="mt-6 grid gap-2 sm:grid-cols-2">
      {labels.map((lv) => {
        const live = Boolean(KEY[lv]);
        const on = open === lv;
        return (
          <li key={lv}>
            <button
              type="button"
              disabled={!live}
              onClick={() => hit(lv)}
              className={cn(
                "border-line w-full rounded-xl border px-4 py-3 text-left text-sm",
                live ? "bg-surface hover:border-gold" : "bg-surface text-muted",
                on && "border-gold",
              )}
            >
              <span>{lv}</span>
              {on ? (
                <span className="text-gold mt-1 block text-[11px] tracking-wide uppercase">
                  {busy && !pack ? "Pulling Yahoo…" : pack ? `${read(lv, pack)} · ${pack.symbol}` : "No print"}
                </span>
              ) : live ? (
                <span className="text-muted mt-1 block text-[11px]">Tap for the live number</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
