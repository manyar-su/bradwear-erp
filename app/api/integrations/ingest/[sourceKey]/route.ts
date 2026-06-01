import { NextResponse } from 'next/server';
import { assertPermission } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type IngestPayload = {
  external_id?: string;
  idempotency_key?: string;
  order?: {
    kode_barang?: string;
    nama_penjahit?: string;
    model?: string;
    model_detail?: string;
    jumlah_pesanan?: number;
    status?: string;
    payment_status?: string;
    priority?: string;
    cs?: string;
    konsumen?: string;
    warna?: string;
    tanggal_order?: string;
    tanggal_target_selesai?: string;
    deskripsi_pekerjaan?: string;
    size_details?: unknown;
  };
  konsumen?: {
    kode_barang?: string;
    nama?: string;
    telepon?: string;
    email?: string;
    alamat?: string;
    catatan?: string;
    status?: 'aktif' | 'nonaktif';
  };
  raw?: unknown;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ sourceKey: string }> }
) {
  try {
    await assertPermission('orders.manage');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 });
  }

  const { sourceKey } = await context.params;
  if (!sourceKey) {
    return NextResponse.json({ error: 'sourceKey wajib diisi.' }, { status: 400 });
  }

  let payload: IngestPayload;
  try {
    payload = (await request.json()) as IngestPayload;
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const startedAt = new Date().toISOString();

  const { data: sourceRaw } = await supabase
    .from('integration_sources')
    .select('source_key, is_active')
    .eq('source_key', sourceKey)
    .maybeSingle();
  const sourceRow = (sourceRaw || null) as { source_key: string; is_active: boolean } | null;

  if (!sourceRow?.is_active) {
    return NextResponse.json({ error: `Source '${sourceKey}' tidak aktif.` }, { status: 403 });
  }

  const idempotencyKey = (payload.idempotency_key || payload.external_id || '').trim() || null;
  if (idempotencyKey) {
    const { data: existedRaw } = await supabase
      .from('integration_sync_logs')
      .select('id')
      .eq('source_key', sourceKey)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
    const existed = (existedRaw || null) as { id: string } | null;
    if (existed) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'duplicate-idempotency-key' });
    }
  }

  let konsumenId: string | null = null;
  if (payload.konsumen?.kode_barang && payload.konsumen?.nama) {
    const konsumenPayload = {
      kode_barang: payload.konsumen.kode_barang.trim(),
      nama: payload.konsumen.nama.trim(),
      telepon: payload.konsumen.telepon?.trim() || null,
      email: payload.konsumen.email?.trim() || null,
      alamat: payload.konsumen.alamat?.trim() || null,
      catatan: payload.konsumen.catatan?.trim() || null,
      status: payload.konsumen.status || 'aktif',
      created_by_email: `integration:${sourceKey}`,
    };

    const { data: konsumenRaw } = await supabase
      .from('konsumen')
      .upsert(
        [konsumenPayload] as unknown as never[],
        { onConflict: 'kode_barang' }
      )
      .select('id')
      .single();
    const konsumen = (konsumenRaw || null) as { id: string } | null;

    konsumenId = konsumen?.id || null;
  }

  let orderId: string | null = null;
  if (payload.order?.kode_barang) {
    const orderInput = {
      kode_barang: payload.order.kode_barang.trim(),
      nama_penjahit: payload.order.nama_penjahit?.trim() || null,
      model: payload.order.model?.trim() || null,
      model_detail: payload.order.model_detail?.trim() || null,
      jumlah_pesanan: Number(payload.order.jumlah_pesanan || 0),
      status: payload.order.status?.trim() || 'Proses',
      payment_status: payload.order.payment_status?.trim() || 'Belum Bayar',
      priority: payload.order.priority?.trim() || 'Medium',
      cs: payload.order.cs?.trim() || null,
      konsumen: payload.order.konsumen?.trim() || payload.konsumen?.nama?.trim() || null,
      warna: payload.order.warna?.trim() || null,
      tanggal_order: payload.order.tanggal_order?.trim() || null,
      tanggal_target_selesai: payload.order.tanggal_target_selesai?.trim() || null,
      deskripsi_pekerjaan: payload.order.deskripsi_pekerjaan?.trim() || null,
      size_details: payload.order.size_details ?? [],
      integration_source: sourceKey,
      external_id: payload.external_id?.trim() || null,
    };

    const { data: orderRaw } = await supabase
      .from('orders')
      .insert([orderInput] as unknown as never[])
      .select('id')
      .single();
    const order = (orderRaw || null) as { id: string } | null;
    orderId = order?.id || null;
  }

  await supabase.from('integration_sync_logs').insert([
    {
      source_key: sourceKey,
      idempotency_key: idempotencyKey,
      external_id: payload.external_id?.trim() || null,
      status: 'success',
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      raw_payload: payload.raw ?? payload,
      normalized_payload: {
        sourceKey,
        orderId,
        konsumenId,
      },
    },
  ] as unknown as never[]);

  return NextResponse.json({
    ok: true,
    sourceKey,
    orderId,
    konsumenId,
  });
}
