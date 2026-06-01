import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { PengaturanClient } from '@/app/(dashboard)/pengaturan/pengaturan-client';
import { DEFAULT_ROLE } from '@/lib/auth/permissions';
import type { AppRole, UserProfileRow } from '@/types/auth';

function parseRole(value: string | null): AppRole {
  if (value === 'admin' || value === 'staff' || value === 'cs' || value === 'penjahit') {
    return value;
  }
  return DEFAULT_ROLE;
}

export default async function PengaturanPage() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('user_profiles')
    .select('email, display_name, role, avatar_url, status_text, is_active, last_login_at, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(500);

  const sourceRows = (data || []) as Array<{
    email: string;
    display_name: string | null;
    role: string | null;
    avatar_url: string | null;
    status_text: string | null;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
  }>;

  const rows: UserProfileRow[] = sourceRows.map((row) => ({
    email: row.email,
    display_name: row.display_name,
    role: parseRole(row.role),
    avatar_url: row.avatar_url,
    status_text: row.status_text,
    is_active: row.is_active,
    last_login_at: row.last_login_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return <PengaturanClient rows={rows} />;
}
