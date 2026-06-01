'use server';

import { revalidatePath } from 'next/cache';
import { assertPermission } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { AppRole } from '@/types/auth';

const ROLE_VALUES: AppRole[] = ['admin', 'staff', 'cs', 'penjahit'];

function parseRole(value: FormDataEntryValue | null): AppRole | null {
  if (typeof value !== 'string') return null;
  if (ROLE_VALUES.includes(value as AppRole)) return value as AppRole;
  return null;
}

export async function upsertUserProfileAction(formData: FormData) {
  try {
    await assertPermission('settings.manage');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden';
    return { ok: false, message };
  }

  const email = String(formData.get('email') || '').trim().toLowerCase();
  const role = parseRole(formData.get('role'));
  const displayName = String(formData.get('display_name') || '').trim();
  const statusText = String(formData.get('status_text') || '').trim();
  const avatarUrl = String(formData.get('avatar_url') || '').trim();
  const isActiveRaw = String(formData.get('is_active') || 'false');
  const isActive = isActiveRaw === 'true' || isActiveRaw === 'on';

  if (!email || !email.endsWith('@bradwear.com')) {
    return { ok: false, message: 'Email wajib domain @bradwear.com.' };
  }
  if (!role) {
    return { ok: false, message: 'Role tidak valid.' };
  }

  const supabase = getSupabaseAdmin();
  const profilePayload = {
      email,
      role,
      display_name: displayName || null,
      status_text: statusText || null,
      avatar_url: avatarUrl || null,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

  const { error } = await supabase
    .from('user_profiles')
    .upsert([profilePayload] as unknown as never[], { onConflict: 'email' });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath('/pengaturan');
  return { ok: true, message: 'Profil user berhasil disimpan.' };
}

export async function submitUserProfileAction(formData: FormData) {
  await upsertUserProfileAction(formData);
}
