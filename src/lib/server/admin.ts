import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE, isValidAdminSession } from './security';
import { error } from './http';

/** Returns an error response when the request is not from a signed-in admin. */
export function requireAdmin(req: NextRequest) {
  if (!isValidAdminSession(req.cookies.get(ADMIN_COOKIE)?.value)) return error(401, 'unauthorized');
  return null;
}
