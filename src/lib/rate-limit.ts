import { getRequest } from "@tanstack/react-start/server";

type Bucket = { count: number; resetAt: number };

/**
 * Fixed-window limiter, in-process only — a courtesy cap on a single client
 * hammering a paid endpoint, not a distributed quota guarantee across
 * multiple serverless instances. Good enough to stop the realistic threat
 * here (a script looping an unauthenticated call), not a substitute for a
 * shared store (Redis/KV) if this ever needs to be airtight.
 */
function makeLimiter(max: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();
  return function hit(key: string): boolean {
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || now >= b.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (b.count >= max) return false;
    b.count += 1;
    return true;
  };
}

function clientKey(): string {
  const request = getRequest();
  const h = request?.headers;
  const ip =
    h?.get("x-vercel-forwarded-for") ??
    h?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h?.get("x-real-ip");
  return ip || "unknown";
}

// Per-client and a global ceiling together: the global cap bounds total spend
// even if many distinct IPs (or none, in preview) hit it at once.
const perClient = makeLimiter(6, 60_000); // 6 asks/min per client
const global = makeLimiter(60, 60_000); // 60 asks/min total

/** True if this request may proceed; false if it should be told to slow down. */
export function allowAskTape(): boolean {
  return global("global") && perClient(clientKey());
}
