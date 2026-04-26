import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json();
    if (!code || subtotal == null) {
      return NextResponse.json({ success: false, error: 'Code and subtotal required' }, { status: 400 });
    }

    const normalizedCode = String(code).toUpperCase().trim();
    const sub = parseFloat(subtotal);

    const { data, error } = await supabaseServer
      .from('vouchers')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ success: false, error: 'Voucher tidak ditemukan' }, { status: 404 });
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'Voucher sudah expired' }, { status: 400 });
    }

    if (data.max_uses != null && data.used_count >= data.max_uses) {
      return NextResponse.json({ success: false, error: 'Voucher sudah habis' }, { status: 400 });
    }

    if (sub < Number(data.min_order)) {
      return NextResponse.json({
        success: false,
        error: `Minimum order Rp ${Number(data.min_order).toLocaleString('id-ID')}`,
      }, { status: 400 });
    }

    let discount = 0;
    if (data.discount_type === 'percent') {
      discount = sub * Number(data.discount_value) / 100;
    } else {
      discount = Number(data.discount_value);
    }
    if (discount > sub) discount = sub;

    return NextResponse.json({
      success: true,
      voucher: {
        code: data.code,
        description: data.description,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
      },
      discount,
      total: sub - discount,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
