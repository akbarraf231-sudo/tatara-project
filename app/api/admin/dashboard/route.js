import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { data: orders, error: ordersErr } = await supabaseServer
      .from('orders')
      .select('id, total, status, created_at, order_type')
      .is('archived_at', null);
    if (ordersErr) throw ordersErr;

    const { data: items, error: itemsErr } = await supabaseServer
      .from('order_items')
      .select(`
        qty,
        price,
        products (name),
        orders!inner (status, archived_at)
      `)
      .is('orders.archived_at', null);
    if (itemsErr) throw itemsErr;

    const { data: expenses, error: expErr } = await supabaseServer
      .from('expenses')
      .select('amount, expense_date, category');
    if (expErr) throw expErr;

    return NextResponse.json({
      success: true,
      orders: orders || [],
      items: items || [],
      expenses: expenses || [],
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
