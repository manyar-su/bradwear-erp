import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { can, DEFAULT_ROLE } from '@/lib/auth/permissions';
import type { AppRole, AuthUserContext, PermissionKey, UserRoleRow } from '@/types/auth';

function toAppRole(role: string | null | undefined): AppRole {
  if (role === 'admin' || role === 'staff' || role === 'cs' || role === 'penjahit') {
    return role;
  }
  return DEFAULT_ROLE;
}

export const getCurrentUserContext = cache(async (): Promise<AuthUserContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('user_id, role, display_name, is_active')
    .eq('user_id', user.id)
    .maybeSingle<UserRoleRow>();

  const resolvedRole = toAppRole(roleRow?.role);
  const displayName =
    roleRow?.display_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.display_name ||
    user.email ||
    'User';

  return {
    userId: user.id,
    email: user.email || '',
    displayName,
    role: resolvedRole,
    isActive: roleRow?.is_active ?? true,
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
