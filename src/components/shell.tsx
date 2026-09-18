import { PinNav } from "@/components/pin-nav";
import { MoverStrip } from "@/components/mover-strip";
import { FuturesBar } from "@/components/futures-bar";
import { Mast } from "@/components/mast";
import { NextPrint } from "@/components/next-print";
import { SearchBar } from "@/components/search-bar";
import { TapeStrip } from "@/components/tape-strip";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[48%] opacity-35">
        <div className="floor h-full w-full" />
      </div>
      <header className="relative z-10 px-3 pt-2 sm:px-4">
        <div className="flex items-center gap-3">
          <Mast />
          <SearchBar />
        </div>
        <PinNav />
      </header>
      <TapeStrip />
      <FuturesBar />
      <NextPrint />
      <MoverStrip />
      <div className="relative z-10 px-3 py-6 sm:px-5">{children}</div>
      <footer className="relative z-10 mt-10 flex flex-wrap items-end justify-between gap-3 px-4 pb-8">
        <div>
          <p className="text-sm tracking-[0.18em]">
            <span className="foil font-display tracking-[0.18em]">ACTA</span>
          </p>
          <p className="text-muted mt-1 text-[11px] tracking-[0.18em] uppercase">
            For the people by the people
          </p>
        </div>
        <div className="flex gap-1.5">
          <a className="pill pill-solid" href="https://x.com" target="_blank" rel="noreferrer">
            Donate
          </a>
          <a className="pill" href="https://x.com" target="_blank" rel="noreferrer">
            Ads / X
          </a>
        </div>
      </footer>
    </div>
  );
}
