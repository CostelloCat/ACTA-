import { createServerFn } from "@tanstack/react-start";
import { ttlCache } from "./ttl-cache";

export type LevelPack = {
  symbol: string;
  last: number;
  priorHigh: number | null;
  priorLow: number | null;
  vwap: number | null;
  onh: number | null;
  onl: number | null;
  yearOpen: number | null;
  asOf: string;
  source: string;
};

export const YAHOO: Record<string, string> = {
  spx: "ES=F",
  nq: "NQ=F",
  gold: "GC=F",
  silver: "SI=F",
  oil: "CL=F",
  vix: "^VIX",
  mag7: "NVDA",
  btc: "BTC-USD",
  eth: "ETH-USD",
  sol: "SOL-USD",
  xrp: "XRP-USD",
  xlm: "XLM-USD",
};

type Quote = {
  open: Array<number | null>;
  high: Array<number | null>;
  low: Array<number | null>;
  close: Array<number | null>;
  volume: Array<number | null>;
};

type Chart = {
  timestamp?: number[];
  meta?: { regularMarketPrice?: number; timezone?: string };
  indicators?: { quote?: Quote[] };
};

async function chart(symbol: string, interval: string, range: string): Promise<Chart | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=true`;
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 ACTA" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { chart?: { result?: Chart[] } };
    return json.chart?.result?.[0] ?? null;
  } catch {
    return null;
  }
}

function etHourMin(unix: number) {
  const d = new Date(unix * 1000);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function etYmd(unix: number) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(unix * 1000));
}

// ET is UTC-4 (EDT) or UTC-5 (EST) depending on the date — hardcoding one
// breaks the other half of the year. Anchor the probe at 18:00 UTC: by then
// any DST transition (which happens at 2am local) for that calendar date has
// already occurred, so the offset observed here is the one actually in
// effect at 18:00 ET the same day.
function etOffsetHours(y: number, m: number, d: number): number {
  const anchor = new Date(Date.UTC(y, m - 1, d, 18, 0, 0));
  const tzName =
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      timeZoneName: "shortOffset",
    })
      .formatToParts(anchor)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT-5";
  const match = tzName.match(/GMT([+-]\d{1,2})/);
  return match ? Number(match[1]) : -5;
}

function sessionOpen18ET(y: number, m: number, d: number): number {
  const offset = etOffsetHours(y, m, d);
  const sign = offset < 0 ? "-" : "+";
  const hh = String(Math.abs(offset)).padStart(2, "0");
  return Date.parse(
    `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T18:00:00${sign}${hh}:00`,
  );
}

function lastSessionOpenUnix(now = Date.now()) {
  const ymd = etYmd(Math.floor(now / 1000));
  const [y, m, d] = ymd.split("-").map(Number);
  const eighteen = sessionOpen18ET(y ?? 1970, m ?? 1, d ?? 1);
  if (now >= eighteen) return Math.floor(eighteen / 1000);
  const prev = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, (d ?? 1) - 1));
  return Math.floor(
    sessionOpen18ET(prev.getUTCFullYear(), prev.getUTCMonth() + 1, prev.getUTCDate()) / 1000,
  );
}

// 20s TTL: short enough to stay fresh for someone clicking around a book page
// (CLAUDE.md: "pull on click"), long enough that a burst of clicks/viewers on
// the same symbol shares one Yahoo round trip instead of one each.
const levelsCache = ttlCache<LevelPack | null>(20_000);

async function loadLevels(symbol: string): Promise<LevelPack | null> {
    const [daily, intra, year] = await Promise.all([
      chart(symbol, "1d", "10d"),
      chart(symbol, "5m", "5d"),
      chart(symbol, "1d", "ytd"),
    ]);
    const dTs = daily?.timestamp ?? [];
    const dQ = daily?.indicators?.quote?.[0];
    let priorHigh: number | null = null;
    let priorLow: number | null = null;
    if (dQ && dTs.length >= 2) {
      const i = dTs.length - 2;
      priorHigh = dQ.high[i] ?? null;
      priorLow = dQ.low[i] ?? null;
    }
    const last = daily?.meta?.regularMarketPrice ?? dQ?.close.at(-1) ?? 0;

    const iTs = intra?.timestamp ?? [];
    const iQ = intra?.indicators?.quote?.[0];
    let vwap: number | null = null;
    let onh: number | null = null;
    let onl: number | null = null;
    if (iQ && iTs.length) {
      const openUnix = lastSessionOpenUnix();
      let pv = 0;
      let vol = 0;
      for (let i = 0; i < iTs.length; i++) {
        const t = iTs[i] ?? 0;
        if (t < openUnix) continue;
        const h = iQ.high[i];
        const l = iQ.low[i];
        const c = iQ.close[i];
        const o = iQ.open[i];
        const v = iQ.volume[i] ?? 0;
        if (h == null || l == null || c == null || o == null) continue;
        const typical = (h + l + c) / 3;
        pv += typical * v;
        vol += v;
        const hm = etHourMin(t);
        const overnight = hm >= 18 * 60 || hm < 9 * 60 + 30;
        if (overnight) {
          onh = onh == null ? h : Math.max(onh, h);
          onl = onl == null ? l : Math.min(onl, l);
        }
      }
      if (vol > 0) vwap = pv / vol;
    }

    const yTs = year?.timestamp ?? [];
    const yQ = year?.indicators?.quote?.[0];
    const yearOpen = yQ && yTs.length ? (yQ.open[0] ?? null) : null;

    return {
      symbol,
      last: Number(last) || 0,
      priorHigh,
      priorLow,
      vwap,
      onh,
      onl,
      yearOpen,
      asOf: new Date().toISOString(),
      source: "Yahoo Finance",
    };
}

export const getLevels = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data }): Promise<LevelPack | null> => {
    const symbol = YAHOO[data.slug];
    if (!symbol) return null;
    return levelsCache(symbol, () => loadLevels(symbol));
  });
