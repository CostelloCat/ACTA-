import type { CalKind } from "@/lib/calendar";

export type ImpactNodeKind = "mechanism" | "asset" | "sector" | "company";

export type ImpactNode = {
  id: string;
  kind: ImpactNodeKind;
  label: string;
  what: string;
  why: string;
  instrumentSlug?: string;
};

export type ImpactEdge = {
  from: string;
  to: string;
  /** Illustrative relationship strength, 0–1 — mirrors the `weight` column ENGINEERING_AUDIT_001.md §E proposes for `instrument_influence`. */
  weight: number;
};

export type ImpactGraph = {
  id: string;
  eventTitle: string;
  eventKind: CalKind;
  nodes: ImpactNode[];
  edges: ImpactEdge[];
};

export const IMPACT_GRAPHS: ImpactGraph[] = [
  {
    id: "cpi",
    eventTitle: "CPI",
    eventKind: "inflation",
    nodes: [
      {
        id: "cpi-rate-path",
        kind: "mechanism",
        label: "Fed rate-path repricing",
        what: "How many cuts or hikes markets expect the Fed to deliver over the next year.",
        why: "A core CPI surprise changes that expected path immediately, which resets pricing across the whole rates curve.",
      },
      {
        id: "cpi-real-yields",
        kind: "mechanism",
        label: "Real yields move",
        what: "The 10-year Treasury yield minus expected inflation — the rate that actually prices risk assets.",
        why: "An inflation surprise changes the real yield almost on the print, before the Fed says a word.",
      },
      {
        id: "cpi-dxy",
        kind: "asset",
        label: "DXY (Dollar Index)",
        what: "Broad US dollar strength gauge against a basket of major currencies.",
        why: "A more hawkish repriced rate path pulls foreign capital toward higher US yields, bidding the dollar.",
      },
      {
        id: "cpi-10y",
        kind: "asset",
        label: "10Y Treasury yield",
        what: "Benchmark long-term US government bond yield.",
        why: "It's the direct instrument the real-yield repricing shows up in first, minutes after the release.",
      },
      {
        id: "cpi-nqes",
        kind: "asset",
        label: "NQ / ES futures",
        what: "Nasdaq-100 and S&P 500 index futures — the two most-watched equity index tapes.",
        why: "Higher real yields raise the discount rate on future earnings, hitting long-duration growth names hardest — that's the Nasdaq.",
        instrumentSlug: "nq",
      },
      {
        id: "cpi-gold",
        kind: "asset",
        label: "Gold",
        what: "The reserve precious metal, priced against real yields and the dollar.",
        why: "Gold is priced against real yields and the dollar; a hawkish surprise on either is a headwind.",
        instrumentSlug: "gold",
      },
      {
        id: "cpi-megacap",
        kind: "sector",
        label: "Mega-cap Tech",
        what: "The largest weights in the Nasdaq-100 (roughly 40%+ of the index).",
        why: "Nasdaq futures are driven mostly by mega-cap tech weight, so index-level moves concentrate here first.",
      },
      {
        id: "cpi-financials",
        kind: "sector",
        label: "Rate-sensitive Financials",
        what: "Banks whose net-interest-margin outlook is tied directly to the yield curve.",
        why: "Bank NIM expectations move directly with the yield curve the 10-year just repriced.",
      },
      {
        id: "cpi-miners",
        kind: "sector",
        label: "Precious-metals miners",
        what: "Equities that mine and sell gold and silver.",
        why: "Miner equities carry operating leverage to the metal price — they move more than gold itself, in both directions.",
      },
      {
        id: "cpi-nvda",
        kind: "company",
        label: "NVDA · AAPL · MSFT",
        what: "The three largest weights in the Nasdaq-100.",
        why: "Largest index weights; a mega-cap-tech move concentrates here first and moves the index most visibly.",
        instrumentSlug: "mag7",
      },
      {
        id: "cpi-jpm",
        kind: "company",
        label: "JPM",
        what: "Largest US bank by market capitalization.",
        why: "A bellwether for how the market prices NIM-sensitive bank earnings against the new yield curve.",
      },
      {
        id: "cpi-nem",
        kind: "company",
        label: "NEM (Newmont)",
        what: "Largest gold miner by market capitalization.",
        why: "The most liquid single-name way to trade precious-metals-miner beta to the gold move.",
      },
    ],
    edges: [
      { from: "event", to: "cpi-rate-path", weight: 0.95 },
      { from: "event", to: "cpi-real-yields", weight: 0.9 },
      { from: "cpi-rate-path", to: "cpi-dxy", weight: 0.8 },
      { from: "cpi-real-yields", to: "cpi-10y", weight: 0.95 },
      { from: "cpi-real-yields", to: "cpi-nqes", weight: 0.85 },
      { from: "cpi-rate-path", to: "cpi-gold", weight: 0.6 },
      { from: "cpi-real-yields", to: "cpi-gold", weight: 0.8 },
      { from: "cpi-nqes", to: "cpi-megacap", weight: 0.9 },
      { from: "cpi-10y", to: "cpi-financials", weight: 0.75 },
      { from: "cpi-gold", to: "cpi-miners", weight: 0.7 },
      { from: "cpi-megacap", to: "cpi-nvda", weight: 0.85 },
      { from: "cpi-financials", to: "cpi-jpm", weight: 0.6 },
      { from: "cpi-miners", to: "cpi-nem", weight: 0.65 },
    ],
  },
  {
    id: "fomc",
    eventTitle: "FOMC + dots",
    eventKind: "rates",
    nodes: [
      {
        id: "fomc-dots",
        kind: "mechanism",
        label: "Dot-plot rate-path revision",
        what: "The quarterly Summary of Economic Projections — each Fed member's own rate forecast.",
        why: "The dots reset the market's expected policy path for the whole next year, which matters more than the 25bp decision itself.",
      },
      {
        id: "fomc-presser",
        kind: "mechanism",
        label: "Powell presser tone",
        what: "The Fed chair's forward-guidance language in the post-decision press conference.",
        why: "Presser tone is read as the Fed's actual reaction function, and can move markets more than the statement text.",
      },
      {
        id: "fomc-dxy",
        kind: "asset",
        label: "DXY (Dollar Index)",
        what: "Broad US dollar strength gauge against a basket of major currencies.",
        why: "A dot plot showing fewer cuts than priced is a hawkish dollar surprise.",
      },
      {
        id: "fomc-gold",
        kind: "asset",
        label: "Gold",
        what: "The reserve precious metal, priced against real yields and the dollar.",
        why: "Gold trades opposite the real-rate path implied by the dots; presser tone can reverse the initial move entirely.",
        instrumentSlug: "gold",
      },
      {
        id: "fomc-nqes",
        kind: "asset",
        label: "NQ / ES futures",
        what: "Nasdaq-100 and S&P 500 index futures — the two most-watched equity index tapes.",
        why: "Duration-sensitive index futures react most to forward guidance, not the 14:00 decision itself.",
        instrumentSlug: "nq",
      },
      {
        id: "fomc-vix",
        kind: "asset",
        label: "VIX",
        what: "The index options market's 30-day implied-volatility gauge.",
        why: "Event vol typically bids into 14:00 and crushes into the presser if the statement is as-expected — a surprise keeps it bid.",
        instrumentSlug: "vix",
      },
      {
        id: "fomc-megacap",
        kind: "sector",
        label: "Mega-cap Tech",
        what: "The largest weights in the Nasdaq-100 (roughly 40%+ of the index).",
        why: "Nasdaq futures are driven mostly by mega-cap tech weight, so index-level moves concentrate here first.",
      },
      {
        id: "fomc-miners",
        kind: "sector",
        label: "Precious-metals miners",
        what: "Equities that mine and sell gold and silver.",
        why: "Miner equities carry operating leverage to the metal price — they move more than gold itself, in both directions.",
      },
      {
        id: "fomc-homebuilders",
        kind: "sector",
        label: "Homebuilders",
        what: "The most rate-sensitive real-economy sector — housing.",
        why: "Fewer priced cuts in the dots directly raises mortgage-rate expectations, the single biggest input to homebuilder demand.",
      },
      {
        id: "fomc-nvda",
        kind: "company",
        label: "NVDA · AAPL · MSFT",
        what: "The three largest weights in the Nasdaq-100.",
        why: "Largest index weights; a mega-cap-tech move concentrates here first and moves the index most visibly.",
        instrumentSlug: "mag7",
      },
      {
        id: "fomc-nem",
        kind: "company",
        label: "NEM (Newmont)",
        what: "Largest gold miner by market capitalization.",
        why: "The most liquid single-name way to trade precious-metals-miner beta to the gold move.",
      },
      {
        id: "fomc-dhi",
        kind: "company",
        label: "DHI (D.R. Horton)",
        what: "Largest US homebuilder by closings volume.",
        why: "Highly sensitive to mortgage-rate moves, making it the cleanest single-name expression of the housing channel.",
      },
    ],
    edges: [
      { from: "event", to: "fomc-dots", weight: 0.95 },
      { from: "event", to: "fomc-presser", weight: 0.9 },
      { from: "fomc-dots", to: "fomc-dxy", weight: 0.8 },
      { from: "fomc-dots", to: "fomc-gold", weight: 0.75 },
      { from: "fomc-presser", to: "fomc-gold", weight: 0.6 },
      { from: "fomc-presser", to: "fomc-nqes", weight: 0.9 },
      { from: "fomc-presser", to: "fomc-vix", weight: 0.7 },
      { from: "fomc-nqes", to: "fomc-megacap", weight: 0.9 },
      { from: "fomc-gold", to: "fomc-miners", weight: 0.7 },
      { from: "fomc-dots", to: "fomc-homebuilders", weight: 0.65 },
      { from: "fomc-megacap", to: "fomc-nvda", weight: 0.85 },
      { from: "fomc-miners", to: "fomc-nem", weight: 0.65 },
      { from: "fomc-homebuilders", to: "fomc-dhi", weight: 0.6 },
    ],
  },
];

