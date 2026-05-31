'use client';

import { useState } from 'react';
import { Header } from '@/components/shared/Header';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Wallet,
  Plus,
  Search,
} from 'lucide-react';
import { formatRupiah, formatShortDate, getStatusBadgeVariant } from '@/lib/utils';
import { affiliateData, commissionData, pesananData } from '@/lib/supabase/demo-data';

export default function AffiliateSalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddAffiliateOpen, setIsAddAffiliateOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Calculate affiliate performance
  const getAffiliateStats = (affiliateId: string) => {
    const commissions = commissionData.filter((c) => c.affiliate_id === affiliateId);
    const orders = pesananData.filter((p) => p.affiliate_id === affiliateId);
    const totalSales = orders.reduce((sum, o) => sum + o.total_harga, 0);
    const totalCommission = commissions.reduce((sum, c) => sum + c.nilai_komisi, 0);
    const paidCommission = commissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.nilai_komisi, 0);
    const pendingCommission = commissions
      .filter((c) => c.status === 'pending' || c.status === 'approved')
      .reduce((sum, c) => sum + c.nilai_komisi, 0);

    return {
      totalSales,
      totalCommission,
      paidCommission,
      pendingCommission,
      orderCount: orders.length,
    };
  };

  const filteredCommissions = commissionData.filter((commission) => {
    const affiliate = affiliateData.find((a) => a.id === commission.affiliate_id);
    const matchesSearch =
      affiliate?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStats = {
    totalCommission: commissionData.reduce((sum, c) => sum + c.nilai_komisi, 0),
    pendingCommission: commissionData
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + c.nilai_komisi, 0),
    approvedCommission: commissionData
      .filter((c) => c.status === 'approved')
      .reduce((sum, c) => sum + c.nilai_komisi, 0),
    paidCommission: commissionData
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.nilai_komisi, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Affiliate Sales"
        breadcrumbs={[{ label: 'Bradwear', href: '/dashboard' }, { label: 'Affiliate Sales' }]}
      />

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Affiliate</p>
                  <p className="text-2xl font-bold">{affiliateData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-100">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Komisi</p>
                  <p className="text-2xl font-bold text-primary">{formatRupiah(totalStats.totalCommission)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-100">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Belum Cair</p>
                  <p className="text-2xl font-bold">{formatRupiah(totalStats.pendingCommission + totalStats.approvedCommission)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sudah Dibayar</p>
                  <p className="text-2xl font-bold text-green-600">{formatRupiah(totalStats.paidCommission)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Affiliate Performance Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Performa Affiliate</CardTitle>
              <Button onClick={() => setIsAddAffiliateOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah Affiliate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Komisi %</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Sudah Cair</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliateData.map((affiliate) => {
                  const stats = getAffiliateStats(affiliate.id);
                  return (
                    <TableRow key={affiliate.id}>
                      <TableCell className="font-medium">{affiliate.nama}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>{affiliate.telepon || '-'}</div>
                          <div>{affiliate.email || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatRupiah(stats.totalSales)}</TableCell>
                      <TableCell>{stats.orderCount}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{affiliate.komisi_persen}%</Badge>
                      </TableCell>
                      <TableCell className="text-amber-600 font-medium">
                        {formatRupiah(stats.pendingCommission)}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatRupiah(stats.paidCommission)}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Wallet className="w-4 h-4" />
                          Cairkan
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Commission History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Komisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari affiliate..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || 'all')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Sudah Dibayar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nilai Komisi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.map((commission) => {
                  const affiliate = affiliateData.find((a) => a.id === commission.affiliate_id);
                  const order = pesananData.find((p) => p.id === commission.pesanan_id);
                  return (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">{affiliate?.nama || '-'}</TableCell>
                      <TableCell className="font-mono">{order?.invoice || '-'}</TableCell>
                      <TableCell>{formatShortDate(commission.created_at)}</TableCell>
                      <TableCell className="font-medium">{formatRupiah(commission.nilai_komisi)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(commission.status)} className="capitalize">
                          {commission.status === 'pending'
                            ? 'Pending'
                            : commission.status === 'approved'
                              ? 'Approved'
                              : 'Sudah Dibayar'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {commission.status === 'pending' && (
                          <Button variant="outline" size="sm">
                            Approve
                          </Button>
                        )}
                        {commission.status === 'approved' && (
                          <Button variant="default" size="sm">
                            Bayar
                          </Button>
                        )}
                        {commission.status === 'paid' && (
                          <Badge variant="default" className="capitalize bg-green-100 text-green-700 border-green-200">
                            Completed
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredCommissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data komisi yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Affiliate Modal */}
      <Dialog open={isAddAffiliateOpen} onOpenChange={setIsAddAffiliateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Affiliate Baru</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama *</label>
              <Input placeholder="Nama affiliate" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telepon</label>
                <Input placeholder="08xxxxxxxxxx" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="email@example.com" type="email" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Persentase Komisi (%)</label>
              <Input type="number" placeholder="5" defaultValue="5" />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAffiliateOpen(false)}>
              Batal
            </Button>
            <Button>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Request Modal */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Pencairan Komisi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Affiliate</p>
              <p className="font-medium">Andi Wijaya</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Pending</p>
              <p className="text-2xl font-bold text-primary">{formatRupiah(775000)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jumlah Pencairan</label>
              <Input type="number" placeholder="0" defaultValue="775000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan</label>
              <Input placeholder="Catatan (opsional)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>
              Batal
            </Button>
            <Button>Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
