'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/shared/Header';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ShoppingCart,
  Package,
  Clock,
  TrendingUp,
  ArrowRight,
  CalendarClock,
  ClipboardCheck,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { formatRupiah, getStatusBadgeVariant } from '@/lib/utils';
import {
  getDashboardStats,
  getPenjualanChartData,
  getKategoriChartData,
  getTopKonsumen,
  pesananData,
} from '@/lib/supabase/demo-data';

type DashboardPayload = {
  stats: {
    totalPenjualanBulanIni: number;
    totalProduksiBulanIni: number;
    pesananAktif: number;
    komisiBelumCair: number;
  };
  penjualanData: { minggu: string; nilai: number }[];
  kategoriData: { name: string; value: number; color: string }[];
  topKonsumen: { nama: string; total: number }[];
  recentOrders: {
    id: string;
    invoice: string;
    konsumen?: { nama?: string };
    kategori: string;
    total_harga: number;
    status_pesanan: string;
    status_pembayaran: string;
    target_selesai?: string;
  }[];
  paymentSummary?: {
    belumBayar: number;
    dp: number;
    lunas: number;
    potensiPiutang: number;
  };
  deadlineSoon?: {
    id: string;
    invoice: string;
    konsumen?: { nama?: string };
    target_selesai?: string;
    daysToDeadline: number;
  }[];
  completionRate?: number;
  paidOrders?: number;
  activeOrdersCount?: number;
};

