'use client';

import { useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Package,
  ArrowDownCircle,
  Scissors,
  Palette,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { formatRupiah, formatShortDate } from '@/lib/utils';
import { belanjaBahanData } from '@/lib/supabase/demo-data';

const KATEGORI_INFO = {
  kain: { label: 'Kain', icon: Package, color: 'bg-blue-100 text-blue-600' },
  kancing: { label: 'Kancing', icon: ArrowDownCircle, color: 'bg-amber-100 text-amber-600' },
  benang: { label: 'Benang', icon: Scissors, color: 'bg-green-100 text-green-600' },
  bordir: { label: 'Jasa Bordir', icon: Palette, color: 'bg-purple-100 text-purple-600' },
  produksi: { label: 'Biaya Produksi', icon: Settings, color: 'bg-pink-100 text-pink-600' },
  lainnya: { label: 'Lainnya', icon: MoreHorizontal, color: 'bg-slate-100 text-slate-600' },
};

export default function BelanjaBahanPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredData = belanjaBahanData.filter((item) => {
    const matchesSearch = item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKategori = filterKategori === 'all' || item.kategori === filterKategori;

    if (dateRange.start && new Date(item.tanggal) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(item.tanggal) > new Date(dateRange.end)) return false;

    return matchesSearch && matchesKategori;
  });

  const totalBelanja = filteredData.reduce((sum, item) => sum + item.jumlah, 0);

  const categoryTotals = KATEGORI_INFO ? Object.entries(KATEGORI_INFO).reduce((acc, [key]) => {
    acc[key] = belanjaBahanData
      .filter((item) => item.kategori === key)
      .reduce((sum, item) => sum + item.jumlah, 0);
    return acc;
  }, {} as Record<string, number>) : {};

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Belanja Bahan"
        breadcrumbs={[{ label: 'Bradwear', href: '/dashboard' }, { label: 'Belanja Bahan' }]}
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-primary">{formatRupiah(totalBelanja)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Jumlah Transaksi</p>
              <p className="text-2xl font-bold">{filteredData.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Rata-rata</p>
              <p className="text-2xl font-bold">{formatRupiah(totalBelanja / (filteredData.length || 1))}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Per Kategori</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(categoryTotals).map(([key, value]) => {
                  const info = KATEGORI_INFO[key as keyof typeof KATEGORI_INFO];
                  if (!info || value === 0) return null;
                  return (
                    <Badge key={key} variant="outline" className="text-xs">
                      {info.label}: {formatRupiah(value)}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Log Pengeluaran</CardTitle>
              <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Input Pengeluaran
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari deskripsi atau vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterKategori} onValueChange={(value) => setFilterKategori(value || 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="kain">Kain</SelectItem>
                  <SelectItem value="kancing">Kancing</SelectItem>
                  <SelectItem value="benang">Benang</SelectItem>
                  <SelectItem value="bordir">Jasa Bordir</SelectItem>
                  <SelectItem value="produksi">Biaya Produksi</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full"
                  placeholder="Dari"
                />
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full"
                  placeholder="Sampai"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => {
                  const info = KATEGORI_INFO[item.kategori as keyof typeof KATEGORI_INFO];
                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50">
                      <TableCell>{formatShortDate(item.tanggal)}</TableCell>
                      <TableCell>
                        <Badge className={`${info?.color || ''}`}>
                          {info?.icon && <info.icon className="w-3 h-3 mr-1" />}
                          {info?.label || item.kategori}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.deskripsi}</TableCell>
                      <TableCell className="text-muted-foreground">{item.vendor || '-'}</TableCell>
                      <TableCell className="text-right font-medium">{formatRupiah(item.jumlah)}</TableCell>
                    </TableRow>
                  );
                })}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Tidak ada data pengeluaran yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Input Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Input Pengeluaran Baru</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal *</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select defaultValue="kain">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kain">Kain</SelectItem>
                    <SelectItem value="kancing">Kancing</SelectItem>
                    <SelectItem value="benang">Benang</SelectItem>
                    <SelectItem value="bordir">Jasa Bordir</SelectItem>
                    <SelectItem value="produksi">Biaya Produksi</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi *</Label>
              <Textarea placeholder="Deskripsikan item yang dibeli..." />
            </div>
            <div className="space-y-2">
              <Label>Vendor / Toko</Label>
              <Input placeholder="Nama vendor atau toko" />
            </div>
            <div className="space-y-2">
              <Label>Jumlah (Rupiah) *</Label>
              <Input type="number" placeholder="0" />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
