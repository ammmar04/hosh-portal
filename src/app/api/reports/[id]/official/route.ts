import type { NextRequest } from 'next/server';
import { getStore } from '@/lib/db';
import { error, json, readJson, sameOrigin } from '@/lib/server/http';
import { checkEditToken, clientIp, rateLimit } from '@/lib/server/security';
import { isUuid } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reports/[id]/official  { answer: boolean, token }
 * Saves the optional "Did you report this officially?" answer. Only the person
 * who sent the report has the token, which was returned when it was created.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return error(403, 'forbidden');
  const { id } = await params;
  if (!isUuid(id)) return error(404, 'not_found');

  const limit = rateLimit(`official:${clientIp(req)}`, 30, 60 * 60 * 1000);
  if (!limit.ok) return error(429, 'rate_limited');

  const parsed = await readJson(req, 512);
  if (!parsed.ok) return error(parsed.status, parsed.code);
  const body = parsed.body as { answer?: unknown; token?: unknown } | null;
  if (!body || typeof body.answer !== 'boolean') return error(422, 'invalid');
  if (!checkEditToken(id, body.token)) return error(403, 'bad_token');

  try {
    const ok = await getStore().setReportedOfficially(id, body.answer);
    return ok ? json({ ok: true }) : error(404, 'not_found');
  } catch (e) {
    console.error('[api/official]', e);
    return error(500, 'server_error');
  }
}
