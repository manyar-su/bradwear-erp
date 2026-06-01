import type { AppRole } from '@/types/auth';

export const SESSION_COOKIE = 'bradwear_session';
export const EMAIL_COOKIE = 'bradwear_email';
export const NAME_COOKIE = 'bradwear_name';
export const ROLE_COOKIE = 'bradwear_role';

export const INTERNAL_DOMAIN = '@bradwear.com';
const SHORT_INTERNAL_DOMAIN = '@bradwear';

export function normalizeRole(value: string | null | undefined): AppRole {
  if (value === 'admin' || value === 'staff' || value === 'cs' || value === 'penjahit') {
    return value;
  }
  return 'penjahit';
}

export function normalizeInternalEmail(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return '';
  if (!trimmed.includes('@')) return `${trimmed}${INTERNAL_DOMAIN}`;
  if (trimmed.endsWith(SHORT_INTERNAL_DOMAIN)) return `${trimmed}.com`;
  return trimmed;
}

export function isInternalEmail(value: string) {
  return value.toLowerCase().endsWith(INTERNAL_DOMAIN);
}
