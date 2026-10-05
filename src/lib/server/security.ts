import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

/** Secret for signing. Set HOSH_SECRET in production. */
function secret(): string {
  if (process.env.HOSH_SECRET) return process.env.HOSH_SECRET;
  if (process.env.ADMIN_PASSWORD) return `hosh:${process.env.ADMIN_PASSWORD}`;
  return 'hosh-local-dev-secret-change-me';
}

export function hmac(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

/* ---------- Request identity (never stored raw) ---------- */

export function clientIp(req: NextRequest | Request): string {
  const h = req.headers;
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return h.get('x-real-ip') || h.get('cf-connecting-ip') || 'local';
}

/** A one-way fingerprint for "Report abuse": IP + user agent, keyed with the secret. */
export function fingerprint(req: NextRequest | Request): string {
  const ua = (req.headers.get('user-agent') || '').slice(0, 300);
  return hmac(`fp:${clientIp(req)}|${ua}`).slice(0, 32);
}

/* ---------- Simple per-IP rate limit (per server instance) ---------- */

type Bucket = number[];
const g = globalThis as unknown as { __hoshRate?: Map<string, Bucket> };
const buckets = (g.__hoshRate ??= new Map<string, Bucket>());

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0]!)) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}

/* ---------- Edit token: lets the person who sent a report answer "reported officially?" ---------- */

export function editToken(reportId: string): string {
  return hmac(`official:${reportId}`).slice(0, 24);
}

export function checkEditToken(reportId: string, token: unknown): boolean {
  return typeof token === 'string' && token.length === 24 && safeEqual(token, editToken(reportId));
}

/* ---------- Admin session ---------- */

export const ADMIN_COOKIE = 'hosh_admin';
const ADMIN_TTL_MS = 12 * 60 * 60 * 1000;

export function adminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === 'production' ? null : 'hosh-demo';
}

export function isAdminEnabled(): boolean {
  return adminPassword() !== null;
}

export function makeAdminSession(): string {
  const issued = Date.now().toString(36);
  return `${issued}.${hmac(`admin:${issued}:${adminPassword()}`)}`;
}

export function isValidAdminSession(value: string | undefined | null): boolean {
  if (!value || !isAdminEnabled()) return false;
  const [issued, sig] = value.split('.');
  if (!issued || !sig) return false;
  const t = parseInt(issued, 36);
  if (!Number.isFinite(t) || Date.now() - t > ADMIN_TTL_MS || t > Date.now() + 60_000) return false;
  return safeEqual(sig, hmac(`admin:${issued}:${adminPassword()}`));
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: ADMIN_TTL_MS / 1000,
};
