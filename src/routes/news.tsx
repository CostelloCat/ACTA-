import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LiveMosaic } from "@/components/live-mosaic";
import { Shell } from "@/components/shell";
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
        <h1 className="text-3xl sm:text-4xl">Global News</h1>
        <p className="text-muted mt-2 max-w-xl text-sm">
          Click a country, you get their newsroom. Native language. We don't rewrite it.
        </p>

        <div className="mt-5">
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
