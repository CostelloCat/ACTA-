import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AskTape } from "@/components/ask-tape";
import { CatalystRail } from "@/components/catalyst-rail";
import { Shell } from "@/components/shell";
import {
  EVENTS, KIND_LABEL, eventsOn, monthGrid, shiftMonth, upcomingFrom,
  type CalEvent, type CalKind,
} from "@/lib/calendar";
import { signalFromCalendar } from "@/lib/catalysts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({ component: CalendarPage });

const KIND_CLASS: Record<CalKind, string> = {
  rates: "bg-rates/20 text-rates",
  inflation: "bg-inflation/20 text-inflation",
  oil: "bg-oil/20 text-oil",
  mag7: "bg-mag7/20 text-mag7",
};
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const ASSETS = ["All", "NQ", "ES", "AAPL", "NVDA", "GOLD", "CL", "BTC"] as const;

function isoToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function CalendarPage() {
  const now = new Date();
  const today = isoToday();
  const firstUpcoming = upcomingFrom(today, 1)[0] ?? EVENTS[0];
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedEvent, setSelectedEvent] = useState<CalEvent>(firstUpcoming);
  const [asset, setAsset] = useState<(typeof ASSETS)[number]>("All");
  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const agenda = useMemo(() => upcomingFrom(today, 14).filter((event) => asset === "All" || event.hits.includes(asset)), [asset, today]);
  const railSignals = useMemo(() => agenda.slice(0, 4).map((event) => signalFromCalendar(event)), [agenda]);

  function moveMonth(delta: number) {
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  function selectEvent(event: CalEvent) {
    setSelectedEvent(event);
    const [y, m] = event.date.split("-").map(Number);
    setYear(y);
    setMonth(m - 1);
  }

  return (
    <Shell>
      <main className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="text-gold text-[10px] tracking-[0.2em] uppercase">Catalyst desk</p>
            <h1 className="mt-1 text-3xl sm:text-4xl">Know what can move your trade.</h1>
          </div>
          <div className="flex max-w-full gap-1 overflow-x-auto pb-1" aria-label="Filter events by instrument">
            {ASSETS.map((item) => (
              <button key={item} type="button" className={cn("pill", asset === item && "pill-on")} onClick={() => setAsset(item)}>{item}</button>
            ))}
          </div>
        </header>

        <section className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
          <div className="overflow-hidden rounded-2xl border border-line bg-black/30">
            <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
              <button type="button" className="pill" onClick={() => moveMonth(-1)} aria-label="Previous month">←</button>
              <p className="text-sm font-medium">{MONTHS[month]} {year}</p>
              <button type="button" className="pill" onClick={() => moveMonth(1)} aria-label="Next month">→</button>
            </div>
            <div className="text-muted grid grid-cols-7 border-b border-line text-center text-[10px] tracking-widest uppercase">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((cell, index) => {
                const dayEvents = cell.iso ? eventsOn(cell.iso).filter((event) => asset === "All" || event.hits.includes(asset)) : [];
                const selected = dayEvents.some((event) => event === selectedEvent);
                return (
                  <div key={`${cell.iso}-${index}`} className={cn("min-h-20 border-b border-r border-white/10 p-1.5 sm:min-h-24 sm:p-2", !cell.day && "bg-black/20", selected && "bg-white/[0.05]")}>
                    {cell.day ? <span className={cn("text-muted text-xs", cell.iso === today && "text-gold")}>{cell.day}</span> : null}
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <button key={`${event.date}-${event.title}`} type="button" onClick={() => selectEvent(event)} className={cn("block w-full truncate rounded-md px-1.5 py-1 text-left text-[10px] leading-tight", KIND_CLASS[event.kind], event === selectedEvent && "ring-1 ring-current")}>
                          {event.time ? `${event.time} ` : ""}{event.short}
                        </button>
                      ))}
                      {dayEvents.length > 3 ? <span className="text-muted block text-[10px]">+{dayEvents.length - 3} more in agenda</span> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="rounded-2xl border border-line bg-surface/90 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className={cn("rounded-full px-2 py-1 text-[10px] tracking-[0.16em] uppercase", KIND_CLASS[selectedEvent.kind])}>{KIND_LABEL[selectedEvent.kind]}</p>
              <p className="text-muted text-xs tabular-nums">{formatWhen(selectedEvent.date, selectedEvent.time)}</p>
            </div>
            <h2 className="mt-4 text-2xl">{selectedEvent.title}</h2>
            <p className="text-muted mt-2 text-xs tracking-[0.14em] uppercase">Direct exposure · {selectedEvent.hits}</p>
            <div className="mt-5 border-l-2 border-gold/60 pl-4">
              <p className="text-muted text-[10px] tracking-[0.18em] uppercase">Why it matters</p>
              <p className="mt-2 text-sm leading-relaxed">{selectedEvent.context}</p>
            </div>
            <div className="mt-5 border-l-2 border-line pl-4">
              <p className="text-muted text-[10px] tracking-[0.18em] uppercase">Typical tape</p>
              <p className="text-muted mt-2 text-sm leading-relaxed">{selectedEvent.history}</p>
            </div>
            {selectedEvent.sourceUrl ? (
              <a href={selectedEvent.sourceUrl} target="_blank" rel="noopener noreferrer" className="pill mt-5 inline-flex">
                Verify official schedule ↗
              </a>
            ) : null}
            <div className="mt-5">
              <AskTape chips={[{ label: `Ask · ${selectedEvent.short}`, prompt: `${selectedEvent.title} on ${selectedEvent.date}${selectedEvent.time ? ` at ${selectedEvent.time} ET` : ""}. Hits ${selectedEvent.hits}. Explain the bullish sensitivity, bearish sensitivity, what would invalidate each interpretation, and which first-15-minute variables deserve attention. Do not issue a trade call.` }]} />
            </div>
          </aside>
        </section>

        <div className="mt-6">
          <CatalystRail
            signals={railSignals}
            activeId={signalFromCalendar(selectedEvent).id}
            onSelect={(signal) => signal.calendarEvent && selectEvent(signal.calendarEvent)}
            eyebrow="Scheduled catalyst rail"
            title={asset === "All" ? "The next known pressure points" : `What can move ${asset} next`}
          />
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div><p className="text-muted text-[10px] tracking-[0.2em] uppercase">Forward tape</p><h2 className="mt-1 text-xl">Next catalysts{asset !== "All" ? ` for ${asset}` : ""}</h2></div>
            <div className="text-muted hidden flex-wrap gap-3 text-[10px] uppercase sm:flex">
              {(Object.keys(KIND_LABEL) as CalKind[]).map((kind) => <span key={kind}>{KIND_LABEL[kind]}</span>)}
            </div>
          </div>
          {agenda.length ? (
            <div className="grid gap-2 md:grid-cols-2">
              {agenda.slice(0, 8).map((event) => (
                <button key={`${event.date}-${event.title}`} type="button" onClick={() => selectEvent(event)} className={cn("group grid grid-cols-[88px_1fr_auto] items-center gap-3 rounded-xl border border-line bg-black/25 p-3 text-left transition-colors hover:bg-raised", event === selectedEvent && "border-gold/50 bg-raised")}>
                  <span className="text-muted text-xs tabular-nums">{formatCompact(event.date, event.time)}</span>
                  <span className="min-w-0"><strong className="block truncate text-sm font-medium">{event.title}</strong><small className="text-muted mt-1 block truncate text-[10px] tracking-wide uppercase">{event.hits}</small></span>
                  <span className="text-muted transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              ))}
            </div>
          ) : <p className="text-muted rounded-xl border border-line p-5 text-sm">No scheduled catalyst currently hits {asset} in this window.</p>}
        </section>
      </main>
    </Shell>
  );
}

function formatWhen(iso: string, time?: string) {
  const date = new Date(`${iso}T12:00:00`);
  const label = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return time ? `${label} · ${time} ET` : label;
}

function formatCompact(iso: string, time?: string) {
  const date = new Date(`${iso}T12:00:00`);
  const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return time ? `${label} · ${time}` : label;
}
