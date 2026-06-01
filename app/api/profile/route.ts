import { NextResponse } from 'next/server';
import { getCurrentUserContext, assertPermission } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type ProfileUpdatePayload = {
  displayName?: string;
  statusText?: string;
  avatarUrl?: string;
  role?: 'admin' | 'staff' | 'cs' | 'penjahit';
  isActive?: boolean;
};

export async function GET() {
  const user = await getCurrentUserContext();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: rawData, error } = await supabase
    .from('user_profiles')
    .select('email, display_name, role, avatar_url, status_text, is_active, last_login_at, created_at, updated_at')
    .eq('email', user.email)
    .maybeSingle();
  const data = (rawData || null) as {
    email: string;
    display_name: string | null;
    role: string | null;
    avatar_url: string | null;
    status_text: string | null;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string | null;
    updated_at: string | null;
  } | null;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    email: user.email,
    display_name: data?.display_name || user.displayName,
    role: data?.role || user.role,
    avatar_url: data?.avatar_url || null,
    status_text: data?.status_text || null,
    is_active: data?.is_active ?? user.isActive,
    last_login_at: data?.last_login_at || null,
    created_at: data?.created_at || null,
    updated_at: data?.updated_at || null,
  });
}

export async function PUT(request: Request) {
  const user = await getCurrentUserContext();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: ProfileUpdatePayload;
  try {
    payload = (await request.json()) as ProfileUpdatePayload;
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 });
  }

  const isPrivilegedChange = payload.role !== undefined || payload.isActive !== undefined;
  if (isPrivilegedChange) {
    try {
      await assertPermission('settings.manage');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Forbidden';
      return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 });
    }
  }

  const nextDisplayName =
    payload.displayName !== undefined ? payload.displayName.trim().slice(0, 120) : undefined;
  const nextStatusText =
    payload.statusText !== undefined ? payload.statusText.trim().slice(0, 240) : undefined;
  const nextAvatarUrl =
    payload.avatarUrl !== undefined ? payload.avatarUrl.trim().slice(0, 500) : undefined;

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (nextDisplayName !== undefined) updates.display_name = nextDisplayName || null;
  if (nextStatusText !== undefined) updates.status_text = nextStatusText || null;
  if (nextAvatarUrl !== undefined) updates.avatar_url = nextAvatarUrl || null;
  if (isPrivilegedChange) {
    if (payload.role) updates.role = payload.role;
    if (payload.isActive !== undefined) updates.is_active = payload.isActive;
  }

  const supabase = getSupabaseAdmin();
  const targetEmail = user.email;
  const { error } = await supabase
    .from('user_profiles')
    .update(updates as never)
    .eq('email', targetEmail);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: rawUpdated } = await supabase
    .from('user_profiles')
    .select('email, display_name, role, avatar_url, status_text, is_active, last_login_at, created_at, updated_at')
    .eq('email', targetEmail)
    .maybeSingle();
  const data = (rawUpdated || null) as {
    email: string;
    display_name: string | null;
    role: string | null;
    avatar_url: string | null;
    status_text: string | null;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string | null;
    updated_at: string | null;
  } | null;

  return NextResponse.json({ ok: true, profile: data });
}
