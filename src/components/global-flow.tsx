import { useEffect, useMemo, useState } from "react";
import type { CatalystSignal } from "@/lib/catalysts";
import { statusLabel } from "@/lib/catalysts";
import type { Quote } from "@/lib/desk";
import { cn } from "@/lib/utils";

type FlowKind = "source" | "event" | "mechanism" | "asset" | "expression";

type FlowNode = {
  id: string;
  kind: FlowKind;
  eyebrow: string;
  label: string;
  what: string;
  why: string;
  next: string;
  href?: string;
};

type FlowEdge = {
  from: string;
  to: string;
  label: string;
};

type FlowModel = {
  nodes: FlowNode[];
  edges: FlowEdge[];
  trade: TradeLens;
};

type TradeLens = {
  clock: string;
  firstMove: string;
  vehicles: string;
  beneficiaries: string;
  pressure: string;
  confirms: string;
  invalidates: string;
};

const KIND_COLOR: Record<FlowKind, string> = {
  source: "#a8dbe0",
  event: "#f0c2d8",
  mechanism: "#c9b8ea",
  asset: "#f5d4b8",
  expression: "#bfe8c9",
};

const KIND_LABEL: Record<FlowKind, string> = {
  source: "Evidence",
  event: "Event",
  mechanism: "Transmission",
  asset: "Markets",
  expression: "Names / expressions",
};

function uniqueHits(signal: CatalystSignal) {
  return [...new Set(signal.hits.split("·").map((hit) => hit.trim()).filter(Boolean))].slice(0, 3);
}

function transmissionLabel(signal: CatalystSignal) {
  if (signal.actor === "ENERGY" || /WTI|BRENT|oil|crude/i.test(signal.hits)) return "Supply / route risk";
  if (signal.actor === "FED" || /rates|FOMC|DXY/i.test(signal.title)) return "Rates / liquidity path";
  if (signal.actor === "DJT") return "Policy transmission";
  if (signal.actor === "OPENAI" || signal.actor === "NVDA") return "AI demand / compute";
  if (signal.actor === "ELON") return "Company / risk appetite";
  return "Cross-asset repricing";
}

function expressionsFor(signal: CatalystSignal) {
  if (signal.actor === "ENERGY" || /WTI|BRENT|oil|crude/i.test(`${signal.hits} ${signal.title}`)) {
    return [
      { label: "BNO / USO", why: "Brent- and WTI-linked fund expressions can separate when the shock is regional rather than global." },
      { label: "XOM · CVX / VLO · MPC", why: "Producers and refiners carry different exposure to crude prices, spreads, and product availability." },
      { label: "DAL · UAL / transport", why: "Fuel-sensitive businesses can absorb the same oil shock through higher operating costs." },
    ];
  }
  if (signal.actor === "FED" || /NQ.*GOLD|FOMC|rates/i.test(`${signal.hits} ${signal.title}`)) {
    return [
      { label: "QQQ / duration", why: "Long-duration growth exposure is sensitive to changes in the expected rate path." },
      { label: "JPM · KRE", why: "Banks respond through the curve, funding expectations, and credit conditions." },
      { label: "NEM · homebuilders", why: "Gold miners and rate-sensitive housing names express different branches of the same policy shock." },
    ];
  }
  if (["OPENAI", "NVDA", "AAPL", "MSFT", "GOOGL", "AMZN", "META"].includes(signal.actor)) {
    return [
      { label: signal.actor === "OPENAI" ? "MSFT · NVDA" : signal.actor, why: "The named company or its closest listed partner is the most direct expression of company-specific news." },
      { label: "Suppliers / partners", why: "Supply-chain and platform partners show whether the economics extend beyond the headline company." },
      { label: "Peer breadth / NQ", why: "Peer and index breadth confirm whether the catalyst is becoming a group or market event." },
    ];
  }
  if (signal.actor === "ELON") {
    return [
      { label: "TSLA", why: "Tesla is the direct company exposure when the remarks concern vehicles, autonomy, or company guidance." },
      { label: "NVDA / AI names", why: "Compute or xAI remarks can transmit into the wider AI complex." },
      { label: "NQ breadth", why: "Index breadth shows whether attention is spreading beyond the named company." },
    ];
  }
  if (signal.actor === "DJT") {
    return [
      { label: "Trade-sensitive names", why: "Tariffs and trade policy reach companies through sourcing, pricing, and geographic revenue." },
      { label: "Defense / energy", why: "Geopolitical and fiscal remarks can reprice sector-specific expectations before the whole index." },
      { label: "DXY / rate proxies", why: "Dollar and rate reactions help distinguish macro transmission from headline noise." },
    ];
  }
  return [
    { label: "Sector leaders", why: "Leaders reveal whether the event is moving a real industry group or only a headline." },
    { label: "Directly exposed names", why: "Company-level exposure separates the actual mechanism from broad index sympathy." },
    { label: "Index confirmation", why: "Breadth and index response show whether the event has escaped its original pocket." },
  ];
}

