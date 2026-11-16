import { createServerFn } from "@tanstack/react-start";
import { ttlCache } from "./ttl-cache";

export type FuturesSlug = "nq" | "spx";
export type FuturesBar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};
export type FuturesBarsResult = {
  symbol: string;
  bars: FuturesBar[];
  barAsOf: string | null;
  source: "Yahoo Finance";
  interval: "5m";
};

const SYMBOLS: Record<FuturesSlug, string> = {
  nq: "NQ=F",
  spx: "ES=F",
};

// Prototype reference data only: Yahoo's website data does not establish
// redistribution rights for a commercial, subscription-based product.
const barsCache = ttlCache<FuturesBarsResult | null>(60_000);

function positive(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

async function loadBars(symbol: string): Promise<FuturesBarsResult | null> {
  try {
    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=5d&includePrePost=true`;
    const response = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 ACTA" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;

    const json = (await response.json()) as {
      chart?: {
        result?: Array<{
          timestamp?: number[];
          indicators?: {
            quote?: Array<{
              open?: Array<number | null>;
              high?: Array<number | null>;
              low?: Array<number | null>;
              close?: Array<number | null>;
            }>;
          };
        }>;
      };
    };
    const result = json.chart?.result?.[0];
    const quote = result?.indicators?.quote?.[0];
    if (!result?.timestamp?.length || !quote) return null;

    const bars: FuturesBar[] = [];
    result.timestamp.forEach((time, index) => {
      const open = quote.open?.[index];
      const high = quote.high?.[index];
      const low = quote.low?.[index];
      const close = quote.close?.[index];
      if (
        !Number.isFinite(time) ||
        !positive(open) ||
        !positive(high) ||
        !positive(low) ||
        !positive(close) ||
        low > Math.min(open, close) ||
        high < Math.max(open, close) ||
        high < low
      ) return;
      bars.push({ time, open, high, low, close });
    });

    if (!bars.length) return null;
    bars.sort((a, b) => a.time - b.time);
    const uniqueBars = bars.filter((bar, index) => index === 0 || bar.time !== bars[index - 1]?.time);
    const lastTime = uniqueBars.at(-1)?.time;
    return {
      symbol,
      bars: uniqueBars,
      barAsOf: lastTime ? new Date(lastTime * 1000).toISOString() : null,
      source: "Yahoo Finance",
      interval: "5m",
    };
  } catch {
    return null;
  }
}

export const getFuturesBars = createServerFn({ method: "GET" })
  .validator((input: { slug: FuturesSlug }) => {
    if (input.slug !== "nq" && input.slug !== "spx") throw new Error("Unsupported futures contract");
    return input;
  })
  .handler(async ({ data }): Promise<FuturesBarsResult | null> => {
    const symbol = SYMBOLS[data.slug];
    return barsCache(symbol, () => loadBars(symbol));
  });
