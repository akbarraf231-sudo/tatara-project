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
    const { data: orders, error: ordersErr } = await supabaseServer
      .from('orders')
      .select('id, total, status, created_at');

    if (ordersErr) throw ordersErr;

    const { data: items, error: itemsErr } = await supabaseServer
      .from('order_items')
      .select(`
        qty,
        price,
        products (name),
        orders!inner (status)
      `);

    if (itemsErr) throw itemsErr;

    return NextResponse.json({
      success: true,
      orders: orders || [],
      items: items || [],
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
