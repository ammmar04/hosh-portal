import { NextResponse } from 'next/server';

const NO_STORE = { 'Cache-Control': 'no-store' };

export function json(data: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
  return NextResponse.json(data, { status: init.status ?? 200, headers: { ...NO_STORE, ...init.headers } });
}

export function error(status: number, code: string, extra: Record<string, unknown> = {}, headers?: Record<string, string>) {
  return json({ ok: false, error: code, ...extra }, { status, headers });
}

/** Parse a small JSON body. Anything over `maxBytes` or not JSON is rejected. */
export async function readJson(req: Request, maxBytes = 4096): Promise<{ ok: true; body: unknown } | { ok: false; status: number; code: string }> {
  const type = req.headers.get('content-type') || '';
  if (!type.includes('application/json')) return { ok: false, status: 415, code: 'unsupported_media_type' };
  const length = Number(req.headers.get('content-length') || 0);
  if (length > maxBytes) return { ok: false, status: 413, code: 'too_large' };
  const text = await req.text();
  if (text.length > maxBytes) return { ok: false, status: 413, code: 'too_large' };
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, code: 'invalid_json' };
  }
}

/** Reject cross-site form posts: the Origin header, when present, must match the host. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get('host');
  } catch {
    return false;
  }
}
