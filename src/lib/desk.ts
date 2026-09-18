import { createServerFn } from "@tanstack/react-start";
import { ttlCache } from "./ttl-cache";

export type WireKind = "OIL" | "RATES" | "INFLATION" | "MAG7" | "GEO" | "CRYPTO";

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  published: string;
  kind: WireKind;
};

export type Quote = {
  symbol: string;
  label: string;
  price: number;
  changePct: number;
};

export const WIRE_KEYS = [
  "United States",
  "Europe",
  "Russia",
  "Middle East",
  "Asia",
  "China",
  "LatAm",
  "Africa",
  "Crypto",
] as const;
export type WireKey = (typeof WIRE_KEYS)[number];

export type DeskPayload = {
  national: NewsItem[];
  region: NewsItem[];
  wires: Record<WireKey, NewsItem[]>;
  quotes: Quote[];
  fetchedAt: string;
};

const FEEDS: Record<WireKey, string[]> = {
  "United States": [
    "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",
    "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
  ],
  Europe: [
    "https://news.google.com/rss/search?q=Europe+markets+OR+ECB+when:1d&hl=en-US&gl=US&ceid=US:en",
    "https://feeds.bbci.co.uk/news/world/europe/rss.xml",
  ],
  Russia: [
    "https://tass.ru/rss/v2.xml",
    "https://ria.ru/export/rss2/archive/index.xml",
    "https://www.kommersant.ru/RSS/news.xml",
    "https://news.google.com/rss?hl=ru&gl=RU&ceid=RU:ru",
  ],
  "Middle East": [
    "https://news.google.com/rss?hl=ar&gl=EG&ceid=EG:ar",
    "https://www.aljazeera.com/xml/rss/all.xml",
  ],
  Asia: [
    "https://www3.nhk.or.jp/rss/news/cat0.xml",
    "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml",
    "https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja",
  ],
  China: [
    "https://news.google.com/rss?hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
    "https://news.google.com/rss/search?q=PBOC+OR+CGTN+OR+China+markets+when:1d&hl=en-US&gl=US&ceid=US:en",
  ],
  LatAm: [
    "https://news.google.com/rss?hl=es-419&gl=MX&ceid=MX:es",
    "https://news.google.com/rss/search?q=Bovespa+OR+Pemex+OR+LatAm+markets+when:1d&hl=en-US&gl=US&ceid=US:en",
  ],
  Africa: [
    "https://www.africanews.com/feed/",
    "https://news.google.com/rss?hl=en&gl=NG&ceid=NG:en",
    "https://news.google.com/rss?hl=en&gl=ZA&ceid=ZA:en",
  ],
  Crypto: [
    "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "https://cointelegraph.com/rss",
    "https://news.google.com/rss/search?q=bitcoin+OR+ethereum+OR+solana+OR+crypto+when:7d&hl=en-US&gl=US&ceid=US:en",
  ],
};

const FALLBACK: Record<WireKey, NewsItem[]> = {
  "United States": [
    {
      title: "FOMC and dots are in — market digests the path into Thursday housing and claims",
      link: "https://news.google.com/search?q=FOMC",
      source: "Wire",
      published: "",
      kind: "RATES",
    },
  ],
  Europe: [
    {
      title: "Bank of England due Thursday — cable and gold vs last night's dots",
      link: "https://news.google.com/search?q=Bank%20of%20England",
      source: "Wire",
      published: "",
      kind: "RATES",
    },
  ],
  Russia: [
    {
      title: "Российская лента — нефть, газ, ЦБ. Читаем источник, не перевод.",
      link: "https://tass.ru",
      source: "ТАСС",
      published: "",
      kind: "GEO",
    },
  ],
  "Middle East": [
    {
      title: "Oil desks watch Gulf supply headlines into the London session",
      link: "https://news.google.com/search?q=oil%20Middle%20East",
      source: "Wire",
      published: "",
      kind: "OIL",
    },
  ],
  Asia: [
    {
      title: "Asia session faded the FOMC spike — Tokyo and HK wait on US claims",
      link: "https://news.google.com/search?q=Asia%20markets",
      source: "Wire",
      published: "",
      kind: "GEO",
    },
  ],
  China: [
    {
      title: "人民币与央行 — 原语新闻，不是西方摘要。",
      link: "https://news.google.com/search?q=PBOC",
      source: "Wire",
      published: "",
      kind: "RATES",
    },
  ],
  LatAm: [
    {
      title: "LatAm crude, copper, Bovespa — native Spanish wires.",
      link: "https://news.google.com/search?q=Bovespa",
      source: "Wire",
      published: "",
      kind: "GEO",
    },
  ],
  Africa: [
    {
      title: "West Africa crude and metals — local desks, not the London rewrite.",
      link: "https://news.google.com/search?q=Africa%20oil",
      source: "Wire",
      published: "",
      kind: "OIL",
    },
  ],
  Crypto: [
    {
      title: "Bitcoin tracks the dollar after the SEP — funding still crowded",
      link: "https://news.google.com/search?q=bitcoin",
      source: "Wire",
      published: "",
      kind: "CRYPTO",
    },
  ],
};

