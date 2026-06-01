import { NextResponse } from 'next/server';
import { assertPermission } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type LegacyOrderRow = {
  id: string;
  kode_barang: string | null;
  konsumen: string | null;
};

type KonsumenRefRow = {
  id: string;
  kode_barang: string;
  nama: string;
};

function normalizeText(value: string | null | undefined) {
  return (value || '').trim().toLowerCase();
}

export async function POST() {
  try {
    await assertPermission('settings.manage');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 403 });
  }

  const startedAt = new Date().toISOString();
  const supabase = getSupabaseAdmin();

  const [{ data: rawOrders, error: orderErr }, { data: rawKonsumen, error: konsumenErr }] =
    await Promise.all([
      supabase
        .from('orders')
        .select('id, kode_barang, konsumen')
        .is('deleted_at', null)
        .is('konsumen_id', null)
        .limit(10000),
      supabase
        .from('konsumen')
        .select('id, kode_barang, nama')
        .limit(10000),
    ]);

  if (orderErr) {
    if (orderErr.message.includes('column orders.konsumen_id does not exist')) {
      return NextResponse.json(
        { error: 'Kolom orders.konsumen_id belum ada. Jalankan SQL migrasi schema terlebih dahulu.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: orderErr.message }, { status: 500 });
  }
  if (konsumenErr) {
    return NextResponse.json({ error: konsumenErr.message }, { status: 500 });
  }

  const orders = (rawOrders || []) as LegacyOrderRow[];
  const masterKonsumen = (rawKonsumen || []) as KonsumenRefRow[];

  const byKode = new Map<string, KonsumenRefRow>();
  const byNama = new Map<string, KonsumenRefRow>();
  masterKonsumen.forEach((row) => {
    const kode = normalizeText(row.kode_barang);
    const nama = normalizeText(row.nama);
    if (kode && !byKode.has(kode)) byKode.set(kode, row);
    if (nama && !byNama.has(nama)) byNama.set(nama, row);
  });

  let matchedByKode = 0;
  let matchedByNama = 0;
  let updated = 0;
  let failedUpdate = 0;
  let unmatched = 0;

  for (const order of orders) {
    const kode = normalizeText(order.kode_barang);
    const nama = normalizeText(order.konsumen);
    const candidateByKode = kode ? byKode.get(kode) : null;
    const candidateByNama = !candidateByKode && nama ? byNama.get(nama) : null;
    const selected = candidateByKode || candidateByNama;

    if (!selected) {
      unmatched += 1;
      continue;
    }

    if (candidateByKode) matchedByKode += 1;
    if (candidateByNama) matchedByNama += 1;

    const { error } = await supabase
      .from('orders')
      .update({
        konsumen_id: selected.id,
        konsumen: selected.nama,
      } as never)
      .eq('id', order.id);

    if (error) {
      failedUpdate += 1;
      continue;
    }
    updated += 1;
  }

  const completedAt = new Date().toISOString();
  const summary = {
    totalCandidateOrders: orders.length,
    totalMasterKonsumen: masterKonsumen.length,
    matchedByKode,
    matchedByNama,
    updated,
    unmatched,
    failedUpdate,
  };

  await supabase.from('integration_sync_logs').insert([
    {
      source_key: 'konsumen_backfill_relasi',
      idempotency_key: `konsumen-backfill-${startedAt}`,
      status: failedUpdate > 0 ? 'partial' : 'success',
      started_at: startedAt,
      completed_at: completedAt,
      raw_payload: summary,
      normalized_payload: summary,
      external_id: null,
    },
  ] as never[]);

  return NextResponse.json({
    ok: true,
    started_at: startedAt,
    completed_at: completedAt,
    summary,
  });
}
