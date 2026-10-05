import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LANG, LANG_COOKIE, isLang, type Lang } from './i18n/config';

/**
 * Every page lives under /en or /ur. Unprefixed paths (/, /now, /check?n=...)
 * redirect to the visitor's language: the saved cookie first, then the
 * browser's preferred language, then English.
 */
function preferredLang(req: NextRequest): Lang {
  const saved = req.cookies.get(LANG_COOKIE)?.value;
  if (isLang(saved)) return saved;
  const accept = req.headers.get('accept-language') || '';
  const first = accept.split(',')[0]?.trim().toLowerCase() || '';
  if (first.startsWith('ur')) return 'ur';
  return DEFAULT_LANG;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const segment = pathname.split('/')[1];
  if (isLang(segment)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${preferredLang(req)}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Skip API routes, Next internals and any file with an extension (sw.js, icons, manifest).
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
