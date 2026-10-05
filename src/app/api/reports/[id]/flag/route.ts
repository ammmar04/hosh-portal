import type { NextRequest } from 'next/server';
import { getStore } from '@/lib/db';
import { error, json, sameOrigin } from '@/lib/server/http';
import { clientIp, fingerprint, rateLimit } from '@/lib/server/security';
import { isUuid } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/** POST /api/reports/[id]/flag : "Report abuse". Hidden after 3 flags from different people. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return error(403, 'forbidden');
  const { id } = await params;
  if (!isUuid(id)) return error(404, 'not_found');

  const limit = rateLimit(`flag:${clientIp(req)}`, 20, 60 * 60 * 1000);
  if (!limit.ok) return error(429, 'rate_limited', { retryAfter: limit.retryAfter }, { 'Retry-After': String(limit.retryAfter) });

  try {
    const result = await getStore().flag(id, fingerprint(req));
    if (!result) return error(404, 'not_found');
    // Only say whether this person had flagged before; counts stay private.
    return json({ ok: true, duplicate: result.duplicate });
  } catch (e) {
    console.error('[api/flag]', e);
    return error(500, 'server_error');
  }
}