export default function DashboardPage() {
  const [isLiveData, setIsLiveData] = useState(false);
  const initialData: DashboardPayload = useMemo(
    () => ({
      stats: getDashboardStats(),
      penjualanData: getPenjualanChartData(),
      kategoriData: getKategoriChartData(),
      topKonsumen: getTopKonsumen(),
      recentOrders: pesananData.slice(0, 5),
      paymentSummary: pesananData.reduce(
        (acc, order) => {
          if (order.status_pembayaran === 'belum_bayar') acc.belumBayar += 1;
          if (order.status_pembayaran === 'dp') acc.dp += 1;
          if (order.status_pembayaran === 'lunas') acc.lunas += 1;
          return acc;
        },
        { belumBayar: 0, dp: 0, lunas: 0, potensiPiutang: 0 }
      ),
      completionRate:
        pesananData.length > 0
          ? Math.round(
              (pesananData.filter((order) =>
                ['selesai', 'diambil'].includes(order.status_pesanan)
              ).length /
                pesananData.length) *
                100
            )
          : 0,
      paidOrders: pesananData.filter((order) => order.status_pembayaran === 'lunas')
        .length,
      activeOrdersCount: pesananData.filter((order) =>
        ['menunggu', 'proses'].includes(order.status_pesanan)
      ).length,
      deadlineSoon: [],
    }),
    []
  );
  const [dashboardData, setDashboardData] = useState<DashboardPayload>(initialData);

  useEffect(() => {
    let cancelled = false;
    const loadLiveData = async () => {
      try {
        const response = await fetch('/api/dashboard/live', { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as DashboardPayload;
        if (!cancelled) {
          setDashboardData(data);
          setIsLiveData(true);
        }
      } catch {
        // Keep fallback demo data when live API is unavailable.
      }
    };
    void loadLiveData();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = dashboardData.stats;
  const penjualanData = dashboardData.penjualanData;
  const kategoriData = dashboardData.kategoriData;
  const topKonsumen = dashboardData.topKonsumen;
  const recentOrders = dashboardData.recentOrders;
  const paymentSummary = dashboardData.paymentSummary || {
    belumBayar: 0,
    dp: 0,
    lunas: 0,
    potensiPiutang: 0,
  };
  const deadlineSoon = dashboardData.deadlineSoon || [];
  const completionRate = dashboardData.completionRate || 0;
  const paidOrders = dashboardData.paidOrders || 0;
  const activeOrdersCount = dashboardData.activeOrdersCount || stats.pesananAktif;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Dashboard"
        breadcrumbs={[{ label: 'Bradwear', href: '/dashboard' }, { label: 'Dashboard' }]}
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Order Bulan Ini"
            value={stats.totalPenjualanBulanIni}
            icon={ShoppingCart}
            trend={{ value: 12.5, label: 'dari bulan lalu', positive: true }}
          />
          <StatsCard
            title="Total Produksi Bulan Ini"
            value={stats.totalProduksiBulanIni}
            subtitle="pcs"
            icon={Package}
            trend={{ value: 8.2, label: 'dari bulan lalu', positive: true }}
          />
          <StatsCard
            title="Pesanan Aktif"
            value={stats.pesananAktif}
            subtitle="sedang diproses"
            icon={Clock}
          />
          <StatsCard
            title="Order Belum Lunas"
            value={stats.komisiBelumCair}
            icon={TrendingUp}
            subtitle="perlu follow-up"
          />
        </div>

        <div className="flex items-center justify-end">
          <Badge variant={isLiveData ? 'default' : 'secondary'}>
            {isLiveData ? 'Data live Supabase' : 'Data demo (fallback)'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="w-4 h-4 text-primary" />
                Status Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Belum Bayar</span>
                <Badge variant="destructive">{paymentSummary.belumBayar} order</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">DP</span>
                <Badge variant="secondary">{paymentSummary.dp} order</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lunas</span>
                <Badge>{paymentSummary.lunas} order</Badge>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-muted-foreground">
                  Potensi piutang (estimasi):
                </p>
                <p className="text-lg font-semibold">
                  {paymentSummary.potensiPiutang > 0
                    ? formatRupiah(paymentSummary.potensiPiutang)
                    : '-'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Estimasi: order DP dihitung sisa 50%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="w-4 h-4 text-primary" />
                Deadline 7 Hari
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deadlineSoon.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Tidak ada deadline dekat untuk pesanan aktif.
                </p>
              ) : (
                <div className="space-y-3">
                  {deadlineSoon.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{order.konsumen?.nama || order.invoice}</p>
                        <p className="text-xs text-muted-foreground">
                          Target {order.target_selesai}
                        </p>
                      </div>
                      <Badge variant={order.daysToDeadline <= 2 ? 'destructive' : 'secondary'}>
                        {order.daysToDeadline < 0
                          ? `${Math.abs(order.daysToDeadline)} hari lewat`
                          : `H-${order.daysToDeadline}`}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                Ringkasan Eksekusi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Order aktif saat ini</p>
                <p className="text-2xl font-bold">{activeOrdersCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Order lunas</p>
                <p className="text-2xl font-bold">{paidOrders}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rasio penyelesaian order</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Penjualan Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Trend Volume Order (8 Minggu Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={penjualanData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="minggu"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value} pcs`}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} pcs`, 'Volume']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="nilai"
                      stroke="#1E3A5F"
                      strokeWidth={3}
                      dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#F59E0B' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Kategori Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Status Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kategoriData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {kategoriData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} pcs`, 'Jumlah']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Konsumen */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Konsumen (Volume)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topKonsumen} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `${value} pcs`}
                    />
                    <YAxis
                      dataKey="nama"
                      type="category"
                      tick={{ fontSize: 11 }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} pcs`, 'Total']}
                    />
                    <Bar dataKey="total" fill="#1E3A5F" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pesanan Terbaru</CardTitle>
              <Link
                href="/penjualan"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Lihat semua <ArrowRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Konsumen</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">
                        {order.invoice}
                      </TableCell>
                      <TableCell>{order.konsumen?.nama || '-'}</TableCell>
                      <TableCell>{order.target_selesai || '-'}</TableCell>
                      <TableCell className="capitalize">{order.kategori}</TableCell>
                      <TableCell className="capitalize">
                        {order.status_pembayaran.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.total_harga.toLocaleString('id-ID')} pcs
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(order.status_pesanan)}
                          className="capitalize"
                        >
                          {order.status_pesanan}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
