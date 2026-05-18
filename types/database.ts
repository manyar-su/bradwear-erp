// Database Types for Bradwear Dashboard

export interface Konsumen {
  id: string;
  kode_barang: string;
  nama: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  status: 'aktif' | 'nonaktif';
  created_at: string;
  updated_at: string;
}

export interface Affiliate {
  id: string;
  nama: string;
  telepon?: string;
  email?: string;
  komisi_persen: number;
  created_at: string;
}

export interface SizeChart {
  pria: Record<string, number>;
  wanita: Record<string, number>;
}

export interface BordirDetail {
  posisi: string;
  teks: string;
  keterangan?: string;
}

export interface Pesanan {
  id: string;
  invoice: string;
  konsumen_id: string;
  cs_id: string;
  affiliate_id?: string;
  tanggal_order: string;
  target_selesai?: string;
  kategori: 'kemeja' | 'jaket' | 'celana' | 'vest';
  model: string;
  tipe_lengan: 'panjang' | 'pendek';
  detail_saku: string;
  bentuk_bawah: string;
  potongan: 'pria' | 'wanita';
  jumlah_total: number;
  breakdown_warna: Record<string, number>;
  size_chart: SizeChart;
  bordir: BordirDetail[];
  total_harga: number;
  status_pembayaran: 'dp' | 'lunas' | 'belum_bayar';
  status_pesanan: 'menunggu' | 'proses' | 'selesai' | 'diambil' | 'batal';
  created_at: string;
  updated_at: string;
  // Joined fields
  konsumen?: Konsumen;
  affiliate?: Affiliate;
}

export interface BelanjaBahan {
  id: string;
  tanggal: string;
  kategori: 'kain' | 'kancing' | 'benang' | 'bordir' | 'produksi' | 'lainnya';
  deskripsi: string;
  vendor?: string;
  jumlah: number;
  bukti_url?: string;
  created_at: string;
}

export interface AffiliateCommission {
  id: string;
  affiliate_id: string;
  pesanan_id: string;
  nilai_komisi: number;
  status: 'pending' | 'approved' | 'paid';
  tanggal_request?: string;
  tanggal_bayar?: string;
  created_at: string;
  // Joined fields
  affiliate?: Affiliate;
  pesanan?: Pesanan;
}

// Dashboard Stats
export interface DashboardStats {
  totalPenjualanBulanIni: number;
  totalProduksiBulanIni: number;
  pesananAktif: number;
  komisiBelumCair: number;
}

// Chart Data
export interface PenjualanChartData {
  minggu: string;
  nilai: number;
}

export interface KategoriChartData {
  name: string;
  value: number;
  color: string;
}

export interface TopKonsumenData {
  nama: string;
  total: number;
}

// Filter Types
export interface PenjualanFilters {
  tanggalMulai?: string;
  tanggalAkhir?: string;
  statusPembayaran?: string;
  statusPesanan?: string;
  kategori?: string;
}

export interface BelanjaFilters {
  tanggalMulai?: string;
  tanggalAkhir?: string;
  kategori?: string;
}

// Form Types
export interface PesananFormData {
  konsumen_id: string;
  cs_id: string;
  affiliate_id?: string;
  tanggal_order: string;
  target_selesai?: string;
  kategori: 'kemeja' | 'jaket' | 'celana' | 'vest';
  model: string;
  tipe_lengan: 'panjang' | 'pendek';
  detail_saku: string;
  bentuk_bawah: string;
  potongan: 'pria' | 'wanita';
  jumlah_total: number;
  breakdown_warna: Record<string, number>;
  size_chart: SizeChart;
  bordir: BordirDetail[];
  total_harga: number;
  status_pembayaran: 'dp' | 'lunas' | 'belum_bayar';
}

export interface BelanjaFormData {
  tanggal: string;
  kategori: 'kain' | 'kancing' | 'benang' | 'bordir' | 'produksi' | 'lainnya';
  deskripsi: string;
  vendor?: string;
  jumlah: number;
  bukti_url?: string;
}
