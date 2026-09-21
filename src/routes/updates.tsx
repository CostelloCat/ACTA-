import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/updates")({ component: Updates });

const NOTES = [
  {
    when: "16 Sep · FOMC day",
    body: "Retail sales 8:30. Decision 14:00. Presser 14:30. Dots are the tape. Size down into the hour.",
  },
  {
    when: "11 Sep · CPI",
    body: "CPI week is done. Core is what the committee sits on. Don't relitigate Friday's tick.",
  },
  {
    when: "Session rule",
    body: "Asia sets the overnight range. London fades or expands it. NY cash open is not the event today — 14:00 is.",
  },
];

function Updates() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl">Updates</h1>
        <ul className="mt-6 grid gap-3">
          {NOTES.map((n) => (
            <li key={n.when} className="bg-surface border-line rounded-xl border p-4">
              <p className="text-muted text-xs tracking-widest uppercase">{n.when}</p>
              <p className="mt-2 text-sm leading-relaxed">{n.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
