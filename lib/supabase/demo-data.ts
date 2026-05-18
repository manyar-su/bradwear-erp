// Demo Data Store - Simulates Supabase database
// In production, replace this with actual Supabase calls

import type {
  Konsumen,
  Affiliate,
  Pesanan,
  BelanjaBahan,
  AffiliateCommission,
  DashboardStats,
  PenjualanChartData,
  KategoriChartData,
  TopKonsumenData
} from '@/types/database';

// Demo Konsumen Data
export const konsumenData: Konsumen[] = [
  {
    id: '1',
    kode_barang: '1716',
    nama: 'PT Maju Bersama',
    alamat: 'Jl. Industri No. 10, Jakarta',
    telepon: '021-5551234',
    email: 'purchasing@majubersama.com',
    status: 'aktif',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    kode_barang: '2847',
    nama: 'CV Karya Sentosa',
    alamat: 'Jl. Pabrik No. 25, Bandung',
    telepon: '022-6789012',
    email: 'order@karyasentosa.co.id',
    status: 'aktif',
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-02-20T00:00:00Z',
  },
  {
    id: '3',
    kode_barang: '3956',
    nama: 'Toko Busana Melati',
    alamat: 'Jl. Pasar Baru No. 88, Surabaya',
    telepon: '031-1234567',
    status: 'aktif',
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z',
  },
  {
    id: '4',
    kode_barang: '4523',
    nama: 'PT Sinar Textile',
    alamat: 'Jl. Teknologi No. 45, Semarang',
    telepon: '024-7654321',
    email: ' procurement@sinartextile.com',
    status: 'aktif',
    created_at: '2024-04-05T00:00:00Z',
    updated_at: '2024-04-05T00:00:00Z',
  },
  {
    id: '5',
    kode_barang: '5689',
    nama: 'UD Buana Fashion',
    alamat: 'Jl. textile No. 12, Yogyakarta',
    telepon: '0274-456789',
    status: 'nonaktif',
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z',
  },
];

// Demo Affiliate Data
export const affiliateData: Affiliate[] = [
  {
    id: '1',
    nama: 'Andi Wijaya',
    telepon: '081234567890',
    email: 'andi.wijaya@email.com',
    komisi_persen: 5,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    nama: 'Dewi Rahayu',
    telepon: '081298765432',
    email: 'dewi.rahayu@email.com',
    komisi_persen: 7,
    created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: '3',
    nama: 'Budi Santoso',
    telepon: '081345678901',
    email: 'budi.santoso@email.com',
    komisi_persen: 5,
    created_at: '2024-03-20T00:00:00Z',
  },
];

