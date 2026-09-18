import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/sessions")({ component: Sessions });

const ROWS = [
  { name: "Asia", et: "18:00 – 03:00", note: "Range. Thin NQ. Gold and oil still print." },
  { name: "London", et: "03:00 – 08:30", note: "First real volume. Sweep of Asia is common." },
  { name: "NY cash", et: "09:30 – 16:00", note: "The tape. Data at 8:30 lives in the pre-open." },
  { name: "FOMC window", et: "14:00 – 15:30", note: "Statement, then Powell. Do not average." },
  { name: "Globex", et: "18:00 next", note: "Positioning into Asia. Size off." },
];

function Sessions() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl">Sessions</h1>
        <p className="text-muted mt-2 text-sm">Eastern Time. Futures, not cash hours.</p>
        <ul className="mt-6 grid gap-3">
          {ROWS.map((r) => (
            <li key={r.name} className="bg-surface border-line flex flex-col gap-1 rounded-xl border p-4 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-muted text-sm">{r.note}</p>
              </div>
              <p className="tabular-nums text-gold text-sm">{r.et}</p>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
