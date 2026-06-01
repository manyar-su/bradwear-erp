import { NextResponse } from 'next/server';
import { getCurrentUserContext } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function GET() {
  const user = await getCurrentUserContext();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('forum_messages')
    .select('id, message_text, author_email, author_name, author_role, kode_barang_tag, emoji_reactions, attachment_url, attachment_name, attachment_type, created_at, updated_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(500);

  if (error) {
    return NextResponse.json(
      { error: `Gagal membaca forum messages: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ items: data || [] });
}

export async function POST(request: Request) {
  const user = await getCurrentUserContext();
  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const formData = await request.formData();

  const messageText = String(formData.get('message_text') || '').trim();
  const kodeBarangTag = String(formData.get('kode_barang_tag') || '').trim() || null;
  const emojiCsv = String(formData.get('emoji_csv') || '').trim();
  const file = formData.get('attachment');

  if (!messageText && !(file instanceof File)) {
    return NextResponse.json(
      { error: 'Isi pesan atau upload file dulu.' },
      { status: 400 }
    );
  }

  let attachmentUrl: string | null = null;
  let attachmentName: string | null = null;
  let attachmentType: string | null = null;

  if (file instanceof File) {
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file maksimal 15MB.' }, { status: 400 });
    }

    const safeName = sanitizeFilename(file.name || 'attachment');
    const path = `forum/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadErr } = await supabase.storage
      .from('forum-uploads')
      .upload(path, bytes, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      });
    if (uploadErr) {
      return NextResponse.json({ error: `Upload gagal: ${uploadErr.message}` }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('forum-uploads')
      .getPublicUrl(path);

    attachmentUrl = publicUrlData.publicUrl;
    attachmentName = file.name || safeName;
    attachmentType = file.type || null;
  }

  const emojiReactions = emojiCsv
    ? emojiCsv.split(',').map((item) => item.trim()).filter(Boolean)
    : [];

  const payload = {
    message_text: messageText || null,
    author_email: user.email,
    author_name: user.displayName,
    author_role: user.role,
    kode_barang_tag: kodeBarangTag,
    emoji_reactions: { quick: emojiReactions },
    attachment_url: attachmentUrl,
    attachment_name: attachmentName,
    attachment_type: attachmentType,
  };

  const { data, error } = await supabase
    .from('forum_messages')
    .insert([payload] as unknown as never[])
    .select('id, message_text, author_email, author_name, author_role, kode_barang_tag, emoji_reactions, attachment_url, attachment_name, attachment_type, created_at, updated_at')
    .single();

  if (error) {
    return NextResponse.json(
      { error: `Gagal simpan pesan forum: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}

