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
type ExistingProfile = {
  display_name: string | null;
  role: string | null;
  is_active: boolean | null;
};

function createLoginResponse(params: {
  email: string;
  displayName: string;
  role: AppRole;
  isActive: boolean;
  syncStatus?: 'synced' | 'offline';
}) {
  const { email, displayName, role, isActive, syncStatus = 'synced' } = params;
  const response = NextResponse.json({
    ok: true,
    syncStatus,
    user: {
      email,
      displayName,
      role,
      isActive,
    },
  });

  const maxAge = 60 * 60 * 24 * 14;
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set(SESSION_COOKIE, '1', { path: '/', maxAge, sameSite: 'lax', secure });
  response.cookies.set(EMAIL_COOKIE, encodeURIComponent(email), {
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
  response.cookies.set(ROLE_COOKIE, role, { path: '/', maxAge, sameSite: 'lax', secure });

  return response;
}

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

  try {
    const supabase = getSupabaseAdmin();
    const { data: existingRaw, error: lookupError } = await supabase
      .from('user_profiles')
      .select('display_name, role, is_active')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    const existing = (existingRaw || null) as ExistingProfile | null;
    const persistedRole = normalizeRole(existing?.role || incomingRole);
    const isActive = existing?.is_active ?? true;

    if (!isActive) {
      return NextResponse.json({ error: 'Akun ini sedang dinonaktifkan.' }, { status: 403 });
    }

    const persistedName = existing?.display_name || displayName;
    const profilePayload = {
      email: normalizedEmail,
      display_name: persistedName,
      role: persistedRole,
      is_active: isActive,
      last_login_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert([profilePayload] as unknown as never[], { onConflict: 'email' });

    if (error) {
      throw error;
    }

    return createLoginResponse({
      email: normalizedEmail,
      displayName: persistedName,
      role: persistedRole,
      isActive,
    });
  } catch (error) {
    console.warn('Internal login Supabase sync failed, falling back to cookie session.', error);

    return createLoginResponse({
      email: normalizedEmail,
      displayName,
      role: incomingRole,
      isActive: true,
      syncStatus: 'offline',
    });
  }
}
