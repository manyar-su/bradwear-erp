import type { AppRole, PermissionKey, PermissionMap } from '@/types/auth';

export const DEFAULT_ROLE: AppRole = 'penjahit';

export const PERMISSION_MAP: PermissionMap = {
  admin: {
    'konsumen.manage': true,
    'orders.manage': true,
    'belanja.manage': true,
    'affiliate.manage': true,
    'settings.manage': true,
    'keuangan.manage': true,
    'production.manage': true,
  },
  staff: {
    'konsumen.manage': true,
    'orders.manage': true,
    'belanja.manage': true,
    'affiliate.manage': true,
    'settings.manage': true,
    'keuangan.manage': true,
    'production.manage': true,
  },
  cs: {
    'konsumen.manage': true,
    'orders.manage': true,
    'belanja.manage': false,
    'affiliate.manage': false,
    'settings.manage': false,
    'keuangan.manage': false,
    'production.manage': false,
  },
  penjahit: {
    'konsumen.manage': false,
    'orders.manage': false,
    'belanja.manage': false,
    'affiliate.manage': false,
    'settings.manage': false,
    'keuangan.manage': false,
    'production.manage': false,
  },
};

export function can(role: AppRole, permission: PermissionKey) {
  return PERMISSION_MAP[role]?.[permission] ?? false;
}
