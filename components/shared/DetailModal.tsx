'use client';

import { X, Printer, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatRupiah, formatTanggal, getStatusBadgeVariant } from '@/lib/utils';
import type { Pesanan } from '@/types/database';
import { useState } from 'react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Pesanan | null;
}

export function DetailModal({ isOpen, onClose, data }: DetailModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const sizeLabels: Record<string, string> = {
    S: 'S (Small)',
    M: 'M (Medium)',
    L: 'L (Large)',
    XL: 'XL (Extra Large)',
    '2XL': '2XL',
    '3XL': '3XL',
    '4XL': '4XL',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col pointer-events-auto animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-primary">FORM LEMBAR KERJA</h2>
              <p className="text-sm text-muted-foreground">Detail Pesanan Produksi</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6 print-area">
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">Invoice:</span>
                    <span className="font-mono font-bold text-lg">{data.invoice}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">Tanggal:</span>
                    <span>{formatTanggal(data.tanggal_order)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">Target:</span>
                    <span>{data.target_selesai ? formatTanggal(data.target_selesai) : '-'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">CS:</span>
                    <span className="font-medium">{data.cs_id}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">Kategori:</span>
                    <Badge variant="outline" className="capitalize">{data.kategori}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">Status:</span>
                    <Badge variant={getStatusBadgeVariant(data.status_pesanan)} className="capitalize">
                      {data.status_pesanan}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Konsumen Info */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <h3 className="font-bold text-primary mb-3">DATA KONSUMEN</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">Konsumen:</span>
                    <span className="font-medium">{data.konsumen?.nama || '-'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">Kode Barang:</span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border">
                      {data.konsumen?.kode_barang || data.invoice}
                    </span>
                  </div>
                  {data.konsumen?.telepon && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-24">Telepon:</span>
                      <span>{data.konsumen.telepon}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Deskripsi Pekerjaan */}
              <div className="space-y-3">
                <h3 className="font-bold text-primary">DESKRIPSI PEKERJAAN</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Model</p>
                    <p className="font-medium">{data.model || '-'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Tipe Lengan</p>
                    <p className="font-medium capitalize">{data.tipe_lengan}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Potongan</p>
                    <p className="font-medium capitalize">{data.potongan}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Detail Saku</p>
                    <p className="font-medium">{data.detail_saku || '-'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Bentuk Bawah</p>
                    <p className="font-medium">{data.bentuk_bawah || '-'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Breakdown Warna */}
              <div className="space-y-3">
                <h3 className="font-bold text-primary">BREAKDOWN WARNA</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(data.breakdown_warna || {}).map(([warna, jumlah]) => (
                    <div key={warna} className="bg-blue-50 rounded-lg px-4 py-2 flex items-center gap-3">
                      <span className="text-sm font-medium">{warna}</span>
                      <span className="text-blue-600 font-bold">{jumlah} pcs</span>
                    </div>
                  ))}
                  <div className="bg-primary/10 rounded-lg px-4 py-2 flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">TOTAL</span>
                    <span className="text-primary font-bold text-lg">{data.jumlah_total} pcs</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tabel Ukuran */}
              <div className="space-y-3">
                <h3 className="font-bold text-primary">TABEL UKURAN</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 px-4 py-2 text-left font-bold">Size</th>
                        <th className="border border-slate-300 px-4 py-2 text-center font-bold bg-blue-50">Laki-Laki</th>
                        <th className="border border-slate-300 px-4 py-2 text-center font-bold bg-pink-50">Perempuan</th>
                        <th className="border border-slate-300 px-4 py-2 text-center font-bold bg-slate-100">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].map((size) => {
                        const pria = data.size_chart?.pria?.[size] || 0;
                        const wanita = data.size_chart?.wanita?.[size] || 0;
                        const total = pria + wanita;
                        if (total === 0) return null;

                        return (
                          <tr key={size} className="hover:bg-slate-50">
                            <td className="border border-slate-300 px-4 py-2 font-medium">{sizeLabels[size]}</td>
                            <td className="border border-slate-300 px-4 py-2 text-center bg-blue-50/50">{pria}</td>
                            <td className="border border-slate-300 px-4 py-2 text-center bg-pink-50/50">{wanita}</td>
                            <td className="border border-slate-300 px-4 py-2 text-center font-bold bg-slate-100">{total}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-primary/10 font-bold">
                        <td className="border border-slate-300 px-4 py-2">TOTAL</td>
                        <td className="border border-slate-300 px-4 py-2 text-center">
                          {Object.values(data.size_chart?.pria || {}).reduce((a, b) => a + b, 0)}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-center">
                          {Object.values(data.size_chart?.wanita || {}).reduce((a, b) => a + b, 0)}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-center text-primary">
                          {data.jumlah_total}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Detail Bordir */}
              <div className="space-y-3">
                <h3 className="font-bold text-primary">DETAIL BORDIR</h3>
                {data.bordir && data.bordir.length > 0 ? (
                  <div className="space-y-2">
                    {data.bordir.map((b, index) => (
                      <div key={index} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Posisi</p>
                            <p className="font-medium">{b.posisi}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Teks</p>
                            <p className="font-medium">{b.teks}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Keterangan</p>
                            <p className="font-medium">{b.keterangan || '-'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Tidak ada bordir</p>
                )}
              </div>

              <Separator />

              {/* Summary */}
              <div className="bg-slate-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Affiliate/Sales</p>
                    <p className="font-medium">{data.affiliate?.nama || '-'}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">Total Harga</p>
                    <p className="text-2xl font-bold text-primary">{formatRupiah(data.total_harga)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant={getStatusBadgeVariant(data.status_pembayaran)} className="text-sm px-3 py-1">
                    Pembayaran: {data.status_pembayaran === 'dp' ? 'DP' : data.status_pembayaran === 'lunas' ? 'LUNAS' : 'Belum Bayar'}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(data.status_pesanan)} className="text-sm px-3 py-1 capitalize">
                    Status: {data.status_pesanan}
                  </Badge>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}