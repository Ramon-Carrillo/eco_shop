/**
 * Simple in-memory sliding window rate limiter.
 * For production, replace with Redis-backed solution.
 */

const windowMs = 60_000; // 1 minute
const maxRequests = 10; // max requests per window per IP

const hits = new Map<string, number[]>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of hits) {
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length === 0) hits.delete(key);
    else hits.set(key, valid);
  }
}, 300_000);

export function rateLimit(ip: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  timestamps.push(now);
  hits.set(ip, timestamps);
  return { success: true, remaining: maxRequests - timestamps.length };
}
