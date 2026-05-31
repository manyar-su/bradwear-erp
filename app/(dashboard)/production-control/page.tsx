'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/dialog';
import { BarChart3, Eye, Factory, Search, TimerReset, TriangleAlert } from 'lucide-react';
import { getStatusBadgeVariant } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';

type ProductionOrder = {
  id: string;
  kode_barang: string | null;
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
  normalized_status: string;
  normalized_payment: string;
};

type SizeGroup = {
  model?: string;
  warna?: string;
  gender?: string;
  tangan?: string;
  sakuType?: string;
  sakuColor?: string;
  sizes?: Array<{
    size?: string;
    jumlah?: number;
    namaPerSize?: string;
  }>;
};

type ProductionPayload = {
  source: string;
  stats: {
    totalOrder: number;
    totalQty: number;
    inProgress: number;
    selesai: number;
    belumBayar: number;
    prioritasHigh: number;
    overdue: number;
  };
  tailorWorkload: { namaPenjahit: string; qty: number }[];
  orders: ProductionOrder[];
};

const EMPTY_PAYLOAD: ProductionPayload = {
  source: 'Bradflow orders',
  stats: {
    totalOrder: 0,
    totalQty: 0,
    inProgress: 0,
    selesai: 0,
    belumBayar: 0,
    prioritasHigh: 0,
    overdue: 0,
  },
  tailorWorkload: [],
  orders: [],
};

