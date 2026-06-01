'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Paperclip, RefreshCcw, Send } from 'lucide-react';

type ForumMessage = {
  id: string;
  message_text: string | null;
  author_email: string;
  author_name: string | null;
  author_role: string | null;
  kode_barang_tag: string | null;
  emoji_reactions: { quick?: string[] };
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  created_at: string;
};

const QUICK_EMOJIS = ['😀', '🔥', '👍', '🙏', '✅', '🚚', '✂️', '🧵'];

export default function ForumDiskusiPage() {
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [kodeBarangOptions, setKodeBarangOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messageText, setMessageText] = useState('');
  const [kodeBarangTag, setKodeBarangTag] = useState('');
  const [emojiList, setEmojiList] = useState<string[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);

  const selectedEmojiCsv = useMemo(() => emojiList.join(','), [emojiList]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/forum/messages', { cache: 'no-store' });
      const data = (await response.json()) as { items?: ForumMessage[]; error?: string };
      if (!response.ok) {
        setError(data.error || 'Gagal load pesan forum.');
        return;
      }
      setMessages(data.items || []);
    } catch {
      setError('Tidak bisa terhubung ke forum API.');
    } finally {
      setLoading(false);
    }
  };

  const loadKodeBarangOptions = async () => {
    try {
      const response = await fetch('/api/forum/kode-barang', { cache: 'no-store' });
      const data = (await response.json()) as { items?: string[] };
      if (!response.ok) return;
      setKodeBarangOptions(data.items || []);
    } catch {
      // ignore and keep previous options
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void Promise.all([loadMessages(), loadKodeBarangOptions()]);
  }, []);

  const toggleEmoji = (emoji: string) => {
    setEmojiList((prev) => (prev.includes(emoji) ? prev.filter((item) => item !== emoji) : [...prev, emoji]));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!messageText.trim() && !attachment) {
      setError('Isi pesan atau upload file dulu.');
      return;
    }

    const payload = new FormData();
    payload.set('message_text', messageText);
    payload.set('kode_barang_tag', kodeBarangTag);
    payload.set('emoji_csv', selectedEmojiCsv);
    if (attachment) {
      payload.set('attachment', attachment);
    }

    setSending(true);
    try {
      const response = await fetch('/api/forum/messages', {
        method: 'POST',
        body: payload,
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || 'Gagal kirim pesan.');
        return;
      }

      setMessageText('');
      setKodeBarangTag('');
      setEmojiList([]);
      setAttachment(null);
      await loadMessages();
    } catch {
      setError('Tidak bisa kirim pesan ke server.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Forum Diskusi"
        breadcrumbs={[{ label: 'Bradwear', href: '/dashboard' }, { label: 'Forum Diskusi' }]}
      />

      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Diskusi Tim Produksi
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadMessages()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Memuat pesan forum...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada pesan forum.</p>
            ) : (
              <div className="space-y-3">
                {messages.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sm">{item.author_name || item.author_email}</p>
                      <Badge variant="secondary" className="capitalize">{item.author_role || 'user'}</Badge>
                      {item.kode_barang_tag && <Badge>{item.kode_barang_tag}</Badge>}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {item.message_text && <p className="whitespace-pre-wrap text-sm">{item.message_text}</p>}
                    {item.attachment_url && (
                      <a
                        href={item.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Paperclip className="h-4 w-4" />
                        {item.attachment_name || 'Attachment'}
                      </a>
                    )}
                    {(item.emoji_reactions?.quick || []).length > 0 && (
                      <p className="mt-2 text-sm">{item.emoji_reactions.quick?.join(' ')}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kirim Pesan Forum</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Tulis chat update produksi, kendala, atau instruksi..."
                rows={4}
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Input
                    value={kodeBarangTag}
                    onChange={(event) => setKodeBarangTag(event.target.value)}
                    placeholder="Tag kode barang (contoh: 2295)"
                    list="forum-kode-barang-list"
                  />
                  <datalist id="forum-kode-barang-list">
                    {kodeBarangOptions.map((code) => (
                      <option key={code} value={code} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Input
                    type="file"
                    onChange={(event) => setAttachment(event.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => toggleEmoji(emoji)}
                    className={`rounded-md border px-2 py-1 text-lg ${
                      emojiList.includes(emoji) ? 'border-primary bg-primary/10' : 'border-slate-200 bg-white'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={sending} className="gap-2">
                <Send className="h-4 w-4" />
                {sending ? 'Mengirim...' : 'Kirim ke Forum'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
