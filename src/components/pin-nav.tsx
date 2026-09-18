import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PIN_CATALOG, pinBySlug, readPins, writePins } from "@/lib/desk-pins";
import { cn } from "@/lib/utils";

const CORE = [
  { to: "/", label: "Desk" },
  { to: "/news", label: "Global News" },
  { to: "/calendar", label: "Trading Calendar" },
  { to: "/socials", label: "Socials" },
  { to: "/crypto", label: "Crypto" },
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
    <nav className="mt-2 flex gap-1 overflow-x-auto pb-2">
      {CORE.map((item) => (
        <Link key={item.to} to={item.to} className={cn("pill", pathname === item.to && "pill-on")}>
          {item.label}
        </Link>
      ))}
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
          + Add
        </button>
        {open ? (
          <div className="bg-surface border-line absolute top-full right-0 z-30 mt-1 max-h-72 min-w-44 overflow-y-auto rounded-xl border p-1">
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
                  <span className="text-muted text-[11px]">{on ? "pinned" : "add"}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
