import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { DataHealth } from "@/components/data-health";
import { tradeLensFor } from "@/components/global-flow";
import { Shell } from "@/components/shell";
import {
  buildCatalystSignals,
  scheduledCatalysts,
  signalTimeLabel,
  statusLabel,
  type CatalystSignal,
} from "@/lib/catalysts";
import { getMosaic } from "@/lib/channels";
import { getDesk, type Quote } from "@/lib/desk";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [desk, mosaic] = await Promise.all([getDesk(), getMosaic()]);
    return { desk, mosaic };
  },
  component: Desk,
});

const MARKET_PULSE = [
  { symbol: "NQ=F", label: "NQ", note: "Tech beta", to: "/nq" },
  { symbol: "^GSPC", label: "S&P", note: "Broad risk", to: "/spx" },
  { symbol: "GC=F", label: "Gold", note: "Rates / dollar", to: "/gold" },
  { symbol: "CL=F", label: "WTI", note: "Energy / geo", to: "/oil" },
] as const;

function Desk() {
  const { desk, mosaic } = Route.useLoaderData();
  const router = useRouter();
  const signals = buildCatalystSignals({ mosaic, news: Object.values(desk.wires).flat(), limit: 4 });
  const active = signals[0] ?? null;
  const lens = active ? tradeLensFor(active) : null;
  const nextRisk = scheduledCatalysts(new Date(), 1, false)[0] ?? null;
  const quotes = MARKET_PULSE.map((market) => ({ ...market, quote: desk.quotes.find((quote) => quote.symbol === market.symbol) }));

  useEffect(() => {
    const id = setInterval(() => void router.invalidate(), 45_000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <Shell>
      <main className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="text-gold text-[10px] tracking-[0.22em] uppercase">Independent market intelligence</p>
            <h1 className="mt-1 text-3xl sm:text-4xl">Know what changed before you touch the trade.</h1>
          </div>
          <p className="text-muted max-w-md text-sm leading-relaxed">
            ACTA separates verified catalysts, scheduled risk, and market reaction—without pretending a headline is a trade call.
          </p>
        </header>

        <div className="mt-4">
          <DataHealth desk={desk} />
        </div>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <PriorityCard signal={active} />

          <aside className="grid gap-4">
            <NextRiskCard signal={nextRisk} />
            <section className="rounded-2xl border border-line bg-black/30 p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-muted text-[10px] tracking-[0.2em] uppercase">Watch · developing</p>
                  <h2 className="mt-1 text-xl">What could reach the tape</h2>
                </div>
                <Link to="/news" className="text-gold text-xs no-underline">Radar →</Link>
              </div>
              <ol className="mt-3 divide-y divide-line">
                {signals.slice(1, 3).map((signal) => (
                  <li key={signal.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-muted text-[9px] tracking-[0.16em] uppercase">{signal.actor} · {statusLabel(signal)}</p>
                    <p className="mt-1 text-sm leading-snug">{signal.title}</p>
                    <p className="text-muted mt-1 text-[10px] tracking-wide uppercase">{signal.hits}</p>
                  </li>
                ))}
                {signals.length < 2 ? <li className="text-muted py-3 text-sm">No additional source-linked signal is active.</li> : null}
              </ol>
            </section>
          </aside>
        </section>

        <section className="mt-4 rounded-2xl border border-line bg-black/30 p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-muted text-[10px] tracking-[0.22em] uppercase">Tape · live when available</p>
              <h2 className="mt-1 text-2xl">Four markets, four different stories</h2>
            </div>
            <p className="text-muted text-xs">Updated {formatFetched(desk.fetchedAt)} · unavailable means unavailable</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {quotes.map((item) => <MarketPulse key={item.symbol} {...item} />)}
          </div>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link to="/nq" className="group rounded-2xl border border-line bg-surface p-4 no-underline transition-colors hover:border-gold/50 sm:p-5">
            <span className="text-gold text-[10px] tracking-[0.18em] uppercase">Trade the market</span>
            <strong className="mt-1 block text-xl font-medium">NQ / S&amp;P</strong>
            <span className="text-muted mt-2 block text-sm leading-relaxed">Start with the macro catalyst, then demand confirmation from rates, breadth, and the index.</span>
          </Link>
          <Link to="/mag7" className="group rounded-2xl border border-line bg-surface p-4 no-underline transition-colors hover:border-mag7/60 sm:p-5">
            <span className="text-mag7 text-[10px] tracking-[0.18em] uppercase">Trade the name</span>
            <strong className="mt-1 block text-xl font-medium">Mag 7 / single stock</strong>
            <span className="text-muted mt-2 block text-sm leading-relaxed">Start with the company catalyst; use NQ and peer breadth as confirmation, not as the thesis.</span>
          </Link>
        </section>
      </main>
    </Shell>
  );
}

function PriorityCard({ signal }: { signal: CatalystSignal | null }) {
  if (!signal) {
    return (
      <section className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-gold text-[10px] tracking-[0.2em] uppercase">Now · catalyst radar</p>
        <h2 className="mt-2 text-2xl">No verified priority signal.</h2>
        <p className="text-muted mt-3 text-sm">That means ACTA has no source-linked event to elevate—not that nothing is happening.</p>
        <Link to="/news" className="pill mt-5">Open Radar</Link>
      </section>
    );
  }

  const lens = tradeLensFor(signal);
  const urgent = signal.status === "breaking" || (signal.status === "live" && signal.verified);
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-gold text-[10px] tracking-[0.2em] uppercase">Now · catalyst radar</p>
          <span className={cn("rounded-full border px-2 py-1 text-[9px] tracking-wide uppercase", urgent ? "border-live/50 bg-live/15 text-red-200" : "border-gold/35 text-gold")}>
            {statusLabel(signal)}
          </span>
        </div>
        <h2 className="mt-4 max-w-3xl text-2xl leading-tight sm:text-3xl">{signal.title}</h2>
        <p className="text-muted mt-2 text-[10px] tracking-[0.14em] uppercase">{signal.actor} · {signal.source} · {signalTimeLabel(signal)}</p>
        <p className="text-muted mt-4 max-w-3xl text-sm leading-relaxed">{signal.summary}</p>
      </div>
      <div className="grid gap-px bg-line sm:grid-cols-2">
        <BriefCell label="Why it can move" value={signal.mechanism} />
        <BriefCell label="Read first" value={lens.firstMove} />
        <BriefCell label="Confirmation" value={lens.confirms} tone="text-up" />
        <BriefCell label="Invalidation" value={lens.invalidates} tone="text-down" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4">
        <p className="text-muted text-[10px] tracking-wide uppercase">Direct exposure · {signal.hits}</p>
        <a href={signal.href} target={signal.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="pill pill-solid">
          Verify source {signal.href.startsWith("http") ? "↗" : "→"}
        </a>
      </div>
    </article>
  );
}

function NextRiskCard({ signal }: { signal: CatalystSignal | null }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-gold text-[10px] tracking-[0.2em] uppercase">Next · scheduled risk</p>
        {signal ? <span className="text-gold text-[10px] tabular-nums">{statusLabel(signal)}</span> : null}
      </div>
      {signal ? (
        <>
          <h2 className="mt-3 text-xl leading-snug">{signal.title}</h2>
          <p className="text-muted mt-2 text-[10px] tracking-wide uppercase">{signal.hits}</p>
          <p className="text-muted mt-3 text-sm leading-relaxed">{signal.summary}</p>
          <Link to="/calendar" className="pill mt-4">Prepare in Calendar →</Link>
        </>
      ) : <p className="text-muted mt-3 text-sm">No scheduled catalyst is currently loaded.</p>}
    </section>
  );
}

function BriefCell({ label, value, tone = "text-muted" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="bg-surface p-4 sm:p-5">
      <p className={cn("text-[9px] tracking-[0.18em] uppercase", tone)}>{label}</p>
      <p className="mt-2 text-xs leading-relaxed">{value}</p>
    </div>
  );
}

function MarketPulse({ label, note, to, quote }: { label: string; note: string; to: "/nq" | "/spx" | "/gold" | "/oil"; quote?: Quote }) {
  const live = Boolean(quote && quote.price > 0);
  return (
    <Link to={to} className="group rounded-xl border border-line bg-raised p-3 no-underline transition-colors hover:border-white/30">
      <div className="flex items-center justify-between gap-2">
        <strong className="text-sm font-medium">{label}</strong>
        <span className={cn("text-xs tabular-nums", !live ? "text-muted" : quote!.changePct < 0 ? "text-down" : "text-up")}>
          {live ? formatChange(quote!) : "—"}
        </span>
      </div>
      <p className="mt-2 text-lg tabular-nums">{live ? quote!.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "Unavailable"}</p>
      <p className="text-muted mt-1 text-[10px] tracking-wide uppercase">{note}</p>
    </Link>
  );
}

function formatChange(quote: Quote) {
  return `${quote.changePct >= 0 ? "+" : ""}${quote.changePct.toFixed(2)}%`;
}

function formatFetched(iso: string) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "recently";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) + " ET";
}
