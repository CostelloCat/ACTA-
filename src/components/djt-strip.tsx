import { Link } from "@tanstack/react-router";

export function DjtStrip() {
  return (
    <div className="flex items-center gap-3 bg-[#3a0d12] px-4 py-1.5 text-xs">
      <span className="bg-live rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white">
        DJT
      </span>
      <p className="min-w-0 flex-1 truncate text-red-100">
        Donald Trump on the wire — remarks, Truth, and White House live.
      </p>
      <Link to="/news" className="text-red-100 no-underline">
        Watch →
      </Link>
    </div>
  );
}
