'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Search, ScanLine, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStatusBadgeVariant } from '@/lib/utils';

type OrderItem = {
  id: string;
  kode_barang: string | null;
  konsumen_id: string | null;
  nama_penjahit: string | null;
  model: string | null;
  model_detail: string | null;
  jumlah_pesanan: number | null;
  status: string | null;
  payment_status: string | null;
  cs: string | null;
  konsumen: string | null;
  warna: string | null;
  tanggal_order: string | null;
  tanggal_target_selesai: string | null;
  deskripsi_pekerjaan: string | null;
  konsumen_master?: {
    id: string;
    kode_barang: string;
    nama: string;
    telepon: string | null;
    email: string | null;
    assigned_cs: string | null;
  } | null;
};

type OcrResponse = {
  normalized: {
    kodeBarang: string;
    cs: string;
    konsumen: string;
    model: string;
    warna: string;
    tanggalOrder: string;
    tanggalTargetSelesai: string;
    jumlahPesanan: number;
    status: string;
    deskripsiPekerjaan: string;
    sizeDetails: unknown[];
  };
};

type KonsumenOption = {
  id: string;
  kode_barang: string;
  nama: string;
  telepon: string | null;
  email: string | null;
  assigned_cs: string | null;
};

const STATUS_OPTIONS = ['Proses', 'Beres', 'Menunggu', 'Batal'] as const;
const PAYMENT_OPTIONS = ['Belum Bayar', 'DP', 'Sudah Bayar'] as const;