// Demo Pesanan Data
export const pesananData: Pesanan[] = [
  {
    id: '1',
    invoice: '1716',
    konsumen_id: '1',
    cs_id: 'Siti',
    affiliate_id: '1',
    tanggal_order: '2026-05-10',
    target_selesai: '2026-05-25',
    kategori: 'kemeja',
    model: 'Brad V2',
    tipe_lengan: 'panjang',
    detail_saku: '2 saku dada + 1 saku dalam',
    bentuk_bawah: 'Regular fit',
    potongan: 'pria',
    jumlah_total: 100,
    breakdown_warna: { 'Putih': 50, 'Biru Tua': 50 },
    size_chart: {
      pria: { 'S': 10, 'M': 25, 'L': 30, 'XL': 25, '2XL': 10 },
      wanita: { 'S': 5, 'M': 10, 'L': 15, 'XL': 5, '2XL': 0, '3XL': 0, '4XL': 0 },
    },
    bordir: [
      { posisi: 'Dada Kanan', teks: 'BRADWEAR', keterangan: 'Logo Perusahaan' },
      { posisi: 'Dada Kiri', teks: 'GT', keterangan: 'Logo Client' },
    ],
    total_harga: 15500000,
    status_pembayaran: 'lunas',
    status_pesanan: 'proses',
    created_at: '2026-05-10T08:00:00Z',
    updated_at: '2026-05-10T08:00:00Z',
    konsumen: konsumenData[0],
    affiliate: affiliateData[0],
  },
  {
    id: '2',
    invoice: '2847',
    konsumen_id: '2',
    cs_id: 'Budi',
    tanggal_order: '2026-05-12',
    target_selesai: '2026-05-28',
    kategori: 'jaket',
    model: 'Jacket Pro X',
    tipe_lengan: 'panjang',
    detail_saku: '4 saku luar + 2 saku dalam',
    bentuk_bawah: 'Regular fit',
    potongan: 'pria',
    jumlah_total: 75,
    breakdown_warna: { 'Hitam': 40, 'Abu-abu': 35 },
    size_chart: {
      pria: { 'S': 5, 'M': 15, 'L': 25, 'XL': 20, '2XL': 10 },
      wanita: { 'S': 0, 'M': 0, 'L': 0, 'XL': 0, '2XL': 0 },
    },
    bordir: [
      { posisi: 'Dada Kiri', teks: 'KARYA SENTOSA', keterangan: 'Logo Company' },
    ],
    total_harga: 22500000,
    status_pembayaran: 'dp',
    status_pesanan: 'menunggu',
    created_at: '2026-05-12T10:30:00Z',
    updated_at: '2026-05-12T10:30:00Z',
    konsumen: konsumenData[1],
  },
  {
    id: '3',
    invoice: '3956',
    konsumen_id: '3',
    cs_id: 'Siti',
    affiliate_id: '2',
    tanggal_order: '2026-05-14',
    target_selesai: '2026-05-30',
    kategori: 'vest',
    model: 'Vest Classic',
    tipe_lengan: 'pendek',
    detail_saku: '3 saku luar',
    bentuk_bawah: 'Slim fit',
    potongan: 'wanita',
    jumlah_total: 50,
    breakdown_warna: { 'Navy': 25, 'Maroon': 25 },
    size_chart: {
      pria: { 'S': 0, 'M': 0, 'L': 0, 'XL': 0 },
      wanita: { 'S': 10, 'M': 15, 'L': 15, 'XL': 10, '2XL': 0 },
    },
    bordir: [
      { posisi: 'Dada Kiri', teks: 'MELATI', keterangan: 'Brand Name' },
    ],
    total_harga: 8500000,
    status_pembayaran: 'lunas',
    status_pesanan: 'selesai',
    created_at: '2026-05-14T14:00:00Z',
    updated_at: '2026-05-16T16:00:00Z',
    konsumen: konsumenData[2],
    affiliate: affiliateData[1],
  },
  {
    id: '4',
    invoice: '4523',
    konsumen_id: '4',
    cs_id: 'Ahmad',
    tanggal_order: '2026-05-15',
    target_selesai: '2026-06-01',
    kategori: 'celana',
    model: 'Chino Pants',
    tipe_lengan: 'pendek',
    detail_saku: '2 saku depan + 1 saku belakang',
    bentuk_bawah: 'Straight cut',
    potongan: 'pria',
    jumlah_total: 120,
    breakdown_warna: { 'Khaki': 60, 'Navy': 60 },
    size_chart: {
      pria: { 'S': 15, 'M': 30, 'L': 35, 'XL': 25, '2XL': 15 },
      wanita: { 'S': 0, 'M': 0, 'L': 0, 'XL': 0 },
    },
    bordir: [],
    total_harga: 18000000,
    status_pembayaran: 'belum_bayar',
    status_pesanan: 'menunggu',
    created_at: '2026-05-15T09:00:00Z',
    updated_at: '2026-05-15T09:00:00Z',
    konsumen: konsumenData[3],
  },
  {
    id: '5',
    invoice: '5689',
    konsumen_id: '5',
    cs_id: 'Budi',
    affiliate_id: '3',
    tanggal_order: '2026-05-16',
    target_selesai: '2026-06-05',
    kategori: 'kemeja',
    model: 'Brad V1',
    tipe_lengan: 'panjang',
    detail_saku: '1 saku dada',
    bentuk_bawah: 'Regular fit',
    potongan: 'pria',
    jumlah_total: 80,
    breakdown_warna: { 'Putih': 40, 'Cream': 40 },
    size_chart: {
      pria: { 'S': 10, 'M': 20, 'L': 25, 'XL': 15, '2XL': 10 },
      wanita: { 'S': 0, 'M': 0, 'L': 0, 'XL': 0 },
    },
    bordir: [
      { posisi: 'Dada Kiri', teks: 'BUANA', keterangan: 'Brand' },
    ],
    total_harga: 12000000,
    status_pembayaran: 'dp',
    status_pesanan: 'diambil',
    created_at: '2026-05-16T11:00:00Z',
    updated_at: '2026-05-17T15:00:00Z',
    konsumen: konsumenData[4],
    affiliate: affiliateData[2],
  },
];

// Demo Belanja Bahan Data
export const belanjaBahanData: BelanjaBahan[] = [
  {
    id: '1',
    tanggal: '2026-05-01',
    kategori: 'kain',
    deskripsi: 'Kain katun Oxford 60s - 500 meter',
    vendor: 'PT textile Jaya',
    jumlah: 25000000,
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    id: '2',
    tanggal: '2026-05-03',
    kategori: 'benang',
    deskripsi: 'Benang polyester 40/2 - 100 gulung',
    vendor: 'Toko Benang Sentosa',
    jumlah: 3500000,
    created_at: '2026-05-03T00:00:00Z',
  },
  {
    id: '3',
    tanggal: '2026-05-05',
    kategori: 'kancing',
    deskripsi: 'Kancing 4 lubang - 1000 pcs',
    vendor: 'Supplier Kancing Maju',
    jumlah: 1500000,
    created_at: '2026-05-05T00:00:00Z',
  },
  {
    id: '4',
    tanggal: '2026-05-08',
    kategori: 'bordir',
    deskripsi: 'Jasa bordir logo - 200 pcs',
    vendor: 'Bordir Studio Indonesia',
    jumlah: 8000000,
    created_at: '2026-05-08T00:00:00Z',
  },
  {
    id: '5',
    tanggal: '2026-05-10',
    kategori: 'produksi',
    deskripsi: 'Biaya jahit outsource - 100 pcs kemeja',
    vendor: 'Konveksi Sehat',
    jumlah: 7500000,
    created_at: '2026-05-10T00:00:00Z',
  },
  {
    id: '6',
    tanggal: '2026-05-12',
    kategori: 'kain',
    deskripsi: 'Kain drill untuk jaket - 300 meter',
    vendor: 'PT textile Jaya',
    jumlah: 18000000,
    created_at: '2026-05-12T00:00:00Z',
  },
  {
    id: '7',
    tanggal: '2026-05-15',
    kategori: 'lainnya',
    deskripsi: 'Kirim paket ekspedisi',
    vendor: 'JNE Express',
    jumlah: 850000,
    created_at: '2026-05-15T00:00:00Z',
  },
];

