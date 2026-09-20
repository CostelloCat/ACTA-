import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CatalystBrief, CatalystRail } from "@/components/catalyst-rail";
import { LiveMosaic } from "@/components/live-mosaic";
import { Shell } from "@/components/shell";
import { buildCatalystSignals } from "@/lib/catalysts";
import { type DeskId, getMosaic } from "@/lib/channels";
import { getDesk, leadAge } from "@/lib/desk";
import { DESK_WIRE, outletsOn } from "@/lib/outlets";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/news")({
  loader: async () => {
    const [desk, mosaic] = await Promise.all([getDesk(), getMosaic()]);
    return { desk, mosaic };
  },
  component: NewsPage,
});

const KIND_TONE: Record<string, string> = {
  OIL: "text-oil",
  RATES: "text-rates",
  INFLATION: "text-inflation",
  MAG7: "text-mag7",
  CRYPTO: "text-gold",
  GEO: "text-muted",
};

function NewsPage() {
  const { desk, mosaic } = Route.useLoaderData();
  const router = useRouter();
  const [region, setRegion] = useState<DeskId>("us");
  const wireKey = DESK_WIRE[region] ?? "United States";
  const items = desk.wires[wireKey] ?? desk.national;
  const natives = outletsOn(region);
  const signals = buildCatalystSignals({ mosaic, news: Object.values(desk.wires).flat() });
  const [activeSignalId, setActiveSignalId] = useState(() => signals[0]?.id ?? "");
  const activeSignal = signals.find((signal) => signal.id === activeSignalId) ?? signals[0] ?? null;

  useEffect(() => {
    const id = setInterval(() => {
      void router.invalidate();
    }, 45_000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <Shell>
      <div className="relative -mx-3 -mt-6 min-h-[88vh] sm:-mx-5">
        <img
          src="/hero/earth-night.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-bg/35" />
        <div className="relative mx-auto max-w-6xl px-3 py-6 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-gold text-[11px] tracking-[0.2em] uppercase">Live catalyst desk</p>
            <h1 className="mt-1 text-3xl sm:text-4xl">Global News</h1>
          </div>
          <p className="text-muted max-w-xl text-sm leading-relaxed">
            Detect the event, verify the source, map the exposure. Native newsrooms remain visible; ACTA does not rewrite them into one approved version.
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <CatalystRail
            signals={signals}
            activeId={activeSignal?.id}
            onSelect={(signal) => setActiveSignalId(signal.id)}
            eyebrow="Live / breaking / next mic"
            title="The event rail"
          />
          <CatalystBrief signal={activeSignal} />
        </div>

        {activeSignal?.videoId ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
            <iframe
              title={activeSignal.title}
              src={`https://www.youtube.com/embed/${activeSignal.videoId}?rel=0&modestbranding=1`}
              className="aspect-video w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <p className="text-muted px-4 py-2 text-[11px] tracking-wide uppercase">Verified live source · {activeSignal.source}</p>
          </div>
        ) : null}

        <div className="mt-8 border-t border-line pt-6">
          <p className="text-muted text-[10px] tracking-[0.22em] uppercase">Source rooms</p>
          <h2 className="mt-1 text-2xl">Watch the world without losing the source</h2>
          <p className="text-muted mt-2 max-w-2xl text-sm">Mainstream, native-language, official, and Against the Current desks stay side by side.</p>
        </div>
        <div className="mt-4">
          <LiveMosaic rows={mosaic} desk={region} onDesk={setRegion} wires={items} />
        </div>

        <p className="text-muted mt-8 text-[10px] tracking-[0.22em] uppercase">{wireKey} wire</p>
        {natives.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {natives.map((o) => (
              <a key={o.href} href={o.href} target="_blank" rel="noreferrer" className="pill">
                {o.label}
              </a>
            ))}
          </div>
        ) : null}
        <ul className="mt-4 space-y-4">
          {items.slice(0, 12).map((it) => (
            <li key={it.title} className="border-line border-b pb-4 last:border-0">
              <p className={cn("text-[10px] tracking-[0.22em] uppercase", KIND_TONE[it.kind] ?? "text-muted")}>
                {it.kind}
              </p>
              <a href={it.link} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm no-underline">
                {it.title}
              </a>
              <p className="text-muted mt-1 text-[11px] tracking-wide uppercase">
                {it.source}
                {leadAge(it.published) ? ` · ${leadAge(it.published)}` : ""}
              </p>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </Shell>
  );
}
