import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

export async function PATCH(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData = {};
    if (body.code !== undefined) updateData.code = String(body.code).toUpperCase().trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.discount_type !== undefined) updateData.discount_type = body.discount_type === 'percent' ? 'percent' : 'amount';
    if (body.discount_value !== undefined) updateData.discount_value = parseFloat(body.discount_value);
    if (body.min_order !== undefined) updateData.min_order = parseFloat(body.min_order);
    if (body.max_uses !== undefined) updateData.max_uses = body.max_uses ? parseInt(body.max_uses) : null;
    if (body.is_active !== undefined) updateData.is_active = !!body.is_active;
    if (body.expires_at !== undefined) updateData.expires_at = body.expires_at || null;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseServer
      .from('vouchers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { error } = await supabaseServer.from('vouchers').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
