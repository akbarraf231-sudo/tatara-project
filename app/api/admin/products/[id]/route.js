import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { isAdminAuthorized } from '@/lib/adminAuth';

const optionalCols = ['image_url', 'image_url_2', 'image_url_3', 'product_type', 'description', 'flavors', 'sizes', 'max_flavors_selectable', 'badge'];

async function tryUpdate(id, payload) {
  let { data, error } = await supabaseServer
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  let attempt = 0;
  while (error && attempt < optionalCols.length) {
    const drop = optionalCols.find((k) => new RegExp(k, 'i').test(error.message || ''));
    if (!drop) break;
    delete payload[drop];
    const retry = await supabaseServer
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
    attempt++;
  }
  return { data, error };
}

export async function PATCH(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData = { updated_at: new Date() };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock);
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.image_url !== undefined) updateData.image_url = body.image_url || null;
    if (body.image_url_2 !== undefined) updateData.image_url_2 = body.image_url_2 || null;
    if (body.image_url_3 !== undefined) updateData.image_url_3 = body.image_url_3 || null;
    if (body.product_type !== undefined) updateData.product_type = body.product_type === 'special' ? 'special' : 'daily';
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.badge !== undefined) updateData.badge = body.badge || null;
    if (body.flavors !== undefined) updateData.flavors = Array.isArray(body.flavors) ? body.flavors : [];
    if (body.sizes !== undefined) updateData.sizes = Array.isArray(body.sizes) ? body.sizes : [];
    if (body.max_flavors_selectable !== undefined) updateData.max_flavors_selectable = parseInt(body.max_flavors_selectable) || 1;

    const { data, error } = await tryUpdate(id, updateData);
    if (error) throw error;

    // Sync per-flavor stocks if provided
    if (Array.isArray(body.flavor_stocks)) {
      await supabaseServer.rpc('upsert_product_flavor_stocks', {
        p_product_id: id,
        p_flavors: body.flavor_stocks,
      });
    }

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

    // Check if product has order history
    const { data: orderItems } = await supabaseServer
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1);

    if (orderItems && orderItems.length > 0) {
      // Has order history — soft delete (deactivate) instead
      const { error } = await supabaseServer
        .from('products')
        .update({ is_active: false, updated_at: new Date() })
        .eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true, softDeleted: true });
    }

    // No order history — safe to hard delete
    const { error } = await supabaseServer.from('products').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true, softDeleted: false });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
