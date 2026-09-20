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
      { from: "event", to: "cpi-rate-path" },
      { from: "event", to: "cpi-real-yields" },
      { from: "cpi-rate-path", to: "cpi-dxy" },
      { from: "cpi-real-yields", to: "cpi-10y" },
      { from: "cpi-real-yields", to: "cpi-nqes" },
      { from: "cpi-rate-path", to: "cpi-gold" },
      { from: "cpi-real-yields", to: "cpi-gold" },
      { from: "cpi-nqes", to: "cpi-megacap" },
      { from: "cpi-10y", to: "cpi-financials" },
      { from: "cpi-gold", to: "cpi-miners" },
      { from: "cpi-megacap", to: "cpi-nvda" },
      { from: "cpi-financials", to: "cpi-jpm" },
      { from: "cpi-miners", to: "cpi-nem" },
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
      { from: "event", to: "fomc-dots" },
      { from: "event", to: "fomc-presser" },
      { from: "fomc-dots", to: "fomc-dxy" },
      { from: "fomc-dots", to: "fomc-gold" },
      { from: "fomc-presser", to: "fomc-gold" },
      { from: "fomc-presser", to: "fomc-nqes" },
      { from: "fomc-presser", to: "fomc-vix" },
      { from: "fomc-nqes", to: "fomc-megacap" },
      { from: "fomc-gold", to: "fomc-miners" },
      { from: "fomc-dots", to: "fomc-homebuilders" },
      { from: "fomc-megacap", to: "fomc-nvda" },
      { from: "fomc-miners", to: "fomc-nem" },
      { from: "fomc-homebuilders", to: "fomc-dhi" },
    ],
  },
];