export type CrowdNarrative = {
  label: string;
  share: number;
  note: string;
};

export type CrowdContext = {
  /** Hand-authored, illustrative framings of public discussion — not derived from any live post or feed. */
  narratives: CrowdNarrative[];
  /** A single illustrative sentence, not computed from real price or narrative data. */
  divergenceNote: string;
};

/**
 * SAMPLE / PROTOTYPE data for the Conviction / Crowd Context exploration. Unlike the
 * `IMPACT_GRAPHS` relationship data (which is at least grounded in the real `markets.ts` prose),
 * these narrative splits are illustrative placeholders standing in for a real aggregation ACTA
 * doesn't have the infrastructure to measure yet — see OPS_STATUS.md for what that would take.
 */
export const CROWD_CONTEXT: Record<string, CrowdContext> = {
  cpi: {
    narratives: [
      { label: "Inflation cooling, Fed has room to ease", share: 45, note: "Reads the print as confirming disinflation continues." },
      { label: "Core still sticky, hawkish risk stays", share: 35, note: "Focuses on services/shelter components staying firm." },
      { label: "One print is noise, wait for the trend", share: 20, note: "Discounts the single release either direction." },
    ],
    divergenceNote:
      "Demo logic: price sometimes front-runs the CPI print itself (positioning into 8:30) and then reverses once the dominant narrative above catches up — not measured here.",
  },
  fomc: {
    narratives: [
      { label: "Dots confirm the cutting path", share: 40, note: "Reads the SEP as validating an easing cycle already priced." },
      { label: "Powell sounds more hawkish than the dots", share: 38, note: "Weighs presser tone over the projections themselves." },
      { label: "Decision is a non-event, watch the next SEP", share: 22, note: "Treats a non-SEP meeting as low-signal." },
    ],
    divergenceNote:
      "Demo logic: the market's first reaction to the 14:00 statement often diverges from where it settles after the 14:30 presser — not measured here.",
  },
};
