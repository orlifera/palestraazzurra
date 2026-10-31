const buckets = new Map<string, number[]>()

/** Best-effort in-memory limiter, per server instance. Returns false when over the limit. */
export function allow(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) {
    buckets.set(key, hits)
    return false
  }
  hits.push(now)
  buckets.set(key, hits)
  return true
}
