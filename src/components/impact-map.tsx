import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { EVENTS, upcomingFrom, type CalEvent } from "@/lib/calendar";
import { getDesk, getNameNews, leadAge, type NewsItem, type Quote } from "@/lib/desk";
import {
  IMPACT_GRAPHS,
  RAIL_SOURCES,
  type ImpactEdge,
  type ImpactGraph,
  type ImpactNode,
  type ImpactNodeKind,
  type RailSource,
} from "@/lib/impact-map-data";
import { cn } from "@/lib/utils";

const COLUMN_ORDER: ImpactNodeKind[] = ["mechanism", "asset", "sector", "company"];

const COLUMN_LABEL: Record<ImpactNodeKind, string> = {
  mechanism: "Mechanism",
  asset: "Assets",
  sector: "Sectors",
  company: "Companies",
};

/** Reuses the .foil brand palette (styles.css) so the map reads as ACTA, not a generic chart. */
const KIND_ACCENT: Record<ImpactNodeKind, string> = {
  mechanism: "#c9b8ea",
  asset: "#f5d4b8",
  sector: "#bfe8c9",
  company: "#a8dbe0",
};

const EVENT_ACCENT = "#d8c39a";
const WATCH_STEP_MS = 9000;

/** The Rail's five semantic colors — the same five stops as the .foil brand gradient (styles.css). */
const RAIL_ACCENT = {
  cyan: "#a8dbe0",
  peach: "#f5d4b8",
  lavender: "#c9b8ea",
  pink: "#f0c2d8",
  paleGreen: "#bfe8c9",
};

type Selection = { kind: "event" } | { kind: "node"; id: string };
type ViewMode = "explore" | "watch";

function findGraphSourceEvent(graph: ImpactGraph): CalEvent | null {
  return EVENTS.find((e) => e.title === graph.eventTitle) ?? null;
}

function isoToday() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function nextOfKind(kind: CalEvent["kind"], fromIso: string) {
  return EVENTS.find((e) => e.kind === kind && e.date >= fromIso) ?? null;
}

function strengthLabel(weight: number) {
  if (weight >= 0.8) return "Primary driver";
  if (weight >= 0.6) return "Notable factor";
  return "Secondary factor";
}

/**
 * The strongest complete event -> mechanism -> asset -> sector -> company chain, in order —
 * the "read this first" path, and (in Watch Mode) the sequence it narrates through. Scored by
 * its weakest link (bottleneck), not total weight, so a chain isn't rewarded for one strong hop
 * hiding a weak one; a shortcut that skips a column (there are a couple in the sample data)
 * never satisfies the required depth, so it's ignored.
 */
function computePrimaryPath(graph: ImpactGraph): string[] {
  const nodesById = new Map(graph.nodes.map((n) => [n.id, n]));
  let best: { ids: string[]; score: number } | null = null;

  function dfs(currentId: string, chainIds: string[], minWeight: number, depth: number) {
    if (depth === COLUMN_ORDER.length) {
      if (nodesById.get(currentId)?.kind === "company" && (!best || minWeight > best.score)) {
        best = { ids: chainIds, score: minWeight };
      }
      return;
    }
    for (const edge of graph.edges.filter((e) => e.from === currentId)) {
      dfs(edge.to, [...chainIds, edge.to], Math.min(minWeight, edge.weight), depth + 1);
    }
  }

  dfs("event", ["event"], Infinity, 0);
  return best ? (best as { ids: string[]; score: number }).ids : ["event"];
}

