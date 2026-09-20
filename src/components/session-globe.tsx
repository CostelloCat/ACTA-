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
    <section className="relative overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="relative h-[430px] w-full overflow-hidden sm:h-[500px]">
        <img
          src="/hero/orbit.jpg"
          alt=""
          className="orbit-still absolute inset-0 h-full w-full object-cover brightness-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/15 via-transparent to-bg/45" />
        <div className="via-bg/75 absolute inset-x-0 top-[28%] h-36 bg-gradient-to-b from-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-32 text-center sm:pb-28">
          <p className="text-gold text-[10px] tracking-[0.85em] uppercase">
            {st.live ? "Live session" : "Between sessions"}
          </p>
          <p className="mt-4 text-3xl font-light tracking-[0.48em] uppercase sm:text-5xl sm:tracking-[0.72em]">{st.current.name}</p>
          <p className="text-muted mt-4 text-xs tracking-[0.42em] uppercase">{st.current.country}</p>
          <p className="text-muted mt-6 text-[10px] tracking-[0.32em] uppercase">Next handoff · {st.next.name}</p>
        </div>
        <ol className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2 sm:inset-x-5 sm:bottom-5">
        {SESSIONS.map((s) => {
          const slice = sessionSlice(s, now);
          const clock = cityClock(s.tz, now);
          const on = slice.live;
          return (
            <li
              key={s.id}
              className={cn(
                "bg-black/65 border-line relative overflow-hidden rounded-xl border px-2 py-3 text-center backdrop-blur-md sm:px-4",
                on && "border-gold session-live",
              )}
            >
              <p className="text-muted text-[10px] tracking-[0.32em] uppercase">{s.name}</p>
              <p className="mt-1.5 font-light tracking-[0.2em]">
                <span className="text-base tabular-nums tracking-tight sm:text-2xl">
                  {clock.hour}:{clock.minute}
                </span>
                <span className={cn("ml-0.5 text-[11px] tabular-nums", on ? "text-gold" : "text-muted")}>
                  :{clock.second}
                </span>
              </p>
              <p className="text-muted mt-1 text-[10px] tracking-[0.28em] uppercase">{clock.day}</p>
              <p className={cn("mt-2 truncate text-[9px] tracking-[0.14em] uppercase sm:text-[10px] sm:tracking-[0.2em]", on ? "text-gold" : "text-muted")}>
                {on ? "Live" : DESK[s.id]}
              </p>
              <div className="bg-raised mx-auto mt-2 h-px w-12 overflow-hidden">
                <div
                  className={cn("h-full", on ? "bg-gold" : "bg-line")}
                  style={{ width: on ? `${Math.round(slice.progress * 100)}%` : "100%" }}
                />
              </div>
            </li>
          );
        })}
        </ol>
      </div>
    </section>
  );
}