function tradeLensFor(signal: CatalystSignal): TradeLens {
  const text = `${signal.actor} ${signal.title} ${signal.hits}`;

  if (/ENERGY|WTI|BRENT|oil|crude|tanker|hormuz/i.test(text)) {
    return {
      clock: "Headline minutes → front contracts → cash-session equities",
      firstMove: "Brent vs WTI, prompt spreads, crude options volatility",
      vehicles: "Brent futures are direct; BNO is a proxy. CL / USO express WTI. XLE and company names add equity-session and business-mix risk.",
      beneficiaries: "Upstream producers, exporters, BNO / XLE if crude strength holds",
      pressure: "Airlines, transports, fuel-intensive industries; refiners depend on crack spreads",
      confirms: "Brent leads WTI, backwardation firms, energy breadth expands, breakevens rise",
      invalidates: "Routes remain open, prompt spreads fade, crude rejects the move, XLE lags",
    };
  }

  if (/FED|FOMC|Powell|Warsh|rates|inflation/i.test(text)) {
    return {
      clock: "Statement seconds → rates / FX → index futures → sector rotation",
      firstMove: "2Y yield, DXY, SOFR path, NQ relative to ES",
      vehicles: "Treasury and rate futures are direct. QQQ / SPY, banks, gold and homebuilders are conditional equity or asset proxies.",
      beneficiaries: "Duration if yields fall; lenders if the curve steepens for constructive reasons",
      pressure: "Long-duration growth when real yields rise; rate-sensitive credit when conditions tighten",
      confirms: "Rates and dollar agree, breadth follows, financial conditions move with the headline",
      invalidates: "Front-end yields reverse, DXY diverges, or index breadth refuses the initial move",
    };
  }

  if (/DJT|Trump|tariff|trade|geopolit/i.test(text)) {
    return {
      clock: "Headline seconds → FX / commodities → futures → exposed companies",
      firstMove: "DXY, rates, crude / gold, index futures and trade-sensitive baskets",
      vehicles: "Use the closest macro future first; sector ETFs and single names add policy-detail, liquidity and overnight gap risk.",
      beneficiaries: "Depends on policy: domestic substitutes, defense, or energy may gain relative strength",
      pressure: "Importers, globally sourced margins, exporters facing retaliation, fuel-sensitive groups",
      confirms: "Official language, implementation detail, sector breadth, FX and rates agreement",
      invalidates: "Walk-back or delay, no official document, or directly exposed names ignore the headline",
    };
  }

  if (signal.actor !== "ELON" && /OPENAI|NVDA|AAPL|MSFT|GOOGL|AMZN|META|Altman|NVIDIA|Apple|Microsoft|Alphabet|Google|Amazon|Meta|AI|compute/i.test(text)) {
    return {
      clock: "Named company → suppliers / partners → semiconductor breadth → NQ",
      firstMove: "Named stock, closest suppliers, cloud partners, SOX relative strength",
      vehicles: "The named stock is direct. Suppliers, SMH / SOXX and QQQ are progressively broader proxies with more unrelated exposure.",
      beneficiaries: "Compute, networking, memory, power and cloud names when demand is incremental",
      pressure: "Incumbents or high-multiple peers if the news changes cost, access, or competitive position",
      confirms: "Volume in the named stock, supplier participation, SOX breadth and estimate revisions",
      invalidates: "One-stock spike, suppliers lag, no economic detail, or NQ breadth deteriorates",
    };
  }

  if (/ELON|Musk|TSLA|xAI|SpaceX/i.test(text)) {
    return {
      clock: "Named company first → adjacent theme → NQ only if breadth develops",
      firstMove: "TSLA or named company, options volatility, adjacent autonomy / AI names",
      vehicles: "The named company is direct. Options add volatility and timing risk; theme baskets and NQ require breadth confirmation.",
      beneficiaries: "Direct suppliers and adjacent themes only when the statement changes economics",
      pressure: "Competitors or counterparties named by the catalyst; index impact requires breadth",
      confirms: "Primary-source detail, sustained volume, peer reaction and options follow-through",
      invalidates: "Social-only claim, rapid reversal, no peer reaction, or no change to fundamentals",
    };
  }

  return {
    clock: "Source confirmation → direct market → sector breadth → index",
    firstMove: "The closest listed market and directly exposed names",
    vehicles: "Prefer the instrument closest to the mechanism; label ETFs, sectors and indices as proxies with basis and session risk.",
    beneficiaries: "Groups with improving revenue, pricing power, supply, or funding conditions",
    pressure: "Groups facing the inverse mechanism: higher costs, tighter liquidity, or lost demand",
    confirms: "Primary-source confirmation, price / volume follow-through, and cross-market agreement",
    invalidates: "Source contradiction, reversal in the direct market, or failure to spread beyond one name",
  };
}

