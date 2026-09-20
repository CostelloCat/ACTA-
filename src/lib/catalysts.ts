import { EVENTS, eventStamp, type CalEvent } from "./calendar";
import type { MosaicRow } from "./channels";
import type { NewsItem } from "./desk";

export type CatalystStatus = "live" | "breaking" | "upcoming" | "monitoring";

export type CatalystSignal = {
  id: string;
  actor: string;
  status: CatalystStatus;
  title: string;
  summary: string;
  mechanism: string;
  hits: string;
  source: string;
  href: string;
  at?: number;
  videoId?: string;
  verified: boolean;
  calendarEvent?: CalEvent;
};

export type CatalystWatch = {
  id: string;
  label: string;
  pattern: RegExp;
  hits: string;
  mechanism: string;
};

export const CATALYST_WATCHLIST: CatalystWatch[] = [
  {
    id: "djt",
    label: "DJT",
    pattern: /donald trump|president trump|\btrump\b|\bdjt\b/i,
    hits: "NQ · ES · DXY · sector names",
    mechanism: "Policy, tariffs, fiscal direction and geopolitics",
  },
  {
    id: "fed",
    label: "FED",
    pattern: /federal reserve|\bfed\b|fomc|powell|warsh/i,
    hits: "NQ · ES · GOLD · DXY",
    mechanism: "Rates, liquidity and the policy path",
  },
  {
    id: "elon",
    label: "ELON",
    pattern: /elon musk|\bmusk\b|tesla|spacex|\bxai\b/i,
    hits: "TSLA · NQ · NVDA",
    mechanism: "Company guidance, AI compute and risk appetite",
  },
  {
    id: "openai",
    label: "OPENAI",
    pattern: /sam altman|\baltman\b|openai/i,
    hits: "MSFT · NVDA · NQ",
    mechanism: "AI demand, model economics and compute",
  },
  {
    id: "nvidia",
    label: "NVDA",
    pattern: /jensen huang|nvidia|\bnvda\b/i,
    hits: "NVDA · NQ · semiconductors",
    mechanism: "AI demand, data-center spend and semiconductor breadth",
  },
  {
    id: "apple",
    label: "AAPL",
    pattern: /tim cook|apple intelligence|\bapple\b|\baapl\b/i,
    hits: "AAPL · NQ · hardware suppliers",
    mechanism: "Device demand, services margins, product cycles and supplier exposure",
  },
  {
    id: "microsoft",
    label: "MSFT",
    pattern: /satya nadella|\bmicrosoft\b|\bmsft\b|azure|copilot/i,
    hits: "MSFT · NQ · cloud / software",
    mechanism: "Cloud growth, AI monetization, enterprise spend and compute demand",
  },
  {
    id: "alphabet",
    label: "GOOGL",
    pattern: /sundar pichai|\balphabet\b|\bgoogle\b|\bgoogl\b|gemini/i,
    hits: "GOOGL · NQ · ads / cloud",
    mechanism: "Search economics, advertising demand, cloud growth and AI competition",
  },
  {
    id: "amazon",
    label: "AMZN",
    pattern: /andy jassy|\bamazon\b|\bamzn\b|\baws\b/i,
    hits: "AMZN · NQ · cloud / retail",
    mechanism: "AWS demand, retail margins, consumer activity and logistics costs",
  },
  {
    id: "meta",
    label: "META",
    pattern: /mark zuckerberg|\bmeta platforms\b|\bmeta\b|facebook|instagram/i,
    hits: "META · NQ · ads / AI",
    mechanism: "Advertising demand, engagement, AI infrastructure spend and regulation",
  },
  {
    id: "energy",
    label: "ENERGY",
    pattern: /opec|crude|oil|hormuz|tanker|energy ministry/i,
    hits: "WTI · BRENT · XLE · airlines",
    mechanism: "Supply risk, inflation expectations and sector margins",
  },
];