export default function ProductionControlPage() {
  const { can } = useAuth();
  const canManageProduction = can('production.manage');
  const [data, setData] = useState<ProductionPayload>(EMPTY_PAYLOAD);
  const [isLive, setIsLive] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/production-control', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as ProductionPayload;
        if (!cancelled) {
          setData(payload);
          setIsLive(true);
        }
      } catch {
        // keep empty fallback
      }
    };
    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    return data.orders.filter((order) => {
      const query = search.toLowerCase();
      const matchSearch =
        (order.kode_barang || '').toLowerCase().includes(query) ||
        (order.nama_penjahit || '').toLowerCase().includes(query) ||
        (order.konsumen || '').toLowerCase().includes(query) ||
        (order.cs || '').toLowerCase().includes(query) ||
        (order.model || '').toLowerCase().includes(query);

      const matchStatus =
        statusFilter === 'all' || order.normalized_status === statusFilter;
      const matchPayment =
        paymentFilter === 'all' || order.normalized_payment === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [data.orders, search, statusFilter, paymentFilter]);

  const selectedSizeGroups = useMemo(() => {
    if (!selectedOrder?.size_details) return [];
    if (!Array.isArray(selectedOrder.size_details)) return [];
    return selectedOrder.size_details as SizeGroup[];
  }, [selectedOrder]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Production Control"
        breadcrumbs={[{ label: 'Bradwear', href: '/dashboard' }, { label: 'Production Control' }]}
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Integrasi data dari aplikasi Bradflow (`orders`).
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={isLive ? 'default' : 'secondary'}>
              {isLive ? `Live: ${data.source}` : 'Belum tersambung'}
            </Badge>
            <Badge variant={canManageProduction ? 'default' : 'secondary'}>
              {canManageProduction ? 'Aksi Produksi Aktif' : 'Read Only'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total Order Aktif</p>
              <p className="text-2xl font-bold">{data.stats.totalOrder}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total Qty Produksi</p>
              <p className="text-2xl font-bold">{data.stats.totalQty.toLocaleString('id-ID')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Factory className="w-4 h-4" /> Dalam Proses
              </div>
              <p className="text-2xl font-bold">{data.stats.inProgress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TriangleAlert className="w-4 h-4" /> Lewat Deadline
              </div>
              <p className="text-2xl font-bold text-red-600">{data.stats.overdue}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Daftar Produksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari penjahit, konsumen, cs, kode"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value || 'all')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="proses">Proses</SelectItem>
                    <SelectItem value="beres">Beres/Selesai</SelectItem>
                    <SelectItem value="menunggu">Menunggu</SelectItem>
                    <SelectItem value="batal">Batal</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={paymentFilter}
                  onValueChange={(value) => setPaymentFilter(value || 'all')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Pembayaran</SelectItem>
                    <SelectItem value="sudah_bayar">Sudah Bayar</SelectItem>
                    <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                    <SelectItem value="dp">DP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Penjahit</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Model Detail</TableHead>
                    <TableHead>Jumlah Pesanan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                        Tidak ada data produksi yang cocok dengan filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id}</TableCell>
                        <TableCell className="font-mono font-medium">{order.kode_barang || '-'}</TableCell>
                        <TableCell>{order.nama_penjahit || '-'}</TableCell>
                        <TableCell>{order.model || '-'}</TableCell>
                        <TableCell>{order.model_detail || '-'}</TableCell>
                        <TableCell>{(order.jumlah_pesanan || 0).toLocaleString('id-ID')}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.normalized_status)}>
                            {(order.status || order.normalized_status || '-').toString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Beban Penjahit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.tailorWorkload.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data workload.</p>
              ) : (
                data.tailorWorkload.map((item) => (
                  <div key={item.namaPenjahit} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{item.namaPenjahit}</span>
                      <span>{item.qty.toLocaleString('id-ID')} pcs</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#1E3A5F]"
                        style={{
                          width: `${Math.max(
                            8,
                            Math.round((item.qty / Math.max(1, data.stats.totalQty)) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}

              <div className="pt-4 border-t border-slate-100 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order selesai</span>
                  <span>{data.stats.selesai}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Belum bayar</span>
                  <span>{data.stats.belumBayar}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Priority high</span>
                  <span>{data.stats.prioritasHigh}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sumber update</span>
                  <span className="inline-flex items-center gap-1">
                    <TimerReset className="w-3 h-3" /> Live
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent
            className="max-w-5xl max-h-[90vh] overflow-y-auto"
            overlayClassName="supports-backdrop-filter:backdrop-blur-none bg-black/20"
          >
            <DialogHeader>
              <DialogTitle>
                Detail Production Control {selectedOrder?.kode_barang ? `- ${selectedOrder.kode_barang}` : ''}
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p><span className="text-muted-foreground">Nama Penjahit:</span> {selectedOrder.nama_penjahit || '-'}</p>
                      <p><span className="text-muted-foreground">Nama Konsumen:</span> {selectedOrder.konsumen || '-'}</p>
                      <p><span className="text-muted-foreground">Nama CS:</span> {selectedOrder.cs || '-'}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p><span className="text-muted-foreground">Model Kerjaan:</span> {selectedOrder.model || '-'}</p>
                      <p><span className="text-muted-foreground">Detail Model:</span> {selectedOrder.model_detail || '-'}</p>
                      <p><span className="text-muted-foreground">Jumlah:</span> {(selectedOrder.jumlah_pesanan || 0).toLocaleString('id-ID')} pcs</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p><span className="text-muted-foreground">Status:</span> <Badge className="ml-1" variant={getStatusBadgeVariant(selectedOrder.normalized_status)}>{selectedOrder.normalized_status}</Badge></p>
                      <p><span className="text-muted-foreground">Pembayaran:</span> {selectedOrder.normalized_payment.replace('_', ' ')}</p>
                      <p><span className="text-muted-foreground">Priority:</span> {selectedOrder.priority || '-'}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Informasi Produksi</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <p><span className="text-muted-foreground">Tanggal Order:</span> {selectedOrder.tanggal_order || '-'}</p>
                    <p><span className="text-muted-foreground">Target Selesai:</span> {selectedOrder.tanggal_target_selesai || '-'}</p>
                    <p><span className="text-muted-foreground">Warna:</span> {selectedOrder.warna || '-'}</p>
                    <p><span className="text-muted-foreground">Saku:</span> {selectedOrder.saku_type || '-'} / {selectedOrder.saku_color || '-'}</p>
                    <p><span className="text-muted-foreground">Embroidery:</span> {selectedOrder.embroidery_status || '-'}</p>
                    <p><span className="text-muted-foreground">Catatan Embroidery:</span> {selectedOrder.embroidery_notes || '-'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Detail Size, Tangan, dan Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSizeGroups.length === 0 ? (
                      <p className="text-muted-foreground">Data size belum tersedia.</p>
                    ) : (
                      <div className="space-y-4">
                        {selectedSizeGroups.map((group, index) => (
                          <div key={`${selectedOrder.id}-size-${index}`} className="rounded-lg border border-slate-200 p-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
                              <p><span className="text-muted-foreground">Gender:</span> {group.gender || '-'}</p>
                              <p><span className="text-muted-foreground">Tangan:</span> {group.tangan || '-'}</p>
                              <p><span className="text-muted-foreground">Model:</span> {group.model || selectedOrder.model || '-'}</p>
                              <p><span className="text-muted-foreground">Warna:</span> {group.warna || selectedOrder.warna || '-'}</p>
                              <p><span className="text-muted-foreground">Saku Type:</span> {group.sakuType || selectedOrder.saku_type || '-'}</p>
                              <p><span className="text-muted-foreground">Saku Color:</span> {group.sakuColor || selectedOrder.saku_color || '-'}</p>
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Size</TableHead>
                                  <TableHead>Qty</TableHead>
                                  <TableHead>Nama Per Size</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(group.sizes || []).length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-muted-foreground">
                                      Tidak ada breakdown size.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  (group.sizes || []).map((size, sizeIndex) => (
                                    <TableRow key={`${selectedOrder.id}-${index}-${sizeIndex}`}>
                                      <TableCell>{size.size || '-'}</TableCell>
                                      <TableCell>{(size.jumlah || 0).toLocaleString('id-ID')}</TableCell>
                                      <TableCell>{size.namaPerSize || '-'}</TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Deskripsi Pekerjaan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{selectedOrder.deskripsi_pekerjaan || '-'}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
