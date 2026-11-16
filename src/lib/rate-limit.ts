/**
 * Límite simple de pedidos por IP (en memoria, por instancia del servidor).
 * Frena abusos básicos como alguien mandando cientos de compras por minuto.
 */
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anon";
}