const BREAKING_PATTERN = /\bbreaking\b|live updates?|\bemergency\b|unexpectedly|trading halt(?:ed)?|market halt(?:ed)?|airspace clos(?:ed|ure)|strait clos(?:ed|ure)|missile|strike[sd]?|attack(?:ed|s)?|resign(?:s|ed)?|declare[sd]?|announce[sd]?/i;
const MIC_PATTERN = /keynote|devday|presser|press conference|remarks|speaks?|earnings call|fireside chat/i;
const APPEARANCE_PATTERN = /\blive\b|speaks?|remarks|keynote|interview|testif(?:y|ies)|press conference|town hall|fireside chat/i;
const LIVE_WINDOW_MS = 90 * 60 * 1000;

export function watchFor(text: string) {
  return CATALYST_WATCHLIST.find((watch) => watch.pattern.test(text)) ?? null;
}

function publishedAt(item: NewsItem) {
  const stamp = Date.parse(item.published);
  return Number.isFinite(stamp) ? stamp : null;
}

function calendarId(event: CalEvent) {
  return `calendar-${event.date}-${event.short.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function signalFromCalendar(event: CalEvent, now = new Date()): CatalystSignal {
  const watch = watchFor(event.title);
  const at = eventStamp(event).getTime();
  const duringWindow = now.getTime() >= at && now.getTime() < at + LIVE_WINDOW_MS;
  return {
    id: calendarId(event),
    actor: watch?.label ?? event.short,
    status: duringWindow ? "monitoring" : "upcoming",
    title: event.title,
    summary: event.context,
    mechanism: watch?.mechanism ?? event.context,
    hits: event.hits,
    source: duringWindow ? "Scheduled window · awaiting live verification" : "ACTA Calendar",
    href: "/calendar",
    at,
    verified: false,
    calendarEvent: event,
  };
}

export function scheduledCatalysts(now = new Date(), limit = 4, microphoneOnly = false) {
  return EVENTS.filter((event) => {
    const at = eventStamp(event).getTime();
    const stillRelevant = at + LIVE_WINDOW_MS > now.getTime();
    if (!stillRelevant) return false;
    if (!microphoneOnly) return true;
    return Boolean(watchFor(event.title)) || MIC_PATTERN.test(event.title);
  })
    .sort((a, b) => eventStamp(a).getTime() - eventStamp(b).getTime())
    .slice(0, limit)
    .map((event) => signalFromCalendar(event, now));
}

function liveSignals(mosaic: MosaicRow[]) {
  return mosaic
    .filter((row) => row.onAir && row.videoId)
    .map((row): CatalystSignal | null => {
      const text = row.provenance === "discovered" ? row.title : `${row.label} ${row.title} ${row.query}`;
      const watch = watchFor(text);
      const officialDesk = /white house|federal reserve|house floor|c-span/i.test(text);
      if (!watch && !officialDesk) return null;
      return {
        id: `live-${row.videoId}`,
        actor: watch?.label ?? row.label.toUpperCase(),
        status: "live",
        title: row.provenance === "discovered" ? row.title : `${row.label} is live`,
        summary: row.title && row.title !== row.label ? row.title : "Live source on the ACTA desk.",
        mechanism: watch?.mechanism ?? "Official remarks and policy headlines",
        hits: watch?.hits ?? "NQ · ES · DXY",
        source: row.provenance === "discovered" ? `${row.label} · discovered feed` : row.label,
        href: `https://www.youtube.com/watch?v=${row.videoId}`,
        videoId: row.videoId ?? undefined,
        verified: row.provenance === "official",
      };
    })
    .filter((signal): signal is CatalystSignal => Boolean(signal));
}

