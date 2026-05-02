import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

const optionalCols = ['image_url', 'image_url_2', 'image_url_3', 'product_type', 'description', 'flavors', 'sizes', 'max_flavors_selectable'];

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [{ data: products, error }, { data: stocks }] = await Promise.all([
      supabaseServer
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }),
      supabaseServer
        .from('product_flavor_stocks')
        .select('product_id, flavor, stock')
        .eq('is_active', true),
    ]);
    if (error) throw error;

    const stocksByProduct = {};
    for (const row of stocks || []) {
      if (!stocksByProduct[row.product_id]) stocksByProduct[row.product_id] = [];
      stocksByProduct[row.product_id].push({ flavor: row.flavor, stock: row.stock });
    }
    const enriched = (products || []).map((p) => ({
      ...p,
      flavor_stocks: stocksByProduct[p.id] || [],
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const {
      name, price, stock, is_active, image_url, image_url_2, image_url_3,
      product_type, description, flavors, sizes, max_flavors_selectable,
      flavor_stocks,
    } = body;

    if (!name || price == null || stock == null) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const insertData = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      is_active: is_active ?? true,
      product_type: product_type === 'special' ? 'special' : 'daily',
      description: description || null,
      flavors: Array.isArray(flavors) ? flavors : [],
      sizes: Array.isArray(sizes) ? sizes : [],
      max_flavors_selectable: parseInt(max_flavors_selectable) || 1,
    };
    if (image_url) insertData.image_url = image_url;
    if (image_url_2) insertData.image_url_2 = image_url_2;
    if (image_url_3) insertData.image_url_3 = image_url_3;

    let { data, error } = await supabaseServer
      .from('products')
      .insert([insertData])
      .select()
      .single();

    let attempt = 0;
    while (error && attempt < optionalCols.length) {
      const drop = optionalCols.find((k) => new RegExp(k, 'i').test(error.message || ''));
      if (!drop) break;
      delete insertData[drop];
      const retry = await supabaseServer
        .from('products')
        .insert([insertData])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
      attempt++;
    }

    if (error) throw error;

    // Sync per-flavor stocks (best-effort; ignores if migration 011 not applied)
    if (Array.isArray(flavor_stocks) && flavor_stocks.length > 0) {
      await supabaseServer.rpc('upsert_product_flavor_stocks', {
        p_product_id: data.id,
        p_flavors: flavor_stocks,
      });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
