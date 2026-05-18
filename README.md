# Bradwear Dashboard - ERP Sistem Manajemen Garmen

Sistem ERP (Enterprise Resource Planning) berbasis web untuk manajemen produksi garmen. Sistem ini dirancang khusus untuk konveksi yang memproduksi kemeja, jaket, celana, dan vest/rompi.

## Fitur Utama

### 1. Dashboard
- Ringkasan performa penjualan bulanan
- Total produksi dan pesanan aktif
- Grafik trend penjualan (12 minggu terakhir)
- Breakdown produksi per kategori (Pie chart)
- Top 5 konsumen berdasarkan nilai order
- Riwayat pesanan terbaru

### 2. CS Dashboard
- Input pesanan baru dengan form lengkap
- Manajemen antrean produksi
- Filter berdasarkan status pesanan
- Tabel ukuran gender-based (Pria/Wanita)

### 3. Manajemen Konsumen
- Daftar konsumen dengan kode barang 4 digit unik
- Riwayat order per konsumen
- Klik nama/kode untuk melihat detail pesanan (pop-up modal)
- Filter berdasarkan status (Aktif/Nonaktif)

### 4. Penjualan
- Laporan transaksi lengkap
- Filter multi-level (tanggal, status bayar, status pesanan, kategori)
- Ringkasan statistik penjualan

### 5. Belanja Bahan
- Log pengeluaran bahan (kain, kancing, benang, bordir, dll)
- Filter berdasarkan kategori dan tanggal
- Ringkasan total pengeluaran per kategori

### 6. Affiliate Sales
- Manajemen tim sales/affiliate
- Tracking commission per affiliate
- Request pencairan dan approval
- Performa sales dengan statistik

## Teknologi

- **Framework**: Next.js 16 (App Router)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Struktur Halaman

| Route | Halaman | Deskripsi |
|-------|---------|-----------|
| `/dashboard` | Dashboard | Ringkasan performa bisnis |
| `/cs-dashboard` | CS Dashboard | Input pesanan & antrean produksi |
| `/konsumen` | Konsumen | Manajemen data konsumen |
| `/penjualan` | Penjualan | Laporan transaksi |
| `/belanja-bahan` | Belanja Bahan | Log pengeluaran bahan |
| `/affiliate-sales` | Affiliate Sales | Manajemen komisi affiliate |

## Format Sistem

- **Bahasa**: Bahasa Indonesia
- **Mata Uang**: Rupiah (IDR)
- **Kode Barang**: 4 digit unik per konsumen

## Instalasi

```bash
# Clone repository
git clone https://github.com/your-username/bradwear-erp.git

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Buat file `.env.local` dengan:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## License

MIT License - Bradwear Dashboard ERP