function breakingSignals(news: NewsItem[], now: Date) {
  const seen = new Set<string>();
  const signals: CatalystSignal[] = [];
  for (const item of news) {
    const at = publishedAt(item);
    if (at === null || now.getTime() - at > 3 * 60 * 60 * 1000) continue;
    const watch = watchFor(item.title);
    const urgent = BREAKING_PATTERN.test(item.title);
    const watchedAppearance = Boolean(watch && APPEARANCE_PATTERN.test(item.title));
    if (!urgent && !watchedAppearance) continue;
    const key = `${watch?.id ?? item.kind}-${item.title.toLowerCase().slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    signals.push({
      id: `wire-${signals.length}-${at}`,
      actor: watch?.label ?? item.kind,
      status: "breaking",
      title: item.title,
      summary: `Fresh reporting from ${item.source}. Open the original source before treating the headline as confirmed context.`,
      mechanism: watch?.mechanism ?? "Breaking information with potential cross-asset consequences",
      hits: watch?.hits ?? kindHits(item.kind),
      source: item.source,
      href: item.link,
      at,
      verified: true,
    });
    if (signals.length >= 4) break;
  }
  return signals;
}

function monitoringSignals(news: NewsItem[], now: Date, excludedTitles: Set<string>) {
  const seen = new Set<string>();
  const signals: CatalystSignal[] = [];
  for (const item of news) {
    const at = publishedAt(item);
    if (at === null || now.getTime() - at > 6 * 60 * 60 * 1000) continue;
    if (excludedTitles.has(item.title.toLowerCase())) continue;
    const watch = watchFor(item.title);
    if (!watch && item.kind !== "OIL" && item.kind !== "GEO") continue;
    const actor = watch?.label ?? (item.kind === "OIL" ? "ENERGY" : "GEO");
    const key = `${actor}-${item.title.toLowerCase().slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    signals.push({
      id: `monitor-${signals.length}-${at}`,
      actor,
      status: "monitoring",
      title: item.title,
      summary: `Recent source-linked coverage from ${item.source}. ACTA is monitoring the transmission path without labeling it breaking.`,
      mechanism: watch?.mechanism ?? (item.kind === "OIL" ? "Supply, transport, inflation and margin pressure" : "Geopolitics, policy response and cross-asset risk"),
      hits: watch?.hits ?? kindHits(item.kind),
      source: item.source,
      href: item.link,
      at,
      verified: true,
    });
    if (signals.length >= 3) break;
  }
  return signals;
}

function kindHits(kind: NewsItem["kind"]) {
  if (kind === "OIL") return "WTI · BRENT · energy names";
  if (kind === "RATES" || kind === "INFLATION") return "NQ · ES · GOLD · DXY";
  if (kind === "MAG7") return "NQ · single names";
  if (kind === "CRYPTO") return "BTC · ETH · crypto-linked names";
  return "Index futures · sectors · exposed names";
}

export function buildCatalystSignals({
  mosaic = [],
  news = [],
  now = new Date(),
  limit = 6,
}: {
  mosaic?: MosaicRow[];
  news?: NewsItem[];
  now?: Date;
  limit?: number;
}) {
  const live = liveSignals(mosaic);
  const breaking = breakingSignals(news, now);
  const breakingTitles = new Set(breaking.map((signal) => signal.title.toLowerCase()));
  const monitoring = monitoringSignals(news, now, breakingTitles);
  const nextMic = scheduledCatalysts(now, 3, true);
  return [...live, ...breaking, ...monitoring, ...nextMic].slice(0, limit);
}

export function buildDeskSignals({
  mosaic = [],
  news = [],
  now = new Date(),
}: {
  mosaic?: MosaicRow[];
  news?: NewsItem[];
  now?: Date;
}) {
  const immediate = [...liveSignals(mosaic), ...breakingSignals(news, now)];
  if (immediate.length) return immediate;
  return scheduledCatalysts(now, 1, false);
}

export function statusLabel(signal: CatalystSignal, now = new Date()) {
  if (signal.status === "live") return signal.verified ? "LIVE · PRIMARY" : "LIVE FEED · VERIFY";
  if (signal.status === "breaking") return "BREAKING · SOURCE LINKED";
  if (signal.status === "monitoring") return signal.verified ? "MONITORING · SOURCE LINKED" : "WINDOW OPEN · VERIFYING";
  if (!signal.at) return "MONITORING";
  const ms = signal.at - now.getTime();
  if (ms <= 0) return "DUE NOW";
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `IN ${days}D ${hours}H`;
  if (hours > 0) return `IN ${hours}H ${minutes}M`;
  return `IN ${Math.max(1, minutes)}M`;
}
