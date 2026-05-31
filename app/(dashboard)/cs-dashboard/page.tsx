'use client';

import { useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
} from 'lucide-react';
import { formatRupiah, formatTanggal, getStatusBadgeVariant } from '@/lib/utils';
import { pesananData, konsumenData, affiliateData } from '@/lib/supabase/demo-data';
import type { Pesanan } from '@/types/database';
import {
  KATEGORI_OPTIONS,
  TIPE_LENGAN_OPTIONS,
  POTONGAN_OPTIONS,
  SIZE_OPTIONS,
  STATUS_PESANAN_OPTIONS,
} from '@/lib/constants';
import { useAuth } from '@/components/providers/AuthProvider';

export default function CSDashboardPage() {
  const { can } = useAuth();
  const canManageOrders = can('orders.manage');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Pesanan | null>(null);

  const filteredOrders = pesananData.filter((order) => {
    const matchesSearch =
      order.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.konsumen?.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status_pesanan === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    menunggu: pesananData.filter((o) => o.status_pesanan === 'menunggu').length,
    proses: pesananData.filter((o) => o.status_pesanan === 'proses').length,
    selesai: pesananData.filter((o) => o.status_pesanan === 'selesai').length,
    diambil: pesananData.filter((o) => o.status_pesanan === 'diambil').length,
    batal: pesananData.filter((o) => o.status_pesanan === 'batal').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'menunggu':
        return <Clock className="w-4 h-4" />;
      case 'proses':
        return <Package className="w-4 h-4" />;
      case 'selesai':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'diambil':
        return <Truck className="w-4 h-4" />;
      case 'batal':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="CS Dashboard"
        breadcrumbs={[{ label: 'Bradwear', href: '/dashboard' }, { label: 'CS Dashboard' }]}
      />

      <div className="p-6 space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {STATUS_PESANAN_OPTIONS.map((status) => (
            <Card
              key={status.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                statusFilter === status.value ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() =>
                setStatusFilter(statusFilter === status.value ? 'all' : status.value)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{status.label}</p>
                    <p className="text-2xl font-bold">
                      {statusCounts[status.value as keyof typeof statusCounts] || 0}
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-lg ${
                      status.value === 'menunggu'
                        ? 'bg-yellow-100 text-yellow-600'
                        : status.value === 'proses'
                          ? 'bg-blue-100 text-blue-600'
                          : status.value === 'selesai'
                            ? 'bg-green-100 text-green-600'
                            : status.value === 'diambil'
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {getStatusIcon(status.value)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari invoice atau konsumen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
          </div>
          <Button
            onClick={() => canManageOrders && setIsFormOpen(true)}
            className="gap-2"
            disabled={!canManageOrders}
          >
            <Plus className="w-4 h-4" />
            Pesanan Baru
          </Button>
        </div>
        {!canManageOrders && (
          <p className="text-xs text-muted-foreground">
            Role Anda hanya bisa melihat antrean. Aksi tambah pesanan dan update status khusus admin, staff, atau cs.
          </p>
        )}

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Antrean Produksi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Konsumen</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell className="font-mono font-medium">{order.invoice}</TableCell>
                    <TableCell>{formatTanggal(order.tanggal_order)}</TableCell>
                    <TableCell className="font-medium">{order.konsumen?.nama || '-'}</TableCell>
                    <TableCell className="capitalize">{order.kategori}</TableCell>
                    <TableCell>{order.jumlah_total} pcs</TableCell>
                    <TableCell className="font-medium">{formatRupiah(order.total_harga)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(order.status_pesanan)}
                        className="capitalize"
                      >
                        {order.status_pesanan}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.cs_id}</TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Tidak ada pesanan yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pesanan {selectedOrder.invoice}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Konsumen</Label>
                  <p className="font-medium">{selectedOrder.konsumen?.nama || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kategori</Label>
                  <p className="font-medium capitalize">{selectedOrder.kategori}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Model</Label>
                  <p className="font-medium">{selectedOrder.model}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Jumlah</Label>
                  <p className="font-medium">{selectedOrder.jumlah_total} pcs</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(selectedOrder.status_pesanan)} className="capitalize">
                    {selectedOrder.status_pesanan}
                  </Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Tutup
              </Button>
              <Button disabled={!canManageOrders}>Update Status</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Order Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={(open) => canManageOrders && setIsFormOpen(open)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Pesanan Baru</DialogTitle>
          </DialogHeader>
          <form className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Konsumen *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih konsumen" />
                  </SelectTrigger>
                  <SelectContent>
                    {konsumenData.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.nama} ({k.kode_barang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select defaultValue="kemeja">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORI_OPTIONS.map((k) => (
                      <SelectItem key={k.value} value={k.value}>
                        {k.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>CS *</Label>
                <Input placeholder="Nama CS" defaultValue="Siti" />
              </div>
              <div className="space-y-2">
                <Label>Affiliate (Opsional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih affiliate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tidak ada</SelectItem>
                    {affiliateData.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tanggal Order *</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label>Target Selesai</Label>
                <Input type="date" />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <h3 className="font-medium">Detail Produk</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input placeholder="Contoh: Brad V2" />
                </div>
                <div className="space-y-2">
                  <Label>Tipe Lengan</Label>
                  <Select defaultValue="panjang">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPE_LENGAN_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Potongan</Label>
                  <Select defaultValue="pria">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POTONGAN_OPTIONS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bentuk Bawah</Label>
                  <Input placeholder="Contoh: Regular fit" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Detail Saku</Label>
                <Textarea placeholder="Deskripsikan detail saku..." />
              </div>
            </div>

            {/* Size Chart */}
            <div className="space-y-4">
              <h3 className="font-medium">Tabel Ukuran & Jumlah</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Laki-Laki */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-blue-600">Laki-Laki</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {SIZE_OPTIONS.map((size) => (
                      <div key={size} className="space-y-1">
                        <Label className="text-xs">{size}</Label>
                        <Input type="number" min="0" defaultValue="0" className="h-8" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Perempuan */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-pink-600">Perempuan</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {SIZE_OPTIONS.map((size) => (
                      <div key={size} className="space-y-1">
                        <Label className="text-xs">{size}</Label>
                        <Input type="number" min="0" defaultValue="0" className="h-8" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Harga</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Status Pembayaran</Label>
                <Select defaultValue="dp">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                    <SelectItem value="dp">DP</SelectItem>
                    <SelectItem value="lunas">Lunas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button disabled={!canManageOrders}>Simpan Pesanan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
