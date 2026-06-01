'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  EMAIL_COOKIE,
  INTERNAL_DOMAIN,
  NAME_COOKIE,
  ROLE_COOKIE,
  SESSION_COOKIE,
  isInternalEmail,
  normalizeInternalEmail,
} from '@/lib/auth/session';

type AuthMode = 'login' | 'register';
type SignupRole = 'staff' | 'cs' | 'penjahit';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [signupRole, setSignupRole] = useState<SignupRole>('penjahit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const getNextPath = () => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    if (next && next.startsWith('/')) {
      return next;
    }
    return '/dashboard';
  };

  const resetFeedback = () => {
    setError(null);
    setMessage(null);
  };

  const validateInternalEmail = (value: string) => {
    return isInternalEmail(value);
  };

  const persistLocalSession = (payload: { email: string; displayName: string; role: SignupRole }) => {
    const maxAge = 60 * 60 * 24 * 14;
    const base = `Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    document.cookie = `${SESSION_COOKIE}=1; ${base}`;
    document.cookie = `${EMAIL_COOKIE}=${encodeURIComponent(payload.email)}; ${base}`;
    document.cookie = `${NAME_COOKIE}=${encodeURIComponent(payload.displayName)}; ${base}`;
    document.cookie = `${ROLE_COOKIE}=${payload.role}; ${base}`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    const normalizedEmail = normalizeInternalEmail(email);
    if (!normalizedEmail) {
      setError('Email wajib diisi.');
      return;
    }

    if (!validateInternalEmail(normalizedEmail)) {
      setError(`Gunakan email internal Bradwear (${INTERNAL_DOMAIN}).`);
      return;
    }

    setEmail(normalizedEmail);
    setLoading(true);

    if (mode === 'login') {
      persistLocalSession({
        email: normalizedEmail,
        displayName: normalizedEmail.split('@')[0],
        role: 'penjahit',
      });
      router.replace(getNextPath());
      router.refresh();
      return;
    }

    persistLocalSession({
      email: normalizedEmail,
      displayName: displayName.trim() || normalizedEmail.split('@')[0],
      role: signupRole,
    });
    router.replace(getNextPath());
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-bold text-center">Bradwear Dashboard</CardTitle>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                mode === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
              }`}
              onClick={() => {
                setMode('login');
                resetFeedback();
              }}
            >
              Masuk
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                mode === 'register' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
              }`}
              onClick={() => {
                setMode('register');
                resetFeedback();
              }}
            >
              Daftar
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Nama</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Nama lengkap"
                  autoComplete="name"
                />
              </div>
            )}
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="signupRole">Role</Label>
                <select
                  id="signupRole"
                  value={signupRole}
                  onChange={(event) => setSignupRole(event.target.value as SignupRole)}
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="staff">Staff</option>
                  <option value="cs">CS</option>
                  <option value="penjahit">Penjahit</option>
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={`nama${INTERNAL_DOMAIN}`}
                autoComplete="email"
              />
            </div>

            {mode === 'register' && (
              <p className="text-xs text-muted-foreground">
                Gunakan email internal <span className="font-medium">{INTERNAL_DOMAIN}</span> untuk akses dashboard.
              </p>
            )}
            {mode === 'login' && (
              <p className="text-xs text-muted-foreground">
                Login tanpa otentikasi email eksternal. Email internal hanya sebagai identitas akses.
              </p>
            )}

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Kembali ke{' '}
            <Link href="/" className="text-primary hover:underline">
              dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
