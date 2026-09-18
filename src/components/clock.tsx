import { useEffect, useState } from "react";

export function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return (
    <time
      className="font-body tabular-nums text-sm text-muted"
      dateTime={now?.toISOString()}
    >
      {now
        ? now.toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "\u00a0"}
    </time>
  );
}
