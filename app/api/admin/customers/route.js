import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseServer
      .from('orders')
      .select('customer_name, customer_phone, total, status, created_at')
      .not('customer_phone', 'is', null)
      .neq('customer_phone', '')
      .is('archived_at', null);

    if (error) throw error;

    const map = new Map();
    for (const o of data || []) {
      const phone = (o.customer_phone || '').replace(/\D/g, '');
      if (!phone) continue;
      const isPaid = o.status === 'confirmed' || o.status === 'completed';
      const existing = map.get(phone);
      if (!existing) {
        map.set(phone, {
          phone,
          name: o.customer_name || '-',
          total_orders: 1,
          paid_orders: isPaid ? 1 : 0,
          total_spent: isPaid ? Number(o.total) : 0,
          last_order_at: o.created_at,
          first_order_at: o.created_at,
        });
      } else {
        existing.total_orders += 1;
        if (isPaid) {
          existing.paid_orders += 1;
          existing.total_spent += Number(o.total);
        }
        if (new Date(o.created_at) > new Date(existing.last_order_at)) {
          existing.last_order_at = o.created_at;
          existing.name = o.customer_name || existing.name;
        }
        if (new Date(o.created_at) < new Date(existing.first_order_at)) {
          existing.first_order_at = o.created_at;
        }
      }
    }

    const customers = Array.from(map.values()).sort(
      (a, b) => new Date(b.last_order_at) - new Date(a.last_order_at)
    );

    const totalSpent = customers.reduce((s, c) => s + c.total_spent, 0);
    const repeatBuyers = customers.filter((c) => c.paid_orders >= 2).length;

    return NextResponse.json({
      success: true,
      data: customers,
      stats: {
        unique_customers: customers.length,
        repeat_buyers: repeatBuyers,
        total_revenue_from_customers: totalSpent,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
