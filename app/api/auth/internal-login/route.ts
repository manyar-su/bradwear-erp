import { NextResponse } from 'next/server';
import type { AppRole } from '@/types/auth';
import {
  EMAIL_COOKIE,
  INTERNAL_DOMAIN,
  NAME_COOKIE,
  ROLE_COOKIE,
  SESSION_COOKIE,
  isInternalEmail,
  normalizeInternalEmail,
  normalizeRole,
} from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type BodyPayload = {
  email?: string;
  displayName?: string;
  role?: AppRole;
};

const ALLOWED_REGISTER_ROLES: AppRole[] = ['staff', 'cs', 'penjahit'];

export async function POST(request: Request) {
  let payload: BodyPayload;
  try {
    payload = (await request.json()) as BodyPayload;
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 });
  }

  const normalizedEmail = normalizeInternalEmail(payload.email || '');
  if (!normalizedEmail || !isInternalEmail(normalizedEmail)) {
    return NextResponse.json(
      { error: `Gunakan email internal Bradwear (${INTERNAL_DOMAIN}).` },
      { status: 400 }
    );
  }

  const fallbackName = normalizedEmail.split('@')[0] || 'User';
  const displayName = (payload.displayName || '').trim() || fallbackName;
  const incomingRole = payload.role && ALLOWED_REGISTER_ROLES.includes(payload.role) ? payload.role : 'penjahit';

  const supabase = getSupabaseAdmin();
  const { data: existingRaw } = await supabase
    .from('user_profiles')
    .select('role, is_active')
    .eq('email', normalizedEmail)
    .maybeSingle();
  const existing = (existingRaw || null) as { role: string | null; is_active: boolean | null } | null;

  const persistedRole = normalizeRole(existing?.role || incomingRole);
  const isActive = existing?.is_active ?? true;

  const profilePayload = {
      email: normalizedEmail,
      display_name: displayName,
      role: persistedRole,
      is_active: isActive,
      last_login_at: new Date().toISOString(),
    };

  const { error } = await supabase
    .from('user_profiles')
    .upsert([profilePayload] as unknown as never[], { onConflict: 'email' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const response = NextResponse.json({
    ok: true,
    user: {
      email: normalizedEmail,
      displayName,
      role: persistedRole,
      isActive,
    },
  });

  const maxAge = 60 * 60 * 24 * 14;
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set(SESSION_COOKIE, '1', { path: '/', maxAge, sameSite: 'lax', secure });
  response.cookies.set(EMAIL_COOKIE, encodeURIComponent(normalizedEmail), {
    path: '/',
    maxAge,
    sameSite: 'lax',
    secure,
  });
  response.cookies.set(NAME_COOKIE, encodeURIComponent(displayName), {
    path: '/',
    maxAge,
    sameSite: 'lax',
    secure,
  });
  response.cookies.set(ROLE_COOKIE, persistedRole, { path: '/', maxAge, sameSite: 'lax', secure });

  return response;
}
