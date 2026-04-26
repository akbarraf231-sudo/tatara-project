import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { data, error } = await supabaseServer
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
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
      code, description, discount_type, discount_value,
      min_order, max_uses, is_active, expires_at,
    } = body;

    if (!code || discount_value == null) {
      return NextResponse.json({ success: false, error: 'Code and discount_value required' }, { status: 400 });
    }

    const insertData = {
      code: String(code).toUpperCase().trim(),
      description: description || null,
      discount_type: discount_type === 'percent' ? 'percent' : 'amount',
      discount_value: parseFloat(discount_value),
      min_order: parseFloat(min_order || 0),
      max_uses: max_uses ? parseInt(max_uses) : null,
      is_active: is_active ?? true,
      expires_at: expires_at || null,
    };

    const { data, error } = await supabaseServer
      .from('vouchers')
      .insert([insertData])
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
