import { cache } from 'react';
import { cookies } from 'next/headers';
import { can, DEFAULT_ROLE } from '@/lib/auth/permissions';
import { EMAIL_COOKIE, NAME_COOKIE, ROLE_COOKIE, SESSION_COOKIE, normalizeRole } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { AppRole, AuthUserContext, PermissionKey } from '@/types/auth';

export const getCurrentUserContext = cache(async (): Promise<AuthUserContext | null> => {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get(SESSION_COOKIE)?.value === '1';
  const rawEmail = cookieStore.get(EMAIL_COOKIE)?.value || '';
  const email = decodeURIComponent(rawEmail || '').trim().toLowerCase();
  const rawDisplayName = cookieStore.get(NAME_COOKIE)?.value || '';
  const cookieDisplayName = decodeURIComponent(rawDisplayName || '').trim();
  const cookieRole = normalizeRole(cookieStore.get(ROLE_COOKIE)?.value || DEFAULT_ROLE);

  if (!hasSession || !email) {
    return null;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: rawData } = await supabase
      .from('user_profiles')
      .select('email, display_name, role, avatar_url, status_text, is_active')
      .eq('email', email)
      .maybeSingle();
    const data = (rawData || null) as {
      email: string;
      display_name: string | null;
      role: string | null;
      avatar_url: string | null;
      status_text: string | null;
      is_active: boolean | null;
    } | null;

    if (!data) {
      return {
        userId: email,
        email,
        displayName: cookieDisplayName || email.split('@')[0] || 'User',
        role: cookieRole,
        isActive: true,
      };
    }

    return {
      userId: data.email,
      email: data.email,
      displayName: data.display_name || data.email.split('@')[0] || 'User',
      role: normalizeRole(data.role || DEFAULT_ROLE),
      isActive: data.is_active ?? true,
      avatarUrl: data.avatar_url,
      statusText: data.status_text,
    };
  } catch {
    return {
      userId: email,
      email,
      displayName: cookieDisplayName || email.split('@')[0] || 'User',
      role: cookieRole,
      isActive: true,
    };
  }
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
