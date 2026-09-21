export type Session = {
  id: "asia" | "london" | "newyork";
  name: string;
  country: string;
  tz: string;
  lat: number;
  lon: number;
  /** ET hour start, can wrap past 24 */
  startET: number;
  endET: number;
};

export const SESSIONS: Session[] = [
  {
    id: "asia",
    name: "Asia",
    country: "Japan",
    tz: "Asia/Tokyo",
    lat: 32.5,
    lon: 128,
    startET: 19,
    endET: 3,
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    tz: "Europe/London",
    lat: 51.5,
    lon: -0.12,
    startET: 3,
    endET: 8,
  },
  {
    id: "newyork",
    name: "New York",
    country: "United States",
    tz: "America/New_York",
    lat: 40.7,
    lon: -74.0,
    startET: 8,
    endET: 17,
  },
];

export function etHours(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).formatToParts(date);
  let h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const period = (parts.find((p) => p.type === "dayPeriod")?.value ?? "").toUpperCase();
  if (period.startsWith("P") && h < 12) h += 12;
  if (period.startsWith("A") && h === 12) h = 0;
  return h + m / 60;
}

function inWindow(h: number, start: number, end: number) {
  if (start < end) return h >= start && h < end;
  return h >= start || h < end;
}

function windowProgress(h: number, start: number, end: number) {
  const len = start < end ? end - start : 24 - start + end;
  const elapsed = start < end ? h - start : h >= start ? h - start : 24 - start + h;
  return Math.min(1, Math.max(0, elapsed / len));
}

function hoursUntil(h: number, start: number) {
  return (start - h + 24) % 24;
}

export function sessionState(date = new Date()) {
  const h = etHours(date);
  const liveIdx = SESSIONS.findIndex((s) => inWindow(h, s.startET, s.endET));
  if (liveIdx >= 0) {
    const current = SESSIONS[liveIdx]!;
    const next = SESSIONS[(liveIdx + 1) % SESSIONS.length]!;
    return { current, next, progress: windowProgress(h, current.startET, current.endET), live: true, et: h };
  }
  let best = 0;
  let wait = 99;
  SESSIONS.forEach((s, i) => {
    const w = hoursUntil(h, s.startET);
    if (w < wait) {
      wait = w;
      best = i;
    }
  });
  const next = SESSIONS[best]!;
  const current = SESSIONS[(best - 1 + SESSIONS.length) % SESSIONS.length]!;
  return { current, next, progress: 0.82, live: false, et: h };
}

export function sessionSlice(s: Session, date: Date) {
  const h = etHours(date);
  const live = inWindow(h, s.startET, s.endET);
  return {
    live,
    progress: live ? windowProgress(h, s.startET, s.endET) : 0,
    until: live ? 0 : hoursUntil(h, s.startET),
  };
}

export function etWindow(s: Session) {
  const fmt = (n: number) => `${String(Math.floor(n) % 24).padStart(2, "0")}:00`;
  return `${fmt(s.startET)}–${fmt(s.endET)} ET`;
}

export function cityClock(tz: string, date: Date) {
  const t = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).formatToParts(date);
  const hour = t.find((p) => p.type === "hour")?.value ?? "";
  const minute = t.find((p) => p.type === "minute")?.value ?? "";
  const second = t.find((p) => p.type === "second")?.value ?? "";
  const day = (t.find((p) => p.type === "dayPeriod")?.value ?? "").toUpperCase();
  return { hour, minute, second, day, label: `${hour}:${minute}:${second} ${day}` };
}
