'use client';

import { useState } from 'react';
import { Header } from '@/components/shared/Header';
import { DetailModal } from '@/components/shared/DetailModal';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { formatRupiah, getStatusBadgeVariant } from '@/lib/utils';
import { konsumenData, pesananData } from '@/lib/supabase/demo-data';
import type { Konsumen, Pesanan } from '@/types/database';

export default function KonsumenPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedKonsumen, setSelectedKonsumen] = useState<Konsumen | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Pesanan | null>(null);

  const filteredKonsumen = konsumenData.filter((konsumen) => {
    const matchesSearch =
      konsumen.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      konsumen.kode_barang.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || konsumen.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getKonsumenOrders = (konsumenId: string) => {
    return pesananData.filter((p) => p.konsumen_id === konsumenId);
  };

  const getTotalNilai = (konsumenId: string) => {
    return getKonsumenOrders(konsumenId).reduce((sum, p) => sum + p.total_harga, 0);
  };

  const getTotalOrder = (konsumenId: string) => {
    return getKonsumenOrders(konsumenId).length;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Konsumen"
        breadcrumbs={[{ label: 'Bradwear', href: '/dashboard' }, { label: 'Konsumen' }]}
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Konsumen</p>
                  <p className="text-2xl font-bold">{konsumenData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-100">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Konsumen Aktif</p>
                  <p className="text-2xl font-bold">
                    {konsumenData.filter((k) => k.status === 'aktif').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Nilai Order</p>
                  <p className="text-2xl font-bold">
                    {formatRupiah(pesananData.reduce((sum, p) => sum + p.total_harga, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau kode barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Konsumen Baru
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Total Order</TableHead>
                  <TableHead>Total Nilai</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKonsumen.map((konsumen) => (
                  <TableRow key={konsumen.id}>
                    <TableCell>
                      <button
                        onClick={() => setSelectedKonsumen(konsumen)}
                        className="font-mono font-bold text-primary hover:underline"
                      >
                        {konsumen.kode_barang}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setSelectedKonsumen(konsumen)}
                        className="font-medium hover:text-primary"
                      >
                        {konsumen.nama}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {konsumen.telepon && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {konsumen.telepon}
                          </div>
                        )}
                        {konsumen.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {konsumen.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTotalOrder(konsumen.id)} order</TableCell>
                    <TableCell className="font-medium">
                      {formatRupiah(getTotalNilai(konsumen.id))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(konsumen.status)} className="capitalize">
                        {konsumen.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedKonsumen(konsumen)}
                      >
                        Lihat Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredKonsumen.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada konsumen yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal - Click on konsumen to show first order */}
      <DetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        data={selectedOrder}
      />

      {/* Konsumen Detail Modal - Shows first order of the selected konsumen */}
      {selectedKonsumen && !selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedKonsumen(null)}
          />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-scale-in">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-primary">{selectedKonsumen.nama}</h2>
                  <p className="text-sm text-muted-foreground">
                    Kode Barang: <span className="font-mono font-bold">{selectedKonsumen.kode_barang}</span>
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedKonsumen.status)} className="capitalize">
                  {selectedKonsumen.status}
                </Badge>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <h3 className="font-medium text-muted-foreground">Informasi Kontak</h3>
                <div className="grid grid-cols-1 gap-2">
                  {selectedKonsumen.alamat && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <span>{selectedKonsumen.alamat}</span>
                    </div>
                  )}
                  {selectedKonsumen.telepon && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedKonsumen.telepon}</span>
                    </div>
                  )}
                  {selectedKonsumen.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedKonsumen.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Order</p>
                  <p className="text-2xl font-bold">{getTotalOrder(selectedKonsumen.id)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Nilai</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatRupiah(getTotalNilai(selectedKonsumen.id))}
                  </p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="space-y-2">
                <h3 className="font-medium text-muted-foreground">Riwayat Pesanan</h3>
                {getKonsumenOrders(selectedKonsumen.id).length > 0 ? (
                  <div className="space-y-2">
                    {getKonsumenOrders(selectedKonsumen.id).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100"
                        onClick={() => {
                          setSelectedOrder(order);
                          setSelectedKonsumen(null);
                        }}
                      >
                        <div>
                          <p className="font-mono font-medium">Invoice {order.invoice}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.kategori} - {order.jumlah_total} pcs
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatRupiah(order.total_harga)}</p>
                          <Badge
                            variant={getStatusBadgeVariant(order.status_pesanan)}
                            className="capitalize text-xs"
                          >
                            {order.status_pesanan}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Belum ada pesanan</p>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedKonsumen(null)}>
                Tutup
              </Button>
              <Button>Edit Konsumen</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