export function ImpactMap() {
  const [graphId, setGraphId] = useState(IMPACT_GRAPHS[0]!.id);
  const graph = IMPACT_GRAPHS.find((g) => g.id === graphId) ?? IMPACT_GRAPHS[0]!;
  const [selection, setSelection] = useState<Selection>({ kind: "event" });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("explore");
  const [watchStep, setWatchStep] = useState(0);
  const [watchPaused, setWatchPaused] = useState(false);
  const [pinned, setPinned] = useState<{ label: string; href: string } | null>(null);
  const [attention, setAttention] = useState<NewsItem[] | null>(null);
  const [attentionLoading, setAttentionLoading] = useState(false);
  const [nqQuote, setNqQuote] = useState<Quote | null>(null);
  const [railLeadId, setRailLeadId] = useState<string | null>(null);
  const [railHoverId, setRailHoverId] = useState<string | null>(null);

  const sourceEvent = findGraphSourceEvent(graph);
  const today = isoToday();
  const upcomingSameKind = sourceEvent
    ? EVENTS.filter((e) => e.kind === graph.eventKind && e.date >= today && e.title !== sourceEvent.title)[0] ?? null
    : nextOfKind(graph.eventKind, today);

  const nodesById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph]);
  const primaryPath = useMemo(() => computePrimaryPath(graph), [graph]);
  const primaryPathIds = useMemo(() => new Set(primaryPath), [primaryPath]);

  const columns = useMemo(() => {
    return COLUMN_ORDER.map((kind) => ({
      kind,
      nodes: graph.nodes.filter((n) => n.kind === kind),
    }));
  }, [graph]);

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    const left = 10;
    const right = 90;
    map.set("event", { x: left, y: 50 });
    columns.forEach((col, colIndex) => {
      const x = left + ((colIndex + 1) * (right - left)) / COLUMN_ORDER.length;
      const n = col.nodes.length || 1;
      col.nodes.forEach((node, i) => {
        const y = ((i + 0.5) / n) * 100;
        map.set(node.id, { x, y });
      });
    });
    return map;
  }, [columns]);

  // Watch Mode ambiently narrates the primary path — one step every WATCH_STEP_MS, no
  // continuous animation, so it's "auto-updating" without being "noisy." A manual hover/click
  // pauses it; the trader's own exploration always wins over the ambient narration.
  useEffect(() => {
    if (mode !== "watch" || watchPaused) return;
    const id = setInterval(() => setWatchStep((s) => (s + 1) % primaryPath.length), WATCH_STEP_MS);
    return () => clearInterval(id);
  }, [mode, watchPaused, primaryPath.length]);

  useEffect(() => {
    setWatchStep(0);
    setWatchPaused(false);
    setRailLeadId(null);
    setRailHoverId(null);
  }, [graphId, mode]);

  const watchSelection: Selection =
    mode === "watch" && !watchPaused
      ? primaryPath[watchStep] === "event"
        ? { kind: "event" }
        : { kind: "node", id: primaryPath[watchStep]! }
      : selection;

  const selectedId = watchSelection.kind === "node" ? watchSelection.id : "event";
  // Hover always previews a connection; otherwise the active selection (manual, or Watch
  // Mode's own narration) governs the diagram, and with nothing focused at all we default to
  // the single highest-weight path so it reads in ~2 seconds.
  const focusId = hoveredId ?? (watchSelection.kind === "node" ? watchSelection.id : null);
  const relatedIds = focusId
    ? new Set(
        graph.edges
          .filter((e) => e.from === focusId || e.to === focusId)
          .flatMap((e) => [e.from, e.to])
          .concat(focusId),
      )
    : primaryPathIds;
  const isDefaultPath = !focusId;

  const selectedNode: ImpactNode | null =
    watchSelection.kind === "node" ? graph.nodes.find((n) => n.id === watchSelection.id) ?? null : null;

  const incomingToSelected: ImpactEdge[] = selectedNode
    ? graph.edges.filter((e) => e.to === selectedNode.id)
    : [];
  const selectedStrength = incomingToSelected.length
    ? Math.max(...incomingToSelected.map((e) => e.weight))
    : null;

  function edgeColor(edge: ImpactEdge) {
    const target = nodesById.get(edge.to);
    return target ? KIND_ACCENT[target.kind] : EVENT_ACCENT;
  }

  function pickNode(id: string) {
    setSelection({ kind: "node", id });
    if (mode === "watch") setWatchPaused(true);
  }

  function pickEvent() {
    setSelection({ kind: "event" });
    if (mode === "watch") setWatchPaused(true);
  }

  const panelAccent = selectedNode ? KIND_ACCENT[selectedNode.kind] : EVENT_ACCENT;
  const watching = mode === "watch";

  // Real, live calendar data — not part of the sample relationship graph.
  const next3Prints = useMemo(() => upcomingFrom(today, 3), [today]);

  // "Human Signal" stays honest by linking to generic platform search, not naming or
  // attributing any specific creator/channel this app has no relationship with.
  const humanSignalQuery = selectedNode?.label ?? sourceEvent?.title ?? graph.eventTitle;
  const youtubeSearchHref = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${humanSignalQuery} market reaction`)}`;
  const xSearchHref = `https://x.com/search?q=${encodeURIComponent(humanSignalQuery)}&f=live`;

  // "Attention" is the one Crowd Context dimension backed by real data: the same live wire
  // search (`getNameNews`) BookNews already calls per instrument — a genuine mention count and
  // source list, not a fabricated one. It re-fetches whenever the focused node changes, so it
  // stays connected to whatever the Relationship Engine diagram is currently pointed at.
  useEffect(() => {
    if (!watching) return;
    let alive = true;
    setAttentionLoading(true);
    void getNameNews({ data: { q: humanSignalQuery } }).then((rows) => {
      if (alive) {
        setAttention(rows);
        setAttentionLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [watching, humanSignalQuery]);

  // The Rail's one genuinely live element: NQ's real quote, from the same getDesk() feed
  // FuturesBar/MoverStrip already use. Everything else on the rail (the source plates) is
  // sample data — this is never conflated with them.
  useEffect(() => {
    if (!watching) return;
    let alive = true;
    void getDesk().then((payload) => {
      if (alive) setNqQuote(payload.quotes.find((q) => q.symbol === "NQ=F") ?? null);
    });
    return () => {
      alive = false;
    };
  }, [watching]);

  const attentionSources = attention ? new Set(attention.map((a) => a.source)).size : 0;

  const railSources = RAIL_SOURCES[graph.id] ?? [];
  const railFocus = railSources.find((s) => s.id === (railHoverId ?? railLeadId)) ?? null;
  const tapeDirection =
    nqQuote == null || nqQuote.price <= 0
      ? null
      : nqQuote.changePct > 0.05
        ? "pushing higher"
        : nqQuote.changePct < -0.05
          ? "leaving the room"
          : "chopping flat";
  const railConviction = railSources.some((s) => s.attentionTrend === "split") ? "split" : "aligned";
  const risingCategory = railSources.find((s) => s.attentionTrend === "rising")?.category ?? railSources[0]?.category ?? "quiet";

  const diagram = (
    <div className="border-line bg-surface relative overflow-hidden rounded-2xl border">
      <div
        className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full opacity-15 blur-3xl"
        style={{ background: KIND_ACCENT.mechanism }}
      />
      <div
        className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full opacity-15 blur-3xl"
        style={{ background: KIND_ACCENT.company }}
      />
      <div
        className={cn("relative w-full", watching ? "aspect-[16/6] sm:aspect-[16/5]" : "aspect-[16/10] sm:aspect-[16/8]")}
        onMouseLeave={() => setHoveredId(null)}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {graph.edges.map((edge, i) => {
            const from = positions.get(edge.from);
            const to = positions.get(edge.to);
            if (!from || !to) return null;
            const active = relatedIds.has(edge.from) && relatedIds.has(edge.to);
            const color = edgeColor(edge);
            const midX = (from.x + to.x) / 2;
            const d = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
            return (
              <path
                key={`${edge.from}-${edge.to}-${i}`}
                d={d}
                fill="none"
                stroke={active ? color : "var(--color-line)"}
                strokeWidth={active ? 0.6 + edge.weight * 1.0 : 0.18 + edge.weight * 0.12}
                opacity={active ? 0.95 : 0.35}
                style={active ? { filter: `drop-shadow(0 0 2.5px ${color}aa)` } : undefined}
              />
            );
          })}
        </svg>

        <button
          type="button"
          onClick={pickEvent}
          onMouseEnter={() => setHoveredId("event")}
          className="bg-raised absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border px-2.5 py-2 text-left transition-all w-24 sm:w-28"
          style={{
            left: `${positions.get("event")!.x}%`,
            top: `${positions.get("event")!.y}%`,
            borderColor: selectedId === "event" || relatedIds.has("event") ? EVENT_ACCENT : "var(--color-line)",
            boxShadow: selectedId === "event" ? `0 0 0 1px ${EVENT_ACCENT}66, 0 0 18px ${EVENT_ACCENT}55` : undefined,
          }}
        >
          <p className="text-gold text-[9px] tracking-[0.18em] uppercase">Event</p>
          <p className="text-fg mt-0.5 text-xs leading-tight">{graph.eventTitle}</p>
        </button>

        {columns.map((col) =>
          col.nodes.map((node) => {
            const pos = positions.get(node.id)!;
            const active = relatedIds.has(node.id);
            const isSelected = selectedId === node.id;
            const accent = KIND_ACCENT[node.kind];
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => pickNode(node.id)}
                onMouseEnter={() => setHoveredId(node.id)}
                className={cn(
                  "bg-raised absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border px-2 py-1.5 text-left transition-all",
                  "w-24 sm:w-28",
                  !active && "opacity-35",
                )}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  borderColor: isSelected ? accent : active ? `${accent}88` : "var(--color-line)",
                  boxShadow: isSelected
                    ? `0 0 0 1px ${accent}66, 0 0 16px ${accent}55`
                    : active
                      ? `0 0 8px ${accent}33`
                      : undefined,
                }}
              >
                {active ? (
                  <span className="flex items-center gap-1">
                    <i className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                    <span className="text-muted text-[9px] tracking-[0.14em] uppercase">
                      {COLUMN_LABEL[node.kind]}
                    </span>
                  </span>
                ) : (
                  <i className="mb-0.5 block size-1.5 rounded-full" style={{ backgroundColor: accent }} />
                )}
                <p className={cn("mt-0.5 text-[11px] leading-tight", active ? "text-fg" : "text-muted")}>
                  {node.label}
                </p>
              </button>
            );
          }),
        )}
      </div>
    </div>
  );

  const legend = (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 text-[11px] tracking-wide uppercase",
        watching ? "mt-3 opacity-60" : "mt-4",
      )}
    >
      {COLUMN_ORDER.map((k) => (
        <span key={k} className="text-muted flex items-center gap-1.5">
          <i className="size-2 rounded-full" style={{ backgroundColor: KIND_ACCENT[k] }} />
          {COLUMN_LABEL[k]}
        </span>
      ))}
      {!watching ? (
        <span className="text-muted normal-case">Line weight = relationship strength · hover any node to trace it</span>
      ) : null}
    </div>
  );

  const panel = (
    <div
      className={cn(
        "bg-surface rounded-2xl border-t-2 shadow-[0_8px_30px_rgb(0,0,0,0.25)]",
        watching ? "p-7" : "mt-5 p-5",
      )}
      style={{
        borderTopColor: panelAccent,
        borderLeft: "1px solid var(--color-line)",
        borderRight: "1px solid var(--color-line)",
        borderBottom: "1px solid var(--color-line)",
      }}
    >
      {watching ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-muted text-[10px] tracking-[0.22em] uppercase">Watch mode · ambient walkthrough</p>
            <span className="border-line text-muted rounded-full border px-1.5 py-0.5 text-[8px] tracking-[0.14em] uppercase">
              Relationship data: sample
            </span>
          </div>
          {watchPaused ? (
            <button
              type="button"
              className="pill"
              onClick={() => {
                setWatchPaused(false);
                setWatchStep(0);
              }}
            >
              Resume
            </button>
          ) : null}
        </div>
      ) : null}

      {watchSelection.kind === "event" && sourceEvent ? (
        <>
          {isDefaultPath ? (
            <p className="text-muted mb-3 text-[10px] tracking-[0.18em] uppercase">
              Primary path shown below — hover or click any node to trace an alternate one
            </p>
          ) : null}
          <p className="text-muted text-[10px] tracking-[0.22em] uppercase">What</p>
          <p className={cn("mt-1", watching ? "text-3xl" : "text-xl")}>
            {sourceEvent.title}
            {sourceEvent.time ? ` · ${sourceEvent.time} ET` : ""}
          </p>
          <p className="text-muted mt-3 text-[10px] tracking-[0.22em] uppercase">Why it matters</p>
          <p className={cn("mt-1 leading-relaxed", watching ? "text-base" : "text-sm")}>{sourceEvent.context}</p>
          <p className="text-muted mt-3 text-[10px] tracking-[0.22em] uppercase">Next</p>
          <p className={cn("mt-1 leading-relaxed", watching ? "text-base" : "text-sm")}>
            {watching
              ? "Watching the primary path narrate itself — click any node to take over."
              : "Click a mechanism, asset, sector, or company node above to see why it's connected."}
            {upcomingSameKind ? ` Next print of this kind: ${upcomingSameKind.title} on ${upcomingSameKind.date}.` : null}
          </p>
        </>
      ) : null}

      {selectedNode ? (
        <>
          <p className="text-muted text-[10px] tracking-[0.22em] uppercase">What</p>
          <p className={cn("mt-1", watching ? "text-3xl" : "text-xl")}>{selectedNode.label}</p>
          <p className={cn("mt-1 leading-relaxed", watching ? "text-base" : "text-sm")}>{selectedNode.what}</p>
          <div className="mt-3 flex items-center gap-2">
            <p className="text-muted text-[10px] tracking-[0.22em] uppercase">Why it's connected</p>
            {selectedStrength !== null ? (
              <span
                className="rounded-full px-2 py-0.5 text-[9px] tracking-[0.1em] uppercase"
                style={{ color: panelAccent, border: `1px solid ${panelAccent}66` }}
              >
                {strengthLabel(selectedStrength)}
              </span>
            ) : null}
          </div>
          <p className={cn("mt-1 leading-relaxed", watching ? "text-base" : "text-sm")}>{selectedNode.why}</p>
          <p className="text-muted mt-3 text-[10px] tracking-[0.22em] uppercase">Next</p>
          <p className={cn("mt-1 leading-relaxed", watching ? "text-base" : "text-sm")}>
            {selectedNode.instrumentSlug ? (
              <a href={`/${selectedNode.instrumentSlug}`} className="pill pill-solid inline-flex">
                Open ACTA book →
              </a>
            ) : (
              "No live ACTA book for this node yet in the prototype."
            )}
          </p>
        </>
      ) : null}

      {watching ? (
        <div className="border-line mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="border-fg/30 text-fg rounded-full border px-1.5 py-0.5 text-[8px] tracking-[0.14em] uppercase">
                Live data
              </span>
              <p className="text-muted text-[10px] tracking-[0.2em] uppercase">Next 3 prints</p>
            </div>
            <ul className="mt-2 space-y-1">
              {next3Prints.map((e) => (
                <li key={e.title + e.date} className="text-sm">
                  <span className="text-fg">{e.title}</span>{" "}
                  <span className="text-muted text-xs">
                    {e.date}
                    {e.time ? ` · ${e.time} ET` : ""}
                  </span>
                </li>
              ))}
              {!next3Prints.length ? <li className="text-muted text-sm">Nothing scheduled ahead right now.</li> : null}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="border-line text-muted rounded-full border border-dashed px-1.5 py-0.5 text-[8px] tracking-[0.14em] uppercase">
                Prototype stub
              </span>
              <p className="text-muted text-[10px] tracking-[0.2em] uppercase">Human signal</p>
            </div>
            <p className="text-muted mt-2 text-xs leading-relaxed">
              Generic platform search for "{humanSignalQuery}" — not a curated feed and not attributed to any
              specific creator or channel.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <a className="pill" href={youtubeSearchHref} target="_blank" rel="noreferrer">
                YouTube ↗
              </a>
              <a className="pill" href={xSearchHref} target="_blank" rel="noreferrer">
                X ↗
              </a>
              <button
                type="button"
                className="pill"
                onClick={() =>
                  setPinned(pinned ? null : { label: humanSignalQuery, href: youtubeSearchHref })
                }
              >
                {pinned ? "Unpin" : "Pin here"}
              </button>
            </div>
            {pinned ? (
              <p className="text-muted mt-2 text-xs leading-relaxed">
                Pinned: <span className="text-fg">{pinned.label}</span> — this prototype can't embed video yet, so
                it still opens in a new tab.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {watching ? (
        <div className="border-line mt-6 border-t pt-6">
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted text-[10px] tracking-[0.2em] uppercase">The Rail — context, not advice</p>
            <span className="border-fg/30 text-fg rounded-full border px-1.5 py-0.5 text-[8px] tracking-[0.14em] uppercase">
              Live tape
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed">
            <span className="text-muted uppercase tracking-[0.08em] text-xs">Attention</span>{" "}
            <span className="text-fg">{risingCategory}</span>
            <span className="text-muted"> · </span>
            <span className="text-muted uppercase tracking-[0.08em] text-xs">Conviction</span>{" "}
            <span className="text-fg">{railConviction}</span>
            <span className="text-muted"> · </span>
            <span className="text-muted uppercase tracking-[0.08em] text-xs">Tape</span>{" "}
            <span className="text-fg">
              {tapeDirection ?? "tape unavailable"}
              {nqQuote ? ` (${nqQuote.changePct >= 0 ? "+" : ""}${nqQuote.changePct.toFixed(2)}%)` : ""}
            </span>
          </p>
          <p className="text-muted mt-1 text-[11px] leading-relaxed">
            Attention/Conviction read from the sample plates below (illustrative). Tape is NQ's real live quote.{" "}
            {attentionLoading
              ? "Checking the live wire…"
              : attention
                ? `Live wire check: ${attention.length} headline${attention.length === 1 ? "" : "s"} on "${humanSignalQuery}" across ${attentionSources} outlet${attentionSources === 1 ? "" : "s"} in the last 2 days.`
                : null}
          </p>

          <div
            className="relative mt-4 h-56"
            onMouseLeave={() => setRailHoverId(null)}
          >
            <div className="border-line absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed" />

            <div
              className="border-line bg-raised absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border px-3 py-2 text-center"
              style={{ boxShadow: `0 0 0 1px ${EVENT_ACCENT}55, 0 0 16px ${EVENT_ACCENT}44` }}
            >
              <p className="text-gold text-[9px] tracking-[0.18em] uppercase">NQ · live</p>
              {nqQuote && nqQuote.price > 0 ? (
                <>
                  <p className="text-fg mt-0.5 text-sm tabular-nums">
                    {nqQuote.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className={cn("text-xs tabular-nums", nqQuote.changePct < 0 ? "text-down" : "text-up")}>
                    {nqQuote.changePct >= 0 ? "+" : ""}
                    {nqQuote.changePct.toFixed(2)}%
                  </p>
                </>
              ) : (
                <p className="text-muted mt-0.5 text-xs">{nqQuote ? "quote unavailable" : "loading…"}</p>
              )}
            </div>

            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
              {railSources.map((s, i) => {
                const side = i % 2 === 0 ? -1 : 1;
                const x = 50 + side * (12 + s.divergence * 33);
                const y = railSources.length > 1 ? 12 + (i / (railSources.length - 1)) * 76 : 50;
                const connectorColor = s.divergence >= 0.5 ? RAIL_ACCENT.pink : RAIL_ACCENT.paleGreen;
                const isDimmed = railLeadId !== null && railLeadId !== s.id;
                return (
                  <line
                    key={`line-${s.id}`}
                    x1={x}
                    y1={y}
                    x2={50}
                    y2={y}
                    stroke={connectorColor}
                    strokeWidth={0.4}
                    opacity={isDimmed ? 0.2 : 0.75}
                  />
                );
              })}
            </svg>

            {railSources.map((s, i) => {
              const side = i % 2 === 0 ? -1 : 1;
              const x = 50 + side * (12 + s.divergence * 33);
              const y = railSources.length > 1 ? 12 + (i / (railSources.length - 1)) * 76 : 50;
              const trendColor =
                s.attentionTrend === "rising" ? RAIL_ACCENT.cyan : s.attentionTrend === "cooling" ? RAIL_ACCENT.peach : RAIL_ACCENT.lavender;
              const isLead = railLeadId === s.id;
              const isDimmed = railLeadId !== null && !isLead;
              const width = 92 + s.attentionSize * 46;
              return (
                <button
                  key={s.id}
                  type="button"
                  onMouseEnter={() => setRailHoverId(s.id)}
                  onClick={() => setRailLeadId(isLead ? null : s.id)}
                  className={cn(
                    "bg-raised absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border px-2.5 py-1.5 text-left transition-all",
                    isDimmed && "opacity-35",
                  )}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${width}px`,
                    borderColor: isLead ? trendColor : `${trendColor}99`,
                    boxShadow: isLead ? `0 0 0 1px ${trendColor}77, 0 0 14px ${trendColor}55` : undefined,
                  }}
                >
                  <p className="text-muted text-[9px] tracking-[0.1em] uppercase">{s.category}</p>
                  <p className="text-fg mt-0.5 text-[11px] leading-tight">{s.claim}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] tracking-wide uppercase">
            <span className="text-muted flex items-center gap-1.5">
              <i className="size-2 shrink-0 rounded-full" style={{ backgroundColor: RAIL_ACCENT.cyan }} /> Attention rising
            </span>
            <span className="text-muted flex items-center gap-1.5">
              <i className="size-2 shrink-0 rounded-full" style={{ backgroundColor: RAIL_ACCENT.peach }} /> Attention cooling
            </span>
            <span className="text-muted flex items-center gap-1.5">
              <i className="size-2 shrink-0 rounded-full" style={{ backgroundColor: RAIL_ACCENT.lavender }} /> Split / disagreement
            </span>
            <span className="text-muted flex items-center gap-1.5">
              <i className="size-2 shrink-0 rounded-full" style={{ backgroundColor: RAIL_ACCENT.pink }} /> Diverging from tape
            </span>
            <span className="text-muted flex items-center gap-1.5">
              <i className="size-2 shrink-0 rounded-full" style={{ backgroundColor: RAIL_ACCENT.paleGreen }} /> In phase with tape
            </span>
          </div>

          <div className="border-line mt-3 rounded-xl border p-4">
            <span className="border-line text-muted rounded-full border border-dashed px-1.5 py-0.5 text-[8px] tracking-[0.14em] uppercase">
              Sample source
            </span>
            {railFocus ? (
              <>
                <p className="mt-1.5 text-sm">
                  {railFocus.category} <span className="text-muted text-xs">· {railFocus.timestamp}</span>
                </p>
                <p className="mt-1 text-xs leading-relaxed">
                  Said: "{railFocus.claim}" / tape now: {tapeDirection ?? "tape unavailable"}.
                </p>
                {railLeadId === railFocus.id ? (
                  <>
                    <p className="text-muted mt-2 text-[10px] tracking-[0.16em] uppercase">
                      Last 3 sample claims (not real posts)
                    </p>
                    <ul className="mt-1 space-y-1">
                      {railFocus.sampleClaims.map((c) => (
                        <li key={c} className="text-xs leading-relaxed">
                          "{c}"
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-muted mt-1.5 text-[10px]">Click the plate to lock it as lead.</p>
                )}
              </>
            ) : (
              <p className="text-muted mt-1.5 text-xs">Hover or click a plate to expand its source, timestamp, and claim.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {IMPACT_GRAPHS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={cn("pill", g.id === graphId && "pill-on")}
              onClick={() => {
                setGraphId(g.id);
                setSelection({ kind: "event" });
                setHoveredId(null);
              }}
            >
              {g.eventTitle}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            className={cn("pill", mode === "explore" && "pill-on")}
            onClick={() => setMode("explore")}
          >
            Explore
          </button>
          <button type="button" className={cn("pill", mode === "watch" && "pill-on")} onClick={() => setMode("watch")}>
            Watch mode
          </button>
        </div>
      </div>

      <div className={cn("flex flex-col gap-5", watching && "flex-col-reverse")}>
        <div>
          {diagram}
          {legend}
        </div>
        {panel}
      </div>

      <p className="text-muted mt-4 text-xs leading-relaxed">
        <strong className="text-fg">Provenance:</strong> the relationships above are illustrative, hand-curated by
        ACTA engineering for this preview — they are not live correlation data and nothing here reflects a real-time
        signal. Relationship strength (line weight/glow, and the "primary driver" / "notable factor" / "secondary
        factor" labels) is likewise hand-estimated, not measured — in production it would be the `weight` column
        ENGINEERING_AUDIT_001.md §E already proposes for `instrument_influence`. The event card itself (
        {sourceEvent?.title ?? graph.eventTitle}) pulls its real WHAT/WHY text from the live{" "}
        <Link to="/calendar" className="underline">
          ACTA calendar
        </Link>
        . "Watch mode" is a first exploration of a second-monitor "desk companion" concept —
        see the report for what a real version would still need. In "The Rail" below, only the
        NQ price/quote at the center is real (the same live quote feed `FuturesBar` already
        uses); every source plate — its category, claim, timestamp, and distance from the tape —
        is a hand-authored sample standing in for a real aggregation ACTA doesn't have the
        infrastructure to measure yet, and none of it is investment advice.
      </p>
    </div>
  );
}
