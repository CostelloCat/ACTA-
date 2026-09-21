import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AskTape } from "@/components/ask-tape";
import { Shell } from "@/components/shell";
import { TvMini } from "@/components/tv-mini";
import { getCryptoNews, leadAge } from "@/lib/desk";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crypto")({
  loader: async () => ({ news: await getCryptoNews() }),
  component: Crypto,
});

function Crypto() {
  const { news } = Route.useLoaderData();
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      void router.invalidate();
    }, 60_000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <Shell>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-muted text-[10px] tracking-[0.24em] uppercase">
              Bitcoin · Ethereum · Solana · Stellar
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl">Crypto</h1>
            <p className="text-muted mt-2 max-w-md text-sm">
              Last 7 days on the coin wire. Refreshes every minute. No fake live TV.
            </p>
          </div>
          <AskTape chips={[{ label: "Astra · crypto", prompt: "BTC ETH SOL tape today vs NQ and DXY. Short." }]} />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TvMini symbol="BITSTAMP:BTCUSD" />
          <TvMini symbol="BITSTAMP:ETHUSD" />
          <TvMini symbol="BINANCE:SOLUSDT" />
          <TvMini symbol="BINANCE:XLMUSDT" />
        </div>
        <p className="text-muted mt-8 text-[10px] tracking-[0.22em] uppercase">Coin wire · 7d</p>
        <ul className="mt-3 space-y-4">
          {news.map((it) => (
            <li key={it.title} className="border-line border-b pb-4 last:border-0">
              <p className={cn("text-[10px] tracking-[0.22em] uppercase", "text-gold")}>{it.kind}</p>
              <a href={it.link} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm no-underline">
                {it.title}
              </a>
              <p className="text-muted mt-1 text-[11px] tracking-wide uppercase">
                {it.source}
                {leadAge(it.published) ? ` · ${leadAge(it.published)}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
