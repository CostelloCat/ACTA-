import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookNews } from "@/components/book-news";
import { Shell } from "@/components/shell";
import { EVENTS } from "@/lib/calendar";
import { PIN_CATALOG } from "@/lib/desk-pins";
import { askTape } from "@/lib/tape";
import { cn } from "@/lib/utils";

type Hit = {
  id: string;
  kind: "desk" | "print" | "page";
  label: string;
  dek: string;
  to?: string;
  grok?: string;
};

const PAGES: Hit[] = [
  { id: "desk", kind: "page", label: "Desk", dek: "Priority catalyst, next risk, tape", to: "/" },
  { id: "news", kind: "page", label: "Catalyst Radar", dek: "Verified breaking signals and source rooms", to: "/news" },
  { id: "cal", kind: "page", label: "Trading Calendar", dek: "Prints and speeches", to: "/calendar" },
  { id: "socials", kind: "page", label: "Socials", dek: "X, YouTube, TV, Kick", to: "/socials" },
  { id: "crypto", kind: "page", label: "Crypto", dek: "BTC ETH SOL", to: "/crypto" },
];

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: String(s.q ?? "") }),
  component: SearchPage,
});

function SearchPage() {
  const { q: initial } = Route.useSearch();
  const [q, setQ] = useState(initial);
  const [grok, setGrok] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const needle = q.trim().toLowerCase();

  const hits = useMemo(() => {
    const desks: Hit[] = PIN_CATALOG.map((p) => ({
      id: p.slug,
      kind: "desk",
      label: p.label,
      dek: "Market desk",
      to: p.to,
    }));
    const prints: Hit[] = EVENTS.map((e) => ({
      id: e.short + e.date,
      kind: "print",
      label: e.title,
      dek: `${e.date}${e.time ? ` · ${e.time} ET` : ""} · ${e.hits}`,
      to: "/calendar",
      grok: `${e.title}. Hits ${e.hits}. ${e.history}`,
    }));
    const all = [...PAGES, ...desks, ...prints];
    if (!needle) return all.slice(0, 10);
    return all.filter((h) => `${h.label} ${h.dek}`.toLowerCase().includes(needle)).slice(0, 12);
  }, [needle]);

  async function ask() {
    const query = q.trim();
    if (!query) return;
    setBusy(true);
    setGrok("");
    const res = await askTape({ data: { prompt: query } });
    setBusy(false);
    setGrok(res.ok ? res.text : res.error);
  }

  return (
    <Shell>
      <div className="mx-auto max-w-2xl">
        <p className="text-muted text-[10px] tracking-[0.24em] uppercase">Command</p>
        <h1 className="mt-1 text-3xl sm:text-4xl">Search</h1>
        <form
          className="bg-surface border-line mt-6 flex items-center gap-2 rounded-full border px-4"
          onSubmit={(e) => {
            e.preventDefault();
            void nav({ to: "/search", search: { q: q.trim() } });
          }}
        >
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="NQ, FOMC, gold, Warsh…"
            className="text-fg min-h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <button type="submit" className="pill pill-solid">
            Find
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button type="button" className="pill" onClick={() => void ask()} disabled={busy}>
            {busy ? "Astra…" : "Ask Astra"}
          </button>
          <a
            className="pill"
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q || "live")}`}
            target="_blank"
            rel="noreferrer"
          >
            YouTube
          </a>
        </div>
        {grok ? (
          <div className="border-line mt-4 rounded-2xl border bg-black/20 p-4">
            <p className="text-muted text-[9px] tracking-[0.18em] uppercase">Astra · ACTA assistant · current engine Grok</p>
            <p className="text-muted mt-2 text-sm leading-relaxed whitespace-pre-wrap">{grok}</p>
          </div>
        ) : null}
        {q.trim().length >= 2 ? <BookNews query={q.trim()} /> : null}
        <ul className="mt-6 divide-y divide-line">
          {hits.map((h) => (
            <li key={h.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn("text-[10px] tracking-[0.18em] uppercase", "text-muted")}>{h.kind}</p>
                  {h.to ? (
                    <Link to={h.to} className="mt-0.5 block text-sm no-underline">
                      {h.label}
                    </Link>
                  ) : (
                    <p className="mt-0.5 text-sm">{h.label}</p>
                  )}
                  <p className="text-muted mt-0.5 text-xs">{h.dek}</p>
                </div>
                {h.grok ? (
                  <button
                    type="button"
                    className="pill shrink-0"
                    onClick={() => {
                      setQ(h.label);
                      void askTape({ data: { prompt: h.grok ?? h.label } }).then((res) =>
                        setGrok(res.ok ? res.text : res.error),
                      );
                    }}
                  >
                    Astra
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        {!hits.length ? <p className="text-muted mt-8 text-sm">Nothing on the desk for that.</p> : null}
      </div>
    </Shell>
  );
}
