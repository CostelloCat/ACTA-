import { useMemo, useState } from "react";
import {
  ALT_TABS,
  CHANNELS,
  MAIN_TABS,
  channelsOn,
  embedSrc,
  mediaUrl,
  type DeskId,
  type Lane,
  type MosaicRow,
} from "@/lib/channels";
import type { NewsItem } from "@/lib/desk";
import { outletsOn } from "@/lib/outlets";
import { cn } from "@/lib/utils";

export function LiveMosaic({
  rows,
  desk: deskProp,
  onDesk,
  wires,
}: {
  rows?: MosaicRow[];
  desk?: DeskId;
  onDesk?: (id: DeskId) => void;
  wires?: NewsItem[];
}) {
  const catalog =
    rows?.length ?
      rows
    : CHANNELS.map((c) => ({ ...c, videoId: null, thumb: null, title: c.label, onAir: false, age: "" }));
  const [lane, setLane] = useState<Lane>("main");
  const [innerDesk, setInnerDesk] = useState<DeskId>("us");
  const desk = deskProp ?? innerDesk;
  function setDesk(id: DeskId) {
    setInnerDesk(id);
    onDesk?.(id);
  }
  const [on, setOn] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const tabs = lane === "main" ? MAIN_TABS : ALT_TABS;
  const natives = outletsOn(desk);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const selected = new Set(channelsOn(desk, lane).map((c) => `${c.desk}:${c.label}`));
    const pool = catalog.filter((row) => {
      if (row.lane !== lane) return false;
      if (needle) {
        return `${row.label} ${row.query} ${row.desk}`.toLowerCase().includes(needle);
      }
      if (!selected.has(`${row.desk}:${row.label}`)) return false;
      return desk !== "live" || row.onAir;
    });
    // Unavailable streams are still real catalog entries. Never hide the publisher.
    return [...pool].sort((a, b) => Number(b.onAir) - Number(a.onAir) || Number(Boolean(b.videoId)) - Number(Boolean(a.videoId)));
  }, [catalog, desk, lane, q]);

  const liveNow = list.filter((r) => r.onAir);
  const highlights = list.filter((r) => !r.onAir && r.videoId);
  const fallback = liveNow[0] ?? highlights[0] ?? list[0] ?? null;
  const active = list.find((c) => c.label === on) ?? fallback;
  const playing = Boolean(
    active && embedSrc(active) && (active.onAir || on === active.label || (lane === "main" && active === fallback)),
  );
  const src = playing && active ? embedSrc(active) : null;
  const rest = list.filter((c) => c.label !== active?.label).slice(0, 6);
  const min = desk === "min" && !q.trim();
  const ytMiss = `https://www.youtube.com/results?search_query=${encodeURIComponent(q.trim())}`;

  function goLane(next: Lane) {
    setLane(next);
    setDesk(next === "main" ? "us" : "talk");
    setOn(null);
    setQ("");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => goLane("main")} className={cn("pill", lane === "main" && "pill-solid")}>
          Main stream
        </button>
        <button
          type="button"
          onClick={() => goLane("current")}
          className={cn("pill", lane === "current" && "pill-solid")}
        >
          Against the current
        </button>
        <span className="text-muted ml-1 text-[11px] tracking-wide uppercase">
          {catalog.filter((row) => row.lane === lane).length} outlets · {liveNow.length} verified live · {highlights.length} recent clips
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="acta-media-search">Search news and media sources</label>
        <input
          id="acta-media-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={lane === "current" ? "Search independent voices and markets" : "Search all global TV, video and news channels"}
          className="border-line bg-raised text-fg min-h-10 min-w-0 flex-1 rounded-full border px-4 text-sm outline-none placeholder:text-muted"
        />
        {q.trim() ? (
          <button type="button" onClick={() => setQ("")} className="pill">Clear</button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDesk("min");
              setOn(null);
            }}
            className="pill"
          >
            Browse all media
          </button>
        )}
      </div>
      {q.trim() ? (
        <p className="text-muted mt-2 text-[11px]">
          Searching every {lane === "main" ? "global news" : "Against the Current"} source, regardless of region.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tabs.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => {
              setDesk(d.id);
              setOn(null);
              if (lane === "current") setQ("");
            }}
            className={cn("pill", desk === d.id && !q && "pill-on")}
          >
            {d.label}
          </button>
        ))}
      </div>
      {natives.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {natives.map((o) => (
            <a key={o.href} href={o.href} target="_blank" rel="noreferrer" className="pill">
              {o.label} ↗
            </a>
          ))}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Available news and media outlets">
        {list.map((c) => (
          <button
            key={`${c.desk}:${c.label}`}
            type="button"
            onClick={() => setOn(c.label)}
            title={c.onAir ? "Verified live video" : c.videoId ? "Recent video available" : "Open source details"}
            className={cn("pill", active?.label === c.label && "pill-on")}
          >
            {c.label}
            {c.onAir ? (
              <span className="bg-live ml-1.5 inline-block size-1.5 rounded-full" aria-label="Live" />
            ) : c.videoId ? (
              <span className="text-muted ml-1 text-[10px]">video</span>
            ) : (
              <span className="text-muted ml-1 text-[10px]">source</span>
            )}
          </button>
        ))}
      </div>

      {q.trim() && list.length === 0 ? (
        <p className="text-muted mt-4 text-sm">
          No catalog match; ACTA does not invent a stream.{" "}
          <a href={ytMiss} target="_blank" rel="noreferrer">Search YouTube ↗</a>
        </p>
      ) : desk === "live" && !list.length ? (
        <p className="text-muted mt-4 text-sm">
          No independently detected live stream right now. Browse another region to open its full source directory.
        </p>
      ) : null}

      {min ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((c) => (
            <Tile
              key={c.label}
              row={c}
              on={() => {
                setDesk(c.desk);
                setOn(c.label);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-[1.55fr_1fr]">
          <div className="bg-surface overflow-hidden rounded-2xl">
            {src && active ? (
              <>
                <iframe
                  key={src}
                  title={active.label}
                  src={src}
                  className="aspect-video w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <p className="text-muted text-[11px] tracking-wide uppercase">
                    {active.onAir ? "Verified live" : `Recent video · ${active.age || "age unknown"}`} · {active.label}
                  </p>
                  <a href={`https://www.youtube.com/watch?v=${active.videoId}`} target="_blank" rel="noreferrer" className="text-gold text-xs">
                    Open on YouTube ↗
                  </a>
                </div>
              </>
            ) : active ? (
              <div className="flex min-h-[220px] flex-col justify-center px-5 py-6">
                <p className="text-gold text-[10px] tracking-[0.2em] uppercase">Media source · external coverage</p>
                <h3 className="mt-2 text-2xl">{active.label}</h3>
                <p className="text-muted mt-3 max-w-lg text-sm leading-relaxed">
                  No verified stream or recent video is available to embed for this channel. The
                  outlet stays in ACTA's directory; open its YouTube presence to view its coverage.
                </p>
                <a href={mediaUrl(active)} target="_blank" rel="noopener noreferrer" className="pill pill-solid mt-4 self-start">
                  Open {active.label} on YouTube ↗
                </a>
              </div>
            ) : (
              <NativeDesk desk={desk} wires={wires ?? []} natives={natives} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {rest.length
              ? rest.map((c) => <Tile key={c.label} row={c} on={() => setOn(c.label)} />)
              : natives.slice(0, 4).map((o) => (
                  <a
                    key={o.href}
                    href={o.href}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-raised flex aspect-video items-end rounded-xl p-3 no-underline"
                  >
                    <span className="text-sm">{o.label}</span>
                  </a>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NativeDesk({
  desk,
  wires,
  natives,
}: {
  desk: DeskId;
  wires: NewsItem[];
  natives: ReturnType<typeof outletsOn>;
}) {
  const lead = wires.slice(0, 5);
  return (
    <div className="flex min-h-[220px] flex-col px-5 py-5">
      <p className="text-gold text-[10px] tracking-[0.22em] uppercase">
        {desk === "live" ? "Live filter" : "Their newsroom"}
      </p>
      {lead.length ? (
        <ul className="mt-3 space-y-3">
          {lead.map((it) => (
            <li key={it.title}>
              <a href={it.link} target="_blank" rel="noreferrer" className="block text-sm no-underline">
                {it.title}
              </a>
              <p className="text-muted mt-0.5 text-[11px] tracking-wide uppercase">{it.source}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm">
          {desk === "live"
            ? "Nobody live on this desk. Open US for the last 24 hours."
            : "Open an outlet. We don't fill this with old tape or a US rewrite."}
        </p>
      )}
      {natives.length ? (
        <p className="text-muted mt-4 text-[11px] tracking-wide uppercase">
          {natives.map((o) => o.label).join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

function Tile({ row, on }: { row: MosaicRow; on: () => void }) {
  return (
    <button type="button" onClick={on} className="relative aspect-video overflow-hidden rounded-xl text-left">
      {row.thumb ? (
        <img src={row.thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span className="absolute inset-0 bg-raised" />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      {row.onAir ? (
        <span className="bg-live absolute top-2 left-2 rounded-full px-1.5 py-0.5 text-[9px] tracking-[0.14em] text-fg uppercase">
          Live
        </span>
      ) : (
        <span className="bg-raised/80 absolute top-2 left-2 rounded-full px-1.5 py-0.5 text-[9px] tracking-[0.14em] text-gold uppercase">
          {row.videoId ? "Video" : "Source"}
        </span>
      )}
      <span className="absolute right-2 bottom-2 left-2 text-sm">{row.label}</span>
    </button>
  );
}