function relevantQuotes(signal: CatalystSignal, quotes: Quote[]) {
  const text = `${signal.actor} ${signal.title} ${signal.hits}`;
  const wanted = /ENERGY|WTI|BRENT|oil|crude/i.test(text)
    ? ["WTI", "GOLD", "GSPC", "NQ"]
    : /FED|FOMC|rates|inflation/i.test(text)
      ? ["NQ", "GSPC", "GOLD", "DJI"]
      : /OPENAI|NVDA|ELON|Musk|AI|compute/i.test(text)
        ? ["NQ", "GSPC", "DJI"]
        : ["GSPC", "NQ", "GOLD", "WTI"];
  const byLabel = new Map(quotes.filter((quote) => quote.price > 0).map((quote) => [quote.label, quote]));
  return wanted.flatMap((label) => {
    const quote = byLabel.get(label);
    return quote ? [quote] : [];
  });
}

function makeFlow(signal: CatalystSignal): FlowModel {
  const xQuery = `https://x.com/search?q=${encodeURIComponent(signal.title)}&f=live`;
  const youtubeQuery = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${signal.title} live`)}`;
  const assets = uniqueHits(signal);
  const expressions = expressionsFor(signal);
  const sourceNodes: FlowNode[] = [
    {
      id: "source-primary",
      kind: "source",
      eyebrow: signal.verified ? "SOURCE LINKED" : signal.status === "live" ? "DISCOVERED FEED" : "SCHEDULE",
      label: signal.source,
      what: signal.verified
        ? "The publisher or official source linked to this catalyst. A link proves provenance, not the underlying claim."
        : signal.status === "live"
          ? "A live feed found through discovery. It proves the stream is running—not that the named subject is speaking now."
          : "The scheduled ACTA record for this upcoming catalyst.",
      why: "A catalyst is only as useful as its provenance. This is the first place to inspect the exact claim, timestamp, and source type.",
      next: "Open the source, check its timestamp, and compare its exact language with the market reaction.",
      href: signal.href,
    },
    {
      id: "source-live",
      kind: "source",
      eyebrow: signal.videoId ? (signal.verified ? "PRIMARY LIVE" : "LIVE · VERIFY SUBJECT") : "LIVE DESK",
      label: signal.videoId ? "On-air feed" : "Official rooms",
      what: signal.videoId
        ? signal.verified
          ? "An official room confirmed on air by ACTA's live-source check."
          : "A stream confirmed on air; the title and named subject still require visual or primary-source confirmation."
        : "Official and broadcast rooms monitored for a live handoff.",
      why: "Live remarks can change the meaning of a headline in seconds; the full statement matters more than a clipped quote.",
      next: signal.videoId ? "Watch inside ACTA and compare the remarks with the wire." : "Open the live search without assuming someone is currently speaking.",
      href: signal.videoId ? signal.href : youtubeQuery,
    },
    {
      id: "source-social",
      kind: "source",
      eyebrow: "ATTENTION · UNVERIFIED",
      label: "Social signal",
      what: "Live public conversation around the event. It measures attention and claim velocity—not truth.",
      why: "Social coverage can assemble official posts, local reports, and market charts before one newsroom tells the complete story.",
      next: "Open the live search, then confirm every material claim through an official or attributable source.",
      href: xQuery,
    },
  ];

  const eventNode: FlowNode = {
    id: "event",
    kind: "event",
    eyebrow: statusLabel(signal),
    label: signal.title,
    what: signal.summary,
    why: "This is the event currently organizing the evidence, mechanisms, markets, and exposed names around one shared record.",
    next: "Trace rightward to see how the event could transmit. Select any node to inspect the relationship.",
    href: signal.href,
  };

  const mechanismNode: FlowNode = {
    id: "mechanism",
    kind: "mechanism",
    eyebrow: "WHY IT TRAVELS",
    label: transmissionLabel(signal),
    what: signal.mechanism,
    why: "This is the economic or market channel connecting the event to price—not a prediction that price must move.",
    next: "Look for confirmation across the linked markets before treating the mechanism as active.",
  };

  const assetNodes: FlowNode[] = assets.map((asset, index) => ({
    id: `asset-${index}`,
    kind: "asset",
    eyebrow: "MARKET EXPOSURE",
    label: asset,
    what: `${asset} is listed in ACTA's direct exposure set for this catalyst.`,
    why: `The ${transmissionLabel(signal).toLowerCase()} channel can reach ${asset}; direction and magnitude still require live confirmation.`,
    next: `Open the ${asset} book or chart and compare price, volume, and breadth with the developing source record.`,
  }));

  const expressionNodes: FlowNode[] = expressions.slice(0, assetNodes.length || 3).map((expression, index) => ({
    id: `expression-${index}`,
    kind: "expression",
    eyebrow: "EXPOSURE · NOT A CALL",
    label: expression.label,
    what: `A company, sector, or fund expression connected to ${signal.title}.`,
    why: expression.why,
    next: "Compare the individual expression with its parent market. Divergence can reveal where the event is actually being priced.",
  }));

  const edges: FlowEdge[] = [
    ...sourceNodes.map((source) => ({ from: source.id, to: eventNode.id, label: "informs" })),
    { from: eventNode.id, to: mechanismNode.id, label: "transmits through" },
    ...assetNodes.map((asset) => ({ from: mechanismNode.id, to: asset.id, label: "can reprice" })),
    ...expressionNodes.map((expression, index) => ({
      from: assetNodes[index % Math.max(1, assetNodes.length)]?.id ?? mechanismNode.id,
      to: expression.id,
      label: "expressed by",
    })),
  ];

  return { nodes: [...sourceNodes, eventNode, mechanismNode, ...assetNodes, ...expressionNodes], edges, trade: tradeLensFor(signal) };
}

