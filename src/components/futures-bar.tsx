import { useEffect, useState } from "react";

function haltLeft(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "short",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  const minute = Number(parts.find((p) => p.type === "minute")?.value);
  const day = parts.find((p) => p.type === "weekday")?.value ?? "";
  if (day === "Sat" || day === "Sun") return "weekend";
  const mins = hour * 60 + minute;
  const halt = 17 * 60;
  const left = halt - mins;
  if (left <= 0) return "halted";
  const h = Math.floor(left / 60);
  const m = left % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

export function FuturesBar() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const tick = () => setLabel(haltLeft(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="border-line mt-2 flex items-center justify-between border-t px-4 py-2.5 text-[10px] tracking-[0.16em] uppercase">
      <p className="text-muted">
        <span className="text-up mr-2">● Futures</span>
        <span className="text-live mr-1">Live</span>
        to halt 17:00 ET · NQ · ES
      </p>
      <p className="tabular-nums text-muted">{label}</p>
    </div>
  );
}
