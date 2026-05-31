'use client';

import { Header } from '@/components/shared/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, ReceiptText, ShoppingBag, Wallet } from 'lucide-react';
import { belanjaBahanData, commissionData, pesananData } from '@/lib/supabase/demo-data';
import { formatRupiah } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';

export default function KeuanganPage() {
  const { can } = useAuth();
  const canManageFinance = can('keuangan.manage');

  const totalPenjualan = pesananData.reduce((sum, order) => sum + order.total_harga, 0);
  const totalBelanja = belanjaBahanData.reduce((sum, item) => sum + item.jumlah, 0);
  const totalKomisi = commissionData.reduce((sum, item) => sum + item.nilai_komisi, 0);
  const estimasiLabaKotor = totalPenjualan - totalBelanja - totalKomisi;

  const paymentSummary = {
    lunas: pesananData
      .filter((order) => order.status_pembayaran === 'lunas')
      .reduce((sum, order) => sum + order.total_harga, 0),
    dp: pesananData
      .filter((order) => order.status_pembayaran === 'dp')
      .reduce((sum, order) => sum + order.total_harga, 0),
    belumBayar: pesananData
      .filter((order) => order.status_pembayaran === 'belum_bayar')
      .reduce((sum, order) => sum + order.total_harga, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Keuangan"
        breadcrumbs={[{ label: 'Bradwear', href: '/dashboard' }, { label: 'Keuangan' }]}
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Ringkasan finansial dari dataset penjualan, belanja bahan, dan komisi affiliate.
          </p>
          <Button variant="outline" size="sm" className="gap-2" disabled={!canManageFinance}>
            <Download className="w-4 h-4" />
            Export Laporan
          </Button>
        </div>
        {!canManageFinance && (
          <p className="text-xs text-muted-foreground">
            Role Anda memiliki akses baca. Export atau aksi perubahan data hanya untuk admin dan staff.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Wallet className="w-4 h-4" />
                Total Penjualan
              </div>
              <p className="text-2xl font-bold">{formatRupiah(totalPenjualan)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <ShoppingBag className="w-4 h-4" />
                Total Belanja Bahan
              </div>
              <p className="text-2xl font-bold text-rose-600">{formatRupiah(totalBelanja)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <ReceiptText className="w-4 h-4" />
                Total Komisi
              </div>
              <p className="text-2xl font-bold text-amber-600">{formatRupiah(totalKomisi)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Wallet className="w-4 h-4" />
                Estimasi Laba Kotor
              </div>
              <p className={`text-2xl font-bold ${estimasiLabaKotor >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatRupiah(estimasiLabaKotor)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status Pembayaran Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <div>
                <p className="font-medium">Lunas</p>
                <p className="text-xs text-muted-foreground">Kas masuk terkonfirmasi</p>
              </div>
              <Badge>{formatRupiah(paymentSummary.lunas)}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <div>
                <p className="font-medium">DP</p>
                <p className="text-xs text-muted-foreground">Perlu follow up pelunasan</p>
              </div>
              <Badge variant="secondary">{formatRupiah(paymentSummary.dp)}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <div>
                <p className="font-medium">Belum Bayar</p>
                <p className="text-xs text-muted-foreground">Piutang aktif</p>
              </div>
              <Badge variant="destructive">{formatRupiah(paymentSummary.belumBayar)}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
