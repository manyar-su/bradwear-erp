import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { PengaturanClient } from '@/app/(dashboard)/pengaturan/pengaturan-client';
import { DEFAULT_ROLE } from '@/lib/auth/permissions';
import type { AppRole, UserProfileRow } from '@/types/auth';

type TableSummary = {
  table: string;
  count: number;
  error?: string;
};

type DatabaseSummary = {
  tables: TableSummary[];
};

function parseRole(value: string | null): AppRole {
  if (value === 'admin' || value === 'staff' || value === 'cs' || value === 'penjahit') {
    return value;
  }
  return DEFAULT_ROLE;
}

export default async function PengaturanPage() {
  const supabase = getSupabaseAdmin();
  const [
    { data: userProfileData },
    userProfilesCount,
    konsumenCount,
    ordersCount,
    ocrLogsCount,
    integrationSourcesCount,
    integrationSyncLogsCount,
  ] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('email, display_name, role, avatar_url, status_text, is_active, last_login_at, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(500),
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('konsumen').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('ocr_logs').select('*', { count: 'exact', head: true }),
    supabase.from('integration_sources').select('*', { count: 'exact', head: true }),
    supabase.from('integration_sync_logs').select('*', { count: 'exact', head: true }),
  ]);

  const sourceRows = (userProfileData || []) as Array<{
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

  const databaseSummary: DatabaseSummary = {
    tables: [
      { table: 'user_profiles', count: userProfilesCount.count || 0, error: userProfilesCount.error?.message },
      { table: 'konsumen', count: konsumenCount.count || 0, error: konsumenCount.error?.message },
      { table: 'orders', count: ordersCount.count || 0, error: ordersCount.error?.message },
      { table: 'ocr_logs', count: ocrLogsCount.count || 0, error: ocrLogsCount.error?.message },
      { table: 'integration_sources', count: integrationSourcesCount.count || 0, error: integrationSourcesCount.error?.message },
      { table: 'integration_sync_logs', count: integrationSyncLogsCount.count || 0, error: integrationSyncLogsCount.error?.message },
    ],
  };

  return <PengaturanClient rows={rows} databaseSummary={databaseSummary} />;
}
