import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PIN_CATALOG, pinBySlug, readPins, writePins } from "@/lib/desk-pins";
import { cn } from "@/lib/utils";

const CORE = [
  { to: "/", label: "Desk" },
  { to: "/watch", label: "Watch" },
  { to: "/calendar", label: "Calendar" },
  { to: "/news", label: "News" },
  { to: "/socials", label: "Crowd" },
  { to: "/search", label: "Search" },
] as const;

export function PinNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [pins, setPins] = useState(readPins);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setPins(readPins());
  }, []);

  function add(slug: string) {
    const next = [...pins, slug];
    setPins(next);
    writePins(next);
  }

  function remove(slug: string) {
    const next = pins.filter((s) => s !== slug);
    setPins(next);
    writePins(next);
  }

  return (
    <nav className="mt-3 flex w-full items-center gap-1 overflow-x-auto pb-2 md:justify-center" aria-label="Primary navigation">
      <div className="flex shrink-0 gap-1 border-r border-line pr-2">
        {CORE.map((item) => (
          <Link key={item.to} to={item.to} className={cn("pill", pathname === item.to && "pill-on")}>
            {item.label}
          </Link>
        ))}
      </div>
      <span className="text-muted ml-1 hidden text-[9px] tracking-[0.18em] uppercase sm:inline">Markets</span>
      {pins.map((slug) => {
        const pin = pinBySlug(slug);
        if (!pin) return null;
        return (
          <Link key={pin.slug} to={pin.to} className={cn("pill", pathname === pin.to && "pill-on")}>
            {pin.label}
          </Link>
        );
      })}
      <div className="relative">
        <button type="button" className="pill pill-solid" onClick={() => setOpen((v) => !v)}>
          Markets +
        </button>
        {open ? (
          <div className="bg-surface border-line absolute top-full right-0 z-30 mt-1 max-h-72 min-w-44 overflow-y-auto rounded-xl border p-1">
            <p className="text-muted px-3 pb-1 pt-2 text-[9px] tracking-[0.18em] uppercase">Pin to your tape</p>
            {PIN_CATALOG.map((p) => {
              const on = pins.includes(p.slug);
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => (on ? remove(p.slug) : add(p.slug))}
                  className="hover:bg-raised flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm"
                >
                  <span>{p.label}</span>
                  <span className="text-muted text-[11px]">{on ? "remove" : "pin"}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
