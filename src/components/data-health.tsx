import { useEffect, useState } from "react";
import { deskHealth, type DeskPayload } from "@/lib/desk";
import { cn } from "@/lib/utils";

function ageLabel(stamp: string | null, now: Date) {
  if (!stamp) return "no timestamp";
  const ms = now.getTime() - Date.parse(stamp);
  if (!Number.isFinite(ms)) return "unknown age";
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`;
}

export function DataHealth({ desk, compact = false }: { desk: DeskPayload; compact?: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const health = deskHealth(desk, now);
  const healthy = health.state === "healthy";
  const offline = health.state === "offline";
  const label = healthy ? "FEEDS CURRENT" : offline ? "FEEDS OFFLINE" : "PARTIAL DATA";
  const detail = `${health.liveWireCount}/${health.totalWireCount} timestamped wires · ${health.liveQuoteCount}/${desk.quotes.length} quotes · newest ${ageLabel(health.newestWireAt, now)}`;

  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border px-3 py-2 text-[10px] tracking-[0.12em] uppercase",
        compact ? "rounded-xl" : "rounded-2xl",
        healthy && "border-up/35 bg-up/5 text-up",
        health.state === "degraded" && "border-gold/45 bg-gold/10 text-gold",
        offline && "border-live/55 bg-live/15 text-red-200",
      )}
    >
      <strong>{label}</strong>
      <span className={healthy ? "text-muted" : "text-current"}>{detail}</span>
      {!healthy ? <strong className="w-full tracking-normal normal-case">Do not treat ACTA as a complete real-time news feed.</strong> : null}
    </div>
  );
}
