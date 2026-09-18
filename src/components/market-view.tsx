import { BookNews } from "@/components/book-news";
import { LevelKeys } from "@/components/level-keys";
import { Shell } from "@/components/shell";
import { TvMini } from "@/components/tv-mini";
import { useMode } from "@/lib/mode";
import type { Book } from "@/lib/markets";

const SYM: Record<string, string> = {
  nq: "NASDAQ:QQQ",
  spx: "FOREXCOM:SPXUSD",
  gold: "TVC:GOLD",
  silver: "TVC:SILVER",
  oil: "TVC:USOIL",
  vix: "CBOE:VIX",
  mag7: "NASDAQ:NVDA",
  btc: "BITSTAMP:BTCUSD",
  eth: "BITSTAMP:ETHUSD",
  sol: "BINANCE:SOLUSDT",
  xrp: "BINANCE:XRPUSDT",
  xlm: "BINANCE:XLMUSDT",
};

const NEWS_Q: Record<string, string> = {
  nq: "Nasdaq 100 OR NVIDIA OR Tesla OR MNQ",
  spx: "S&P 500 OR ES futures",
  gold: "gold price OR XAUUSD",
  silver: "silver price OR XAG",
  oil: "WTI crude oil OR OPEC",
  vix: "VIX volatility",
  mag7: "NVIDIA OR Apple OR Tesla stock",
  btc: "Bitcoin BTC",
  eth: "Ethereum ETH",
  sol: "Solana SOL crypto",
  xrp: "XRP Ripple",
  xlm: "Stellar XLM",
};

export function MarketView({ book }: { book: Book }) {
  const learn = useMode((s) => s.mode) === "learn";
  return (
    <Shell>
      <article className="mx-auto max-w-3xl">
        <p className="text-muted text-[10px] tracking-[0.22em] uppercase">{book.hits}</p>
        <h1 className="mt-2 text-4xl">{book.title}</h1>
        <div className="mt-5">
          <TvMini symbol={SYM[book.slug] ?? "NASDAQ:QQQ"} />
        </div>
        <p className="text-fg mt-4 max-w-2xl text-sm leading-relaxed">{book.bias}</p>
        <LevelKeys slug={book.slug} labels={book.levels} />
        <p className="text-muted mt-6 text-sm leading-relaxed">{book.note}</p>
        {learn ? (
          <p className="text-muted mt-4 text-sm">Learn mode: mark prior day high/low and VWAP before the open.</p>
        ) : null}
        <BookNews query={NEWS_Q[book.slug] ?? book.title} />
        <a href={book.tv} target="_blank" rel="noopener noreferrer" className="pill mt-8 inline-flex">
          Open TradingView →
        </a>
      </article>
    </Shell>
  );
}
