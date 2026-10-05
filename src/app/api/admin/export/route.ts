import type { NextRequest } from 'next/server';
import { getStore } from '@/lib/db';
import { requireAdmin } from '@/lib/server/admin';
import type { Report } from '@/lib/types';

export const dynamic = 'force-dynamic';

const COLUMNS: (keyof Report)[] = [
  'id',
  'created_at',
  'number_norm',
  'number_display',
  'scam_type',
  'asked',
  'loss_band',
  'story',
  'lang',
  'reported_officially',
  'flag_count',
  'hidden',
  'is_sample',
];

/** Quote every cell, and neutralise cells that a spreadsheet would run as a formula. */
function cell(value: unknown): string {
  let s = Array.isArray(value) ? value.join('|') : value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const reports = await getStore().all();
  const lines = [COLUMNS.join(','), ...reports.map((r) => COLUMNS.map((c) => cell(r[c])).join(','))];
  const date = new Date().toISOString().slice(0, 10);
  // BOM so Excel opens Urdu text as UTF-8.
  return new Response('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="hosh-reports-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
