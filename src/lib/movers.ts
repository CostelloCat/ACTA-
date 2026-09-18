import { EVENTS, eventStamp, type CalEvent } from "./calendar";

export type Mover = {
  id: string;
  tag: string;
  headline: string;
  hits: string;
  query: string;
};

const LIVE_MS = 90 * 60 * 1000;

const MIC = [
  { tag: "AAPL", re: /apple|tim cook/i, hits: "NQ · AAPL" },
  { tag: "GOOG", re: /google|alphabet|sundar/i, hits: "NQ · GOOG" },
  { tag: "OPENAI", re: /openai|sam altman|\baltman\b/i, hits: "NQ · MSFT" },
  { tag: "ANTH", re: /anthropic|dario amodei/i, hits: "NQ · MSFT" },
  { tag: "NVDA", re: /nvda|nvidia|jensen/i, hits: "NQ · NVDA" },
  { tag: "ELON", re: /elon|tesla|\bmusk\b/i, hits: "NQ · TSLA" },
  { tag: "DJT", re: /trump|\bdjt\b/i, hits: "NQ · ES · DXY" },
  { tag: "WARSH", re: /warsh/i, hits: "NQ · GOLD · DXY" },
  { tag: "FED", re: /fomc|powell|fed chair/i, hits: "NQ · ES · GOLD" },
] as const;

function isTalking(e: CalEvent) {
  if (MIC.some((m) => m.re.test(e.title))) return true;
  return /keynote|devday|presser|earnings call/i.test(e.title);
}

function tagFor(e: CalEvent) {
  return MIC.find((m) => m.re.test(e.title))?.tag ?? "LIVE";
}

/** Banner only while a named mic is hot. Data prints never appear here. */
export function liveMover(from = new Date()): Mover | null {
  const t = from.getTime();
  const live = EVENTS.find((e) => {
    if (!isTalking(e)) return false;
    const start = eventStamp(e).getTime();
    return t >= start && t < start + LIVE_MS;
  });
  if (!live) return null;
  const mic = MIC.find((m) => m.re.test(live.title));
  return {
    id: live.short,
    tag: tagFor(live),
    headline: `${live.title} is live — ${mic?.hits ?? live.hits}`,
    hits: mic?.hits ?? live.hits,
    query: live.title,
  };
}
