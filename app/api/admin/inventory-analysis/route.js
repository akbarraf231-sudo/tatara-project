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
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = (page - 1) * limit;

    // Use optimized database function with pagination
    const { data: inventoryStats, error: statsError } = await supabaseServer.rpc('get_product_inventory_stats', {
      limit_val: limit,
      offset_val: offset,
    });

    if (statsError) throw statsError;

    // Get product count for pagination
    const { count: totalCount } = await supabaseServer
      .from('products')
      .select('id', { count: 'exact', head: true });

    const productStats = (inventoryStats || []).map(p => ({
      id: p.product_id,
      name: p.product_name,
      stock: p.stock,
      threshold: p.threshold,
      unit: p.unit_of_measurement,
      price: p.price,
      totalSold: p.total_sold,
      isLowStock: p.is_low_stock,
      status: p.status,
    }));

    // Get critical products for alerts (only query what's needed)
    const { data: outOfStockData } = await supabaseServer
      .from('products')
      .select('id, name')
      .eq('stock', 0)
      .limit(100);

    const { data: lowStockData } = await supabaseServer
      .from('products')
      .select('id, name, stock, restock_threshold')
      .lt('stock', 10)
      .gt('stock', 0)
      .order('stock', { ascending: true })
      .limit(100);

    const outOfStockProducts = outOfStockData || [];
    const lowStockProducts = lowStockData || [];

    // Get purchase expenses from last 30 days
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    const last30DateStr = last30.toISOString().slice(0, 10);

    const { data: expensesData } = await supabaseServer
      .from('expenses')
      .select('amount, quantity, category')
      .eq('category', 'purchase')
      .gte('expense_date', last30DateStr);

    const purchaseExpenses = (expensesData || []).reduce((sum, e) => sum + Number(e.amount), 0);
    const purchaseQuantity = (expensesData || []).reduce((sum, e) => sum + (e.quantity || 0), 0);

    // Stock alerts
    const alerts = [];

    if (outOfStockProducts.length > 0) {
      alerts.push({
        type: 'critical',
        icon: '🚨',
        title: 'Out of Stock',
        count: outOfStockProducts.length,
        message: `${outOfStockProducts.length} produk stok habis! Segera pesan bahan baku.`,
      });
    }

    if (lowStockProducts.length > 0) {
      alerts.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Stock Rendah',
        count: lowStockProducts.length,
        message: `${lowStockProducts.length} produk stok di bawah threshold. Pertimbangkan untuk pesan.`,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        productStats,
        predictions: [],
        alerts,
        summary: {
          totalProducts: totalCount || 0,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          purchaseExpensesLast30: purchaseExpenses,
          purchaseQuantityLast30: purchaseQuantity,
          avgPricePerUnit: purchaseQuantity > 0 ? (purchaseExpenses / purchaseQuantity).toFixed(2) : 0,
        },
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit),
        },
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
