import { useEffect, useState } from "react";
import {
  cityClock,
  sessionSlice,
  sessionState,
  SESSIONS,
  type Session,
} from "@/lib/sessions";
import { cn } from "@/lib/utils";

const DESK: Record<Session["id"], string> = {
  asia: "Yen · Nikkei · overnight NQ",
  london: "Gold · Oil · Cable",
  newyork: "NQ · ES · VIX",
};

export function SessionGlobe() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const st = sessionState(now);

  return (
    <section className="relative">
      <div className="relative h-[min(82vh,720px)] w-full overflow-hidden">
        <img
          src="/hero/orbit.jpg"
          alt=""
          className="orbit-still absolute inset-0 h-full w-full object-cover brightness-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/15 via-transparent to-bg/45" />
        <div className="via-bg/75 absolute inset-x-0 top-[28%] h-36 bg-gradient-to-b from-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-gold text-[10px] tracking-[0.85em] uppercase">
            {st.live ? "Live session" : "Between sessions"}
          </p>
          <p className="mt-5 text-3xl font-light tracking-[0.72em] uppercase sm:text-5xl">{st.current.name}</p>
          <p className="text-muted mt-4 text-xs tracking-[0.42em] uppercase">{st.current.country}</p>
          <p className="text-muted mt-8 text-[10px] tracking-[0.32em] uppercase">Rotating toward {st.next.name}</p>
        </div>
      </div>

      <ol className="mt-4 grid grid-cols-3 gap-2">
        {SESSIONS.map((s) => {
          const slice = sessionSlice(s, now);
          const clock = cityClock(s.tz, now);
          const on = slice.live;
          return (
            <li
              key={s.id}
              className={cn(
                "bg-surface/80 border-line relative overflow-hidden rounded-2xl border px-3 py-4 text-center sm:px-4",
                on && "border-gold session-live",
              )}
            >
              <p className="text-muted text-[10px] tracking-[0.32em] uppercase">{s.name}</p>
              <p className="mt-2 font-light tracking-[0.2em]">
                <span className="text-xl tabular-nums tracking-tight sm:text-2xl">
                  {clock.hour}:{clock.minute}
                </span>
                <span className={cn("ml-0.5 text-[11px] tabular-nums", on ? "text-gold" : "text-muted")}>
                  :{clock.second}
                </span>
              </p>
              <p className="text-muted mt-1 text-[10px] tracking-[0.28em] uppercase">{clock.day}</p>
              <p className={cn("mt-3 text-[10px] tracking-[0.2em] uppercase", on ? "text-gold" : "text-muted")}>
                {on ? "Live" : DESK[s.id]}
              </p>
              <div className="bg-raised mx-auto mt-3 h-px w-12 overflow-hidden">
                <div
                  className={cn("h-full", on ? "bg-gold" : "bg-line")}
                  style={{ width: on ? `${Math.round(slice.progress * 100)}%` : "100%" }}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
