'use server';

import { revalidatePath } from 'next/cache';
import { assertPermission } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';
import type { AppRole } from '@/types/auth';

const ROLE_VALUES: AppRole[] = ['admin', 'staff', 'cs', 'penjahit'];
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseRole(value: FormDataEntryValue | null): AppRole | null {
  if (typeof value !== 'string') return null;
  if (ROLE_VALUES.includes(value as AppRole)) return value as AppRole;
  return null;
}

export async function upsertUserRoleAction(formData: FormData) {
  try {
    await assertPermission('settings.manage');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden';
    return { ok: false, message };
  }

  const userId = String(formData.get('user_id') || '').trim();
  const role = parseRole(formData.get('role'));
  const displayName = String(formData.get('display_name') || '').trim();
  const isActiveRaw = String(formData.get('is_active') || 'false');
  const isActive = isActiveRaw === 'true' || isActiveRaw === 'on';

  if (!UUID_REGEX.test(userId)) {
    return { ok: false, message: 'Format user_id tidak valid (wajib UUID).' };
  }

  if (!role) {
    return { ok: false, message: 'Role tidak valid.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('user_roles').upsert(
    {
      user_id: userId,
      role,
      display_name: displayName || null,
      is_active: isActive,
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath('/pengaturan');
  return { ok: true, message: 'Role berhasil disimpan.' };
}

export async function submitUserRoleAction(formData: FormData) {
  await upsertUserRoleAction(formData);
}
