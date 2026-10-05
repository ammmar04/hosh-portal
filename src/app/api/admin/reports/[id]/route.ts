import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { getStore } from '@/lib/db';
import { requireAdmin } from '@/lib/server/admin';
import { error, json, readJson, sameOrigin } from '@/lib/server/http';
import { isUuid } from '@/lib/validation';

export const dynamic = 'force-dynamic';

function refresh() {
  revalidatePath('/en');
  revalidatePath('/ur');
}

/** PATCH { hidden: boolean } : hide or unhide a report. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  if (!sameOrigin(req)) return error(403, 'forbidden');
  const { id } = await params;
  if (!isUuid(id)) return error(404, 'not_found');
  const parsed = await readJson(req, 256);
  if (!parsed.ok) return error(parsed.status, parsed.code);
  const hidden = (parsed.body as { hidden?: unknown } | null)?.hidden;
  if (typeof hidden !== 'boolean') return error(422, 'invalid');
  const ok = await getStore().setHidden(id, hidden);
  if (!ok) return error(404, 'not_found');
  refresh();
  return json({ ok: true });
}

/** DELETE : remove a report permanently. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  if (!sameOrigin(req)) return error(403, 'forbidden');
  const { id } = await params;
  if (!isUuid(id)) return error(404, 'not_found');
  const ok = await getStore().remove(id);
  if (!ok) return error(404, 'not_found');
  refresh();
  return json({ ok: true });
}
