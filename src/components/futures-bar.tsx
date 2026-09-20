import { useEffect, useState } from "react";

const DAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const HANDOFFS = [
  { name: "Globex reopen", hour: 18, minute: 0, days: [0, 1, 2, 3, 4] },
  { name: "Asia liquidity", hour: 19, minute: 0, days: [0, 1, 2, 3, 4] },
  { name: "London", hour: 3, minute: 0, days: [1, 2, 3, 4, 5] },
  { name: "New York", hour: 8, minute: 0, days: [1, 2, 3, 4, 5] },
] as const;

function etParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    weekday: "short",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  const minute = Number(parts.find((p) => p.type === "minute")?.value);
  const second = Number(parts.find((p) => p.type === "second")?.value);
  const day = DAY_INDEX[parts.find((p) => p.type === "weekday")?.value ?? "Sun"] ?? 0;
  return { day, hour: hour === 24 ? 0 : hour, minute, second };
}

function futuresLive(day: number, secondsOfDay: number) {
  const open = 18 * 3600;
  const halt = 17 * 3600;
  if (day === 0) return secondsOfDay >= open;
  if (day >= 1 && day <= 4) return secondsOfDay < halt || secondsOfDay >= open;
  if (day === 5) return secondsOfDay < halt;
  return false;
}

function marketClock(now: Date) {
  const { day, hour, minute, second } = etParts(now);
  const currentWeekSecond = day * 86400 + hour * 3600 + minute * 60 + second;
  const candidates = HANDOFFS.flatMap((handoff) => handoff.days.map((targetDay) => {
    const target = targetDay * 86400 + handoff.hour * 3600 + handoff.minute * 60;
    let left = target - currentWeekSecond;
    if (left <= 0) left += 7 * 86400;
    return { ...handoff, left };
  })).sort((a, b) => a.left - b.left);
  const next = candidates[0]!;
  const h = Math.floor(next.left / 3600);
  const m = Math.floor((next.left % 3600) / 60);
  const s = next.left % 60;
  return {
    live: futuresLive(day, hour * 3600 + minute * 60 + second),
    next: next.name,
    at: `${String(next.hour).padStart(2, "0")}:${String(next.minute).padStart(2, "0")} ET`,
    countdown: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
  };
}

export function FuturesBar() {
  const [clock, setClock] = useState<ReturnType<typeof marketClock> | null>(null);
  useEffect(() => {
    const tick = () => setClock(marketClock(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="border-line mt-2 flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-[10px] tracking-[0.16em] uppercase">
      <p className="text-muted">
        <span className={clock?.live ? "text-up mr-2" : "text-gold mr-2"}>● Futures</span>
        <span className={clock?.live ? "text-live mr-1" : "text-gold mr-1"}>{clock?.live ? "Live" : "Closed"}</span>
        · NQ · ES
      </p>
      {clock ? (
        <p className="text-muted tabular-nums">
          Next · <span className="text-fg">{clock.next}</span> {clock.at} · <span className="text-gold">{clock.countdown}</span>
        </p>
      ) : null}
    </div>
  );
}
