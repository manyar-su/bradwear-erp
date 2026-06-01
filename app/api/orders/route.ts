import { NextResponse } from 'next/server';
import { assertPermission, getCurrentUserContext } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type CreateOrderPayload = {
  kode_barang?: string;
  konsumen_id?: string;
  nama_penjahit?: string;
  model?: string;
  model_detail?: string;
  jumlah_pesanan?: number;
  status?: string;
  cs?: string;
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
    .select('id, kode_barang, konsumen_id, nama_penjahit, model, model_detail, jumlah_pesanan, status, payment_status, priority, cs, konsumen, warna, tanggal_order, tanggal_target_selesai, deskripsi_pekerjaan, size_details, created_at, updated_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1000);

  let orderRowsData = (data || null) as Array<Record<string, unknown>> | null;
  if (error) {
    if (!error.message.includes('column orders.konsumen_id does not exist')) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const { data: fallbackRows, error: fallbackErr } = await supabase
      .from('orders')
      .select('id, kode_barang, nama_penjahit, model, model_detail, jumlah_pesanan, status, payment_status, priority, cs, konsumen, warna, tanggal_order, tanggal_target_selesai, deskripsi_pekerjaan, size_details, created_at, updated_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1000);
    if (fallbackErr) {
      return NextResponse.json({ error: fallbackErr.message }, { status: 500 });
    }
    orderRowsData = ((fallbackRows || []) as Array<Record<string, unknown>>).map((row) => ({
      ...(row as Record<string, unknown>),
      konsumen_id: null,
    }));
  }

  const orderRows = (orderRowsData || []) as Array<{
    id: string;
    kode_barang: string | null;
    konsumen_id: string | null;
    nama_penjahit: string | null;
    model: string | null;
    model_detail: string | null;
    jumlah_pesanan: number | null;
    status: string | null;
    payment_status: string | null;
    priority: string | null;
    cs: string | null;
    konsumen: string | null;
    warna: string | null;
    tanggal_order: string | null;
    tanggal_target_selesai: string | null;
    deskripsi_pekerjaan: string | null;
    size_details: unknown;
    created_at: string | null;
    updated_at: string | null;
  }>;

  const konsumenIds = Array.from(
    new Set(orderRows.map((row) => row.konsumen_id).filter((id): id is string => Boolean(id)))
  );

  const konsumenMap = new Map<
    string,
    {
      id: string;
      kode_barang: string;
      nama: string;
      telepon: string | null;
      email: string | null;
      pic_name: string | null;
      pic_phone: string | null;
      assigned_cs: string | null;
    }
  >();

  if (konsumenIds.length > 0) {
    const { data: konsumenData, error: konsumenErr } = await supabase
      .from('konsumen')
      .select('id, kode_barang, nama, telepon, email, pic_name, pic_phone, assigned_cs')
      .in('id', konsumenIds);
    let rows = (konsumenData || null) as Array<Record<string, unknown>> | null;
    if (konsumenErr && konsumenErr.message.includes('column konsumen.pic_name does not exist')) {
      const { data: fallbackData } = await supabase
        .from('konsumen')
        .select('id, kode_barang, nama, telepon, email')
        .in('id', konsumenIds);
      rows = ((fallbackData || []) as Array<Record<string, unknown>>).map((row) => ({
        ...(row as Record<string, unknown>),
        pic_name: null,
        pic_phone: null,
        assigned_cs: null,
      }));
    }

    (rows || []).forEach((row) => {
      const item = row as {
        id: string;
        kode_barang: string;
        nama: string;
        telepon: string | null;
        email: string | null;
        pic_name: string | null;
        pic_phone: string | null;
        assigned_cs: string | null;
      };
      konsumenMap.set(item.id, item);
    });
  }

  const items = orderRows.map((row) => {
    const konsumenMaster = row.konsumen_id ? konsumenMap.get(row.konsumen_id) : null;
    return {
      ...row,
      konsumen: konsumenMaster?.nama || row.konsumen,
      konsumen_master: konsumenMaster || null,
    };
  });

  return NextResponse.json({ items });
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

  const konsumenId = String(payload.konsumen_id || '').trim();
  if (!konsumenId) {
    return NextResponse.json({ error: 'Field wajib: konsumen_id.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: konsumenMasterRaw, error: konsumenErr } = await supabase
    .from('konsumen')
    .select('id, kode_barang, nama, assigned_cs')
    .eq('id', konsumenId)
    .maybeSingle();
  let konsumenMaster = (konsumenMasterRaw || null) as {
    id: string;
    kode_barang: string;
    nama: string;
    assigned_cs: string | null;
  } | null;

  if (konsumenErr) {
    if (!konsumenErr.message.includes('column konsumen.assigned_cs does not exist')) {
      return NextResponse.json({ error: konsumenErr.message }, { status: 500 });
    }
    const { data: fallbackMaster, error: fallbackErr } = await supabase
      .from('konsumen')
      .select('id, kode_barang, nama')
      .eq('id', konsumenId)
      .maybeSingle();
    if (fallbackErr) {
      return NextResponse.json({ error: fallbackErr.message }, { status: 500 });
    }
    const fallback = (fallbackMaster || null) as {
      id: string;
      kode_barang: string;
      nama: string;
    } | null;
    konsumenMaster = fallback
      ? {
          ...fallback,
          assigned_cs: null,
        }
      : null;
  }
  if (!konsumenMaster) {
    return NextResponse.json({ error: 'Data konsumen tidak ditemukan.' }, { status: 400 });
  }

  const kodeBarang = String(payload.kode_barang || '').trim() || konsumenMaster.kode_barang;
  const konsumenDisplay = konsumenMaster.nama;
  const csValue = payload.cs?.trim() || konsumenMaster.assigned_cs || null;

  const insertPayload = {
    kode_barang: kodeBarang,
    konsumen_id: konsumenMaster.id,
    nama_penjahit: payload.nama_penjahit?.trim() || null,
    model: payload.model?.trim() || null,
    model_detail: payload.model_detail?.trim() || null,
    jumlah_pesanan: Number(payload.jumlah_pesanan || 0),
    status: payload.status?.trim() || 'Proses',
    cs: csValue,
    konsumen: konsumenDisplay,
    warna: payload.warna?.trim() || null,
    tanggal_order: payload.tanggal_order?.trim() || null,
    tanggal_target_selesai: payload.tanggal_target_selesai?.trim() || null,
    deskripsi_pekerjaan: payload.deskripsi_pekerjaan?.trim() || null,
    size_details: payload.size_details ?? [],
    payment_status: payload.payment_status?.trim() || 'Belum Bayar',
    priority: payload.priority?.trim() || 'Medium',
  };

  const { data: insertedData, error } = await supabase
    .from('orders')
    .insert([insertPayload] as unknown as never[])
    .select('*')
    .single();
  let data = insertedData;
  if (error) {
    if (!error.message.includes('column "konsumen_id" of relation "orders" does not exist')) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const legacyPayload = {
      ...insertPayload,
    };
    delete (legacyPayload as Record<string, unknown>).konsumen_id;
    const { data: legacyInserted, error: legacyErr } = await supabase
      .from('orders')
      .insert([legacyPayload] as unknown as never[])
      .select('*')
      .single();
    if (legacyErr) {
      return NextResponse.json({ error: legacyErr.message }, { status: 500 });
    }
    data = legacyInserted;
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
