import { createFileRoute, Link } from "@tanstack/react-router";
import { EventCountdown } from "@/components/event-countdown";
import { SessionGlobe } from "@/components/session-globe";
import { Shell } from "@/components/shell";
import { TvMini } from "@/components/tv-mini";

export const Route = createFileRoute("/")({ component: Desk });

const BUNDLE = [
  "NASDAQ:QQQ",
  "FOREXCOM:SPXUSD",
  "CBOE:VIX",
  "TVC:GOLD",
  "TVC:USOIL",
  "FX_IDC:USDX",
] as const;

function Desk() {
  return (
    <Shell>
      <div className="mx-auto max-w-6xl">
        <SessionGlobe />
        <EventCountdown />
        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-muted text-[10px] tracking-[0.24em] uppercase">The bundle</p>
            <h1 className="mt-1 text-3xl">Six desks</h1>
            <p className="text-muted mt-2 max-w-md text-sm">
              NQ, S&P 500, VIX, Gold, Oil, USD. A desk pass later lets you swap any of the six.
            </p>
          </div>
          <Link to="/news" className="pill shrink-0">
            Live desks →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {BUNDLE.map((symbol) => (
            <TvMini key={symbol} symbol={symbol} />
          ))}
        </div>
      </div>
    </Shell>
  );
}
