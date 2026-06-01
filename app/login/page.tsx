'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'login' | 'register';
type SignupRole = 'staff' | 'cs' | 'penjahit';

const INTERNAL_DOMAIN = '@bradwear.com';
const SHORT_INTERNAL_DOMAIN = '@bradwear';

function normalizeInternalEmail(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return '';
  if (!trimmed.includes('@')) return `${trimmed}${INTERNAL_DOMAIN}`;
  if (trimmed.endsWith(SHORT_INTERNAL_DOMAIN)) return `${trimmed}.com`;
  return trimmed;
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    return value.toLowerCase().endsWith(INTERNAL_DOMAIN);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    const normalizedEmail = normalizeInternalEmail(email);
    if (!normalizedEmail || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    if (!validateInternalEmail(normalizedEmail)) {
      setError(`Gunakan email internal Bradwear (${INTERNAL_DOMAIN}).`);
      return;
    }

    setEmail(normalizedEmail);
    setLoading(true);
    const supabase = createClient();

    if (mode === 'login') {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.replace(getNextPath());
      router.refresh();
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          display_name: displayName.trim() || normalizedEmail.split('@')[0],
          full_name: displayName.trim() || normalizedEmail.split('@')[0],
          role: signupRole,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setMessage('Registrasi berhasil. Jika konfirmasi email aktif, cek inbox terlebih dulu.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-bold text-center">Bradwear ERP</CardTitle>
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {mode === 'register' && (
              <p className="text-xs text-muted-foreground">
                Email akan disimpan ke Supabase Auth. Gunakan domain internal <span className="font-medium">{INTERNAL_DOMAIN}</span>.
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
