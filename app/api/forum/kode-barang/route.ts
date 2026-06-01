import { NextResponse } from 'next/server';
import { getCurrentUserContext } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const user = await getCurrentUserContext();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const [{ data: orderRows, error: orderErr }, { data: konsumenRows, error: konsumenErr }] =
    await Promise.all([
      supabase
        .from('orders')
        .select('kode_barang')
        .is('deleted_at', null)
        .limit(10000),
      supabase
        .from('konsumen')
        .select('kode_barang')
        .limit(10000),
    ]);

  if (orderErr) {
    return NextResponse.json({ error: orderErr.message }, { status: 500 });
  }
  if (konsumenErr) {
    return NextResponse.json({ error: konsumenErr.message }, { status: 500 });
  }

  const allCodes = new Set<string>();
  (orderRows || []).forEach((row) => {
    const code = String((row as { kode_barang: string | null }).kode_barang || '').trim();
    if (code) allCodes.add(code);
  });
  (konsumenRows || []).forEach((row) => {
    const code = String((row as { kode_barang: string }).kode_barang || '').trim();
    if (code) allCodes.add(code);
  });

  return NextResponse.json({
    items: Array.from(allCodes).sort((a, b) => a.localeCompare(b)),
  });
}

