import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { EVENTS, type CalEvent } from "@/lib/calendar";
import { IMPACT_GRAPHS, type ImpactEdge, type ImpactGraph, type ImpactNode, type ImpactNodeKind } from "@/lib/impact-map-data";
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

type Selection = { kind: "event" } | { kind: "node"; id: string };

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

export function ImpactMap() {
  const [graphId, setGraphId] = useState(IMPACT_GRAPHS[0]!.id);
  const graph = IMPACT_GRAPHS.find((g) => g.id === graphId) ?? IMPACT_GRAPHS[0]!;
  const [selection, setSelection] = useState<Selection>({ kind: "event" });

  const sourceEvent = findGraphSourceEvent(graph);
  const today = isoToday();
  const upcomingSameKind = sourceEvent
    ? EVENTS.filter((e) => e.kind === graph.eventKind && e.date >= today && e.title !== sourceEvent.title)[0] ?? null
    : nextOfKind(graph.eventKind, today);

  const nodesById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph]);

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

  const selectedId = selection.kind === "node" ? selection.id : "event";
  const relatedEdges = graph.edges.filter((e) => e.from === selectedId || e.to === selectedId);
  const relatedIds = new Set(relatedEdges.flatMap((e) => [e.from, e.to]));

  const selectedNode: ImpactNode | null =
    selection.kind === "node" ? graph.nodes.find((n) => n.id === selection.id) ?? null : null;

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

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {IMPACT_GRAPHS.map((g) => (
          <button
            key={g.id}
            type="button"
            className={cn("pill", g.id === graphId && "pill-on")}
            onClick={() => {
              setGraphId(g.id);
              setSelection({ kind: "event" });
            }}
          >
            {g.eventTitle}
          </button>
        ))}
      </div>

      <div className="border-line bg-surface relative overflow-hidden rounded-2xl border">
        <div
          className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full opacity-20 blur-3xl"
          style={{ background: KIND_ACCENT.mechanism }}
        />
        <div
          className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full opacity-20 blur-3xl"
          style={{ background: KIND_ACCENT.company }}
        />
        <div className="relative aspect-[16/10] w-full sm:aspect-[16/8]">
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
                  stroke={active ? color : "var(--color-muted)"}
                  strokeWidth={active ? 0.6 + edge.weight * 1.0 : 0.25 + edge.weight * 0.35}
                  opacity={active ? 0.95 : 0.28 + edge.weight * 0.2}
                  style={active ? { filter: `drop-shadow(0 0 2.5px ${color}aa)` } : undefined}
                />
              );
            })}
          </svg>

          <button
            type="button"
            onClick={() => setSelection({ kind: "event" })}
            className={cn(
              "bg-raised absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border px-2.5 py-2 text-left transition-shadow",
              "w-24 sm:w-28",
            )}
            style={{
              left: `${positions.get("event")!.x}%`,
              top: `${positions.get("event")!.y}%`,
              borderColor: selectedId === "event" ? EVENT_ACCENT : "var(--color-line)",
              boxShadow:
                selectedId === "event" ? `0 0 0 1px ${EVENT_ACCENT}66, 0 0 18px ${EVENT_ACCENT}55` : undefined,
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
                  onClick={() => setSelection({ kind: "node", id: node.id })}
                  className={cn(
                    "bg-raised absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border px-2 py-1.5 text-left transition-shadow",
                    "w-24 sm:w-28",
                    !active && selectedId !== "event" && "opacity-45",
                  )}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    borderColor: isSelected ? accent : "var(--color-line)",
                    boxShadow: isSelected
                      ? `0 0 0 1px ${accent}66, 0 0 16px ${accent}55`
                      : active
                        ? `0 0 8px ${accent}33`
                        : undefined,
                  }}
                >
                  <span className="flex items-center gap-1">
                    <i className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                    <span className="text-muted text-[9px] tracking-[0.14em] uppercase">
                      {COLUMN_LABEL[node.kind]}
                    </span>
                  </span>
                  <p className="text-fg mt-0.5 text-[11px] leading-tight">{node.label}</p>
                </button>
              );
            }),
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-[11px] tracking-wide uppercase">
        {COLUMN_ORDER.map((k) => (
          <span key={k} className="text-muted flex items-center gap-1.5">
            <i className="size-2 rounded-full" style={{ backgroundColor: KIND_ACCENT[k] }} />
            {COLUMN_LABEL[k]}
          </span>
        ))}
        <span className="text-muted flex items-center gap-1.5">
          Line thickness · glow = relationship strength
        </span>
      </div>

      <div className="border-line bg-surface mt-5 rounded-2xl border p-5">
        {selection.kind === "event" && sourceEvent ? (
          <>
            <p className="text-muted text-[10px] tracking-[0.22em] uppercase">What</p>
            <p className="mt-1 text-lg">
              {sourceEvent.title}
              {sourceEvent.time ? ` · ${sourceEvent.time} ET` : ""}
            </p>
            <p className="text-muted mt-3 text-[10px] tracking-[0.22em] uppercase">Why it matters</p>
            <p className="mt-1 text-sm leading-relaxed">{sourceEvent.context}</p>
            <p className="text-muted mt-3 text-[10px] tracking-[0.22em] uppercase">Next</p>
            <p className="mt-1 text-sm leading-relaxed">
              Click a mechanism, asset, sector, or company node above to see why it's connected.
              {upcomingSameKind ? ` Next print of this kind: ${upcomingSameKind.title} on ${upcomingSameKind.date}.` : null}
            </p>
          </>
        ) : null}

        {selectedNode ? (
          <>
            <p className="text-muted text-[10px] tracking-[0.22em] uppercase">What</p>
            <p className="mt-1 text-lg">{selectedNode.label}</p>
            <p className="mt-1 text-sm leading-relaxed">{selectedNode.what}</p>
            <div className="mt-3 flex items-center gap-2">
              <p className="text-muted text-[10px] tracking-[0.22em] uppercase">Why it's connected</p>
              {selectedStrength !== null ? (
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] tracking-[0.1em] uppercase"
                  style={{
                    color: KIND_ACCENT[selectedNode.kind],
                    border: `1px solid ${KIND_ACCENT[selectedNode.kind]}66`,
                  }}
                >
                  {strengthLabel(selectedStrength)}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm leading-relaxed">{selectedNode.why}</p>
            <p className="text-muted mt-3 text-[10px] tracking-[0.22em] uppercase">Next</p>
            <p className="mt-1 text-sm leading-relaxed">
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
      </div>

      <p className="text-muted mt-4 text-xs leading-relaxed">
        <strong className="text-fg">Provenance:</strong> the relationships above are illustrative, hand-curated by
        ACTA engineering for this preview — they are not live correlation data and nothing here reflects a real-time
        signal. Relationship strength (line thickness/glow, and the "primary driver" / "notable factor" / "secondary
        factor" labels) is likewise hand-estimated, not measured — in production it would be the `weight` column
        ENGINEERING_AUDIT_001.md §E already proposes for `instrument_influence`. The event card itself (
        {sourceEvent?.title ?? graph.eventTitle}) pulls its real WHAT/WHY text from the live{" "}
        <Link to="/calendar" className="underline">
          ACTA calendar
        </Link>
        .
      </p>
    </div>
  );
}
