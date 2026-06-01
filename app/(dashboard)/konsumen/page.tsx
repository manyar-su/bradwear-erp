'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Plus, Search, Users, ScanLine, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatRupiah, getStatusBadgeVariant } from '@/lib/utils';

type KonsumenItem = {
  id: string;
  kode_barang: string;
  nama: string;
  telepon: string | null;
  email: string | null;
  alamat: string | null;
  catatan: string | null;
  status: 'aktif' | 'nonaktif';
  created_by_email: string | null;
  created_at: string;
  updated_at: string;
  total_order: number;
  total_qty: number;
};

type OcrResponse = {
  normalized: {
    kodeBarang: string;
    cs: string;
    konsumen: string;
    model: string;
    tanggalOrder: string;
    tanggalTargetSelesai: string;
    jumlahPesanan: number;
    deskripsiPekerjaan: string;
  };
};

export default function KonsumenPage() {
  const { can } = useAuth();
  const canManageKonsumen = can('konsumen.manage');

  const [items, setItems] = useState<KonsumenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [selectedKonsumen, setSelectedKonsumen] = useState<KonsumenItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    kode_barang: '',
    nama: '',
    telepon: '',
    email: '',
    alamat: '',
    catatan: '',
    status: 'aktif' as 'aktif' | 'nonaktif',
  });

  const loadKonsumen = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await fetch('/api/konsumen', { cache: 'no-store' });
      const data = (await response.json()) as { items?: KonsumenItem[]; error?: string };
      if (!response.ok) {
        setFetchError(data.error || 'Gagal memuat data konsumen.');
        return;
      }
      setItems(data.items || []);
    } catch {
      setFetchError('Tidak bisa terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadKonsumen();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kode_barang.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const totalQty = items.reduce((sum, item) => sum + item.total_qty, 0);

  const resetForm = () => {
    setForm({
      kode_barang: '',
      nama: '',
      telepon: '',
      email: '',
      alamat: '',
      catatan: '',
      status: 'aktif',
    });
  };

  const submitKonsumen = async () => {
    setSaving(true);
    setFetchError(null);
    try {
      const response = await fetch('/api/konsumen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFetchError(data.error || 'Gagal menyimpan konsumen.');
        return;
      }
      setIsFormOpen(false);
      resetForm();
      await loadKonsumen();
    } catch {
      setFetchError('Tidak bisa terhubung ke server.');
    } finally {
      setSaving(false);
    }
  };

  const handleOcrFile = async (file: File) => {
    setOcrLoading(true);
    setFetchError(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const value = String(reader.result || '');
          const encoded = value.includes(',') ? value.split(',')[1] : value;
          resolve(encoded);
        };
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/ocr/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = (await response.json()) as OcrResponse & { error?: string };
      if (!response.ok) {
        setFetchError(data.error || 'OCR gagal.');
        return;
      }

      const ocr = data.normalized;
      setForm((prev) => ({
        ...prev,
        kode_barang: ocr.kodeBarang || prev.kode_barang,
        nama: ocr.konsumen || prev.nama,
        catatan: [prev.catatan, ocr.deskripsiPekerjaan].filter(Boolean).join('\n'),
      }));
    } catch {
      setFetchError('Gagal memproses OCR.');
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Konsumen"
        breadcrumbs={[{ label: 'Bradwear', href: '/dashboard' }, { label: 'Konsumen' }]}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Konsumen</p>
                  <p className="text-2xl font-bold">{items.length}</p>
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
                  <p className="text-2xl font-bold">{items.filter((item) => item.status === 'aktif').length}</p>
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
                  <p className="text-sm text-muted-foreground">Estimasi Volume</p>
                  <p className="text-2xl font-bold">{formatRupiah(totalQty)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau kode barang..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (!value) return;
                setStatusFilter(value);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="gap-2"
            disabled={!canManageKonsumen}
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Konsumen Baru
          </Button>
        </div>

        {!canManageKonsumen && (
          <p className="text-xs text-muted-foreground">
            Role Anda hanya bisa melihat data konsumen. Aksi tambah/edit khusus admin, staff, atau cs.
          </p>
        )}
        {fetchError && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {fetchError}
          </p>
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Total Order</TableHead>
                  <TableHead>Total Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada konsumen yang ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono font-bold text-primary">{item.kode_barang}</TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell className="text-sm">
                        <p>{item.telepon || '-'}</p>
                        <p className="text-muted-foreground">{item.email || '-'}</p>
                      </TableCell>
                      <TableCell>{item.total_order}</TableCell>
                      <TableCell>{item.total_qty}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(item.status)} className="capitalize">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedKonsumen(item)}>
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
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Konsumen Baru</DialogTitle>
            <DialogDescription>
              Input manual atau upload foto lembar kerja agar field terisi otomatis dari OCR.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleOcrFile(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={ocrLoading}
            >
              {ocrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
              {ocrLoading ? 'Memproses OCR...' : 'Scan Foto (OCR)'}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Kode Barang *</Label>
                <Input
                  value={form.kode_barang}
                  onChange={(event) => setForm((prev) => ({ ...prev, kode_barang: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Nama Konsumen *</Label>
                <Input
                  value={form.nama}
                  onChange={(event) => setForm((prev) => ({ ...prev, nama: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Telepon</Label>
                <Input
                  value={form.telepon}
                  onChange={(event) => setForm((prev) => ({ ...prev, telepon: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Alamat</Label>
              <Input
                value={form.alamat}
                onChange={(event) => setForm((prev) => ({ ...prev, alamat: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Catatan</Label>
              <Textarea
                value={form.catatan}
                onChange={(event) => setForm((prev) => ({ ...prev, catatan: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => {
                  if (!value) return;
                  setForm((prev) => ({ ...prev, status: value as 'aktif' | 'nonaktif' }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button onClick={submitKonsumen} disabled={!canManageKonsumen || saving}>
              {saving ? 'Menyimpan...' : 'Simpan Konsumen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedKonsumen} onOpenChange={() => setSelectedKonsumen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedKonsumen?.nama}</DialogTitle>
          </DialogHeader>
          {selectedKonsumen && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Kode Barang:</span> {selectedKonsumen.kode_barang}
              </p>
              <p>
                <span className="text-muted-foreground">Telepon:</span> {selectedKonsumen.telepon || '-'}
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span> {selectedKonsumen.email || '-'}
              </p>
              <p>
                <span className="text-muted-foreground">Alamat:</span> {selectedKonsumen.alamat || '-'}
              </p>
              <p>
                <span className="text-muted-foreground">Catatan:</span> {selectedKonsumen.catatan || '-'}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
