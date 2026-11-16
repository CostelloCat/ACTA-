import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { EVENTS, type CalEvent, type CalKind } from "@/lib/calendar";

type WindowDays = 7 | 30 | 90;

const KINDS: CalKind[] = ["rates", "inflation", "oil", "mag7"];
const LABELS: Record<CalKind, string> = {
  rates: "Rates / macro",
  inflation: "Inflation",
  oil: "Energy",
  mag7: "Mag 7",
};
const COLORS: Record<CalKind, string> = {
  rates: "#d7b46e",
  inflation: "#86a8da",
  oil: "#d87862",
  mag7: "#7baa92",
};

function endDate(start: string, days: number) {
  const [year = 1970, month = 1, day = 1] = start.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function affects(event: CalEvent, asset: string) {
  return asset === "All" || event.hits.split(/[·,]/).some((item) => item.trim() === asset);
}

function when(event: CalEvent) {
  const date = new Date(`${event.date}T12:00:00Z`);
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(date);
  return event.time ? `${day} · ${event.time} ET` : day;
}

/** A transparent count of ACTA's manually curated scheduled events.
 * It is NOT a volatility estimate, risk score, or comprehensive economic feed.
 */
export function CatalystMix({
  today,
  asset,
  onSelectEvent,
}: {
  today: string;
  asset: string;
  onSelectEvent: (event: CalEvent) => void;
}) {
  const [days, setDays] = useState<WindowDays>(30);
  const [selected, setSelected] = useState<CalKind | null>(null);

  const events = useMemo(() => {
    const until = endDate(today, days);
    return EVENTS.filter((event) => event.date >= today && event.date < until && affects(event, asset))
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));
  }, [today, days, asset]);

  const counts = KINDS.map((kind) => ({
    kind,
    name: LABELS[kind],
    value: events.filter((event) => event.kind === kind).length,
    color: COLORS[kind],
  }));
  const active = selected !== null && counts.some((item) => item.kind === selected && item.value > 0)
    ? selected
    : null;
  const total = events.length;
  const visible = active ? events.filter((event) => event.kind === active) : events;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface/90" aria-label="Upcoming catalyst category breakdown">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-4 sm:px-5">
        <div>
          <p className="text-gold text-[10px] tracking-[0.2em] uppercase">ACTA · catalyst composition</p>
          <h2 className="mt-1 text-2xl">What's on the horizon</h2>
          <p className="text-muted mt-1 max-w-xl text-xs leading-relaxed">
            A breakdown of ACTA's listed upcoming events, by category{asset === "All" ? "" : ` for ${asset}`}.
            Select a segment to inspect the events behind it.
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-line p-1" aria-label="Time window">
          {([7, 30, 90] as const).map((period) => (
            <button
              key={period}
              type="button"
              aria-pressed={days === period}
              onClick={() => { setDays(period); setSelected(null); }}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${days === period ? "bg-raised text-fg" : "text-muted hover:text-fg"}`}
            >
              {period}D
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-center gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-5">
        <div className="relative mx-auto h-[300px] w-full max-w-[410px]">
          {total ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={counts.filter((item) => item.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={88}
                  outerRadius={133}
                  paddingAngle={2}
                  stroke="#08090d"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {counts.filter((item) => item.value > 0).map((item) => (
                    <Cell
                      key={item.kind}
                      fill={item.color}
                      fillOpacity={active === null || active === item.kind ? 1 : 0.28}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelected((current) => current === item.kind ? null : item.kind)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => { const count = Number(value); return [`${count} listed event${count === 1 ? "" : "s"}`, String(name)]; }}
                  contentStyle={{ background: "#111216", border: "1px solid #3a3b40", borderRadius: 10, color: "#fafafa" }}
                  itemStyle={{ color: "#fafafa" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 m-auto h-[236px] w-[236px] rounded-full border-[38px] border-line" />
          )}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-medium tabular-nums">{active ? visible.length : total}</span>
            <span className="text-muted mt-1 text-[10px] tracking-[0.15em] uppercase">
              {active ? LABELS[active] : "Listed events"}
            </span>
            <span className="text-muted mt-1 text-[10px]">Next {days} days</span>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-muted text-[10px] tracking-[0.18em] uppercase">Category mix</p>
            {active ? (
              <button type="button" className="text-gold text-xs underline underline-offset-4" onClick={() => setSelected(null)}>
                Show all
              </button>
            ) : (
              <span className="text-muted text-[10px]">By event count, not risk</span>
            )}
          </div>
          <div className="space-y-2">
            {counts.map((item) => {
              const percentage = total ? Math.round(item.value / total * 100) : 0;
              return (
                <button
                  type="button"
                  key={item.kind}
                  disabled={item.value === 0}
                  aria-pressed={active === item.kind}
                  onClick={() => setSelected((current) => current === item.kind ? null : item.kind)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors disabled:opacity-45 ${active === item.kind ? "border-gold/50 bg-raised" : "border-line hover:bg-raised"}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="flex-1 text-sm">{item.name}</span>
                    <span className="text-sm tabular-nums">{item.value}</span>
                    <span className="text-muted w-10 text-right text-xs tabular-nums">{percentage}%</span>
                  </span>
                  <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color }} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-line px-4 pb-4 pt-4 sm:px-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-base font-medium">{active ? `${LABELS[active]} events` : "Upcoming events in this mix"}</h3>
          <span className="text-muted text-xs">{visible.length} listed</span>
        </div>
        {visible.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {visible.slice(0, 6).map((event) => (
              <button
                key={`${event.date}-${event.time ?? ""}-${event.title}`}
                type="button"
                onClick={() => onSelectEvent(event)}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-black/20 p-3 text-left transition-colors hover:border-gold/50 hover:bg-raised"
              >
                <span className="min-w-0">
                  <span className="text-muted block text-[10px]">{when(event)}</span>
                  <span className="mt-1 block truncate text-sm">{event.title}</span>
                </span>
                <span className="text-gold shrink-0">↗</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted rounded-lg border border-line p-4 text-sm">
            No events listed in this window. This does not mean the market has no scheduled risk.
          </p>
        )}
        {visible.length > 6 ? (
          <p className="text-muted mt-2 text-xs">Showing the first 6 of {visible.length}; use the calendar to inspect more.</p>
        ) : null}
        <p className="text-muted mt-4 text-[11px] leading-relaxed">
          Data integrity: sourced from ACTA's manually curated calendar, not a verified live feed.
          Percentages show the share of listed events only; they do not measure volatility, probability, or market impact.
        </p>
      </div>
    </section>
  );
}
