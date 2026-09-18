import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const CITIES = [
  { name: "Tokyo", tz: "Asia/Tokyo", img: "/cities/tokyo.jpg" },
  { name: "Hong Kong", tz: "Asia/Hong_Kong", img: "/cities/hongkong.jpg" },
  { name: "London", tz: "Europe/London", img: "/cities/london.jpg" },
  { name: "New York", tz: "America/New_York", img: "/cities/newyork.jpg", live: true },
] as const;

function parts(tz: string, now: Date) {
  const t = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(now);
  const hour = t.find((p) => p.type === "hour")?.value ?? "";
  const minute = t.find((p) => p.type === "minute")?.value ?? "";
  const day = t.find((p) => p.type === "dayPeriod")?.value ?? "";
  return { clock: `${hour}:${minute}`, day: day.toUpperCase() };
}

export function WorldClocks() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
      {CITIES.map((c) => {
        const p = parts(c.tz, now);
        const nyLive = "live" in c && isNyLive(now);
        return (
          <div key={c.name} className="flex flex-col items-center">
            <div
              className="relative aspect-square w-full max-w-48 overflow-hidden rounded-full border border-white/10 bg-cover bg-center"
              style={{ backgroundImage: `url(${c.img})` }}
            >
              <div className="absolute inset-0 bg-black/45" />
              {nyLive ? (
                <span className="bg-live absolute top-3 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[9px] tracking-[0.18em] text-white uppercase">
                  Live
                </span>
              ) : null}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-display text-3xl tracking-wide text-white tabular-nums sm:text-4xl">
                  {p.clock}
                </p>
                <p className="text-[10px] tracking-[0.2em] text-white/70 uppercase">{p.day}</p>
              </div>
            </div>
            <p className={cn("mt-3 text-sm", nyLive ? "text-fg" : "text-muted")}>{c.name}</p>
          </div>
        );
      })}
    </div>
  );
}

function isNyLive(now: Date) {
  const h = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      hour12: false,
    }).format(now),
  );
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
  }).format(now);
  if (day === "Sat" || day === "Sun") return false;
  return h >= 9 && h < 16;
}
