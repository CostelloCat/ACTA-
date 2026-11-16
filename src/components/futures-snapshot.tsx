import { useEffect, useState } from "react";
import { getLevels, type LevelPack } from "@/lib/levels";

type FuturesSlug = "nq" | "spx";

const FUTURES: Record<FuturesSlug, { ticker: string; name: string }> = {
  nq: { ticker: "NQ / MNQ", name: "CME Nasdaq-100 futures" },
  spx: { ticker: "ES / MES", name: "CME S&P 500 futures" },
};

function price(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value) || value <= 0) return "—";
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function quoteTime(value: string | null | undefined) {
  if (!value) return "Provider timestamp unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Provider timestamp unavailable";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function FuturesSnapshot({ slug }: { slug: FuturesSlug }) {
  const [pack, setPack] = useState<LevelPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setPack(null);

    void getLevels({ data: { slug } })
      .then((value) => {
        if (!active) return;
        if (value && Number.isFinite(value.last) && value.last > 0) {
          setPack(value);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, refreshKey]);

  const instrument = FUTURES[slug];
  const levels = [
    { label: "Prior high", value: pack?.priorHigh },
    { label: "Prior low", value: pack?.priorLow },
    { label: "Overnight high", value: pack?.onh },
    { label: "Overnight low", value: pack?.onl },
    { label: "VWAP", value: pack?.vwap },
  ];

  return (
    <section aria-label={`${instrument.ticker} futures quote and reference levels`} className="bg-surface border-line overflow-hidden rounded-2xl border">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <p className="text-muted text-[10px] tracking-[0.2em] uppercase">ACTA futures reference</p>
          <p className="mt-1 text-sm font-medium">{instrument.ticker} <span className="text-muted">· {instrument.name}</span></p>
        </div>
        <span className="rounded-full border border-line px-2.5 py-1 text-[10px] tracking-wide text-muted">Indicative · may be delayed</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 px-4 py-5 sm:px-5">
        <div aria-live="polite">
          <p className="text-muted text-xs">Last reported futures price · points</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums sm:text-4xl">
            {loading ? "Loading…" : pack ? price(pack.last) : "Unavailable"}
          </p>
          <p className="text-muted mt-2 text-[11px]">
            {pack ? `${quoteTime(pack.quoteAsOf)} · ${pack.source}` : error ? "Market data could not be retrieved. No substitute price shown." : "Checking reference feed…"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          disabled={loading}
          className="pill shrink-0 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Refresh quote"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-5">
        {levels.map((level) => (
          <div key={level.label} className="bg-surface px-3 py-3 sm:px-4">
            <p className="text-muted text-[10px] tracking-wide uppercase">{level.label}</p>
            <p className="mt-1 text-sm font-medium tabular-nums">{loading ? "…" : price(level.value)}</p>
          </div>
        ))}
      </div>

      <p className="text-muted border-t border-line px-4 py-2.5 text-[11px] sm:px-5">
        Yahoo Finance reference feed · no TradingView account required. Not a real-time execution quote. Exchange data rights must be cleared before a paid launch.
      </p>
    </section>
  );
}