export default function CSDashboardPage() {
  const { can, user } = useAuth();
  const canManageOrders = can('orders.manage');

  const [items, setItems] = useState<OrderItem[]>([]);
  const [konsumenOptions, setKonsumenOptions] = useState<KonsumenOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [konsumenSearch, setKonsumenSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    kode_barang: '',
    konsumen_id: '',
    cs: user?.displayName || '',
    nama_penjahit: '',
    model: '',
    model_detail: '',
    warna: '',
    tanggal_order: '',
    tanggal_target_selesai: '',
    jumlah_pesanan: 0,
    status: 'Proses',
    payment_status: 'Belum Bayar',
    deskripsi_pekerjaan: '',
    size_details: [] as unknown[],
  });

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders', { cache: 'no-store' });
      const data = (await response.json()) as { items?: OrderItem[]; error?: string };
      if (!response.ok) {
        setError(data.error || 'Gagal memuat order.');
        return;
      }
      setItems(data.items || []);
    } catch {
      setError('Tidak bisa terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const loadKonsumenOptions = async () => {
    try {
      const response = await fetch('/api/konsumen', { cache: 'no-store' });
      const data = (await response.json()) as { items?: KonsumenOption[] };
      if (!response.ok) return;
      setKonsumenOptions(data.items || []);
    } catch {
      // keep last loaded options
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void Promise.all([loadOrders(), loadKonsumenOptions()]);
  }, []);

  useEffect(() => {
    if (user?.displayName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((prev) => ({ ...prev, cs: prev.cs || user.displayName }));
    }
  }, [user?.displayName]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = searchTerm.toLowerCase();
      return (
        (item.kode_barang || '').toLowerCase().includes(query) ||
        (item.konsumen || '').toLowerCase().includes(query) ||
        (item.model || '').toLowerCase().includes(query)
      );
    });
  }, [items, searchTerm]);

  const resetForm = () => {
    setForm({
      kode_barang: '',
      konsumen_id: '',
      cs: user?.displayName || '',
      nama_penjahit: '',
      model: '',
      model_detail: '',
      warna: '',
      tanggal_order: '',
      tanggal_target_selesai: '',
      jumlah_pesanan: 0,
      status: 'Proses',
      payment_status: 'Belum Bayar',
      deskripsi_pekerjaan: '',
      size_details: [],
    });
    setKonsumenSearch('');
  };

  const filteredKonsumenOptions = useMemo(() => {
    const query = konsumenSearch.trim().toLowerCase();
    if (!query) return konsumenOptions.slice(0, 100);
    return konsumenOptions
      .filter((item) =>
        item.nama.toLowerCase().includes(query) ||
        item.kode_barang.toLowerCase().includes(query) ||
        (item.telepon || '').toLowerCase().includes(query)
      )
      .slice(0, 100);
  }, [konsumenOptions, konsumenSearch]);

  const selectedKonsumen = useMemo(() => {
    return konsumenOptions.find((item) => item.id === form.konsumen_id) || null;
  }, [konsumenOptions, form.konsumen_id]);

  const applyKonsumenSelection = (konsumenId: string | null) => {
    if (!konsumenId) return;
    const selected = konsumenOptions.find((item) => item.id === konsumenId);
    if (!selected) return;
    setForm((prev) => ({
      ...prev,
      konsumen_id: selected.id,
      kode_barang: prev.kode_barang || selected.kode_barang,
      cs: prev.cs || selected.assigned_cs || '',
    }));
    setKonsumenSearch(selected.nama);
  };

  const submitOrder = async () => {
    if (!form.konsumen_id) {
      setError('Pilih konsumen dari master konsumen terlebih dahulu.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || 'Gagal menyimpan order.');
        return;
      }
      setIsFormOpen(false);
      resetForm();
      await loadOrders();
    } catch {
      setError('Tidak bisa terhubung ke server.');
    } finally {
      setSaving(false);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    setError(null);
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || 'Gagal update status.');
        return;
      }
      await loadOrders();
    } catch {
      setError('Tidak bisa terhubung ke server.');
    }
  };

  const handleOcrFile = async (file: File) => {
    setOcrLoading(true);
    setError(null);
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
        setError(data.error || 'OCR gagal.');
        return;
      }
      const ocr = data.normalized;
      const matchedKonsumen = konsumenOptions.find((item) => {
        const lowerNama = (ocr.konsumen || '').trim().toLowerCase();
        const lowerKode = (ocr.kodeBarang || '').trim().toLowerCase();
        return (
          item.nama.trim().toLowerCase() === lowerNama ||
          item.kode_barang.trim().toLowerCase() === lowerKode
        );
      });
      setForm((prev) => ({
        ...prev,
        kode_barang: ocr.kodeBarang || prev.kode_barang,
        konsumen_id: matchedKonsumen?.id || prev.konsumen_id,
        cs: ocr.cs || prev.cs,
        model: ocr.model || prev.model,
        warna: ocr.warna || prev.warna,
        tanggal_order: ocr.tanggalOrder || prev.tanggal_order,
        tanggal_target_selesai: ocr.tanggalTargetSelesai || prev.tanggal_target_selesai,
        jumlah_pesanan: ocr.jumlahPesanan || prev.jumlah_pesanan,
        status: ocr.status || prev.status,
        deskripsi_pekerjaan: ocr.deskripsiPekerjaan || prev.deskripsi_pekerjaan,
        size_details: ocr.sizeDetails || prev.size_details,
      }));
      if (matchedKonsumen) {
        setKonsumenSearch(matchedKonsumen.nama);
      } else if (ocr.konsumen) {
        setKonsumenSearch(ocr.konsumen);
      }
    } catch {
      setError('Gagal memproses OCR.');
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="CS Dashboard"
        breadcrumbs={[{ label: 'Bradwear', href: '/dashboard' }, { label: 'CS Dashboard' }]}
      />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode/konsumen/model..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="gap-2"
            disabled={!canManageOrders}
          >
            <Plus className="w-4 h-4" />
            Pesanan Baru
          </Button>
        </div>
        {!canManageOrders && (
          <p className="text-xs text-muted-foreground">
            Role Anda hanya bisa melihat antrean. Input pesanan dan update status khusus admin, staff, atau cs.
          </p>
        )}
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Antrean Produksi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Konsumen</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pembayaran</TableHead>
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
                      Tidak ada order.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono font-medium">{item.kode_barang || '-'}</TableCell>
                      <TableCell>{item.konsumen || '-'}</TableCell>
                      <TableCell>{item.model || '-'}</TableCell>
                      <TableCell>{item.jumlah_pesanan || 0}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant((item.status || '').toLowerCase())}>
                          {item.status || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.payment_status || '-'}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(item)}>
                          Detail
                        </Button>
                        {canManageOrders && (
                          <Select
                            onValueChange={(value) => {
                              if (!value) return;
                              void updateOrderStatus(item.id, value);
                            }}
                            defaultValue={item.status || 'Proses'}
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
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
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Pesanan Baru</DialogTitle>
            <DialogDescription>
              Bisa input manual atau scan foto lembar kerja untuk auto-fill OCR.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
                <Input value={form.kode_barang} onChange={(e) => setForm((p) => ({ ...p, kode_barang: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Cari Konsumen</Label>
                <Input
                  value={konsumenSearch}
                  onChange={(e) => setKonsumenSearch(e.target.value)}
                  placeholder="Ketik nama / kode / telepon"
                />
              </div>
              <div className="space-y-1">
                <Label>Pilih Konsumen Master *</Label>
                <Select value={form.konsumen_id} onValueChange={applyKonsumenSelection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih konsumen dari database" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredKonsumenOptions.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        Konsumen tidak ditemukan
                      </SelectItem>
                    ) : (
                      filteredKonsumenOptions.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.nama} - {item.kode_barang}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedKonsumen && (
                  <p className="text-xs text-muted-foreground">
                    Kontak: {selectedKonsumen.telepon || '-'} | CS PIC: {selectedKonsumen.assigned_cs || '-'}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>CS</Label>
                <Input value={form.cs} onChange={(e) => setForm((p) => ({ ...p, cs: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Nama Penjahit</Label>
                <Input value={form.nama_penjahit} onChange={(e) => setForm((p) => ({ ...p, nama_penjahit: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Model</Label>
                <Input value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Model Detail</Label>
                <Input value={form.model_detail} onChange={(e) => setForm((p) => ({ ...p, model_detail: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Warna</Label>
                <Input value={form.warna} onChange={(e) => setForm((p) => ({ ...p, warna: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Jumlah Pesanan</Label>
                <Input
                  type="number"
                  value={form.jumlah_pesanan}
                  onChange={(e) => setForm((p) => ({ ...p, jumlah_pesanan: Number(e.target.value || 0) }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Tanggal Order</Label>
                <Input value={form.tanggal_order} onChange={(e) => setForm((p) => ({ ...p, tanggal_order: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Target Selesai</Label>
                <Input
                  value={form.tanggal_target_selesai}
                  onChange={(e) => setForm((p) => ({ ...p, tanggal_target_selesai: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => {
                    if (!value) return;
                    setForm((p) => ({ ...p, status: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status Pembayaran</Label>
                <Select
                  value={form.payment_status}
                  onValueChange={(value) => {
                    if (!value) return;
                    setForm((p) => ({ ...p, payment_status: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Deskripsi Pekerjaan</Label>
              <Textarea
                value={form.deskripsi_pekerjaan}
                onChange={(e) => setForm((p) => ({ ...p, deskripsi_pekerjaan: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button onClick={submitOrder} disabled={!canManageOrders || saving}>
              {saving ? 'Menyimpan...' : 'Simpan Pesanan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Kode:</span> {selectedOrder.kode_barang || '-'}</p>
              <p><span className="text-muted-foreground">Konsumen:</span> {selectedOrder.konsumen || '-'}</p>
              <p><span className="text-muted-foreground">CS:</span> {selectedOrder.cs || '-'}</p>
              <p><span className="text-muted-foreground">Penjahit:</span> {selectedOrder.nama_penjahit || '-'}</p>
              <p><span className="text-muted-foreground">Model:</span> {selectedOrder.model || '-'}</p>
              <p><span className="text-muted-foreground">Qty:</span> {selectedOrder.jumlah_pesanan || 0}</p>
              <p><span className="text-muted-foreground">Status:</span> {selectedOrder.status || '-'}</p>
              <p><span className="text-muted-foreground">Deskripsi:</span> {selectedOrder.deskripsi_pekerjaan || '-'}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
