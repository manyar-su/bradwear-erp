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
  pic_name?: string;
  pic_phone?: string;
  pic_email?: string;
  assigned_cs?: string;
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
  pic_name: string | null;
  pic_phone: string | null;
  pic_email: string | null;
  assigned_cs: string | null;
  updated_by_email: string | null;
  created_at: string;
  updated_at: string;
};

type OrderAggregateRow = {
  konsumen_id: string | null;
  konsumen: string | null;
  jumlah_pesanan: number | null;
};

export async function GET() {
  const user = await getCurrentUserContext();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const [{ data: konsumenRowsRaw, error: konsumenErr }, { data: orderRows, error: orderErr }] =
    await Promise.all([
      supabase
        .from('konsumen')
        .select('id, kode_barang, nama, telepon, email, alamat, catatan, status, created_by_email, pic_name, pic_phone, pic_email, assigned_cs, updated_by_email, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1000),
      supabase
        .from('orders')
        .select('konsumen_id, konsumen, jumlah_pesanan')
        .is('deleted_at', null)
        .limit(5000),
    ]);

  let konsumenRows = konsumenRowsRaw;
  if (konsumenErr) {
    if (!konsumenErr.message.includes('column konsumen.pic_name does not exist')) {
      return NextResponse.json({ error: konsumenErr.message }, { status: 500 });
    }
    const { data: fallbackRows, error: fallbackErr } = await supabase
      .from('konsumen')
      .select('id, kode_barang, nama, telepon, email, alamat, catatan, status, created_by_email, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1000);
    if (fallbackErr) {
      return NextResponse.json({ error: fallbackErr.message }, { status: 500 });
    }
    konsumenRows = fallbackRows;
  }
  if (orderErr) {
    return NextResponse.json({ error: orderErr.message }, { status: 500 });
  }

  const orderByKonsumenId = new Map<string, { totalOrder: number; totalQty: number }>();
  const orderByKonsumenName = new Map<string, { totalOrder: number; totalQty: number }>();
  ((orderRows || []) as OrderAggregateRow[]).forEach((row) => {
    if (row.konsumen_id) {
      const prevById = orderByKonsumenId.get(row.konsumen_id) || { totalOrder: 0, totalQty: 0 };
      prevById.totalOrder += 1;
      prevById.totalQty += row.jumlah_pesanan || 0;
      orderByKonsumenId.set(row.konsumen_id, prevById);
      return;
    }

    const keyByName = (row.konsumen || '').trim().toLowerCase();
    if (!keyByName) return;
    const prevByName = orderByKonsumenName.get(keyByName) || { totalOrder: 0, totalQty: 0 };
    prevByName.totalOrder += 1;
    prevByName.totalQty += row.jumlah_pesanan || 0;
    orderByKonsumenName.set(keyByName, prevByName);
  });

  const items = ((konsumenRows || []) as Partial<KonsumenRow>[]).map((row) => {
    const metrics = orderByKonsumenId.get(row.id || '') || orderByKonsumenName.get((row.nama || '').trim().toLowerCase()) || {
      totalOrder: 0,
      totalQty: 0,
    };
    return {
      id: row.id || '',
      kode_barang: row.kode_barang || '',
      nama: row.nama || '',
      telepon: row.telepon || null,
      email: row.email || null,
      alamat: row.alamat || null,
      catatan: row.catatan || null,
      status: (row.status as 'aktif' | 'nonaktif') || 'aktif',
      created_by_email: row.created_by_email || null,
      pic_name: row.pic_name || null,
      pic_phone: row.pic_phone || null,
      pic_email: row.pic_email || null,
      assigned_cs: row.assigned_cs || null,
      updated_by_email: row.updated_by_email || null,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString(),
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
  const { data: existingKodeRaw, error: existingKodeErr } = await supabase
    .from('konsumen')
    .select('id')
    .eq('kode_barang', kodeBarang)
    .maybeSingle();
  const existingKode = (existingKodeRaw || null) as { id: string } | null;
  if (existingKodeErr) {
    return NextResponse.json({ error: existingKodeErr.message }, { status: 500 });
  }
  if (existingKode?.id) {
    return NextResponse.json(
      { error: `Kode barang ${kodeBarang} sudah terdaftar di master konsumen.` },
      { status: 409 }
    );
  }

  const insertPayload = {
    kode_barang: kodeBarang,
    nama,
    telepon: payload.telepon?.trim() || null,
    email: payload.email?.trim() || null,
    alamat: payload.alamat?.trim() || null,
    catatan: payload.catatan?.trim() || null,
    status: payload.status || 'aktif',
    pic_name: payload.pic_name?.trim() || null,
    pic_phone: payload.pic_phone?.trim() || null,
    pic_email: payload.pic_email?.trim() || null,
    assigned_cs: payload.assigned_cs?.trim() || null,
    created_by_email: actorEmail,
    updated_by_email: actorEmail,
  };

  const { data: rawInserted, error } = await supabase
    .from('konsumen')
    .insert([insertPayload] as unknown as never[])
    .select('id, kode_barang, nama, telepon, email, alamat, catatan, status, created_by_email, pic_name, pic_phone, pic_email, assigned_cs, updated_by_email, created_at, updated_at')
    .single();

  let data = (rawInserted || null) as Record<string, unknown> | null;
  if (error) {
    if (!error.message.includes('column "pic_name" of relation "konsumen" does not exist')) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const legacyPayload = {
      kode_barang: kodeBarang,
      nama,
      telepon: payload.telepon?.trim() || null,
      email: payload.email?.trim() || null,
      alamat: payload.alamat?.trim() || null,
      catatan: payload.catatan?.trim() || null,
      status: payload.status || 'aktif',
      created_by_email: actorEmail,
    };
    const { data: legacyInserted, error: legacyErr } = await supabase
      .from('konsumen')
      .insert([legacyPayload] as unknown as never[])
      .select('id, kode_barang, nama, telepon, email, alamat, catatan, status, created_by_email, created_at, updated_at')
      .single();
    if (legacyErr) {
      return NextResponse.json({ error: legacyErr.message }, { status: 500 });
    }
    const legacyInsertedObj = (legacyInserted || null) as {
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
    data = {
      ...legacyInsertedObj,
      pic_name: null,
      pic_phone: null,
      pic_email: null,
      assigned_cs: null,
      updated_by_email: null,
    };
  }

  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}
