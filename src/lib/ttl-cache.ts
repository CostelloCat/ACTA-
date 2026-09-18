type Entry<T> = { at: number; value: Promise<T> };

/**
 * In-memory, per-process TTL memoizer for server-side upstream calls (Yahoo
 * Finance, RSS wires, …). Storing the in-flight promise (not just the
 * resolved value) also collapses concurrent callers into one upstream
 * request instead of a thundering herd.
 *
 * Per-process only: on serverless (multiple instances / cold starts) this is
 * a courtesy cache, not a shared guarantee — it still cuts request volume to
 * fragile upstreams on the common case of one warm instance serving repeat
 * traffic (e.g. the 60s crypto poll).
 */
export function ttlCache<T>(ttlMs: number) {
  const store = new Map<string, Entry<T>>();
  return function get(key: string, load: () => Promise<T>): Promise<T> {
    const hit = store.get(key);
    if (hit && Date.now() - hit.at < ttlMs) return hit.value;
    const value = load().catch((err) => {
      store.delete(key);
      throw err;
    });
    store.set(key, { at: Date.now(), value });
    return value;
  };
}
