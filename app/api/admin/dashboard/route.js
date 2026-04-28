import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 500);
    const offset = (page - 1) * limit;

    // Get counts for pagination
    const { count: ordersCount } = await supabaseServer
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null);

    const { data: orders, error: ordersErr } = await supabaseServer
      .from('orders')
      .select('id, total, status, created_at, order_type')
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (ordersErr) throw ordersErr;

    const { data: items, error: itemsErr } = await supabaseServer
      .from('order_items')
      .select(`
        qty,
        price,
        products (name),
        orders!inner (status, archived_at)
      `)
      .is('orders.archived_at', null)
      .limit(limit * 10);
    if (itemsErr) throw itemsErr;

    const { data: expenses, error: expErr } = await supabaseServer
      .from('expenses')
      .select('amount, expense_date, category')
      .limit(1000);
    if (expErr) throw expErr;

    return NextResponse.json({
      success: true,
      orders: orders || [],
      items: items || [],
      expenses: expenses || [],
      pagination: {
        page,
        limit,
        total: ordersCount || 0,
        pages: Math.ceil((ordersCount || 0) / limit),
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
