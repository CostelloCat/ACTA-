import { Link } from "@tanstack/react-router";
import type { CatalystSignal } from "@/lib/catalysts";
import type { Quote } from "@/lib/desk";
import { cn } from "@/lib/utils";

const MARKETS = [
  { label: "Nasdaq futures", ticker: "NQ", symbol: "NQ=F", to: "/nq", driver: "Tech · rates" },
  { label: "S&P futures", ticker: "ES", symbol: "ES=F", to: "/spx", driver: "Broad risk" },
  { label: "WTI crude", ticker: "WTI", symbol: "CL=F", to: "/oil", driver: "Supply · inflation" },
  { label: "Gold", ticker: "GOLD", symbol: "GC=F", to: "/gold", driver: "Real yields · haven" },
  { label: "Bitcoin", ticker: "BTC", symbol: "BTC-USD", to: "/btc", driver: "Crypto · liquidity" },
] as const;

export function GlobalNewsWatch({
  quotes,
  signal,
}: {
  quotes: Quote[];
  signal: CatalystSignal | null;
}) {
  return (
    <section id="global-markets" className="mt-4 scroll-mt-6 rounded-2xl border border-line bg-black/45 p-4 sm:p-5" aria-label="Cross asset intelligence watch">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-gold text-[10px] tracking-[0.2em] uppercase">
            ACTA · Cross-asset intelligence
          </p>
          <h2 className="mt-1 text-xl sm:text-2xl">Where global headlines meet the tape</h2>
        </div>
        <p className="text-muted text-[11px]">Provider snapshots · not tick-by-tick execution data</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {MARKETS.map((market) => {
          const quote = quotes.find((q) => q.symbol === market.symbol);
          const available = Boolean(quote && quote.price > 0);
          return (
            <Link
              key={market.symbol}
              to={market.to}
              className="rounded-xl border border-line bg-surface/90 p-3 no-underline transition-colors hover:border-gold/50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-gold text-xs tracking-wider">{market.ticker}</span>
                <span className={cn("text-[11px] tabular-nums", !available ? "text-muted" : quote!.changePct < 0 ? "text-down" : "text-up")}>
                  {available ? `${quote!.changePct >= 0 ? "+" : ""}${quote!.changePct.toFixed(2)}%` : "—"}
                </span>
              </div>
              <p className="mt-2 text-lg tabular-nums">
                {available
                  ? quote!.price.toLocaleString("en-US", { maximumFractionDigits: market.ticker === "BTC" ? 0 : 2 })
                  : "Unavailable"}
              </p>
              <p className="text-muted mt-1 text-[10px]">{market.label}</p>
              <p className="text-muted mt-2 text-[10px] tracking-wide uppercase">{market.driver}</p>
            </Link>
          );
        })}
      </div>
      <div className="mt-4 border-t border-line pt-3">
        {signal ? (
          <>
            <p className="text-gold text-[10px] tracking-[0.16em] uppercase">Selected catalyst · {signal.actor}</p>
            <p className="mt-1 text-sm">{signal.mechanism}</p>
            <p className="text-muted mt-1 text-xs">
              These markets are monitoring points, not proof of causation or a trade recommendation. Compare moves with the source-linked impact map below.
            </p>
          </>
        ) : (
          <p className="text-muted text-sm">
            No source-linked catalyst is currently elevated. Monitor cross-asset moves alongside confirmed headlines and scheduled events.
          </p>
        )}
      </div>
    </section>
  );
}
