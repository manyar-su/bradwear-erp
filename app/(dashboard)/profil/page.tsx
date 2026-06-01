'use client';

import { useEffect, useRef, useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type ProfilePayload = {
  email: string;
  display_name: string | null;
  role: string;
  avatar_url: string | null;
  status_text: string | null;
  is_active: boolean;
};

export default function ProfilPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [statusText, setStatusText] = useState('');

  const initials = (() => {
    const source = displayName || profile?.display_name || profile?.email || 'U';
    const words = source.trim().split(/\s+/).slice(0, 2);
    return words.map((word) => word[0]?.toUpperCase() || '').join('') || 'U';
  })();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/profile', { cache: 'no-store' });
        const data = (await response.json()) as ProfilePayload & { error?: string };
        if (!response.ok) {
          setError(data.error || 'Gagal memuat profil.');
          return;
        }
        if (cancelled) return;
        setProfile(data);
        setDisplayName(data.display_name || '');
        setAvatarUrl(data.avatar_url || '');
        setStatusText(data.status_text || '');
      } catch {
        if (!cancelled) setError('Tidak bisa terhubung ke server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          avatarUrl,
          statusText,
        }),
      });
      const data = (await response.json()) as { error?: string; profile?: ProfilePayload };
      if (!response.ok) {
        setError(data.error || 'Gagal simpan profil.');
        return;
      }
      if (data.profile) {
        setProfile(data.profile);
      }
      setMessage('Profil berhasil diperbarui.');
    } catch {
      setError('Tidak bisa terhubung ke server.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setError(null);
    setMessage(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(file);
      });
      setAvatarUrl(dataUrl);
      setMessage('Avatar berhasil dipilih. Klik "Simpan Profil" untuk menyimpan ke Supabase.');
    } catch {
      setError('Gagal membaca file avatar.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Profil"
        breadcrumbs={[{ label: 'Bradwear', href: '/dashboard' }, { label: 'Profil' }]}
      />

      <div className="p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Pengaturan Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Memuat profil...</p>
            ) : (
              <>
                {profile && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Email:</span> {profile.email}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {profile.role}
                      </Badge>
                      <Badge variant={profile.is_active ? 'default' : 'destructive'}>
                        {profile.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Nama</Label>
                  <Input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Nama tampilan"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preview Avatar</Label>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16">
                      {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName || profile?.email || 'avatar'} /> : null}
                      <AvatarFallback className="text-base">{initials}</AvatarFallback>
                    </Avatar>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleAvatarUpload(file);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Avatar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Avatar URL</Label>
                  <Input
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Textarea
                    value={statusText}
                    onChange={(event) => setStatusText(event.target.value)}
                    placeholder="Contoh: Penjahit divisi 1"
                  />
                </div>

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

                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Profil'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
