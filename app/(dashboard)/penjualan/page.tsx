'use client';

import { useState } from 'react';
import { Header } from '@/components/shared/Header';
import { DetailModal } from '@/components/shared/DetailModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Download, Eye } from 'lucide-react';
import { formatRupiah, formatShortDate, getStatusBadgeVariant } from '@/lib/utils';
import { pesananData } from '@/lib/supabase/demo-data';
import type { Pesanan } from '@/types/database';
import { useAuth } from '@/components/providers/AuthProvider';

export default function PenjualanPage() {
  const { can } = useAuth();
  const canManageFinance = can('keuangan.manage');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatusBayar, setFilterStatusBayar] = useState('all');
  const [filterStatusPesanan, setFilterStatusPesanan] = useState('all');
  const [filterKategori, setFilterKategori] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOrder, setSelectedOrder] = useState<Pesanan | null>(null);

  const filteredOrders = pesananData.filter((order) => {
    const matchesSearch =
      order.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.konsumen?.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBayar = filterStatusBayar === 'all' || order.status_pembayaran === filterStatusBayar;
    const matchesPesanan = filterStatusPesanan === 'all' || order.status_pesanan === filterStatusPesanan;
    const matchesKategori = filterKategori === 'all' || order.kategori === filterKategori;

    // Date filter
    if (dateRange.start && new Date(order.tanggal_order) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(order.tanggal_order) > new Date(dateRange.end)) return false;

    return matchesSearch && matchesBayar && matchesPesanan && matchesKategori;
  });

  const stats = {
    totalTransaksi: filteredOrders.length,
    totalNilai: filteredOrders.reduce((sum, o) => sum + o.total_harga, 0),
    avgOrderValue: filteredOrders.length > 0 ? filteredOrders.reduce((sum, o) => sum + o.total_harga, 0) / filteredOrders.length : 0,
  };

  const statusBayarCounts = {
    lunas: pesananData.filter((o) => o.status_pembayaran === 'lunas').length,
    dp: pesananData.filter((o) => o.status_pembayaran === 'dp').length,
    belum_bayar: pesananData.filter((o) => o.status_pembayaran === 'belum_bayar').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Penjualan"
        breadcrumbs={[{ label: 'Bradwear', href: '/dashboard' }, { label: 'Penjualan' }]}
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Transaksi</p>
              <p className="text-2xl font-bold">{stats.totalTransaksi}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Nilai</p>
              <p className="text-2xl font-bold text-primary">{formatRupiah(stats.totalNilai)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Rata-rata Order</p>
              <p className="text-2xl font-bold">{formatRupiah(stats.avgOrderValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-700 border-green-200">{statusBayarCounts.lunas} Lunas</Badge>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">{statusBayarCounts.dp} DP</Badge>
                  <Badge variant="secondary">{statusBayarCounts.belum_bayar} Belum</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Filter Transaksi</CardTitle>
              <Button variant="outline" size="sm" className="gap-2" disabled={!canManageFinance}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari invoice atau konsumen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatusBayar} onValueChange={(value) => setFilterStatusBayar(value || 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Status Bayar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status Bayar</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                  <SelectItem value="dp">DP</SelectItem>
                  <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatusPesanan} onValueChange={(value) => setFilterStatusPesanan(value || 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Status Pesanan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="menunggu">Menunggu</SelectItem>
                  <SelectItem value="proses">Dalam Proses</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                  <SelectItem value="diambil">Diambil</SelectItem>
                  <SelectItem value="batal">Batal</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterKategori} onValueChange={(value) => setFilterKategori(value || 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="kemeja">Kemeja</SelectItem>
                  <SelectItem value="jaket">Jaket</SelectItem>
                  <SelectItem value="celana">Celana</SelectItem>
                  <SelectItem value="vest">Vest/Rompi</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full"
                />
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {!canManageFinance && (
          <p className="text-xs text-muted-foreground">
            Role Anda bisa melihat data penjualan, namun export dibatasi untuk admin dan staff.
          </p>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Konsumen</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status Bayar</TableHead>
                  <TableHead>Status Pesanan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono font-medium">{order.invoice}</TableCell>
                    <TableCell>{formatShortDate(order.tanggal_order)}</TableCell>
                    <TableCell className="font-medium">{order.konsumen?.nama || '-'}</TableCell>
                    <TableCell className="capitalize">{order.kategori}</TableCell>
                    <TableCell>{order.jumlah_total} pcs</TableCell>
                    <TableCell className="font-medium">{formatRupiah(order.total_harga)}</TableCell>
                    <TableCell>
                      <Badge
                        className={`capitalize ${
                          order.status_pembayaran === 'lunas'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : order.status_pembayaran === 'dp'
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {order.status_pembayaran === 'dp' ? 'DP' : order.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum Bayar'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status_pesanan)} className="capitalize">
                        {order.status_pesanan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4" />
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Tidak ada transaksi yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        data={selectedOrder}
      />
    </div>
  );
}