const FALLBACK_QUOTES: Quote[] = [
  { symbol: "^DJI", label: "DJI", price: 0, changePct: 0 },
  { symbol: "^IXIC", label: "IXIC", price: 0, changePct: 0 },
  { symbol: "^GSPC", label: "GSPC", price: 0, changePct: 0 },
  { symbol: "GC=F", label: "GOLD", price: 0, changePct: 0 },
  { symbol: "CL=F", label: "WTI", price: 0, changePct: 0 },
  { symbol: "NQ=F", label: "NQ", price: 0, changePct: 0 },
];

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function tagWire(title: string): WireKind {
  const t = title.toLowerCase();
  if (/bitcoin|ethereum|crypto|btc|solana/.test(t)) return "CRYPTO";
  if (/oil|opec|crude|wti|brent|hormuz|tanker|refin|petroleum|газ|нефть/.test(t)) return "OIL";
  if (/cpi|inflation|pce|ppi/.test(t)) return "INFLATION";
  if (/fed|fomc|rate cut|treasury|yield|powell|ecb|boe|цб|pboc/.test(t)) return "RATES";
  if (/nvidia|apple|microsoft|google|amazon|tesla|meta|mag7/.test(t)) return "MAG7";
  return "GEO";
}

function parseRss(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const block = m[1] ?? "";
    const title = decode(block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const link = decode(block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ?? "");
    const source = decode(block.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1] ?? "Wire");
    const published = decode(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] ?? "");
    if (title) items.push({ title, link, source, published, kind: tagWire(title) });
  }
  return items;
}

async function fetchText(url: string, ms = 8000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": "ACTA/1.0" },
    });
    if (!res.ok) throw new Error(String(res.status));
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function loadFeed(url: string): Promise<NewsItem[]> {
  try {
    const xml = await fetchText(url);
    return parseRss(xml).slice(0, 16);
  } catch {
    return [];
  }
}

async function loadWire(key: WireKey): Promise<NewsItem[]> {
  const batches = await Promise.all((FEEDS[key] ?? []).map(loadFeed));
  const seen = new Set<string>();
  const merged: NewsItem[] = [];
  for (const row of batches.flat()) {
    const k = row.title.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    merged.push(row);
  }
  return merged.length ? merged.slice(0, 12) : FALLBACK[key];
}

async function loadQuotes(): Promise<Quote[]> {
  const symbols = "%5EDJI,%5EIXIC,%5EGSPC,GC=F,CL=F,NQ=F";
  const labels: Record<string, string> = {
    "^DJI": "DJI",
    "^IXIC": "IXIC",
    "^GSPC": "GSPC",
    "GC=F": "GOLD",
    "CL=F": "WTI",
    "NQ=F": "NQ",
  };
  try {
    const raw = await fetchText(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`);
    const json = JSON.parse(raw) as {
      quoteResponse?: {
        result?: Array<{
          symbol: string;
          regularMarketPrice?: number;
          regularMarketChangePercent?: number;
        }>;
      };
    };
    const rows = json.quoteResponse?.result ?? [];
    if (!rows.length) return FALLBACK_QUOTES;
    return rows.map((r) => ({
      symbol: r.symbol,
      label: labels[r.symbol] ?? r.symbol,
      price: r.regularMarketPrice ?? 0,
      changePct: r.regularMarketChangePercent ?? 0,
    }));
  } catch {
    return FALLBACK_QUOTES;
  }
}

export function leadAge(published: string) {
  const t = Date.parse(published);
  if (!Number.isFinite(t)) return "";
  const m = Math.max(0, Math.round((Date.now() - t) / 60_000));
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 36) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

// 60s TTL, one shared entry: ~20 RSS feeds + a Yahoo quote batch fan out on
// every call, and every open desk tab/page load was re-running that fan-out
// uncached — the fastest way to get this app's shared server IP rate-limited
// by Yahoo/Google, taking every user down at once.
const deskCache = ttlCache<DeskPayload>(60_000);

async function loadDesk(): Promise<DeskPayload> {
  const entries = await Promise.all(WIRE_KEYS.map(async (key) => [key, await loadWire(key)] as const));
  const wires = Object.fromEntries(entries) as Record<WireKey, NewsItem[]>;
  const quotes = await loadQuotes();
  return {
    national: wires["United States"],
    region: wires.Russia,
    wires,
    quotes,
    fetchedAt: new Date().toISOString(),
  };
}

export const getDesk = createServerFn({ method: "GET" }).handler(() => deskCache("desk", loadDesk));

export const getNameNews = createServerFn({ method: "GET" })
  .validator((input: { q: string }) => input)
  .handler(async ({ data }): Promise<NewsItem[]> => {
    const q = data.q.trim().slice(0, 80);
    if (!q) return [];
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`${q} when:2d`)}&hl=en-US&gl=US&ceid=US:en`;
    const items = await loadFeed(url);
    return items.slice(0, 6);
  });

function withinDays(published: string, days: number) {
  const t = Date.parse(published);
  if (!Number.isFinite(t)) return true;
  return Date.now() - t <= days * 86_400_000;
}

// Matches the /crypto route's own 60s poll (CLAUDE.md: "7-day coin wire,
// refresh 60s") so every open tab shares one upstream fetch per window.
const cryptoNewsCache = ttlCache<NewsItem[]>(60_000);

export const getCryptoNews = createServerFn({ method: "GET" }).handler(() =>
  cryptoNewsCache("crypto", async () => {
    const rows = await loadWire("Crypto");
    return rows.filter((r) => withinDays(r.published, 7)).slice(0, 18);
  }),
);
