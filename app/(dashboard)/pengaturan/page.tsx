import { createClient } from '@/lib/supabase/server';
import { PengaturanClient } from '@/app/(dashboard)/pengaturan/pengaturan-client';
import { DEFAULT_ROLE } from '@/lib/auth/permissions';
import type { AppRole, UserRoleRow } from '@/types/auth';

function parseRole(value: string | null): AppRole {
  if (value === 'admin' || value === 'staff' || value === 'cs' || value === 'penjahit') {
    return value;
  }
  return DEFAULT_ROLE;
}

export default async function PengaturanPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('user_roles')
    .select('user_id, role, display_name, is_active, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200);

  const rows: UserRoleRow[] = (data || []).map((row) => ({
    user_id: row.user_id,
    role: parseRole(row.role),
    display_name: row.display_name,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return <PengaturanClient rows={rows} />;
}
