import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { getFilings } from "@/lib/filings";

export const Route = createFileRoute("/filings")({
  loader: () => getFilings(),
  component: Filings,
});

function Filings() {
  const items = Route.useLoaderData();
  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl">Filings</h1>
        <p className="text-muted mt-2 text-sm">Latest EDGAR current filings.</p>
        <ul className="mt-6 grid gap-2">
          {items.map((it) => (
            <li key={it.title} className="bg-surface border-line rounded-xl border px-4 py-3">
              <a
                href={it.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm no-underline hover:underline"
              >
                {it.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
