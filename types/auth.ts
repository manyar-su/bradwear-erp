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
};

export type UserRoleRow = {
  user_id: string;
  role: AppRole;
  display_name: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};
