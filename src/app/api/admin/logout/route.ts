import type { NextRequest } from 'next/server';
import { error, json, sameOrigin } from '@/lib/server/http';
import { ADMIN_COOKIE, adminCookieOptions } from '@/lib/server/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return error(403, 'forbidden');
  const res = json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions, maxAge: 0 });
  return res;
}
