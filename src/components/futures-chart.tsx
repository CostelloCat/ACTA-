import { useEffect, useRef, useState } from "react";
import { getFuturesBars, type FuturesBarsResult, type FuturesSlug } from "@/lib/futures-bars";

type Display = "candles" | "line";
type Window = "1D" | "5D";

const CONFIG: Record<FuturesSlug, { name: string; tvSymbol: string; chartUrl: string }> = {
  nq: {
    name: "NQ1! · E-mini Nasdaq-100 futures",
    tvSymbol: "NQ1!",
    chartUrl: "https://www.tradingview.com/chart/?symbol=CME_MINI%3ANQ1%21",
  },
  spx: {
    name: "ES1! · E-mini S&P 500 futures",
    tvSymbol: "ES1!",
    chartUrl: "https://www.tradingview.com/chart/?symbol=CME_MINI%3AES1%21",
  },
};

function sourceTime(iso: string | null) {
  if (!iso || Number.isNaN(Date.parse(iso))) return "Timestamp unavailable";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}

function CanvasChart({ result, window, display }: {
  result: FuturesBarsResult;
  window: Window;
  display: Display;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let release: (() => void) | undefined;
    const host = hostRef.current;
    if (!host) return;

    void import("lightweight-charts").then((lib) => {
      if (!active || !host) return;
      const latest = result.bars.at(-1)?.time ?? 0;
      const rows = window === "1D"
        ? result.bars.filter((bar) => bar.time >= latest - 24 * 60 * 60)
        : result.bars;
      if (!rows.length) return;

      const chart = lib.createChart(host, {
        width: Math.max(host.clientWidth, 300),
        height: 355,
        layout: {
          background: { type: lib.ColorType.Solid, color: "#08090d" },
          textColor: "#8c8e9e",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          attributionLogo: true,
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.045)" },
          horzLines: { color: "rgba(255,255,255,0.045)" },
        },
        rightPriceScale: { borderColor: "#2c2c35", minimumWidth: 70 },
        timeScale: { borderColor: "#2c2c35", timeVisible: true, secondsVisible: false, rightOffset: 5 },
        crosshair: { mode: lib.CrosshairMode.Normal },
        handleScale: true,
        handleScroll: true,
      });

      if (display === "candles") {
        const series = chart.addSeries(lib.CandlestickSeries, {
          upColor: "#30b890",
          downColor: "#eb5879",
          wickUpColor: "#30b890",
          wickDownColor: "#eb5879",
          borderVisible: false,
          priceFormat: { type: "price", precision: 2, minMove: 0.25 },
        });
        series.setData(rows.map((bar) => ({
          time: bar.time as import("lightweight-charts").UTCTimestamp,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        })));
      } else {
        const series = chart.addSeries(lib.AreaSeries, {
          lineColor: "#dbc69b",
          topColor: "rgba(219,198,155,0.22)",
          bottomColor: "rgba(219,198,155,0.01)",
          lineWidth: 2,
          priceFormat: { type: "price", precision: 2, minMove: 0.25 },
        });
        series.setData(rows.map((bar) => ({
          time: bar.time as import("lightweight-charts").UTCTimestamp,
          value: bar.close,
        })));
      }

      chart.timeScale().fitContent();
      const observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width;
        if (width && width > 0) chart.applyOptions({ width: Math.floor(width) });
      });
      observer.observe(host);
      release = () => {
        observer.disconnect();
        chart.remove();
      };
    }).catch(() => {
      // If the visual library cannot load, the surrounding panel still provides
      // the source and the exact deep link to the full TradingView chart.
    });

    return () => {
      active = false;
      release?.();
    };
  }, [result, window, display]);

  return <div ref={hostRef} className="h-[355px] w-full" aria-label="Interactive futures price chart" />;
}

export function FuturesChart({ slug }: { slug: FuturesSlug }) {
  const [result, setResult] = useState<FuturesBarsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [display, setDisplay] = useState<Display>("candles");
  const [window, setWindow] = useState<Window>("1D");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setResult(null);

    void getFuturesBars({ data: { slug } })
      .then((response) => {
        if (active) setResult(response?.bars.length ? response : null);
      })
      .catch(() => {
        if (active) setResult(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [slug, retry]);

  const info = CONFIG[slug];
  return (
    <section aria-label={`${info.name} price chart`} className="bg-surface border-line overflow-hidden rounded-2xl border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <p className="text-muted text-[10px] tracking-[0.2em] uppercase">ACTA / market chart</p>
          <p className="mt-1 text-sm font-medium">{info.name}</p>
        </div>
        <a className="pill inline-flex items-center gap-1 border-gold/40 text-gold" href={info.chartUrl} target="_blank" rel="noopener noreferrer">
          Open {info.tvSymbol} in TradingView ↗
        </a>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5 sm:px-5">
        <div className="inline-flex items-center gap-1 rounded-full border border-line p-1" aria-label="Chart period">
          {(["1D", "5D"] as const).map((period) => (
            <button type="button" key={period} onClick={() => setWindow(period)}
              aria-pressed={window === period}
              className={`rounded-full px-3 py-1 text-xs ${window === period ? "bg-raised text-fg" : "text-muted hover:text-fg"}`}>
              {period}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-line p-1" aria-label="Chart display">
          {(["candles", "line"] as const).map((kind) => (
            <button type="button" key={kind} onClick={() => setDisplay(kind)}
              aria-pressed={display === kind}
              className={`rounded-full px-3 py-1 text-xs capitalize ${display === kind ? "bg-raised text-fg" : "text-muted hover:text-fg"}`}>
              {kind === "candles" ? "Candles" : "Line"}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="flex h-[355px] items-center justify-center text-sm text-muted">Loading futures chart…</div>
      ) : result ? (
        <CanvasChart result={result} window={window} display={display} />
      ) : (
        <div className="flex h-[355px] flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-base font-medium">Futures chart temporarily unavailable</p>
          <p className="text-muted max-w-md text-xs leading-relaxed">The reference data provider did not return valid candles. ACTA never substitutes ETF prices or simulated movement for NQ/ES futures.</p>
          <button type="button" onClick={() => setRetry((value) => value + 1)} className="pill">Retry chart</button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5 text-[11px] text-muted sm:px-5">
        <span>{result ? `5-minute bars · ${sourceTime(result.barAsOf)} · Yahoo Finance (indicative)` : "Reference data · source not available"}</span>
        <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          Charts powered by TradingView Lightweight Charts™
        </a>
      </div>
      <p className="text-muted px-4 pb-3 text-[10px] sm:px-5">
        Prototype feed only; not an execution quote. Exchange-data rights and commercial redistribution must be approved before subscriptions.
      </p>
    </section>
  );
}