// Demo Affiliate Commission Data
export const commissionData: AffiliateCommission[] = [
  {
    id: '1',
    affiliate_id: '1',
    pesanan_id: '1',
    nilai_komisi: 775000,
    status: 'pending',
    created_at: '2026-05-10T08:00:00Z',
    affiliate: affiliateData[0],
  },
  {
    id: '2',
    affiliate_id: '2',
    pesanan_id: '3',
    nilai_komisi: 595000,
    status: 'approved',
    tanggal_request: '2026-05-17',
    created_at: '2026-05-16T16:00:00Z',
    affiliate: affiliateData[1],
  },
  {
    id: '3',
    affiliate_id: '3',
    pesanan_id: '5',
    nilai_komisi: 600000,
    status: 'paid',
    tanggal_request: '2026-05-16',
    tanggal_bayar: '2026-05-17',
    created_at: '2026-05-16T11:00:00Z',
    affiliate: affiliateData[2],
  },
];

// Helper functions to get data
export function getDashboardStats(): DashboardStats {
  const bulanIni = new Date().getMonth();
  const pesananBulanIni = pesananData.filter(p =>
    new Date(p.tanggal_order).getMonth() === bulanIni
  );

  return {
    totalPenjualanBulanIni: pesananBulanIni.reduce((sum, p) => sum + p.total_harga, 0),
    totalProduksiBulanIni: pesananBulanIni.reduce((sum, p) => sum + p.jumlah_total, 0),
    pesananAktif: pesananData.filter(p => ['menunggu', 'proses'].includes(p.status_pesanan)).length,
    komisiBelumCair: commissionData
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.nilai_komisi, 0),
  };
}

export function getPenjualanChartData(): PenjualanChartData[] {
  const weeks = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5', 'Minggu 6'];
  const values = [25000000, 32000000, 18000000, 45000000, 28000000, 35000000];

  return weeks.map((minggu, i) => ({
    minggu,
    nilai: values[i],
  }));
}

export function getKategoriChartData(): KategoriChartData[] {
  const kategoriCount: Record<string, number> = {};
  pesananData.forEach(p => {
    kategoriCount[p.kategori] = (kategoriCount[p.kategori] || 0) + p.jumlah_total;
  });

  return Object.entries(kategoriCount).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: name === 'kemeja' ? '#3B82F6' : name === 'jaket' ? '#10B981' : name === 'celana' ? '#F59E0B' : '#8B5CF6',
  }));
}

export function getTopKonsumen(): TopKonsumenData[] {
  const konsumenTotal: Record<string, number> = {};
  const konsumenNama: Record<string, string> = {};

  pesananData.forEach(p => {
    if (p.konsumen) {
      konsumenTotal[p.konsumen_id] = (konsumenTotal[p.konsumen_id] || 0) + p.total_harga;
      konsumenNama[p.konsumen_id] = p.konsumen.nama;
    }
  });

  return Object.entries(konsumenTotal)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, total]) => ({
      nama: konsumenNama[id],
      total,
    }));
}

// Add new konsumen
export function addKonsumen(konsumen: Omit<Konsumen, 'id' | 'created_at' | 'updated_at'>): Konsumen {
  const newKonsumen: Konsumen = {
    ...konsumen,
    id: String(konsumenData.length + 1),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  konsumenData.push(newKonsumen);
  return newKonsumen;
}

// Add new pesanan
export function addPesanan(pesanan: Omit<Pesanan, 'id' | 'created_at' | 'updated_at'>): Pesanan {
  const newPesanan: Pesanan = {
    ...pesanan,
    id: String(pesananData.length + 1),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  pesananData.push(newPesanan);
  return newPesanan;
}

// Add new belanja
export function addBelanja(belanja: Omit<BelanjaBahan, 'id' | 'created_at'>): BelanjaBahan {
  const newBelanja: BelanjaBahan = {
    ...belanja,
    id: String(belanjaBahanData.length + 1),
    created_at: new Date().toISOString(),
  };
  belanjaBahanData.push(newBelanja);
  return newBelanja;
}

// Add new commission
export function addCommission(commission: Omit<AffiliateCommission, 'id' | 'created_at'>): AffiliateCommission {
  const newCommission: AffiliateCommission = {
    ...commission,
    id: String(commissionData.length + 1),
    created_at: new Date().toISOString(),
  };
  commissionData.push(newCommission);
  return newCommission;
}