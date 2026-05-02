import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Lightweight endpoint that returns ONLY stock info per active product.
// Used by the storefront to keep stock fresh without a full page refresh.
// Designed to be cheap so it's safe to poll every 30s.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [{ data: products, error: pErr }, { data: variants, error: vErr }] = await Promise.all([
      supabaseServer
        .from('products')
        .select('id, stock, is_active')
        .eq('is_active', true),
      supabaseServer
        .from('product_flavor_stocks')
        .select('product_id, flavor, stock')
        .eq('is_active', true),
    ]);
    if (pErr) throw pErr;

    const stocksByProduct = {};
    for (const row of variants || []) {
      if (!stocksByProduct[row.product_id]) stocksByProduct[row.product_id] = [];
      stocksByProduct[row.product_id].push({ flavor: row.flavor, stock: row.stock });
    }

    const data = (products || []).map((p) => ({
      id: p.id,
      stock: p.stock,
      flavor_stocks: stocksByProduct[p.id] || [],
    }));

    return NextResponse.json({ success: true, data, ts: Date.now() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