function nodePositions(model: FlowModel) {
  const byKind = (kind: FlowKind) => model.nodes.filter((node) => node.kind === kind);
  const positions = new Map<string, { x: number; y: number }>();
  const placeColumn = (nodes: FlowNode[], x: number) => {
    nodes.forEach((node, index) => {
      const y = nodes.length === 1 ? 50 : 18 + (index / (nodes.length - 1)) * 64;
      positions.set(node.id, { x, y });
    });
  };
  placeColumn(byKind("source"), 8);
  placeColumn(byKind("event"), 30);
  placeColumn(byKind("mechanism"), 50);
  placeColumn(byKind("asset"), 70);
  placeColumn(byKind("expression"), 92);
  return positions;
}

export function GlobalFlow({
  activeSignal,
  quotes,
}: {
  activeSignal: CatalystSignal | null;
  quotes: Quote[];
}) {
  const [selectedId, setSelectedId] = useState("event");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const model = useMemo(() => (activeSignal ? makeFlow(activeSignal) : null), [activeSignal]);
  const positions = useMemo(() => (model ? nodePositions(model) : new Map<string, { x: number; y: number }>()), [model]);
  const tape = useMemo(() => (activeSignal ? relevantQuotes(activeSignal, quotes) : []), [activeSignal, quotes]);

  useEffect(() => {
    setSelectedId("event");
    setHoveredId(null);
  }, [activeSignal?.id]);

  if (!activeSignal || !model) {
    return <p className="text-muted rounded-2xl border border-line p-6 text-sm">No catalyst is available to map right now.</p>;
  }

  const focusId = hoveredId ?? selectedId;
  const selectedNode = model.nodes.find((node) => node.id === selectedId) ?? model.nodes.find((node) => node.id === "event")!;
  const related = new Set(model.edges.filter((edge) => edge.from === focusId || edge.to === focusId).flatMap((edge) => [edge.from, edge.to]));
  related.add(focusId);
  const stages: FlowKind[] = ["source", "event", "mechanism", "asset", "expression"];

  return (
    <section className="global-flow overflow-hidden rounded-3xl border border-line bg-black/55">
      <header className="border-b border-line px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <p className="text-gold text-[11px] tracking-[0.22em] uppercase">Global intelligence flow</p>
            <h2 className="mt-1 text-xl leading-tight sm:text-3xl">{activeSignal.title}</h2>
            <p className="text-muted mt-2 text-[11px] tracking-wide uppercase">
              {activeSignal.actor} · {statusLabel(activeSignal)} · {activeSignal.source}
            </p>
          </div>
          <div className="rounded-xl border border-gold/35 bg-gold/5 px-3 py-2 text-right">
            <p className="text-gold text-[9px] tracking-[0.18em] uppercase">Automatic priority</p>
            <p className="mt-1 text-xs">Highest-impact active signal</p>
          </div>
        </div>
        <p className="text-muted mt-4 text-xs">Catalyst → repricing → trade map</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] tracking-[0.14em] uppercase">
          <span className="text-muted"><b className="text-fg font-medium">Source-linked</b> evidence</span>
          <span className="text-muted"><b className="text-fg font-medium">Curated</b> relationships</span>
          <span className="text-muted"><b className="text-fg font-medium">Social</b> attention, not confirmation</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4" aria-label="Relevant live market tape">
          <span className="text-muted mr-1 text-[9px] tracking-[0.16em] uppercase">Tape check</span>
          {tape.length ? tape.map((quote) => (
            <span key={quote.symbol} className="rounded-full border border-line bg-black/40 px-2.5 py-1 text-[11px] tabular-nums">
              <b className="font-medium">{quote.label}</b> {quote.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
              <span className={quote.changePct < 0 ? "text-down" : "text-up"}>{quote.changePct >= 0 ? "+" : ""}{quote.changePct.toFixed(2)}%</span>
            </span>
          )) : <span className="text-muted text-[11px]">Live confirmation values unavailable · relationship map only</span>}
        </div>
      </header>

      <section className="border-b border-line bg-black/35 p-4 sm:p-6" aria-label="Trader decision map">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-gold text-[10px] tracking-[0.2em] uppercase">Trader lens · conditional, not a call</p>
            <h3 className="mt-1 text-xl">What has to happen for this to matter?</h3>
          </div>
          <p className="text-muted max-w-md text-right text-[11px] tracking-wide uppercase">{model.trade.clock}</p>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ["DIRECT TAPE", model.trade.firstMove],
            ["VEHICLES / PROXY RISK", model.trade.vehicles],
            ["BENEFITS IF CONFIRMED", model.trade.beneficiaries],
            ["UNDER PRESSURE", model.trade.pressure],
            ["CONFIRM WITH", model.trade.confirms],
            ["THESIS FAILS IF", model.trade.invalidates],
          ].map(([label, value]) => (
            <article key={label} className="rounded-xl border border-line bg-surface/80 p-3">
              <p className="text-muted text-[9px] tracking-[0.16em] uppercase">{label}</p>
              <p className="mt-2 text-xs leading-relaxed">{value}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="relative hidden h-[400px] md:block" onMouseLeave={() => setHoveredId(null)}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,184,234,.10),transparent_38%)]" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          {model.edges.map((edge) => {
            const from = positions.get(edge.from);
            const to = positions.get(edge.to);
            if (!from || !to) return null;
            const active = related.has(edge.from) && related.has(edge.to);
            const target = model.nodes.find((node) => node.id === edge.to)!;
            const midX = (from.x + to.x) / 2;
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={`M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
                fill="none"
                stroke={active ? KIND_COLOR[target.kind] : "var(--color-line)"}
                strokeWidth={active ? 0.58 : 0.22}
                opacity={active ? 0.95 : 0.38}
                style={active ? { filter: `drop-shadow(0 0 2px ${KIND_COLOR[target.kind]}aa)` } : undefined}
              />
            );
          })}
        </svg>
        {model.nodes.map((node) => {
          const pos = positions.get(node.id)!;
          const active = related.has(node.id);
          const selected = selectedId === node.id;
          return (
            <button
              key={node.id}
              type="button"
              onMouseEnter={() => setHoveredId(node.id)}
              onFocus={() => setHoveredId(node.id)}
              onBlur={() => setHoveredId(null)}
              onClick={() => setSelectedId(node.id)}
              className={cn(
                "flow-node absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-surface/95 px-3 py-2 text-left transition-opacity",
                node.kind === "event" || node.kind === "mechanism" ? "w-40" : "w-36",
                !active && "opacity-45",
              )}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                borderColor: selected ? KIND_COLOR[node.kind] : active ? `${KIND_COLOR[node.kind]}99` : "var(--color-line)",
                boxShadow: selected ? `0 0 0 1px ${KIND_COLOR[node.kind]}66, 0 0 22px ${KIND_COLOR[node.kind]}44` : undefined,
              }}
            >
              <span className="block text-[9px] tracking-[0.14em] uppercase" style={{ color: KIND_COLOR[node.kind] }}>{node.eyebrow}</span>
              <strong className="mt-1 block text-xs font-medium leading-snug">{node.label}</strong>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {stages.map((stage, stageIndex) => {
          const nodes = model.nodes.filter((node) => node.kind === stage);
          return (
            <div key={stage}>
              {stageIndex ? <p className="text-muted mb-2 text-center text-lg">↓</p> : null}
              <p className="text-muted mb-2 text-[10px] tracking-[0.18em] uppercase">{KIND_LABEL[stage]}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {nodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedId(node.id)}
                    className={cn("rounded-xl border bg-surface p-3 text-left", selectedId === node.id ? "border-gold/70" : "border-line")}
                  >
                    <span className="text-[9px] tracking-[0.14em] uppercase" style={{ color: KIND_COLOR[node.kind] }}>{node.eyebrow}</span>
                    <strong className="mt-1 block text-sm font-medium">{node.label}</strong>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-line bg-surface/80 p-4 sm:p-6" style={{ borderTopColor: KIND_COLOR[selectedNode.kind] }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-muted text-[10px] tracking-[0.2em] uppercase">{KIND_LABEL[selectedNode.kind]} · WHAT</p>
            <h3 className="mt-1 text-xl sm:text-2xl">{selectedNode.label}</h3>
            <p className="text-muted mt-2 text-sm leading-relaxed">{selectedNode.what}</p>
          </div>
          {selectedNode.href ? (
            <a className="pill pill-solid" href={selectedNode.href} target={selectedNode.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              Open source {selectedNode.href.startsWith("http") ? "↗" : "→"}
            </a>
          ) : null}
        </div>
        <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <div>
            <p className="text-muted text-[10px] tracking-[0.18em] uppercase">WHY</p>
            <p className="mt-1 text-sm leading-relaxed">{selectedNode.why}</p>
          </div>
          <div>
            <p className="text-muted text-[10px] tracking-[0.18em] uppercase">NEXT</p>
            <p className="mt-1 text-sm leading-relaxed">{selectedNode.next}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
