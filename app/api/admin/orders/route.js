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
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          qty,
          price,
          products (id, name)
        )
      `)
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
