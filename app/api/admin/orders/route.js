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
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
    const offset = (page - 1) * limit;

    // Get total count
    let countQuery = supabaseServer.from('orders').select('id', { count: 'exact', head: true });
    if (!includeArchived) {
      countQuery = countQuery.is('archived_at', null);
    }
    const { count: totalCount } = await countQuery;

    // Get paginated data
    let query = supabaseServer
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter out archived orders unless explicitly requested
    if (!includeArchived) {
      query = query.is('archived_at', null);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
