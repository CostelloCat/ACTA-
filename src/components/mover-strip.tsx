import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { liveMover } from "@/lib/movers";

export function MoverStrip() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  const m = liveMover(now);
  if (!m) return null;

  return (
    <div className="flex items-center gap-3 bg-[#3a0d12] px-4 py-1.5 text-xs">
      <span className="bg-live shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-fg">
        LIVE
      </span>
      <p className="min-w-0 flex-1 truncate text-red-100">
        <span className="mr-2 tracking-[0.14em] uppercase opacity-80">{m.tag}</span>
        {m.headline}
      </p>
      <Link to="/news" className="shrink-0 text-red-100 no-underline">
        Watch →
      </Link>
    </div>
  );
}
