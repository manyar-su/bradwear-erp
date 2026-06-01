export type AppRole = 'admin' | 'staff' | 'cs' | 'penjahit';

export type PermissionKey =
  | 'konsumen.manage'
  | 'orders.manage'
  | 'belanja.manage'
  | 'affiliate.manage'
  | 'settings.manage'
  | 'keuangan.manage'
  | 'production.manage';

export type PermissionMap = Record<AppRole, Record<PermissionKey, boolean>>;

export type AuthUserContext = {
  userId: string;
  email: string;
  displayName: string;
  role: AppRole;
  isActive: boolean;
  avatarUrl?: string | null;
  statusText?: string | null;
};

export type UserRoleRow = {
  user_id: string;
  role: AppRole;
  display_name: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type UserProfileRow = {
  email: string;
  display_name: string | null;
  role: AppRole;
  avatar_url: string | null;
  status_text: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at?: string;
  updated_at?: string;
};
