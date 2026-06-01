import { NextResponse } from 'next/server';
import { getCurrentUserContext } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type OrderRow = {
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
  saku_type: string | null;
  saku_color: string | null;
  size_details: unknown;
  deskripsi_pekerjaan: string | null;
  embroidery_status: string | null;
  embroidery_notes: string | null;
  completed_at: string | null;
  tanggal_order: string | null;
  tanggal_target_selesai: string | null;
  created_at: string | null;
  deleted_at: string | null;
};

function normalizeStatus(value: string | null | undefined) {
  const status = (value || '').toLowerCase().trim();
  if (status.includes('proses')) return 'proses';
  if (status.includes('beres') || status.includes('selesai')) return 'beres';
  if (status.includes('pending') || status.includes('menunggu')) return 'menunggu';
  if (status.includes('batal')) return 'batal';
  return status || 'proses';
}

function normalizePayment(value: string | null | undefined) {
  const payment = (value || '').toLowerCase().trim();
  if (payment.includes('sudah') || payment.includes('lunas')) return 'sudah_bayar';
  if (payment.includes('belum')) return 'belum_bayar';
  if (payment.includes('dp')) return 'dp';
  return 'belum_bayar';
}

function parseFlexibleDate(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const monthMap: Record<string, number> = {
    januari: 0,
    februari: 1,
    maret: 2,
    april: 3,
    mei: 4,
    juni: 5,
    juli: 6,
    agustus: 7,
    september: 8,
    oktober: 9,
    november: 10,
    desember: 11,
  };

  const normalized = value.toLowerCase();
  const match = normalized.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = monthMap[match[2]];
  const year = Number(match[3]);
  if (month === undefined) return null;

  const fallback = new Date(year, month, day);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export async function GET() {
  const user = await getCurrentUserContext();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, kode_barang, konsumen_id, nama_penjahit, model, model_detail, jumlah_pesanan, status, payment_status, priority, cs, konsumen, warna, saku_type, saku_color, size_details, deskripsi_pekerjaan, embroidery_status, embroidery_notes, completed_at, tanggal_order, tanggal_target_selesai, created_at, deleted_at'
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5000);

  let orderRowsData = (data || null) as Array<Record<string, unknown>> | null;
  if (error) {
    if (!error.message.includes('column orders.konsumen_id does not exist')) {
      return NextResponse.json(
        { error: `Gagal baca data Production Control: ${error.message}` },
        { status: 500 }
      );
    }
    const { data: fallbackRows, error: fallbackErr } = await supabase
      .from('orders')
      .select(
        'id, kode_barang, nama_penjahit, model, model_detail, jumlah_pesanan, status, payment_status, priority, cs, konsumen, warna, saku_type, saku_color, size_details, deskripsi_pekerjaan, embroidery_status, embroidery_notes, completed_at, tanggal_order, tanggal_target_selesai, created_at, deleted_at'
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5000);
    if (fallbackErr) {
      return NextResponse.json(
        { error: `Gagal baca data Production Control: ${fallbackErr.message}` },
        { status: 500 }
      );
    }
    orderRowsData = ((fallbackRows || []) as Array<Record<string, unknown>>).map((row) => ({
      ...(row as Record<string, unknown>),
      konsumen_id: null,
    }));
  }

  const baseOrders = ((orderRowsData || []) as OrderRow[]).map((row) => ({
    ...row,
    normalized_status: normalizeStatus(row.status),
    normalized_payment: normalizePayment(row.payment_status),
  }));

  const konsumenIds = Array.from(
    new Set(baseOrders.map((row) => row.konsumen_id).filter((id): id is string => Boolean(id)))
  );

  const konsumenMap = new Map<
    string,
    {
      id: string;
      nama: string;
      kode_barang: string;
      telepon: string | null;
      email: string | null;
      pic_name: string | null;
      pic_phone: string | null;
      pic_email: string | null;
      assigned_cs: string | null;
    }
  >();

  if (konsumenIds.length > 0) {
    const { data: konsumenData, error: konsumenErr } = await supabase
      .from('konsumen')
      .select('id, nama, kode_barang, telepon, email, pic_name, pic_phone, pic_email, assigned_cs')
      .in('id', konsumenIds);
    let rows = (konsumenData || null) as Array<Record<string, unknown>> | null;
    if (konsumenErr && konsumenErr.message.includes('column konsumen.pic_name does not exist')) {
      const { data: fallbackKonsumen } = await supabase
        .from('konsumen')
        .select('id, nama, kode_barang, telepon, email')
        .in('id', konsumenIds);
      rows = ((fallbackKonsumen || []) as Array<Record<string, unknown>>).map((row) => ({
        ...(row as Record<string, unknown>),
        pic_name: null,
        pic_phone: null,
        pic_email: null,
        assigned_cs: null,
      }));
    }
    (rows || []).forEach((row) => {
      const item = row as {
        id: string;
        nama: string;
        kode_barang: string;
        telepon: string | null;
        email: string | null;
        pic_name: string | null;
        pic_phone: string | null;
        pic_email: string | null;
        assigned_cs: string | null;
      };
      konsumenMap.set(item.id, item);
    });
  }

  const orders = baseOrders.map((row) => {
    const konsumenMaster = row.konsumen_id ? konsumenMap.get(row.konsumen_id) : null;
    return {
      ...row,
      konsumen: konsumenMaster?.nama || row.konsumen,
      konsumen_master: konsumenMaster || null,
    };
  });

  const today = new Date();
  const stats = {
    totalOrder: orders.length,
    totalQty: orders.reduce((sum, row) => sum + (row.jumlah_pesanan || 0), 0),
    inProgress: orders.filter((row) => row.normalized_status === 'proses').length,
    selesai: orders.filter((row) => row.normalized_status === 'beres').length,
    belumBayar: orders.filter((row) => row.normalized_payment === 'belum_bayar').length,
    prioritasHigh: orders.filter(
      (row) => (row.priority || '').toLowerCase().trim() === 'high'
    ).length,
    overdue: orders.filter((row) => {
      if (row.normalized_status === 'beres') return false;
      const target = parseFlexibleDate(row.tanggal_target_selesai);
      return target ? target.getTime() < today.getTime() : false;
    }).length,
  };

  const tailorWorkload = Object.entries(
    orders.reduce<Record<string, number>>((acc, row) => {
      const tailor = (row.nama_penjahit || 'Tanpa Penjahit').trim();
      acc[tailor] = (acc[tailor] || 0) + (row.jumlah_pesanan || 0);
      return acc;
    }, {})
  )
    .map(([namaPenjahit, qty]) => ({ namaPenjahit, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  return NextResponse.json({
    source: 'Bradflow orders',
    stats,
    tailorWorkload,
    orders,
  });
}
