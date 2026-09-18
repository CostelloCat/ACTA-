import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AskTape } from "@/components/ask-tape";
import { Shell } from "@/components/shell";
import {
  KIND_LABEL,
  eventsOn,
  monthGrid,
  nextEvent,
  shiftMonth,
  upcomingFrom,
  type CalEvent,
  type CalKind,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({ component: CalendarPage });

const KIND_CLASS: Record<CalKind, string> = {
  rates: "bg-rates/20 text-rates",
  inflation: "bg-inflation/20 text-inflation",
  oil: "bg-oil/20 text-oil",
  mag7: "bg-mag7/20 text-mag7",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isoToday() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function CalendarPage() {
  const now = new Date();
  const today = isoToday();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sel, setSel] = useState(today);
  const [sheet, setSheet] = useState(false);
  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const selected = eventsOn(sel);
  const table = upcomingFrom(today, 10);
  const upcoming = nextEvent();

  function jumpIso(iso: string, open = true) {
    setSel(iso);
    const [y, m] = iso.split("-").map(Number);
    if (y && m) {
      setYear(y);
      setMonth(m - 1);
    }
    if (open) setSheet(true);
  }

  const grokChips = selected.length
    ? selected.map((e) => ({
        label: `Grok · ${e.short}`,
        prompt: `${e.title} on ${e.date}${e.time ? ` ${e.time} ET` : ""}. Hits ${e.hits}. What does this print historically do to those markets in the first 15 minutes and through the session? Typical fakeout vs follow-through.`,
      }))
    : [
        {
          label: "Grok · next print",
          prompt: upcoming
            ? `${upcoming.title} is next. Hits ${upcoming.hits}. Historical reaction for MNQ, ES, gold.`
            : "Walk the next week of the calendar for MNQ, ES, gold.",
        },
      ];

  return (
    <Shell>
      <div className="relative -mx-3 -mt-6 min-h-[88vh] sm:-mx-5">
        <img
          src="/hero/mesh.jpg"
          alt=""
          className="mesh-drift pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="pointer-events-none absolute inset-0 bg-bg/40" />
        <div className="relative mx-auto max-w-5xl px-3 py-6 sm:px-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="bg-surface border-line flex min-h-11 items-center rounded-full border pr-3">
            <button
              type="button"
              className="grid size-11 place-items-center text-sm"
              aria-label="Previous month"
              onClick={() => {
                const n = shiftMonth(year, month, -1);
                setYear(n.year);
                setMonth(n.month);
              }}
            >
              ←
            </button>
            <select
              className="min-h-11 appearance-none bg-transparent px-1 text-sm outline-none"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              aria-label="Month"
            >
              {MONTHS.map((name, i) => (
                <option key={name} value={i}>
                  {name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="grid size-11 place-items-center text-sm"
              aria-label="Next month"
              onClick={() => {
                const n = shiftMonth(year, month, 1);
                setYear(n.year);
                setMonth(n.month);
              }}
            >
              →
            </button>
          </div>
          <select
            className="bg-surface border-line cal-select min-h-11 rounded-full border pl-3 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="Year"
          >
            {[2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={sel}
            onChange={(e) => e.target.value && jumpIso(e.target.value)}
            className="bg-surface border-line min-h-11 rounded-full border px-3 text-sm"
            aria-label="Jump to date"
          />
          <button type="button" className="pill pill-solid" onClick={() => jumpIso(today)}>
            Today
          </button>
        </div>

        <div className="border-line overflow-hidden rounded-2xl border bg-black/25 backdrop-blur-[2px]">
          <div className="text-muted grid grid-cols-7 border-b border-line text-center text-[11px] tracking-widest uppercase">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={`${d}${i}`} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((c, i) => {
              const ev = c.iso ? eventsOn(c.iso) : [];
              const on = c.iso === sel;
              const isToday = c.iso === today;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!c.day}
                  onClick={() => c.iso && jumpIso(c.iso)}
                  className={cn(
                    "border-white/10 min-h-24 border-r border-b p-2 text-left align-top sm:min-h-28",
                    on && "bg-black/45",
                    !c.day && "bg-black/20",
                  )}
                >
                  {c.day ? (
                    <>
                      <span className={cn("text-fg text-sm", isToday && "text-gold")}>{c.day}</span>
                      <div className="mt-1 flex flex-col gap-1">
                        {ev.map((e) => (
                          <span
                            key={e.short + e.title}
                            className={cn(
                              "truncate rounded-full px-1.5 py-0.5 text-[10px] leading-tight",
                              KIND_CLASS[e.kind],
                            )}
                          >
                            {e.short}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
        <div className="text-muted mt-3 flex flex-wrap gap-4 text-[11px] tracking-wide uppercase">
          {(Object.keys(KIND_LABEL) as CalKind[]).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <i className={cn("size-2 rounded-full", KIND_CLASS[k].split(" ")[0])} />
              {KIND_LABEL[k]}
            </span>
          ))}
        </div>

        {sheet ? <DateSheet iso={sel} events={selected} onClose={() => setSheet(false)} /> : null}

        <div className="mt-6">
          <AskTape chips={grokChips} />
        </div>

        <div className="bg-black/40 border-line mt-6 overflow-x-auto rounded-2xl border backdrop-blur-[2px]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-muted text-[11px] tracking-widest uppercase">
              <tr className="border-line border-b">
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Hits</th>
                <th className="px-4 py-3 font-medium">What it does</th>
              </tr>
            </thead>
            <tbody>
              {table.map((e) => (
                <tr key={e.title} className="border-line border-b last:border-0">
                  <td className="text-muted px-4 py-3 whitespace-nowrap">{formatWhen(e.date, e.time)}</td>
                  <td className="px-4 py-3">{e.title}</td>
                  <td className="text-muted px-4 py-3 whitespace-nowrap">{e.hits}</td>
                  <td className="text-muted px-4 py-3">{e.history}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </Shell>
  );
}

function DateSheet({ iso, events, onClose }: { iso: string; events: CalEvent[]; onClose: () => void }) {
  const day = new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <div className="fixed inset-0 z-40 grid place-items-end sm:place-items-center" onClick={onClose}>
      <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close" />
      <div
        className="bg-surface border-line relative z-10 max-h-[80dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-muted text-[10px] tracking-[0.22em] uppercase">Print window</p>
        <h2 className="mt-1 text-2xl">{day}</h2>
        {events.length ? (
          <ul className="mt-5 space-y-5">
            {events.map((e) => (
              <li key={e.title} className="border-line border-b pb-5 last:border-0 last:pb-0">
                <p className={cn("text-[10px] tracking-[0.18em] uppercase", "text-gold")}>
                  {KIND_LABEL[e.kind]}
                  {e.time ? ` · ${e.time} ET` : ""}
                </p>
                <p className="mt-1 text-lg">{e.title}</p>
                <p className="text-muted mt-1 text-xs tracking-wide uppercase">{e.hits}</p>
                <p className="mt-3 text-sm leading-relaxed">{e.context}</p>
                <p className="text-muted mt-2 text-sm leading-relaxed">{e.history}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted mt-4 text-sm">Quiet day. No scheduled print on this desk.</p>
        )}
        <button type="button" className="pill pill-solid mt-6" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function formatWhen(iso: string, time?: string) {
  const d = new Date(`${iso}T12:00:00`);
  const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return time ? `${day} · ${time}` : day;
}
