import type { NextRequest } from 'next/server';
import { getStore } from '@/lib/db';
import { error, json } from '@/lib/server/http';
import { toPublic } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** GET /api/recent?limit=6 : latest visible reports, newest first. */
export async function GET(req: NextRequest) {
  const raw = Number(req.nextUrl.searchParams.get('limit') || 6);
  const limit = Number.isFinite(raw) ? Math.min(Math.max(Math.trunc(raw), 1), 24) : 6;
  try {
    const reports = await getStore().recent(limit);
    return json({ ok: true, reports: reports.map(toPublic) });
  } catch (e) {
    console.error('[api/recent]', e);
    return error(500, 'server_error');
  }
}
