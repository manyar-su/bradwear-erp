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
import type { AppRole, UserRoleRow } from '@/types/auth';
import { submitUserRoleAction, upsertUserRoleAction } from '@/app/(dashboard)/pengaturan/actions';
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

export function PengaturanClient({ rows }: { rows: UserRoleRow[] }) {
  const { can } = useAuth();
  const canManageSettings = can('settings.manage');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (_prevState, formData) => {
      return upsertUserRoleAction(formData);
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
            <CardTitle>Manajemen Role User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Semua role dapat melihat halaman ini. Aksi assign role dan aktivasi user hanya untuk admin/staff.
            </p>

            <form action={formAction} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input name="user_id" placeholder="User ID (UUID)" disabled={!canManageSettings || pending} />
              <Input name="display_name" placeholder="Display Name" disabled={!canManageSettings || pending} />
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
              <select
                name="is_active"
                defaultValue="true"
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm"
                disabled={!canManageSettings || pending}
              >
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
              <Button type="submit" disabled={!canManageSettings || pending}>
                {pending ? 'Menyimpan...' : 'Tambah/Update User'}
              </Button>
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
            <CardTitle>Daftar User Roles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Belum ada data `user_roles`.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.user_id}>
                      <TableCell className="font-mono text-xs">{row.user_id}</TableCell>
                      <TableCell>{row.display_name || '-'}</TableCell>
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
                        <form action={submitUserRoleAction} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="user_id" value={row.user_id} />
                          <input type="hidden" name="display_name" value={row.display_name || ''} />
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
