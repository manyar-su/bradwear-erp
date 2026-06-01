import { NextResponse } from 'next/server';
import { assertPermission, getCurrentUserContext } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type CreateOrderPayload = {
  kode_barang?: string;
  nama_penjahit?: string;
  model?: string;
  model_detail?: string;
  jumlah_pesanan?: number;
  status?: string;
  cs?: string;
  konsumen?: string;
  warna?: string;
  tanggal_order?: string;
  tanggal_target_selesai?: string;
  deskripsi_pekerjaan?: string;
  size_details?: unknown;
  payment_status?: string;
  priority?: string;
};

type UpdateStatusPayload = {
  id?: string;
  status?: string;
  payment_status?: string;
};

export async function GET() {
  const user = await getCurrentUserContext();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select('id, kode_barang, nama_penjahit, model, model_detail, jumlah_pesanan, status, payment_status, priority, cs, konsumen, warna, tanggal_order, tanggal_target_selesai, deskripsi_pekerjaan, size_details, created_at, updated_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}

export async function POST(request: Request) {
  try {
    await assertPermission('orders.manage');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 });
  }

  let payload: CreateOrderPayload;
  try {
    payload = (await request.json()) as CreateOrderPayload;
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 });
  }

  const kodeBarang = String(payload.kode_barang || '').trim();
  const konsumen = String(payload.konsumen || '').trim();
  if (!kodeBarang || !konsumen) {
    return NextResponse.json({ error: 'Field wajib: kode_barang dan konsumen.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const insertPayload = {
    kode_barang: kodeBarang,
    nama_penjahit: payload.nama_penjahit?.trim() || null,
    model: payload.model?.trim() || null,
    model_detail: payload.model_detail?.trim() || null,
    jumlah_pesanan: Number(payload.jumlah_pesanan || 0),
    status: payload.status?.trim() || 'Proses',
    cs: payload.cs?.trim() || null,
    konsumen,
    warna: payload.warna?.trim() || null,
    tanggal_order: payload.tanggal_order?.trim() || null,
    tanggal_target_selesai: payload.tanggal_target_selesai?.trim() || null,
    deskripsi_pekerjaan: payload.deskripsi_pekerjaan?.trim() || null,
    size_details: payload.size_details ?? [],
    payment_status: payload.payment_status?.trim() || 'Belum Bayar',
    priority: payload.priority?.trim() || 'Medium',
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([insertPayload] as unknown as never[])
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  try {
    await assertPermission('orders.manage');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 });
  }

  let payload: UpdateStatusPayload;
  try {
    payload = (await request.json()) as UpdateStatusPayload;
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 });
  }

  const id = String(payload.id || '').trim();
  if (!id) {
    return NextResponse.json({ error: 'ID order wajib diisi.' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (payload.status !== undefined) updates.status = String(payload.status).trim();
  if (payload.payment_status !== undefined) updates.payment_status = String(payload.payment_status).trim();
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Tidak ada field yang diupdate.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .update(updates as never)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, item: data });
}
