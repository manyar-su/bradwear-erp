'use client';

import { useActionState } from 'react';
import { Header } from '@/components/shared/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AppRole, UserProfileRow } from '@/types/auth';
import { submitUserProfileAction, upsertUserProfileAction } from '@/app/(dashboard)/pengaturan/actions';
import { useAuth } from '@/components/providers/AuthProvider';

const ROLE_OPTIONS: AppRole[] = ['admin', 'staff', 'cs', 'penjahit'];

type ActionState = {
  ok: boolean;
  message: string;
};

const INITIAL_STATE: ActionState = { ok: false, message: '' };

function InlineSaveButton({ disabled }: { disabled: boolean }) {
  return (
    <Button type="submit" size="sm" disabled={disabled}>
      Simpan
    </Button>
  );
}

export function PengaturanClient({ rows }: { rows: UserProfileRow[] }) {
  const { can } = useAuth();
  const canManageSettings = can('settings.manage');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (_prevState, formData) => {
      return upsertUserProfileAction(formData);
    },
    INITIAL_STATE
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Pengaturan"
        breadcrumbs={[{ label: 'Bradwear', href: '/dashboard' }, { label: 'Pengaturan' }]}
      />

      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Manajemen User Profile & Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Semua role bisa melihat halaman ini. Aksi update role/status hanya untuk admin/staff.
            </p>

            <form action={formAction} className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <Input name="email" placeholder="Email @bradwear.com" disabled={!canManageSettings || pending} />
              <Input name="display_name" placeholder="Display Name" disabled={!canManageSettings || pending} />
              <Input name="status_text" placeholder="Status Text" disabled={!canManageSettings || pending} />
              <Input name="avatar_url" placeholder="Avatar URL" disabled={!canManageSettings || pending} />
              <select
                name="role"
                defaultValue="penjahit"
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm"
                disabled={!canManageSettings || pending}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <select
                  name="is_active"
                  defaultValue="true"
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm flex-1"
                  disabled={!canManageSettings || pending}
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
                <Button type="submit" disabled={!canManageSettings || pending}>
                  {pending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>

            {state.message && (
              <p
                className={`rounded-md px-3 py-2 text-sm ${
                  state.ok
                    ? 'border border-green-200 bg-green-50 text-green-700'
                    : 'border border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {state.message}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar User Profiles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Status Text</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Belum ada data `user_profiles`.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.email}>
                      <TableCell className="font-medium">{row.email}</TableCell>
                      <TableCell>{row.display_name || '-'}</TableCell>
                      <TableCell>{row.status_text || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {row.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.is_active ? 'default' : 'destructive'}>
                          {row.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <form action={submitUserProfileAction} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="email" value={row.email} />
                          <input type="hidden" name="display_name" value={row.display_name || ''} />
                          <input type="hidden" name="status_text" value={row.status_text || ''} />
                          <input type="hidden" name="avatar_url" value={row.avatar_url || ''} />
                          <select
                            name="role"
                            defaultValue={row.role}
                            className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs capitalize"
                            disabled={!canManageSettings}
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role} className="capitalize">
                                {role}
                              </option>
                            ))}
                          </select>
                          <select
                            name="is_active"
                            defaultValue={row.is_active ? 'true' : 'false'}
                            className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs"
                            disabled={!canManageSettings}
                          >
                            <option value="true">Aktif</option>
                            <option value="false">Nonaktif</option>
                          </select>
                          <InlineSaveButton disabled={!canManageSettings} />
                        </form>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

