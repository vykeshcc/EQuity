/**
 * In-memory sliding-window rate limiter.
 * Resets on cold start; good enough to prevent accidental abuse on a single instance.
 * For multi-instance production use, back this with Redis/Upstash.
 */

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.limit - 1, resetAt: now + opts.windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, opts.limit - entry.count);
  return { allowed: entry.count <= opts.limit, remaining, resetAt: entry.resetAt };
}

/** Extract a stable client key from a request (IP address). */
export function clientKey(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
