import type { NextRequest } from 'next/server';
import { getStore } from '@/lib/db';
import { requireAdmin } from '@/lib/server/admin';
import { error, json } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

/** GET /api/admin/reports : every report, including hidden ones and moderation fields. */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const store = getStore();
    return json({ ok: true, storage: store.kind, reports: await store.all() });
  } catch (e) {
    console.error('[api/admin/reports]', e);
    return error(500, 'server_error');
  }
}
