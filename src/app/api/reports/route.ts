import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { getStore } from '@/lib/db';
import { normalizeNumber } from '@/lib/phone';
import { error, json, readJson, sameOrigin } from '@/lib/server/http';
import { clientIp, editToken, rateLimit } from '@/lib/server/security';
import { summarize, toPublic } from '@/lib/types';
import { validateNewReport } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/** GET /api/reports?n=0300 1234567 : every visible report for a number, plus a summary. */
export async function GET(req: NextRequest) {
  const n = req.nextUrl.searchParams.get('n') || '';
  const num = normalizeNumber(n);
  if (!num.ok) return error(400, 'invalid_number', { reason: num.error });
  try {
    const reports = (await getStore().forNumber(num.norm)).map(toPublic);
    return json({
      ok: true,
      number: { norm: num.norm, display: num.display, kind: num.kind },
      summary: summarize(reports),
      reports,
    });
  } catch (e) {
    console.error('[api/reports GET]', e);
    return error(500, 'server_error');
  }
}

/** POST /api/reports : create a report. Publishes instantly. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return error(403, 'forbidden');

  const limit = rateLimit(`report:${clientIp(req)}`, 6, 10 * 60 * 1000);
  if (!limit.ok) return error(429, 'rate_limited', { retryAfter: limit.retryAfter }, { 'Retry-After': String(limit.retryAfter) });

  const parsed = await readJson(req);
  if (!parsed.ok) return error(parsed.status, parsed.code);

  const result = validateNewReport(parsed.body);
  if (!result.ok) return error(422, 'invalid', { field: result.error.field, code: result.error.code });

  try {
    const report = await getStore().insertReport(result.value);
    // The home page is statically cached; refresh it so the new report shows up.
    revalidatePath('/en');
    revalidatePath('/ur');
    return json({ ok: true, report: toPublic(report), token: editToken(report.id) }, { status: 201 });
  } catch (e) {
    console.error('[api/reports POST]', e);
    return error(500, 'server_error');
  }
}
