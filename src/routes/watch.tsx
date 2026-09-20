import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { FuturesBar } from "@/components/futures-bar";
import { tradeLensFor } from "@/components/global-flow";
import { buildCatalystSignals, scheduledCatalysts, statusLabel } from "@/lib/catalysts";
import { getMosaic } from "@/lib/channels";
import { getDesk, type Quote } from "@/lib/desk";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/watch")({
  loader: async () => {
    const [desk, mosaic] = await Promise.all([getDesk(), getMosaic()]);
    return { desk, mosaic };
  },
  component: WatchPage,
});

const WATCH_QUOTES = [
  { symbol: "NQ=F", label: "NQ" },
  { symbol: "^GSPC", label: "S&P" },
  { symbol: "CL=F", label: "WTI" },
  { symbol: "GC=F", label: "Gold" },
] as const;

function WatchPage() {
  const { desk, mosaic } = Route.useLoaderData();
  const router = useRouter();
  const signals = buildCatalystSignals({ mosaic, news: Object.values(desk.wires).flat(), limit: 4 });
  const active = signals[0] ?? null;
  const lens = active ? tradeLensFor(active) : null;
  const nextPrints = scheduledCatalysts(new Date(), 3, false);

  useEffect(() => {
    const id = setInterval(() => void router.invalidate(), 45_000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <div>
            <p className="foil font-display text-sm tracking-[0.2em]">ACTA</p>
            <p className="text-muted text-[9px] tracking-[0.2em] uppercase">Watch mode · trading sidecar</p>
          </div>
          <div className="flex gap-1.5">
            <Link to="/news" className="pill">Research</Link>
            <Link to="/" className="pill">Desk</Link>
          </div>
        </div>
        <FuturesBar />
      </header>

      <div className="mx-auto max-w-xl space-y-3 p-3">
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Live market tape">
          {WATCH_QUOTES.map((item) => (
            <QuoteTile key={item.symbol} label={item.label} quote={desk.quotes.find((quote) => quote.symbol === item.symbol)} />
          ))}
        </section>

        {active && lens ? (
          <article className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="border-b border-line p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-gold text-[10px] tracking-[0.2em] uppercase">Priority now</p>
                <span className={cn("rounded-full px-2 py-1 text-[9px] tracking-wide uppercase", active.status === "live" || active.status === "breaking" ? "bg-live/20 text-red-200" : "border border-gold/40 text-gold")}>
                  {statusLabel(active)}
                </span>
              </div>
              <h1 className="mt-3 text-xl leading-snug">{active.title}</h1>
              <p className="text-muted mt-2 text-[10px] tracking-wide uppercase">{active.actor} · {active.source}</p>
              <p className="text-muted mt-3 text-sm leading-relaxed">{active.summary}</p>
            </div>

            <div className="grid gap-px bg-line sm:grid-cols-2">
              <DecisionCell label="WHY IT CAN MOVE" value={active.mechanism} />
              <DecisionCell label="DIRECT TAPE" value={lens.firstMove} />
              <DecisionCell label="CONFIRM WITH" value={lens.confirms} accent="text-up" />
              <DecisionCell label="THESIS FAILS IF" value={lens.invalidates} accent="text-down" />
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line p-3">
              <p className="text-muted text-[10px] tracking-wide uppercase">{lens.clock}</p>
              <a href={active.href} target={active.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="pill pill-solid shrink-0">
                Source {active.href.startsWith("http") ? "↗" : "→"}
              </a>
            </div>
          </article>
        ) : (
          <p className="rounded-2xl border border-line p-5 text-sm text-muted">No active catalyst is available. The tape and scheduled prints remain visible.</p>
        )}

        <section className="rounded-2xl border border-line bg-black/25 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-muted text-[9px] tracking-[0.2em] uppercase">Developing</p>
              <h2 className="mt-1 text-lg">What else can reach the tape</h2>
            </div>
            <Link to="/news" className="text-gold text-xs no-underline">Full desk →</Link>
          </div>
          <ol className="mt-3 divide-y divide-line">
            {signals.slice(1, 3).map((signal) => (
              <li key={signal.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <span className="text-muted mt-0.5 text-[9px] tracking-wide uppercase">{signal.actor}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{signal.title}</p>
                    <p className="text-muted mt-1 text-[10px] tracking-wide uppercase">{statusLabel(signal)} · {signal.hits}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-line bg-black/25 p-4">
          <p className="text-muted text-[9px] tracking-[0.2em] uppercase">Scheduled risk</p>
          <h2 className="mt-1 text-lg">Next three pressure points</h2>
          <ol className="mt-3 space-y-2">
            {nextPrints.map((signal) => (
              <li key={signal.id} className="rounded-xl border border-line bg-surface p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm">{signal.title}</p>
                    <p className="text-muted mt-1 text-[10px] tracking-wide uppercase">{signal.hits}</p>
                  </div>
                  <span className="text-gold shrink-0 text-[10px] tabular-nums">{statusLabel(signal)}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <p className="text-muted px-1 pb-4 text-[10px] leading-relaxed">
          Watch Mode informs the thesis; TradingView and your broker remain the chart and execution surfaces. Live-feed titles require source confirmation.
        </p>
      </div>
    </main>
  );
}

function QuoteTile({ label, quote }: { label: string; quote?: Quote }) {
  const live = Boolean(quote && quote.price > 0);
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <strong className="text-xs font-medium">{label}</strong>
        <span className={cn("text-[10px] tabular-nums", !live ? "text-muted" : quote!.changePct < 0 ? "text-down" : "text-up")}>
          {live ? `${quote!.changePct >= 0 ? "+" : ""}${quote!.changePct.toFixed(2)}%` : "—"}
        </span>
      </div>
      <p className="mt-1 text-base tabular-nums">{live ? quote!.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "Unavailable"}</p>
    </div>
  );
}

function DecisionCell({ label, value, accent = "text-muted" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-surface p-4">
      <p className={cn("text-[9px] tracking-[0.18em] uppercase", accent)}>{label}</p>
      <p className="mt-2 text-xs leading-relaxed">{value}</p>
    </div>
  );
}
