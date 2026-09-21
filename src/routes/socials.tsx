import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/socials")({ component: Socials });

const APPS = [
  {
    name: "X",
    dek: "Live posts from the accounts you follow.",
    href: "https://x.com",
  },
  {
    name: "YouTube",
    dek: "Subscriptions. Lives and longform.",
    href: "https://www.youtube.com/feed/subscriptions",
  },
  {
    name: "Discord",
    dek: "Desks, servers, and private rooms.",
    href: "https://discord.com/app",
  },
  {
    name: "Robinhood",
    dek: "Your book. Positions, not the story.",
    href: "https://robinhood.com",
  },
  {
    name: "TradingView",
    dek: "Charts, alerts, and the public tape.",
    href: "https://www.tradingview.com",
  },
  {
    name: "Truth Social",
    dek: "DJT and the rest of that firehose.",
    href: "https://truthsocial.com",
  },
  {
    name: "Kick",
    dek: "Live streams outside the cable stack.",
    href: "https://kick.com",
  },
] as const;

function Socials() {
  return (
    <Shell>
      <div className="mx-auto max-w-4xl">
        <p className="text-muted text-[10px] tracking-[0.24em] uppercase">Follow your own</p>
        <h1 className="mt-1 text-3xl sm:text-4xl">Socials</h1>
        <p className="text-muted mt-2 max-w-xl text-sm">
          ACTA does not own your feed. Open the desks you already follow.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {APPS.map((app) => (
            <li key={app.name}>
              <a
                href={app.href}
                target="_blank"
                rel="noreferrer"
                className="bg-surface border-line hover:border-gold block rounded-2xl border p-5 no-underline"
              >
                <p className="text-lg">{app.name}</p>
                <p className="text-muted mt-1 text-sm">{app.dek}</p>
                <p className="text-gold mt-4 text-[11px] tracking-[0.16em] uppercase">Open ↗</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
