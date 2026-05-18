'use client';

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
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  ArrowRight,
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

export default function DashboardPage() {
  const stats = getDashboardStats();
  const penjualanData = getPenjualanChartData();
  const kategoriData = getKategoriChartData();
  const topKonsumen = getTopKonsumen();
  const recentOrders = pesananData.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Dashboard"
        breadcrumbs={[{ label: 'Bradwear' }, { label: 'Dashboard' }]}
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Penjualan Bulan Ini"
            value={stats.totalPenjualanBulanIni}
            icon={DollarSign}
            isCurrency
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
            title="Komisi Belum Cair"
            value={stats.komisiBelumCair}
            icon={TrendingUp}
            isCurrency
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Penjualan Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Trend Penjualan (12 Minggu Terakhir)</CardTitle>
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
                      tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}jt`}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [formatRupiah(value as number), 'Nilai']}
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
              <CardTitle>Produksi per Kategori</CardTitle>
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
              <CardTitle>Top 5 Konsumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topKonsumen} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}jt`}
                    />
                    <YAxis
                      dataKey="nama"
                      type="category"
                      tick={{ fontSize: 11 }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value) => [formatRupiah(value as number), 'Total']}
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
                    <TableHead>Kategori</TableHead>
                    <TableHead>Total</TableHead>
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
                      <TableCell className="capitalize">{order.kategori}</TableCell>
                      <TableCell className="font-medium">
                        {formatRupiah(order.total_harga)}
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