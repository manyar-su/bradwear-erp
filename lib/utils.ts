import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency to Indonesian Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date to Indonesian format
export function formatTanggal(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

// Format short date (DD/MM/YYYY)
export function formatShortDate(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Get month name in Indonesian
export function getBulanIndonesia(month: number): string {
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return bulan[month];
}

// Generate unique 4-digit code
export function generateKodeBarang(existingCodes: string[]): string {
  let code: string;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (existingCodes.includes(code));
  return code;
}

// Status badge colors
export function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'link' | 'ghost' {
  switch (status.toLowerCase()) {
    case 'lunas':
    case 'selesai':
    case 'diambil':
    case 'approved':
    case 'paid':
    case 'aktif':
      return 'default'; // Use default green for success
    case 'dp':
    case 'proses':
    case 'pending':
      return 'secondary'; // Use secondary for warning
    case 'batal':
    case 'nonaktif':
      return 'destructive';
    case 'menunggu':
    case 'belum_bayar':
      return 'outline';
    default:
      return 'default';
  }
}

// Kategori colors for charts
export function getKategoriColor(kategori: string): string {
  switch (kategori.toLowerCase()) {
    case 'kemeja':
      return '#3B82F6';
    case 'jaket':
      return '#10B981';
    case 'celana':
      return '#F59E0B';
    case 'vest':
      return '#8B5CF6';
    default:
      return '#64748B';
  }
}

// Calculate commission
export function calculateCommission(
  totalSale: number,
  percentage: number = 5
): number {
  return totalSale * (percentage / 100);
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
