import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/more")({ component: More });

const LINKS = [
  { to: "/calendar", label: "Calendar" },
  { to: "/updates", label: "Updates" },
  { to: "/sessions", label: "Sessions" },
  { to: "/filings", label: "Filings" },
  { to: "/mag7", label: "Mag 7" },
  { to: "/xlm", label: "XLM" },
] as const;

function More() {
  return (
    <Shell>
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl">More</h1>
        <ul className="mt-6 grid gap-2">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="bg-surface border-line flex min-h-12 items-center rounded-xl border px-4 no-underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
