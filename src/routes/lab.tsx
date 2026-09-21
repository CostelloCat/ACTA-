import { createFileRoute } from "@tanstack/react-router";
import { ImpactMap } from "@/components/impact-map";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/lab")({ component: LabPage });

function LabPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-5xl">
        <p className="text-muted text-[10px] tracking-[0.22em] uppercase">Preview · not linked from nav</p>
        <h1 className="mt-1 text-3xl sm:text-4xl">ACTA Relationship Engine — preview</h1>
        <p className="text-muted mt-2 max-w-2xl text-sm leading-relaxed">
          A prototype of an immersive calendar impact view: pick a print, then click through EVENT → MECHANISM →
          ASSETS → SECTORS → COMPANIES to see what it can move, why, and what to watch next. Sample data only — see
          the provenance note below the diagram.
        </p>
        <div className="mt-6">
          <ImpactMap />
        </div>
      </div>
    </Shell>
  );
}
