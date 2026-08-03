/**
 * Lightweight TTL cache for public read-only data.
 * Runs in the server isolate and behaves like a small Redis-style key/value
 * store: get -> miss -> fetch -> set, with explicit invalidation on writes.
 */
type Entry = { value: unknown; expires: number };

const store = new Map<string, Entry>();

export async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.value as T;
  const value = await loader();
  store.set(key, { value, expires: now + ttlMs });
  return value;
}

/** Drop cache entries whose key starts with any of the given prefixes. */
export function invalidate(prefixes: string[]) {
  for (const key of Array.from(store.keys())) {
    if (prefixes.some((p) => key.startsWith(p))) store.delete(key);
  }
}

export function invalidateAll() {
  store.clear();
}
