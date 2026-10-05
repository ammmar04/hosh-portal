import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { getStore } from '@/lib/db';
import { requireAdmin } from '@/lib/server/admin';
import { error, json, sameOrigin } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

/** DELETE /api/admin/samples : one-click removal of all sample data. */
export async function DELETE(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  if (!sameOrigin(req)) return error(403, 'forbidden');
  const removed = await getStore().removeSamples();
  revalidatePath('/en');
  revalidatePath('/ur');
  return json({ ok: true, removed });
}
