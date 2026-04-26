import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      items,
      customer_name,
      customer_phone,
      order_type,
      voucher_code,
      pickup_date,
      pickup_time,
      notes,
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    const rpcItems = items.map((item) => ({
      product_id: item.product_id,
      qty: item.qty,
      flavor: item.flavor || null,
      size: item.size || null,
      notes: item.notes || null,
    }));

    const { data, error } = await supabaseServer.rpc('place_order', {
      p_items: rpcItems,
      p_customer_name: customer_name.trim(),
      p_customer_phone: customer_phone?.trim() || null,
      p_order_type: order_type || 'daily',
      p_voucher_code: voucher_code?.trim() || null,
      p_pickup_date: pickup_date || null,
      p_pickup_time: pickup_time || null,
      p_notes: notes?.trim() || null,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data?.success) {
      return NextResponse.json(
        { success: false, error: data?.error || 'Failed to place order' },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
