import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { SessionGlobe } from "@/components/session-globe";
import { Shell } from "@/components/shell";
import { getDesk, type Quote } from "@/lib/desk";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: async () => ({ desk: await getDesk() }),
  component: Desk,
});

const MARKET_PULSE = [
  { symbol: "NQ=F", label: "NQ", note: "Tech beta", to: "/nq" },
  { symbol: "^GSPC", label: "S&P", note: "Broad risk", to: "/spx" },
  { symbol: "GC=F", label: "Gold", note: "Rates / dollar", to: "/gold" },
  { symbol: "CL=F", label: "WTI", note: "Energy / geo", to: "/oil" },
] as const;

function Desk() {
  const { desk } = Route.useLoaderData();
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => void router.invalidate(), 60_000);
    return () => clearInterval(id);
  }, [router]);

  const quotes = MARKET_PULSE.map((market) => ({ ...market, quote: desk.quotes.find((quote) => quote.symbol === market.symbol) }));
  const liveQuotes = quotes.filter((item) => item.quote && item.quote.price > 0);
  const lead = [...liveQuotes].sort((a, b) => Math.abs(b.quote!.changePct) - Math.abs(a.quote!.changePct))[0];

  return (
    <Shell>
      <main className="mx-auto max-w-6xl">
        <SessionGlobe />

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <div className="rounded-2xl border border-line bg-black/30 p-4 sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-muted text-[10px] tracking-[0.22em] uppercase">Market pulse · live when available</p>
                <h1 className="mt-1 text-2xl">What is moving now</h1>
              </div>
              {lead ? (
                <p className="text-muted text-xs">
                  Largest move · <span className={lead.quote!.changePct < 0 ? "text-down" : "text-up"}>{lead.label} {formatChange(lead.quote!)}</span>
                </p>
              ) : <p className="text-muted text-xs">Live quotes unavailable</p>}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {quotes.map((item) => <MarketPulse key={item.symbol} {...item} />)}
            </div>
            <p className="text-muted mt-3 text-[10px] tracking-wide uppercase">
              Updated {formatFetched(desk.fetchedAt)} · open a market for levels, context, and its live chart
            </p>
          </div>

          <aside className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <p className="text-muted text-[10px] tracking-[0.22em] uppercase">Choose the expression</p>
            <h2 className="mt-1 text-2xl">Market or name?</h2>
            <div className="mt-4 space-y-2">
              <Link to="/nq" className="group block rounded-xl border border-line bg-raised p-3 no-underline transition-colors hover:border-gold/50">
                <span className="text-gold text-[10px] tracking-[0.18em] uppercase">Trade the market</span>
                <strong className="mt-1 block text-sm font-medium">NQ / S&P</strong>
                <span className="text-muted mt-1 block text-xs leading-relaxed">Macro catalyst, breadth, rates and index confirmation.</span>
              </Link>
              <Link to="/mag7" className="group block rounded-xl border border-line bg-raised p-3 no-underline transition-colors hover:border-mag7/60">
                <span className="text-mag7 text-[10px] tracking-[0.18em] uppercase">Trade the name</span>
                <strong className="mt-1 block text-sm font-medium">Mag 7 / single stock</strong>
                <span className="text-muted mt-1 block text-xs leading-relaxed">Company catalyst first; use NQ as confirmation, not the thesis.</span>
              </Link>
            </div>
          </aside>
        </section>
      </main>
    </Shell>
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
