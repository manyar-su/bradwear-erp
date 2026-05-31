// Constants for Bradwear Dashboard

// Navigation items
export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    description: 'Ringkasan performa bisnis',
  },
  {
    title: 'CS Dashboard',
    href: '/cs-dashboard',
    icon: 'ClipboardList',
    description: 'Input pesanan & antrean produksi',
  },
  {
    title: 'Konsumen',
    href: '/konsumen',
    icon: 'Users',
    description: 'Manajemen data konsumen',
  },
  {
    title: 'Penjualan',
    href: '/penjualan',
    icon: 'ShoppingCart',
    description: 'Laporan transaksi penjualan',
  },
  {
    title: 'Production Control',
    href: '/production-control',
    icon: 'Factory',
    description: 'Kontrol produksi terintegrasi Bradflow',
  },
  {
    title: 'Belanja Bahan',
    href: '/belanja-bahan',
    icon: 'Package',
    description: 'Log pengeluaran bahan',
  },
  {
    title: 'Affiliate Sales',
    href: '/affiliate-sales',
    icon: 'TrendingUp',
    description: 'Manajemen komisi affiliate',
  },
] as const;

// Product categories
export const KATEGORI_OPTIONS = [
  { value: 'kemeja', label: 'Kemeja' },
  { value: 'jaket', label: 'Jaket' },
  { value: 'celana', label: 'Celana' },
  { value: 'vest', label: 'Vest/Rompi' },
] as const;

// Tipe lengan
export const TIPE_LENGAN_OPTIONS = [
  { value: 'panjang', label: 'Panjang' },
  { value: 'pendek', label: 'Pendek' },
] as const;

// Potongan gender
export const POTONGAN_OPTIONS = [
  { value: 'pria', label: 'Pria' },
  { value: 'wanita', label: 'Wanita' },
] as const;

// Size options
export const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] as const;

// Status pembayaran
export const STATUS_PEMBAYARAN_OPTIONS = [
  { value: 'belum_bayar', label: 'Belum Bayar' },
  { value: 'dp', label: 'DP (Down Payment)' },
  { value: 'lunas', label: 'Lunas' },
] as const;

// Status pesanan
export const STATUS_PESANAN_OPTIONS = [
  { value: 'menunggu', label: 'Menunggu' },
  { value: 'proses', label: 'Dalam Proses' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'diambil', label: 'Diambil' },
  { value: 'batal', label: 'Batal' },
] as const;

// Kategori belanja
export const KATEGORI_BELANJA_OPTIONS = [
  { value: 'kain', label: 'Kain' },
  { value: 'kancing', label: 'Kancing' },
  { value: 'benang', label: 'Benang' },
  { value: 'bordir', label: 'Jasa Bordir' },
  { value: 'produksi', label: 'Biaya Produksi' },
  { value: 'lainnya', label: 'Lainnya' },
] as const;

// Posisi bordir
export const POSISI_BORDIR_OPTIONS = [
  { value: 'dada_kanan', label: 'Dada Kanan' },
  { value: 'dada_kiri', label: 'Dada Kiri' },
  { value: 'lengan_kanan', label: 'Lengan Kanan' },
  { value: 'lengan_kiri', label: 'Lengan Kiri' },
  { value: 'punggung', label: 'Punggung' },
] as const;

// Commission status
export const COMMISSION_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Sudah Dibayar' },
] as const;

// Default commission percentage
export const DEFAULT_COMMISSION_PERCENT = 5;

// Pagination
export const TABLE_PAGE_SIZES = [10, 25, 50, 100] as const;

// Color palette for charts
export const CHART_COLORS = {
  primary: '#1E3A5F',
  primaryLight: '#2D5A87',
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
} as const;

// Brand info
export const BRAND_INFO = {
  name: 'Bradwear',
  tagline: 'Dashboard ERP',
  version: '1.0.0',
} as const;
