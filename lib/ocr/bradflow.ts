export const BRADFLOW_OCR_PROMPT = `Extract exact structured data from this order slip image.
Return ONLY valid JSON with keys:
{
  "kodeBarang": string,
  "tanggalOrder": string,
  "tanggalTargetSelesai": string,
  "cs": string,
  "konsumen": string,
  "model": string,
  "warna": string,
  "jumlahPesanan": number,
  "status": string,
  "deskripsiPekerjaan": string,
  "sizeDetails": [
    {
      "gender": "Pria|Wanita",
      "tangan": "Panjang|Pendek",
      "warna": string,
      "sizes": [
        {
          "size": string,
          "jumlah": number,
          "namaPerSize": string
        }
      ]
    }
  ]
}

Rules:
- kodeBarang must be exactly 4 digits OR contain prefix TDP.
- Prioritize top-right large number inside circle/box for kodeBarang.
- Ignore dates/qty when extracting kodeBarang.
- Sum all item counts into jumlahPesanan.
- If unknown, return empty string for text fields and 0 for jumlahPesanan.
- Keep Indonesian terms from source text where possible.
`;

type SizeItem = {
  size?: string;
  jumlah?: number;
  namaPerSize?: string;
};

type SizeDetailItem = {
  gender?: string;
  tangan?: string;
  warna?: string;
  sizes?: SizeItem[];
};

export type OcrNormalizedResult = {
  kodeBarang: string;
  tanggalOrder: string;
  tanggalTargetSelesai: string;
  cs: string;
  konsumen: string;
  model: string;
  warna: string;
  jumlahPesanan: number;
  status: string;
  deskripsiPekerjaan: string;
  sizeDetails: {
    gender: 'Pria' | 'Wanita';
    tangan: 'Panjang' | 'Pendek';
    warna: string;
    sizes: { size: string; jumlah: number; namaPerSize?: string }[];
  }[];
};

function normalizeGender(value: string | undefined): 'Pria' | 'Wanita' {
  const v = (value || '').toLowerCase();
  if (v === 'w' || v.includes('wanita') || v.includes('perempuan')) return 'Wanita';
  return 'Pria';
}

function normalizeTangan(value: string | undefined): 'Panjang' | 'Pendek' {
  const v = (value || '').toLowerCase();
  if (v.includes('panjang') || v === 'pjg') return 'Panjang';
  return 'Pendek';
}

function sanitizeKodeBarang(value: string | undefined): string {
  const v = (value || '').trim().toUpperCase();
  if (/^TDP[0-9A-Z]+$/.test(v)) return v;
  if (/^\d{4}$/.test(v)) return v;
  return '';
}

export function normalizeBradflowOcrResult(raw: Record<string, unknown>): OcrNormalizedResult {
  const sizeDetailsInput = Array.isArray(raw.sizeDetails) ? (raw.sizeDetails as SizeDetailItem[]) : [];
  const sizeDetails = sizeDetailsInput.map((item) => ({
    gender: normalizeGender(item.gender),
    tangan: normalizeTangan(item.tangan),
    warna: (item.warna || raw.warna || '').toString(),
    sizes: Array.isArray(item.sizes)
      ? item.sizes.map((s) => ({
          size: (s.size || '').toString() || 'CUSTOM',
          jumlah: Number(s.jumlah || 0) || 0,
          namaPerSize: s.namaPerSize?.toString() || undefined,
        }))
      : [],
  }));

  return {
    kodeBarang: sanitizeKodeBarang(raw.kodeBarang?.toString()),
    tanggalOrder: (raw.tanggalOrder || '').toString(),
    tanggalTargetSelesai: (raw.tanggalTargetSelesai || '').toString(),
    cs: (raw.cs || '').toString(),
    konsumen: (raw.konsumen || '').toString(),
    model: (raw.model || '').toString(),
    warna: (raw.warna || '').toString(),
    jumlahPesanan: Number(raw.jumlahPesanan || 0) || 0,
    status: (raw.status || 'Proses').toString(),
    deskripsiPekerjaan: (raw.deskripsiPekerjaan || '').toString(),
    sizeDetails,
  };
}

