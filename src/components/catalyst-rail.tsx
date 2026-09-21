import { useEffect, useState } from "react";
import type { CatalystSignal } from "@/lib/catalysts";
import { statusLabel } from "@/lib/catalysts";
import { cn } from "@/lib/utils";

export function CatalystRail({
  signals,
  activeId,
  onSelect,
  eyebrow = "Catalyst rail",
  title = "What can move the tape next",
}: {
  signals: CatalystSignal[];
  activeId?: string;
  onSelect?: (signal: CatalystSignal) => void;
  eyebrow?: string;
  title?: string;
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="catalyst-rail overflow-hidden rounded-2xl border border-line bg-black/35">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
        <div>
          <p className="text-gold text-[11px] tracking-[0.2em] uppercase">{eyebrow}</p>
          <h2 className="mt-1 text-xl sm:text-2xl">{title}</h2>
        </div>
        <p className="text-muted max-w-md text-xs leading-relaxed">
          Live is reserved for a verified on-air source. Everything else stays labeled as breaking, scheduled, or monitoring.
        </p>
      </header>

      {signals.length ? (
        <div className="relative px-3 py-4 sm:px-5">
          <div className="catalyst-axis pointer-events-none absolute top-4 bottom-4 left-[21px] w-px sm:left-1/2" />
          <div className="space-y-3">
            {signals.map((signal, index) => {
              const active = signal.id === activeId;
              const plate = (
                <button
                  type="button"
                  onClick={() => onSelect?.(signal)}
                  className={cn(
                    "catalyst-plate relative w-full rounded-xl border bg-surface/95 p-3 text-left transition-colors",
                    active ? "border-gold/70" : "border-line hover:border-white/30",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "text-[10px] font-medium tracking-[0.16em] uppercase",
                        signal.status === "live" || signal.status === "breaking" ? "text-down" : "text-gold",
                      )}
                    >
                      {statusLabel(signal, now)}
                    </span>
                    <span className="text-muted text-[10px] tracking-[0.14em] uppercase">{signal.actor}</span>
                  </div>
                  <strong className="mt-1.5 block text-sm font-medium leading-snug">{signal.title}</strong>
                  <span className="text-muted mt-2 block text-[11px] leading-relaxed">{signal.hits}</span>
                  <span className="text-muted mt-1 block truncate text-[10px] tracking-wide uppercase">{signal.source}</span>
                </button>
              );
              return (
                <div key={signal.id} className="grid grid-cols-[18px_1fr] items-center gap-3 sm:grid-cols-[1fr_24px_1fr] sm:gap-4">
                  <div className={cn("hidden sm:block", index % 2 === 0 ? "sm:col-start-1" : "sm:col-start-3")}>{plate}</div>
                  <span
                    className={cn(
                      "relative z-10 col-start-1 row-start-1 size-3 justify-self-center rounded-full border-2 border-bg sm:col-start-2",
                      signal.status === "live" ? "bg-live shadow-[0_0_14px_rgb(226,61,61,0.75)]" : active ? "bg-gold shadow-[0_0_12px_rgb(216,195,154,0.55)]" : "bg-muted",
                    )}
                  />
                  <div className="col-start-2 row-start-1 sm:hidden">{plate}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-muted px-5 py-8 text-sm">No verified live or scheduled catalyst is on the rail right now.</p>
      )}
    </section>
  );
}

export function CatalystBrief({ signal }: { signal: CatalystSignal | null }) {
  if (!signal) return null;
  const external = signal.href.startsWith("http");
  return (
    <aside className="rounded-2xl border border-line bg-surface/95 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-gold text-[11px] tracking-[0.2em] uppercase">WHAT / WHY / NEXT</p>
        <span className="text-muted text-[10px] tracking-[0.14em] uppercase">{signal.verified ? "Source verified" : "Schedule only"}</span>
      </div>
      <h2 className="mt-3 text-2xl leading-tight">{signal.title}</h2>
      <div className="mt-5 border-l-2 border-gold/60 pl-4">
        <p className="text-muted text-[10px] tracking-[0.18em] uppercase">Why it matters</p>
        <p className="mt-2 text-sm leading-relaxed">{signal.summary}</p>
      </div>
      <div className="mt-4 border-l-2 border-line pl-4">
        <p className="text-muted text-[10px] tracking-[0.18em] uppercase">Transmission</p>
        <p className="mt-2 text-sm leading-relaxed">{signal.mechanism}</p>
        <p className="text-muted mt-2 text-xs">Watch: {signal.hits}</p>
      </div>
      <a
        className="pill pill-solid mt-5"
        href={signal.href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
      >
        {signal.status === "live" ? "Watch source" : signal.status === "upcoming" || signal.status === "monitoring" ? "Open calendar" : "Open source"} {external ? "↗" : "→"}
      </a>
      <p className="text-muted mt-3 text-[11px] leading-relaxed">
        ACTA routes the event and its exposure. It does not turn the headline into a trade call.
      </p>
    </aside>
  );
}
