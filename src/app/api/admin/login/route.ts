import type { NextRequest } from 'next/server';
import { error, json, readJson, sameOrigin } from '@/lib/server/http';
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  adminPassword,
  clientIp,
  makeAdminSession,
  rateLimit,
  safeEqual,
} from '@/lib/server/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return error(403, 'forbidden');
  const expected = adminPassword();
  if (!expected) return error(503, 'admin_disabled');

  const limit = rateLimit(`admin-login:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (!limit.ok) return error(429, 'rate_limited', { retryAfter: limit.retryAfter });

  const parsed = await readJson(req, 1024);
  if (!parsed.ok) return error(parsed.status, parsed.code);
  const password = (parsed.body as { password?: unknown } | null)?.password;
  if (typeof password !== 'string' || !safeEqual(password, expected)) return error(401, 'wrong_password');

  const res = json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeAdminSession(), adminCookieOptions);
  return res;
}
