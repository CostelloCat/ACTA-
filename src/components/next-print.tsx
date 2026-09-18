import { useEffect, useState } from "react";
import { eventStamp, nextEvent, remainingParts } from "@/lib/calendar";

export function NextPrint() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const next = nextEvent(now);
  if (!next) return null;
  const p = remainingParts(eventStamp(next).getTime() - now.getTime());
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="border-line flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2">
      <p className="text-muted text-[10px] tracking-[0.22em] uppercase">
        Next print{" "}
        <span className="text-fg tracking-normal normal-case">
          {next.title}{" "}
          <span className="text-gold tabular-nums">
            {p.d}d {pad(p.h)}h {pad(p.m)}m {pad(p.s)}s
          </span>{" "}
          {next.hits}
        </span>
      </p>
      <div className="ml-auto flex gap-1.5">
        <button type="button" className="pill">
          Alert
        </button>
        <button
          type="button"
          className="pill"
          onClick={() => {
            void navigator.clipboard?.writeText(window.location.href);
          }}
        >
          Share
        </button>
        <a href="#tape" className="pill">
          Grok
        </a>
      </div>
    </div>
  );
}
