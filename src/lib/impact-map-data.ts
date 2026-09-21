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

export type RailAttentionTrend = "rising" | "cooling" | "split";

export type RailSource = {
  id: string;
  /** A generic category, never a specific real account/handle/creator name. */
  category: string;
  claim: string;
  timestamp: string;
  /** Illustrative distance from the tape, 0 (in-phase) to 1 (diverging). Not computed from any real price feed. */
  divergence: number;
  attentionTrend: RailAttentionTrend;
  /** Illustrative plate size, 0 to 1. */
  attentionSize: number;
  /** Up to 3 illustrative one-line claims shown on click — sample, not real posts. */
  sampleClaims: string[];
};

/**
 * SAMPLE / PROTOTYPE data for "The Rail" — the Conviction/Crowd Context visual. Every field here
 * is hand-authored and illustrative, standing in for a real aggregation ACTA doesn't have the
 * infrastructure (or licensing) to measure yet — see OPS_STATUS.md for what that would take.
 * Categories are deliberately generic (desk/thread/note types, not named accounts) so nothing
 * here reads as a real, specific creator's endorsement or claim.
 */
export const RAIL_SOURCES: Record<string, RailSource[]> = {
  cpi: [
    {
      id: "cpi-rates-desks",
      category: "Rates-desk chatter",
      claim: "Framing core CPI as confirmation the disinflation trend holds.",
      timestamp: "~1h ago",
      divergence: 0.15,
      attentionTrend: "rising",
      attentionSize: 0.9,
      sampleClaims: [
        "Core in-line keeps the cutting path alive.",
        "Watching shelter components for the real story.",
        "Fed doesn't need a hot print to stay patient.",
      ],
    },
    {
      id: "cpi-options-flow",
      category: "Options-flow chatter",
      claim: "Elevated gamma into the print; expecting a fast fade either direction.",
      timestamp: "~40m ago",
      divergence: 0.55,
      attentionTrend: "cooling",
      attentionSize: 0.6,
      sampleClaims: [
        "Vol crush likely regardless of the number.",
        "Dealers pinned near round strikes into the open.",
        "Fade the first five minutes was the working plan.",
      ],
    },
    {
      id: "cpi-macro-threads",
      category: "Macro threads",
      claim: "Split between 'cooling confirmed' and 'sticky services' camps.",
      timestamp: "~2h ago",
      divergence: 0.7,
      attentionTrend: "split",
      attentionSize: 0.8,
      sampleClaims: [
        "Team transitory: shelter lags, ignore it.",
        "Team sticky: services ex-shelter still running hot.",
        "Neither camp is budging pre-print.",
      ],
    },
    {
      id: "cpi-sellside-notes",
      category: "Sell-side notes",
      claim: "Base case is an in-line print, keeping September odds anchored.",
      timestamp: "~3h ago",
      divergence: 0.25,
      attentionTrend: "cooling",
      attentionSize: 0.5,
      sampleClaims: [
        "No change to year-end cut count.",
        "In-line print is a non-event for the desk.",
        "Watching the dollar reaction more than the number.",
      ],
    },
  ],
  fomc: [
    {
      id: "fomc-rates-desks",
      category: "Rates-desk chatter",
      claim: "Focused entirely on the dot-plot median, not the 25bp itself.",
      timestamp: "~1h ago",
      divergence: 0.2,
      attentionTrend: "rising",
      attentionSize: 0.9,
      sampleClaims: [
        "Dots matter more than the decision, as always.",
        "Two cuts already priced for next year.",
        "Presser tone is the real risk event.",
      ],
    },
    {
      id: "fomc-options-flow",
      category: "Options-flow chatter",
      claim: "Vol bid into 14:00, expecting a crush by 15:00 absent a surprise.",
      timestamp: "~45m ago",
      divergence: 0.5,
      attentionTrend: "cooling",
      attentionSize: 0.65,
      sampleClaims: [
        "Straddle priced for a roughly 1.2% NQ move.",
        "Dealers likely sell the rip either direction.",
        "Watching the 2s10s more than NQ itself.",
      ],
    },
    {
      id: "fomc-macro-threads",
      category: "Macro threads",
      claim: "Divided between 'hawkish hold' and 'dovish confirmation' reads.",
      timestamp: "~2h ago",
      divergence: 0.65,
      attentionTrend: "split",
      attentionSize: 0.75,
      sampleClaims: [
        "Powell always sounds hawkish — fade the presser dip.",
        "This SEP has to acknowledge the labor cooling.",
        "Neither side is backing off before 14:00.",
      ],
    },
    {
      id: "fomc-sellside-notes",
      category: "Sell-side notes",
      claim: "House view unchanged: base case is a hold with a dovish tilt.",
      timestamp: "~4h ago",
      divergence: 0.3,
      attentionTrend: "cooling",
      attentionSize: 0.55,
      sampleClaims: [
        "No change to our year-end call.",
        "Presser risk is two-sided — size accordingly.",
        "Dots matter more than the vote count.",
      ],
    },
  ],
};
