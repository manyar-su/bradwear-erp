import { NextResponse } from 'next/server';
import { assertPermission, getCurrentUserContext } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type KonsumenInsertPayload = {
  kode_barang?: string;
  nama?: string;
  telepon?: string;
  email?: string;
  alamat?: string;
  catatan?: string;
  status?: 'aktif' | 'nonaktif';
};

type KonsumenRow = {
  id: string;
  kode_barang: string;
  nama: string;
  telepon: string | null;
  email: string | null;
  alamat: string | null;
  catatan: string | null;
  status: 'aktif' | 'nonaktif';
  created_by_email: string | null;
  created_at: string;
  updated_at: string;
};

type OrderAggregateRow = {
  konsumen: string | null;
  jumlah_pesanan: number | null;
};

export async function GET() {
  const user = await getCurrentUserContext();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const [{ data: konsumenRows, error: konsumenErr }, { data: orderRows, error: orderErr }] =
    await Promise.all([
      supabase
        .from('konsumen')
        .select('id, kode_barang, nama, telepon, email, alamat, catatan, status, created_by_email, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1000),
      supabase
        .from('orders')
        .select('konsumen, jumlah_pesanan')
        .is('deleted_at', null)
        .limit(5000),
    ]);

  if (konsumenErr) {
    return NextResponse.json({ error: konsumenErr.message }, { status: 500 });
  }
  if (orderErr) {
    return NextResponse.json({ error: orderErr.message }, { status: 500 });
  }

  const orderByKonsumen = new Map<string, { totalOrder: number; totalQty: number }>();
  ((orderRows || []) as OrderAggregateRow[]).forEach((row) => {
    const key = (row.konsumen || '').trim().toLowerCase();
    if (!key) return;
    const prev = orderByKonsumen.get(key) || { totalOrder: 0, totalQty: 0 };
    prev.totalOrder += 1;
    prev.totalQty += row.jumlah_pesanan || 0;
    orderByKonsumen.set(key, prev);
  });

  const items = ((konsumenRows || []) as KonsumenRow[]).map((row) => {
    const metrics = orderByKonsumen.get(row.nama.trim().toLowerCase()) || {
      totalOrder: 0,
      totalQty: 0,
    };
    return {
      ...row,
      total_order: metrics.totalOrder,
      total_qty: metrics.totalQty,
    };
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  let actorEmail = '';
  try {
    const actor = await assertPermission('konsumen.manage');
    actorEmail = actor.email;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 });
  }

  let payload: KonsumenInsertPayload;
  try {
    payload = (await request.json()) as KonsumenInsertPayload;
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 });
  }

  const kodeBarang = String(payload.kode_barang || '').trim();
  const nama = String(payload.nama || '').trim();
  if (!kodeBarang || !nama) {
    return NextResponse.json(
      { error: 'Field wajib: kode_barang dan nama.' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const insertPayload = {
    kode_barang: kodeBarang,
    nama,
    telepon: payload.telepon?.trim() || null,
    email: payload.email?.trim() || null,
    alamat: payload.alamat?.trim() || null,
    catatan: payload.catatan?.trim() || null,
    status: payload.status || 'aktif',
    created_by_email: actorEmail,
  };

  const { data, error } = await supabase
    .from('konsumen')
    .insert([insertPayload] as unknown as never[])
    .select('id, kode_barang, nama, telepon, email, alamat, catatan, status, created_by_email, created_at, updated_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}
