import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type OrderRow = {
  id: string;
  kode_barang: string | null;
  konsumen: string | null;
  cs: string | null;
  model: string | null;
  jumlah_pesanan: number | null;
  status: string | null;
  payment_status: string | null;
  tanggal_target_selesai: string | null;
  created_at: string | null;
  deleted_at: string | null;
};

type DeadlineOrder = {
  id: string;
  invoice: string;
  konsumen: { nama: string };
  target_selesai: string;
  daysToDeadline: number;
};

function normalizeStatus(status: string | null | undefined) {
  const value = (status || '').toLowerCase().trim();
  if (value.includes('proses')) return 'proses';
  if (value.includes('menunggu') || value.includes('pending')) return 'menunggu';
  if (value.includes('beres') || value.includes('selesai') || value.includes('done')) {
    return 'selesai';
  }
  if (value.includes('batal')) return 'batal';
  return value || 'proses';
}

function normalizePaymentStatus(status: string | null | undefined) {
  const value = (status || '').toLowerCase().trim();
  if (value.includes('sudah') || value.includes('lunas')) return 'lunas';
  if (value.includes('dp')) return 'dp';
  if (value.includes('belum')) return 'belum_bayar';
  return 'belum_bayar';
}

function getWeekStart(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function parseFlexibleDate(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const normalized = value.toLowerCase();
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    return NextResponse.json(
      { error: 'Supabase env belum lengkap' },
      { status: 503 }
    );
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, kode_barang, konsumen, cs, model, jumlah_pesanan, status, payment_status, tanggal_target_selesai, created_at, deleted_at'
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json(
      { error: `Gagal baca orders: ${error.message}` },
      { status: 500 }
    );
  }

  const orders = (data || []) as OrderRow[];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyOrders = orders.filter((order) => {
    if (!order.created_at) return false;
    const d = new Date(order.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalOrdersMonth = monthlyOrders.length;
  const totalPiecesMonth = monthlyOrders.reduce(
    (sum, order) => sum + (order.jumlah_pesanan || 0),
    0
  );
  const activeOrders = orders.filter((order) =>
    ['proses', 'menunggu'].includes(normalizeStatus(order.status))
  ).length;
  const unpaidOrders = orders.filter(
    (order) => normalizePaymentStatus(order.payment_status) !== 'lunas'
  ).length;
  const completedOrders = orders.filter((order) =>
    ['selesai'].includes(normalizeStatus(order.status))
  ).length;
  const completionRate =
    orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0;

  const weeklyBuckets = Array.from({ length: 8 }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (7 - i) * 7);
    return getWeekStart(date);
  });

  const weeklyMap = new Map<string, number>();
  weeklyBuckets.forEach((weekStart) => {
    weeklyMap.set(weekStart.toISOString(), 0);
  });

  orders.forEach((order) => {
    if (!order.created_at) return;
    const weekStart = getWeekStart(new Date(order.created_at)).toISOString();
    if (!weeklyMap.has(weekStart)) return;
    weeklyMap.set(
      weekStart,
      (weeklyMap.get(weekStart) || 0) + (order.jumlah_pesanan || 0)
    );
  });

  const penjualanData = Array.from(weeklyMap.entries()).map(([, value], index) => ({
    minggu: `Minggu ${index + 1}`,
    nilai: value,
  }));

  const statusMap = new Map<string, number>();
  orders.forEach((order) => {
    const key = normalizeStatus(order.status);
    statusMap.set(key, (statusMap.get(key) || 0) + (order.jumlah_pesanan || 0));
  });

  const colorByStatus: Record<string, string> = {
    proses: '#1E3A5F',
    menunggu: '#F59E0B',
    selesai: '#10B981',
    batal: '#EF4444',
  };

  const kategoriData = Array.from(statusMap.entries()).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: colorByStatus[name] || '#64748B',
  }));

  const konsumenMap = new Map<string, number>();
  orders.forEach((order) => {
    const key = (order.konsumen || 'Tanpa Nama').trim();
    konsumenMap.set(key, (konsumenMap.get(key) || 0) + (order.jumlah_pesanan || 0));
  });

  const topKonsumen = Array.from(konsumenMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nama, total]) => ({ nama, total }));

  const recentOrders = orders.slice(0, 5).map((order) => ({
    id: order.id,
    invoice: order.kode_barang || order.id.slice(0, 8),
    konsumen: { nama: order.konsumen || '-' },
    kategori: order.model || '-',
    total_harga: order.jumlah_pesanan || 0,
    status_pesanan: normalizeStatus(order.status),
    status_pembayaran: normalizePaymentStatus(order.payment_status),
    target_selesai: order.tanggal_target_selesai || '-',
  }));

  const paymentSummary = orders.reduce(
    (acc, order) => {
      const payment = normalizePaymentStatus(order.payment_status);
      if (payment === 'belum_bayar') acc.belumBayar += 1;
      if (payment === 'dp') acc.dp += 1;
      if (payment === 'lunas') acc.lunas += 1;
      return acc;
    },
    { belumBayar: 0, dp: 0, lunas: 0, potensiPiutang: 0 }
  );

  const deadlineSoon = orders
    .filter((order) => ['proses', 'menunggu'].includes(normalizeStatus(order.status)))
    .map((order) => {
      const targetDate = parseFlexibleDate(order.tanggal_target_selesai);
      if (!targetDate) return null;
      const daysToDeadline = Math.ceil(
        (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        id: order.id,
        invoice: order.kode_barang || order.id.slice(0, 8),
        konsumen: { nama: order.konsumen || '-' },
        target_selesai: order.tanggal_target_selesai || '-',
        daysToDeadline,
      } satisfies DeadlineOrder;
    })
    .filter((order): order is DeadlineOrder => Boolean(order))
    .filter((order) => order.daysToDeadline <= 7)
    .sort((a, b) => a.daysToDeadline - b.daysToDeadline)
    .slice(0, 4);

  return NextResponse.json({
    stats: {
      totalPenjualanBulanIni: totalOrdersMonth,
      totalProduksiBulanIni: totalPiecesMonth,
      pesananAktif: activeOrders,
      komisiBelumCair: unpaidOrders,
    },
    penjualanData,
    kategoriData,
    topKonsumen,
    recentOrders,
    paymentSummary,
    deadlineSoon,
    completionRate,
    paidOrders: paymentSummary.lunas,
    activeOrdersCount: activeOrders,
  });
}
