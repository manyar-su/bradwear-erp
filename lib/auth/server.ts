import { cache } from 'react';
import { cookies } from 'next/headers';
import { can, DEFAULT_ROLE } from '@/lib/auth/permissions';
import { EMAIL_COOKIE, NAME_COOKIE, ROLE_COOKIE, SESSION_COOKIE, normalizeRole } from '@/lib/auth/session';
import type { AppRole, AuthUserContext, PermissionKey } from '@/types/auth';

export const getCurrentUserContext = cache(async (): Promise<AuthUserContext | null> => {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get(SESSION_COOKIE)?.value === '1';
  const email = cookieStore.get(EMAIL_COOKIE)?.value || '';
  if (!hasSession || !email) {
    return null;
  }

  const role = normalizeRole(cookieStore.get(ROLE_COOKIE)?.value || DEFAULT_ROLE);
  const displayName =
    cookieStore.get(NAME_COOKIE)?.value ||
    email.split('@')[0] ||
    'User';

  return {
    userId: email,
    email,
    displayName,
    role,
    isActive: true,
  };
});

export async function getCurrentUserRole(): Promise<AppRole | null> {
  const user = await getCurrentUserContext();
  if (!user || !user.isActive) return null;
  return user.role;
}

export async function assertPermission(permission: PermissionKey) {
  const user = await getCurrentUserContext();
  if (!user || !user.isActive) {
    throw new Error('Unauthorized');
  }

  if (!can(user.role, permission)) {
    throw new Error('Forbidden');
  }

  return user;
}
