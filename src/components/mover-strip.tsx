import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { buildDeskSignals, statusLabel, type CatalystSignal } from "@/lib/catalysts";
import { getMosaic } from "@/lib/channels";
import { getDesk } from "@/lib/desk";

export function MoverStrip() {
  const [now, setNow] = useState(() => new Date());
  const [signal, setSignal] = useState<CatalystSignal | null>(
    () => buildDeskSignals({ now: new Date() })[0] ?? null,
  );

  useEffect(() => {
    let alive = true;
    async function refresh() {
      const nextNow = new Date();
      setNow(nextNow);
      try {
        const [desk, mosaic] = await Promise.all([getDesk(), getMosaic()]);
        if (!alive) return;
        const news = Object.values(desk.wires).flat();
        setSignal(buildDeskSignals({ news, mosaic, now: nextNow })[0] ?? null);
      } catch {
        if (alive) setSignal(buildDeskSignals({ now: nextNow })[0] ?? null);
      }
    }
    void refresh();
    const id = setInterval(() => void refresh(), 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!signal) return null;
  const urgent = signal.status === "live" || signal.status === "breaking";
  const sourceLinked = signal.status === "monitoring";
  const destination = urgent || sourceLinked ? "/news" : "/calendar";

  return (
    <div
      className={
        urgent
          ? "flex items-center gap-3 bg-[#3a0d12] px-4 py-2 text-xs"
          : "border-line flex items-center gap-3 border-b bg-black/25 px-4 py-2 text-xs"
      }
    >
      <span
        className={
          urgent
            ? "bg-live shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold tracking-wide text-fg"
            : "border-gold/50 text-gold shrink-0 rounded-full border px-2 py-1 text-[9px] font-semibold tracking-wide"
        }
      >
        {statusLabel(signal, now)}
      </span>
      <p
        className={
          urgent ? "min-w-0 flex-1 truncate text-red-100" : "min-w-0 flex-1 truncate text-fg"
        }
      >
        <span className="mr-2 tracking-[0.14em] uppercase opacity-70">{signal.actor}</span>
        {signal.title} <span className="text-muted ml-1 hidden sm:inline">· {signal.hits}</span>
      </p>
      <Link
        to={destination}
        className={
          urgent ? "shrink-0 text-red-100 no-underline" : "text-gold shrink-0 no-underline"
        }
      >
        {urgent ? "Open event" : sourceLinked ? "Open catalyst" : "Prepare"} →
      </Link>
    </div>
  );
}
