import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

function isAuthorized(request) {
  const token = request.headers.get('x-admin-token');
  const adminPassword = process.env.ADMIN_PASSWORD;
  return token === Buffer.from(adminPassword).toString('base64');
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name, price, stock, is_active, image_url } = body;

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
    };
    if (image_url) insertData.image_url = image_url;

    let { data, error } = await supabaseServer
      .from('products')
      .insert([insertData])
      .select()
      .single();

    if (error && /image_url/i.test(error.message || '')) {
      delete insertData.image_url;
      const retry = await supabaseServer
        .from('products')
        .insert([insertData])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
