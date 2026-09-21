import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { eventStamp, nextEvent, remainingParts } from "@/lib/calendar";

export function EventCountdown() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const next = nextEvent(now);
  if (!next) return null;
  const parts = remainingParts(eventStamp(next).getTime() - now.getTime());
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="bg-surface border-line mt-8 rounded-2xl border p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-gold text-[10px] tracking-[0.28em] uppercase">Next print</p>
          <h2 className="mt-1 text-2xl">{next.title}</h2>
          <p className="text-muted mt-1 text-sm">
            {next.hits} · {next.time ?? "session"} ET
          </p>
        </div>
        <Link to="/calendar" className="pill">
          Calendar →
        </Link>
      </div>
      <ol className="mt-5 grid grid-cols-4 gap-2">
        {[
          ["Days", parts.d],
          ["Hours", pad(parts.h)],
          ["Min", pad(parts.m)],
          ["Sec", pad(parts.s)],
        ].map(([label, value]) => (
          <li key={label} className="bg-raised rounded-2xl px-3 py-4 text-center">
            <p className="text-3xl tabular-nums sm:text-4xl">{value}</p>
            <p className="text-muted mt-1 text-[10px] tracking-[0.2em] uppercase">{label}</p>
          </li>
        ))}
      </ol>
      <p className="text-muted mt-4 text-sm">{next.history}</p>
    </section>
  );
}
